using GymApp.Api.DTOs.Auth;

namespace GymApp.Api.Services.Auth;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
}