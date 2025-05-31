using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Organizer.Server.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("username")]
        public string Username { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("password")]
        public string Password { get; set; } = string.Empty;  // Hashed password

        // New fields for password reset
        [BsonElement("passwordResetToken")]
        public string? PasswordResetToken { get; set; }

        [BsonElement("resetTokenExpiry")]
        public DateTime? ResetTokenExpiry { get; set; }

    }
}
