using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Organizer.Server.Models;
using System.Security.Claims;

namespace Organizer.Server.Services
{
    public class TaskService
    {
        private readonly IMongoCollection<TaskItem> _tasks;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TaskService(IOptions<MongoDBSettings> settings, IHttpContextAccessor httpContextAccessor)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _tasks = database.GetCollection<TaskItem>("Tasks");
            _httpContextAccessor = httpContextAccessor;
        }

        // Get all tasks for the current user
        public async Task<List<TaskItem>> GetByUserAsync(string userId)
        {
            return await _tasks.Find(t => t.UserId == userId).ToListAsync();
        }

        // Get tasks filtered by type
        public async Task<List<TaskItem>> GetByTypeAsync(string userId, string type)
        {

            return await _tasks.Find(t => t.UserId == userId && t.Type == type).ToListAsync();
        }

        // Create a new task for the current user
        public async Task CreateAsync(TaskItem task)
        {
            var userId = GetUserIdFromClaims();
            if (userId != null)
            {
                task.UserId = userId;

                // Optionally initialize values depending on type
                if (task.Type == "habit" && task.Streak == null)
                    task.Streak = 0;

                if (task.Type == "goal" && task.Progress == null)
                    task.Progress = 0;

                await _tasks.InsertOneAsync(task);
            }
        }

        // Update an existing task
        public async Task UpdateAsync(string id, TaskItem updatedTask)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return;

            var updateDefs = new List<UpdateDefinition<TaskItem>>();

            if (updatedTask.IsCompleted != null)
                updateDefs.Add(Builders<TaskItem>.Update.Set(t => t.IsCompleted, updatedTask.IsCompleted));

            if (updatedTask.Streak != null)
                updateDefs.Add(Builders<TaskItem>.Update.Set(t => t.Streak, updatedTask.Streak));

            if (updatedTask.Progress != null)
                updateDefs.Add(Builders<TaskItem>.Update.Set(t => t.Progress, updatedTask.Progress));

            if (!string.IsNullOrWhiteSpace(updatedTask.Title))
                updateDefs.Add(Builders<TaskItem>.Update.Set(t => t.Title, updatedTask.Title));

            if (updatedTask.DueTime != null)
                updateDefs.Add(Builders<TaskItem>.Update.Set(t => t.DueTime, updatedTask.DueTime));

            if (updatedTask.EstimatedTime != null)
                 updateDefs.Add(Builders<TaskItem>.Update.Set(t => t.EstimatedTime, updatedTask.EstimatedTime));

            if (updatedTask.DueDate != default)
                updateDefs.Add(Builders<TaskItem>.Update.Set(t => t.DueDate, updatedTask.DueDate));

            if (updateDefs.Count == 0) return;

            var update = Builders<TaskItem>.Update.Combine(updateDefs);

            await _tasks.UpdateOneAsync(
                t => t.Id == id && t.UserId == userId,
                update
            );
        }



        // Delete a task
        public async Task DeleteAsync(string id)
        {
            var userId = GetUserIdFromClaims();
            if (userId != null)
            {
                // Delete the main task
                await _tasks.DeleteOneAsync(t => t.Id == id && t.UserId == userId);

                // Delete related tasks with parentGoalId == id
                await _tasks.DeleteManyAsync(t => t.GoalId == id && t.UserId == userId);
            }
        }


        private string? GetUserIdFromClaims()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        // Read dailies
        public async Task<List<TaskItem>> GetDailiesForUserAsync(string userId, int noOfDays)
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-noOfDays);
            return await _tasks.Find(t =>
                t.UserId == userId &&
                t.Type == "daily" &&
                t.DueDate.Date >= startDate
            ).ToListAsync();
        }

    }
}
