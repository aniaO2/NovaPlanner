using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Organizer.Server.Models.Assistant;
using Organizer.Server.Services;
using Organizer.Server.Plugins;

namespace Organizer.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssistantController : ControllerBase
    {
        private readonly TaskService _taskService;
        private readonly SemanticKernelService _kernelService;

        public AssistantController(TaskService taskService, SemanticKernelService kernelService)
        {
            _taskService = taskService;
            _kernelService = kernelService;
        }

        [HttpPost("evaluate-dailies")]
        public async Task<IActionResult> EvaluateDailies([FromBody] EvaluateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var today = DateTime.UtcNow.Date;

            var recentTasks = await _taskService.GetDailiesForUserAsync(request.UserId, 30); // ultimele 30 de zile
            var grouped = recentTasks
                .GroupBy(t => t.DueDate.Date)
                .Select(g => new DailyTaskKpi
                {
                    Date = g.Key,
                    TotalEstimatedHours = g.Sum(t => t.EstimatedTime ?? 0),
                    CompletedTaskCount = g.Count(t => t.IsCompleted == true),
                    IncompleteTaskCount = g.Count(t => !t.IsCompleted == false),
                }).ToList();

            var plugin = new TaskAnalysisPlugin();
            var kpiText = plugin.FormatKpiSummary(grouped);

            var todayTasksFormatted = string.Join("\n", request.TodayTasks.Select(t => $"- {t.Title} ({t.EstimatedTime}h)"));
            var todayTotal = request.TodayTasks.Sum(t => t.EstimatedTime);

            var prompt = $@" Evaluate if today's plan is realistic: - Today's tasks (total estimated hours: {todayTotal}):
{todayTasksFormatted}- Past 30 days summary:{kpiText}. Suggest if the user should reduce the number of tasks or reorganize. Respond briefly and clearly, no markdown symbols.";

            var kernel = _kernelService.Kernel;
            var response = await kernel.InvokePromptAsync(prompt);

            return Ok(response.ToString());
        }
    }
    
}
