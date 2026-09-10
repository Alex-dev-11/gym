namespace GymApp.Api.DTOs.Users;

public class CreateUserDto
{
    public string Login { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "operator";
    public int? EmployeeId { get; set; }
}