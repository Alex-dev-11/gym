namespace GymApp.Api.DTOs;

public class ClientResponseDto
{
    public int Id { get; set; }
    public string LastName { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string? Patronymic { get; set; }
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }
    public DateTime RegistrationDate { get; set; }
    public string Status { get; set; } = null!;
}