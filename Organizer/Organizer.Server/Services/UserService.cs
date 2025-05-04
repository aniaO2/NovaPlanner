using MongoDB.Driver;
using Organizer.Server.Models;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace Organizer.Server.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IOptions<MongoDBSettings> dbSettings)
        {
            var client = new MongoClient(dbSettings.Value.ConnectionString);
            var database = client.GetDatabase(dbSettings.Value.DatabaseName);
            _users = database.GetCollection<User>("Users");
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _users.Find(u => u.Username == username).FirstOrDefaultAsync();
        }

        public async Task<bool> RegisterAsync(string username, string email, string password)
        {
            if (await _users.Find(u => u.Username == username || u.Email == email).AnyAsync())
                return false;

            var hashedPassword = HashPassword(password);
            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = hashedPassword
            };

            await _users.InsertOneAsync(user);
            return true;
        }

        public async Task<bool> LoginAsync(string username, string password)
        {
            var user = await GetByUsernameAsync(username);
            if (user == null)
                return false;

            return VerifyPassword(password, user.PasswordHash);
        }

        // Password hashing using SHA256 (you can use BCrypt for better security later)
        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            var hashedInput = HashPassword(password);
            return hashedInput == storedHash;
        }
    }
}
