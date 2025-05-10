namespace Organizer.Server.Models
{
    public class MongoDBSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string TasksCollectionName { get; set; } = string.Empty;
        public string UsersCollectionName { get; set; } = null!;
    }
}
