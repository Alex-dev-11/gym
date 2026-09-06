namespace GymApp.Api.DTOs.Clients;

public class UpdateClientDto
{
    public string LastName { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string? Patronymic { get; set; }
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }
}