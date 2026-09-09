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

    public async Task<List<EmployeeResponseDto>> GetActiveTrainersAsync()
    {
        // Фильтруем только активных тренеров. 
        // Используем string, так как мы отказались от ENUM в пользу VARCHAR + CHECK.
        return await _context.Employees
            .Where(e => e.Position == "trainer" && e.IsActive)
            .Select(e => new EmployeeResponseDto
            {
                Id = e.Id,
                // Собираем ФИО, аккуратно обрабатывая возможный null в отчестве
                FullName = $"{e.LastName} {e.FirstName} {e.Patronymic}".Trim()
            })
            .ToListAsync();
    }
}