using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Organizer.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Net;
using System.Net.Mail;

namespace Organizer.Server.Services
{
    //dto to hold login response data
    //we want to separate the login response so we can fetch both the token AND the userId
    public class LoginResponse
    {
        public string Token { get; set; } = null!;
        public string UserId { get; set; } = null!;
    }
    public class UserService
    {
        private readonly IMongoCollection<User> _users;
        private readonly string _jwtSecret;
        private readonly EmailSettings _emailSettings;


        public UserService(IOptions<MongoDBSettings> dbSettings, IOptions<EmailSettings> emailSettings, string jwtSecret)
        {
            var client = new MongoClient(dbSettings.Value.ConnectionString);
            var database = client.GetDatabase(dbSettings.Value.DatabaseName);
            _users = database.GetCollection<User>("Users");
            _emailSettings = emailSettings.Value;
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

        public async Task<LoginResponse?> LoginAsync(string identifier, string password)
        {
            var user = await _users.Find(u => u.Username == identifier || u.Email == identifier).FirstOrDefaultAsync();
            if (user == null)
                return null;

            if (VerifyPassword(password, user.Password))
            {
                return new LoginResponse
                {
                    Token = GenerateJwtToken(user),
                    UserId = user.Id
                };
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

        public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
                return false;

            if (!VerifyPassword(currentPassword, user.Password))
                return false;

            var newHashed = HashPassword(newPassword);
            var update = Builders<User>.Update.Set(u => u.Password, newHashed);

            var result = await _users.UpdateOneAsync(u => u.Id == userId, update);
            return result.ModifiedCount == 1;
        }


        public async Task<bool> RequestPasswordResetAsync(string email)
        {
            var user = await GetByEmailAsync(email);
            if (user == null)
                return false;

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var expiry = DateTime.UtcNow.AddHours(1);

            var update = Builders<User>.Update
                .Set(u => u.PasswordResetToken, token)
                .Set(u => u.ResetTokenExpiry, expiry);

            await _users.UpdateOneAsync(u => u.Id == user.Id, update);
            await SendResetLinkEmail(user.Email, token);
            return true;
        }

        private async Task SendResetLinkEmail(string email, string token)
        {
            var fromAddress = new MailAddress(_emailSettings.FromEmail, _emailSettings.FromName);
            var toAddress = new MailAddress(email);
            string subject = "NovaPlanner - Password Reset Link";
            string resetUrl = $"https://localhost:5173/reset-password?token={WebUtility.UrlEncode(token)}";
            string body = $"Click the link to reset your password:\n{resetUrl}\nThis link will expire in 1 hour.";

            var smtp = new SmtpClient
            {
                Host = _emailSettings.SmtpHost,
                Port = _emailSettings.SmtpPort,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_emailSettings.FromEmail, _emailSettings.Password)
            };

            using var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body
            };
            await smtp.SendMailAsync(message);
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var user = await _users.Find(u => u.PasswordResetToken == token && u.ResetTokenExpiry > DateTime.UtcNow)
                                   .FirstOrDefaultAsync();
            if (user == null)
                return false;

            var hashed = HashPassword(newPassword);

            var update = Builders<User>.Update
                .Set(u => u.Password, hashed)
                .Unset(u => u.PasswordResetToken)
                .Unset(u => u.ResetTokenExpiry);

            var result = await _users.UpdateOneAsync(u => u.Id == user.Id, update);
            return result.ModifiedCount == 1;
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
