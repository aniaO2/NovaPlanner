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
        public bool IsCompleted { get; set; } = false;
        public DateTime DueDate { get; set; }
    }
}
