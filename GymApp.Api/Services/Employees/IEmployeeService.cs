using GymApp.Api.DTOs.Employees;

namespace GymApp.Api.Services.Employees;

public interface IEmployeeService
{
    Task<List<EmployeeResponseDto>> GetAllAsync();
    Task<List<TrainerSelectDto>> GetActiveTrainersAsync();
    Task<EmployeeResponseDto> CreateAsync(CreateEmployeeDto dto);
    Task<EmployeeResponseDto> UpdateAsync(int id, UpdateEmployeeDto dto);
    Task DeleteAsync(int id);
}