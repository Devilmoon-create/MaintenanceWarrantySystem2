namespace MaintenanceWarrantySystem.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public string? AvatarUrl { get; set; }

    // Navigation
    public ICollection<MaintenanceRequest> AssignedMaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
    public ICollection<DeviceMaintenanceHistory> PerformedMaintenances { get; set; } = new List<DeviceMaintenanceHistory>();
    public ICollection<WarrantyClaim> ProcessedClaims { get; set; } = new List<WarrantyClaim>();
    public ICollection<WarrantyClaimHistory> ClaimStatusChanges { get; set; } = new List<WarrantyClaimHistory>();
}

public enum UserRole
{
    Admin = 1,           // Quản trị viên
    Manager = 2,         // Quản lý
    Technician = 3,      // Kỹ thuật viên
    Customer = 4         // Khách hàng (portal)
}
