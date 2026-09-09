using GymApp.Api.DTOs.Employees;
namespace GymApp.Api.Services.Employees;

public interface IEmployeeService
{
    Task<List<EmployeeResponseDto>> GetActiveTrainersAsync();
}
