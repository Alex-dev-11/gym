using GymApp.Api.DTOs.Clients;
namespace GymApp.Api.Services.Clients;


public interface IClientService
{
    Task<List<ClientResponseDto>> GetAllClientsAsync(string? search = null, string? status = null, bool includeDeleted = false);
    Task<ClientResponseDto> GetClientByIdAsync(int id);
    Task<ClientResponseDto> CreateClientAsync(CreateClientDto dto);
    Task<ClientResponseDto> UpdateClientAsync(int id, UpdateClientDto dto);
    Task DeleteClientAsync(int id);
}