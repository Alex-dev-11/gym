using GymApp.Api.DTOs.Users;

namespace GymApp.Api.Services.Users;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto> CreateUserAsync(CreateUserDto dto);
    Task DeleteUserAsync(int id);
}