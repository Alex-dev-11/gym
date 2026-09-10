using Npgsql;
using FluentValidation;
using FluentValidation.AspNetCore;
using GymApp.Api.Data;
using GymApp.Api.Services.Memberships;
using GymApp.Api.Services.Clients;
using GymApp.Api.Services.Visits;
using GymApp.Api.Services.Employees;
using GymApp.Api.Middleware;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text;
using GymApp.Api.Services.Auth;
using GymApp.Api.Services.Users;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Порт Vite по умолчанию
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 1. Добавляем контроллеры (вместо Minimal API)
builder.Services.AddControllers();

// 2. Подключаем FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddDbContext<GymDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 4. Регистрируем наши сервисы (Dependency Injection)
builder.Services.AddScoped<IClientService, ClientService>();

builder.Services.AddScoped<IMembershipService, MembershipService>();

builder.Services.AddScoped<IVisitService, VisitService>();

builder.Services.AddScoped<IEmployeeService, EmployeeService>();

// 5. Подключаем Swagger (для тестирования API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]
                ?? throw new InvalidOperationException("JWT SecretKey not configured"))
        )
    };
});

// Регистрация сервисов
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();




var app = builder.Build();

app.UseAuthentication(); // 👈 Добавили ДО UseAuthorization
app.UseAuthorization();

// 6. Настраиваем конвейер запросов (middleware)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // Swagger UI будет доступен по адресу /swagger
}

// Middleware для обработки исключений (должен быть ДО MapControllers)
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseAuthorization();

app.UseCors("AllowFrontend");

// 7. Маппим контроллеры (включаем маршрутизацию)
app.MapControllers();

// ВРЕМЕННЫЙ КОД ДЛЯ ГЕНЕРАЦИИ ХЭША
var testPassword = "123456";
var hash = BCrypt.Net.BCrypt.HashPassword(testPassword);
Console.WriteLine($"========================================");
Console.WriteLine($"ХЭШ ДЛЯ ПАРОЛЯ '123456': {hash}");
Console.WriteLine($"========================================");


app.Run();