using GymApp.Api.Data;
using GymApp.Api.DTOs.Employees;
using Microsoft.EntityFrameworkCore;

namespace GymApp.Api.Services.Employees;

public class EmployeeService : IEmployeeService
{
    private readonly GymDbContext _context;

    public EmployeeService(GymDbContext context)
    {
        _context = context;
    }

    public async Task<List<EmployeeResponseDto>> GetAllAsync()
    {
        return await _context.Employees
            .Select(e => new EmployeeResponseDto
            {
                Id = e.Id,
                LastName = e.LastName,
                FirstName = e.FirstName,
                Patronymic = e.Patronymic,
                Phone = e.Phone,
                Position = e.Position,
                IsActive = e.IsActive
            })
            .ToListAsync();
    }

    public async Task<List<TrainerSelectDto>> GetActiveTrainersAsync()
    {
        return await _context.Employees
            .Where(e => e.Position == "trainer" && e.IsActive)
            .Select(e => new TrainerSelectDto
            {
                Id = e.Id,
                FullName = string.Join(" ", new[] { e.LastName, e.FirstName, e.Patronymic }
                    .Where(s => !string.IsNullOrWhiteSpace(s)))
            })
            .ToListAsync();
    }

    public async Task<EmployeeResponseDto> CreateAsync(CreateEmployeeDto dto)
    {
        // Проверка на дубликат телефона среди активных сотрудников
        var phoneExists = await _context.Employees.AnyAsync(e => e.Phone == dto.Phone && e.IsActive);
        if (phoneExists)
        {
            throw new InvalidOperationException($"Сотрудник с телефоном {dto.Phone} уже существует");
        }

        var employee = new Models.Employee // Убедись, что имя модели совпадает с твоей (Employee или Employees)
        {
            LastName = dto.LastName,
            FirstName = dto.FirstName,
            Patronymic = dto.Patronymic,
            Phone = dto.Phone,
            Position = dto.Position,
            IsActive = true
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return new EmployeeResponseDto
        {
            Id = employee.Id,
            LastName = employee.LastName,
            FirstName = employee.FirstName,
            Patronymic = employee.Patronymic,
            Phone = employee.Phone,
            Position = employee.Position,
            IsActive = employee.IsActive
        };
    }

    public async Task<EmployeeResponseDto> UpdateAsync(int id, UpdateEmployeeDto dto)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
        {
            throw new KeyNotFoundException("Сотрудник не найден");
        }

        employee.LastName = dto.LastName;
        employee.FirstName = dto.FirstName;
        employee.Patronymic = dto.Patronymic;
        employee.Phone = dto.Phone;
        employee.Position = dto.Position;

        // 🔥 ИСПРАВЛЕНО: Прямое присваивание, так как dto.IsActive теперь строгий bool
        employee.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return new EmployeeResponseDto
        {
            Id = employee.Id,
            LastName = employee.LastName,
            FirstName = employee.FirstName,
            Patronymic = employee.Patronymic,
            Phone = employee.Phone,
            Position = employee.Position,
            IsActive = employee.IsActive
        };
    }

    public async Task DeleteAsync(int id)
    {
        var employee = await _context.Employees.FindAsync(id)
            ?? throw new KeyNotFoundException($"Сотрудник с ID {id} не найден");

        if (!employee.IsActive)
        {
            throw new InvalidOperationException($"Сотрудник с ID {id} уже деактивирован");
        }

        // Мягкое удаление
        employee.IsActive = false;
        await _context.SaveChangesAsync();
    }

    public async Task<List<EmployeeResponseDto>> GetAdministrativeEmployeesAsync()
    {
        // Список должностей, которым разрешено иметь учетную запись в системе
        var allowedPositions = new[] { "administrator", "manager", "director" };

        return await _context.Employees
            .Where(e => allowedPositions.Contains(e.Position) && e.IsActive)
            .Select(e => new EmployeeResponseDto
            {
                Id = e.Id,
                LastName = e.LastName,
                FirstName = e.FirstName,
                Patronymic = e.Patronymic,
                Phone = e.Phone,
                Position = e.Position,
                IsActive = e.IsActive
            })
            .ToListAsync();
    }
}