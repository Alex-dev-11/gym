using GymApp.Api.Data;
using GymApp.Api.DTOs.Users;
using Microsoft.EntityFrameworkCore;

namespace GymApp.Api.Services.Users;

public class UserService : IUserService
{
    private readonly GymDbContext _context;

    public UserService(GymDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserResponseDto>> GetAllUsersAsync()
    {
        return await _context.SystemUsers
            .Include(u => u.Employee)
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Login = u.Login,
                Role = u.Role,
                FullName = u.Employee != null
                    ? $"{u.Employee.LastName} {u.Employee.FirstName} {u.Employee.Patronymic}".Trim()
                    : u.Login,
                IsActive = u.IsActive ?? false,
                CreatedAt = u.CreatedAt ?? DateTime.Now
            })
            .ToListAsync();
    }

    public async Task<UserResponseDto> CreateUserAsync(CreateUserDto dto)
    {
        // Проверка уникальности логина
        var existingUser = await _context.SystemUsers.AnyAsync(u => u.Login == dto.Login);
        if (existingUser)
            throw new InvalidOperationException($"Пользователь с логином {dto.Login} уже существует");

        // Хешируем пароль
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new Models.SystemUser
        {
            Login = dto.Login,
            PasswordHash = passwordHash,
            Role = dto.Role, // <-- Используем Role (string)
            EmployeeId = dto.EmployeeId,
            IsActive = true,
            CreatedAt = DateTime.Now
        };

        _context.SystemUsers.Add(user);
        await _context.SaveChangesAsync();

        // Получаем ФИО
        string fullName = user.Login;
        if (user.EmployeeId.HasValue)
        {
            var employee = await _context.Employees.FindAsync(user.EmployeeId.Value);
            if (employee != null)
            {
                fullName = $"{employee.LastName} {employee.FirstName} {employee.Patronymic}".Trim();
            }
        }

        return new UserResponseDto
        {
            Id = user.Id,
            Login = user.Login,
            Role = user.Role,
            FullName = fullName,
            IsActive = user.IsActive ?? false,
            CreatedAt = user.CreatedAt ?? DateTime.Now
        };
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _context.SystemUsers.FindAsync(id);
        if (user == null)
            throw new KeyNotFoundException($"Пользователь с ID {id} не найден");

        user.IsActive = false; // Мягкое удаление
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _context.SystemUsers.FindAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException("Пользователь не найден");
        }

        user.Login = dto.Login;
        user.Role = dto.Role;
        user.EmployeeId = dto.EmployeeId;
        user.IsActive = dto.IsActive;

        // Если передан новый пароль — хешируем и обновляем
        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync();
    }
}