using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Organizer.Server.Models;
using Organizer.Server.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure MongoDB settings
builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDB"));

// Register services
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<TaskService>();

// Configure JWT settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// Add authentication with JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, // Set this to true if you want to validate the issuer
            ValidateAudience = false, // Set this to true if you want to validate the audience
            ValidateLifetime = true, // Ensure that the token is valid and not expired
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Secret"])) // Your secret key
        };
    });

// Add authorization
builder.Services.AddAuthorization();

// Add controllers
builder.Services.AddControllers();

var app = builder.Build();

// Use authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

app.Run();
