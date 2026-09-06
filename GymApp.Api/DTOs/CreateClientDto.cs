namespace GymApp.Api.DTOs;

public class CreateClientDto
{
    public string LastName { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string? Patronymic { get; set; }
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }
}