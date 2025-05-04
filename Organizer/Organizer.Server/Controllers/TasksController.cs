using Microsoft.AspNetCore.Mvc;
using Organizer.Server.Models;
using Organizer.Server.Services;

namespace Organizer.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

        // Get all tasks
        [HttpGet]
        public async Task<ActionResult<List<TaskItem>>> Get()
        {
            var tasks = await _taskService.GetAsync();
            return Ok(tasks);
        }

        // Create a new task
        [HttpPost]
        public async Task<ActionResult<TaskItem>> Post(TaskItem newTask)
        {
            await _taskService.CreateAsync(newTask);
            return CreatedAtAction(nameof(Get), new { id = newTask.Id }, newTask);
        }
    }
}
