using GymApp.Api.DTOs.Clients;
namespace GymApp.Api.Services.Clients;


public interface IClientService
{
    Task<List<ClientResponseDto>> GetAllClientsAsync(string? search = null, string? status = null);

    // ❌ Было: Task<ClientResponseDto?> GetClientByIdAsync(int id);
    // ✅ Стало: Task<ClientResponseDto> GetClientByIdAsync(int id);
    Task<ClientResponseDto> GetClientByIdAsync(int id);

    Task<ClientResponseDto> CreateClientAsync(CreateClientDto dto);

    // ❌ Было: Task<ClientResponseDto?> UpdateClientAsync(int id, UpdateClientDto dto);
    // ✅ Стало: Task<ClientResponseDto> UpdateClientAsync(int id, UpdateClientDto dto);
    Task<ClientResponseDto> UpdateClientAsync(int id, UpdateClientDto dto);

    // ❌ Было: Task<bool> DeleteClientAsync(int id);
    // ✅ Стало: Task DeleteClientAsync(int id);
    Task DeleteClientAsync(int id);
}