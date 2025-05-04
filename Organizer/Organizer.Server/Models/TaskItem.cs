using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Organizer.Server.Models
{
    public class TaskItem
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public string Description { get; set; } = string.Empty;
        public int Length { get; set; }
        public bool IsDone { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string ListId { get; set; } = string.Empty;
    }
}
