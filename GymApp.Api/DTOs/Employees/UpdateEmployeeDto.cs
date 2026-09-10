namespace GymApp.Api.DTOs.Employees;

public class UpdateEmployeeDto
{
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? Patronymic { get; set; }
    public string? Phone { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public bool? IsActive { get; set; } // Позволяет восстановить сотрудника
}