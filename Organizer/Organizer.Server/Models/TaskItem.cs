using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Organizer.Server.Models
{
    public class TaskItem
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; } = string.Empty;

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("isCompleted")]
        public bool? IsCompleted { get; set; } = false;
        public DateTime DueDate { get; set; }

        [BsonElement("type")]
        public string Type { get; set; } = "todo"; // Possible values: "todo", "daily", "goal", "habit", "checkpoint"

        // Optional: Add specific fields only relevant to certain types
        [BsonElement("streak")]
        [BsonIgnoreIfNull]
        public int? Streak { get; set; }

        [BsonElement("progress")]
        [BsonIgnoreIfNull]
        public int? Progress { get; set; }

        [BsonElement("estimatedTime")]
        [BsonIgnoreIfNull]
        public int? EstimatedTime { get; set; }

        [BsonElement("dueTime")]
        [BsonIgnoreIfNull]
        public TimeSpan? DueTime { get; set; }

        [BsonElement("goalId")]
        [BsonIgnoreIfNull]
        public string? GoalId { get; set; }
    }
}
