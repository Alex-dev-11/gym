namespace GymApp.Api.DTOs.Users;

public class UpdateUserDto
{
    public string Login { get; set; } = string.Empty;
    public string? Password { get; set; } // Опционален при обновлении
    public string Role { get; set; } = string.Empty; // 🔥 ДОБАВЛЕНО: = string.Empty
    public int? EmployeeId { get; set; }
    public bool IsActive { get; set; }
}