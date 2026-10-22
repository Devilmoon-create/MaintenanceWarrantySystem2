using MaintenanceWarrantySystem.Domain.Entities;

namespace MaintenanceWarrantySystem.Domain.Interfaces;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<Customer?> GetByCodeAsync(string code);
    Task<Customer?> GetByEmailAsync(string email);
    Task<Customer?> GetByPhoneAsync(string phone);
    Task<IEnumerable<Customer>> GetByTypeAsync(CustomerType type);
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
}

public interface IDeviceRepository : IRepository<Device>
{
    Task<Device?> GetByCodeAsync(string code);
    Task<Device?> GetBySerialNumberAsync(string serialNumber);
    Task<IEnumerable<Device>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<Device>> GetByCategoryAsync(DeviceCategory category);
    Task<IEnumerable<Device>> GetByStatusAsync(DeviceStatus status);
    Task<IEnumerable<Device>> GetWarrantyExpiringSoonAsync(int days = 30);
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
    Task<bool> IsSerialUniqueAsync(string serial, int? excludeId = null);
}

public interface IMaintenanceRequestRepository : IRepository<MaintenanceRequest>
{
    Task<IEnumerable<MaintenanceRequest>> GetByDeviceIdAsync(int deviceId);
    Task<IEnumerable<MaintenanceRequest>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<MaintenanceRequest>> GetByTechnicianIdAsync(int technicianId);
    Task<IEnumerable<MaintenanceRequest>> GetByStatusAsync(MaintenanceStatus status);
    Task<IEnumerable<MaintenanceRequest>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<string> GenerateRequestCodeAsync();
}

public interface IWarrantyClaimRepository : IRepository<WarrantyClaim>
{
    Task<IEnumerable<WarrantyClaim>> GetByDeviceIdAsync(int deviceId);
    Task<IEnumerable<WarrantyClaim>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<WarrantyClaim>> GetByStatusAsync(WarrantyClaimStatus status);
    Task<IEnumerable<WarrantyClaim>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<string> GenerateClaimCodeAsync();
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
    Task<IEnumerable<User>> GetByRoleAsync(UserRole role);
    Task<bool> IsUsernameUniqueAsync(string username, int? excludeId = null);
    Task<bool> IsEmailUniqueAsync(string email, int? excludeId = null);
    Task<User?> ValidateCredentialsAsync(string username, string passwordHash);
}

public interface IDeviceMaintenanceHistoryRepository : IRepository<DeviceMaintenanceHistory>
{
    Task<IEnumerable<DeviceMaintenanceHistory>> GetByDeviceIdAsync(int deviceId);
    Task<IEnumerable<DeviceMaintenanceHistory>> GetByMaintenanceRequestIdAsync(int requestId);
}

public interface IWarrantyClaimHistoryRepository : IRepository<WarrantyClaimHistory>
{
    Task<IEnumerable<WarrantyClaimHistory>> GetByClaimIdAsync(int claimId);
}
