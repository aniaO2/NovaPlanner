using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Organizer.Server.Models;
using Organizer.Server.Services;

namespace Organizer.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]  // Add this to enforce authentication for all actions
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

        // Get all tasks for the currently logged-in user
        [HttpGet]
        public async Task<ActionResult<List<TaskItem>>> Get()
        {
            var tasks = await _taskService.GetByUserAsync();
            return Ok(tasks);
        }

        // Create a new task for the currently logged-in user
        [HttpPost]
        public async Task<ActionResult<TaskItem>> Post(TaskItem newTask)
        {
            await _taskService.CreateAsync(newTask);
            return CreatedAtAction(nameof(Get), new { id = newTask.Id }, newTask);
        }

        // Update an existing task
        [HttpPut("{id}")]
        public async Task<ActionResult> Put(string id, TaskItem updatedTask)
        {
            await _taskService.UpdateAsync(id, updatedTask);
            return NoContent();  // Returns 204 No Content when successfully updated
        }

        // Delete a task by ID
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            await _taskService.DeleteAsync(id);
            return NoContent();  // Returns 204 No Content when successfully deleted
        }
    }
}
