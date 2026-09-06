using Npgsql;
using FluentValidation;
using FluentValidation.AspNetCore;
using GymApp.Api.Data;
using GymApp.Api.Services.Memberships;
using GymApp.Api.Services.Clients;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

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

// 5. Подключаем Swagger (для тестирования API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 6. Настраиваем конвейер запросов (middleware)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // Swagger UI будет доступен по адресу /swagger
}

app.UseHttpsRedirection();
app.UseAuthorization();

// 7. Маппим контроллеры (включаем маршрутизацию)
app.MapControllers();

app.Run();