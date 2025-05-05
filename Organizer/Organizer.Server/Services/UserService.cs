using MongoDB.Driver;
using Organizer.Server.Models;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace Organizer.Server.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;
        private readonly string _jwtSecret;

        public UserService(IOptions<MongoDBSettings> dbSettings, string jwtSecret)
        {
            var client = new MongoClient(dbSettings.Value.ConnectionString);
            var database = client.GetDatabase(dbSettings.Value.DatabaseName);
            _users = database.GetCollection<User>("Users");
            _jwtSecret = jwtSecret;
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
                Password = hashedPassword
            };

            await _users.InsertOneAsync(user);
            return true;
        }

        public async Task<string?> LoginAsync(string username, string password)
        {
            var user = await GetByUsernameAsync(username);
            if (user == null)
                return null;

            if (VerifyPassword(password, user.Password))
            {
                return GenerateJwtToken(user);
            }

            return null;
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _users.Find(u => u.Username == username).FirstOrDefaultAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

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

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "OrganizerApp",
                audience: "OrganizerApp",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
