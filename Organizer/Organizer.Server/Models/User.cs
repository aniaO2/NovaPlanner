using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Organizer.Server.Models
{
    public class User
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }
}
