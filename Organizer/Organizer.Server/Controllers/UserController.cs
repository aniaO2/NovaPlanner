using Microsoft.AspNetCore.Mvc;
using Organizer.Server.Services;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace Organizer.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        // Register a new user
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var success = await _userService.RegisterAsync(request.Username, request.Email, request.Password);
            return success ? Ok("User registered.") : BadRequest("Username or email already exists.");

        }

        // Login and generate JWT token
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _userService.LoginAsync(request.Identifier, request.Password);
            if (token == null)
            {
                return Unauthorized("Invalid credentials.");
            }

            return Ok(new { Token = token });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            // You need to identify the user (e.g., from JWT claims)
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var result = await _userService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            if (!result)
                return BadRequest("Current password is incorrect.");

            return Ok("Password changed successfully.");
        }

        public class RegisterRequest
        {
            [JsonPropertyName("username")]
            public string Username { get; set; } = string.Empty;

            [JsonPropertyName("email")]
            public string Email { get; set; } = string.Empty;

            [JsonPropertyName("password")]
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var result = await _userService.ForgotPasswordAsync(request.Email);
            return result ? Ok("A new password has been sent to your email.") : NotFound("User with this email not found.");
        }

        public class ForgotPasswordRequest
        {
            public string Email { get; set; } = string.Empty;
        }

        public class LoginRequest
        {
            public string Identifier { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class ChangePasswordRequest
        {
            public string CurrentPassword { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }
    }
}
