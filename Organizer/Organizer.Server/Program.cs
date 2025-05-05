using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Organizer.Server.Models;
using Organizer.Server.Services;
using System.Text;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Configure MongoDB settings
builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDB"));

// Configure JWT settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// Manually register UserService with injected jwtSecret string
builder.Services.AddSingleton<UserService>(sp =>
{
    var dbSettings = sp.GetRequiredService<IOptions<MongoDBSettings>>();
    var jwtSecret = builder.Configuration["Jwt:Secret"];
    return new UserService(dbSettings, jwtSecret);
});

// Register other services
builder.Services.AddSingleton<TaskService>();

// Configure JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Secret"] ?? "default_fallback_key"))
        };
    });

// Add authorization and controllers
builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

// Middleware
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
