﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Organizer.Server.Models;
using Organizer.Server.Services;
using System.Security.Claims;


namespace Organizer.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

        // GET: api/tasks
        [HttpGet]
        public async Task<ActionResult<List<TaskItem>>> Get()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tasks = await _taskService.GetByUserAsync(userId);
            return Ok(tasks);
        }


        // GET: api/tasks/type/{type}
        [HttpGet("type/{type}")]
        public async Task<ActionResult<List<TaskItem>>> GetByType(string type)
        {
            var validTypes = new[] { "todo", "daily", "goal", "habit", "checkpoint" };
            if (!validTypes.Contains(type.ToLower()))
            {
                return BadRequest("Invalid task type.");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tasks = await _taskService.GetByTypeAsync(userId, type.ToLower());
            return Ok(tasks);
        }

        // POST: api/tasks
        [HttpPost]
        public async Task<ActionResult<TaskItem>> Post(TaskItem newTask)
        {
            await _taskService.CreateAsync(newTask);
            return CreatedAtAction(nameof(Get), new { id = newTask.Id }, newTask);
        }

        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(string id, TaskItem updatedTask)
        {
            await _taskService.UpdateAsync(id, updatedTask);
            return NoContent();
        }

        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _taskService.DeleteAsync(id);
            return NoContent();
        }

        // PUT: api/tasks/goals/{goalId}/complete
        [HttpPut("goals/{goalId}/complete")]
        public async Task<IActionResult> CompleteGoal(string goalId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var goal = await _taskService.GetByIdAsync(goalId);
            if (goal == null || goal.Type != "goal" || goal.UserId != userId)
            {
                return NotFound("Goal not found or unauthorized.");
            }

            goal.IsCompleted = true;
            goal.Progress = 100;
            await _taskService.UpdateAsync(goal.Id, goal);

            await _taskService.MarkAllCheckpointsCompletedAsync(goal.Id, userId);

            return NoContent();
        }


    }
}
