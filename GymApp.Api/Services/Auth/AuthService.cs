using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GymApp.Api.Data;
using GymApp.Api.DTOs.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GymApp.Api.Services.Auth;

public class AuthService : IAuthService
{
    private readonly GymDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(GymDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        // 1. Находим пользователя
        var user = await _context.SystemUsers
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Login == dto.Login && u.IsActive == true); // 👈 Исправлено

        if (user == null)
            throw new UnauthorizedAccessException("Неверный логин или пароль");

        // 2. Проверяем пароль
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Неверный логин или пароль");

        // 3. Генерируем JWT токен
        var token = GenerateJwtToken(user);

        // 4. Формируем ФИО
        var fullName = user.Employee != null
            ? $"{user.Employee.LastName} {user.Employee.FirstName} {user.Employee.Patronymic}".Trim()
            : user.Login;

        return new LoginResponseDto
        {
            Token = token,
            Login = user.Login,
            Role = user.Role,
            FullName = fullName
        };
    }

    private string GenerateJwtToken(Models.SystemUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey not configured");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Login),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("userId", user.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}