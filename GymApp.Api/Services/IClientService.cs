using GymApp.Api.DTOs;

namespace GymApp.Api.Services;

public interface IClientService
{
    Task<List<ClientResponseDto>> GetAllClientsAsync();
    Task<ClientResponseDto?> GetClientByIdAsync(int id);
    Task<ClientResponseDto> CreateClientAsync(CreateClientDto dto);
    Task<ClientResponseDto?> UpdateClientAsync(int id, UpdateClientDto dto);
    Task<bool> DeleteClientAsync(int id);
}