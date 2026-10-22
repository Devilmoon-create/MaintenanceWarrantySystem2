using MaintenanceWarrantySystem.Application.DTOs;

namespace MaintenanceWarrantySystem.Application.Interfaces;

public interface IDeviceService
{
    Task<DevicePagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null);
    Task<DeviceDto?> GetByIdAsync(int id);
    Task<DeviceDto?> GetByCodeAsync(string code);
    Task<DeviceDto?> GetBySerialNumberAsync(string serialNumber);
    Task<IEnumerable<DeviceDto>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<DeviceWarrantyExpiryDto>> GetWarrantyExpiringSoonAsync(int days = 30);
    Task<DeviceDto> CreateAsync(CreateDeviceDto dto);
    Task<DeviceDto> UpdateAsync(UpdateDeviceDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
    Task<bool> IsSerialUniqueAsync(string serial, int? excludeId = null);
}
