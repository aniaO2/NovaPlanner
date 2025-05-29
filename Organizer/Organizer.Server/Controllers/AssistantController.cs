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

            var todayTotal = request.TodayTasks.Sum(t => t.EstimatedTime);

            var prompt = $@" Evaluează dacă planul de azi este realist: - Total ore estimate azi: {todayTotal}- Istoric:{kpiText}. Sugerează dacă utilizatorul ar trebui să reducă sarcinile.";

            var kernel = Kernel.CreateBuilder()
                .AddAzureOpenAIChatCompletion("gpt-4", "deployment", "https://endpoint", "key")
                .Build();

            var response = await kernel.InvokePromptAsync(prompt);
            return Ok(response.ToString());
        }
    }

}
