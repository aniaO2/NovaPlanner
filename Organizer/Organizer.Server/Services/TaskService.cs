using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Organizer.Server.Models;

namespace Organizer.Server.Services
{
    public class TaskService
    {
        private readonly IMongoCollection<TaskItem> _tasks;

        public TaskService(IOptions<MongoDBSettings> mongoDBSettings)
        {
            // Get settings from appsettings.json
            var settings = mongoDBSettings.Value;

            // Create MongoDB client and connect to the database and collection
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _tasks = database.GetCollection<TaskItem>(settings.TasksCollectionName);
        }

        // Get all tasks
        public async Task<List<TaskItem>> GetAsync()
        {
            return await _tasks.Find(task => true).ToListAsync();
        }

        // Create a new task
        public async Task CreateAsync(TaskItem newTask)
        {
            await _tasks.InsertOneAsync(newTask);
        }

        // Optional: Update, Delete methods can go here as well
    }
}
