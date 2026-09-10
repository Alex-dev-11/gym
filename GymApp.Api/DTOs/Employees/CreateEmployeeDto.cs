namespace GymApp.Api.DTOs.Employees;

public class CreateEmployeeDto
{
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? Patronymic { get; set; }
    public string? Phone { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty; // "trainer" или "administrator"
}