using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;

namespace MaintenanceWarrantySystem.Application.Interfaces
{
    public interface IAuthService
    {
        Task<TokenDto?> LoginAsync(LoginDto dto);
        Task<TokenDto?> RegisterAsync(RegisterDto dto);
        Task<TokenDto?> RefreshTokenAsync(string refreshToken);
        Task<UserDto?> GetCurrentUserAsync(int userId);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task RevokeRefreshTokenAsync(string refreshToken);
    }
}
