using MaintenanceWarrantySystem.Application.DTOs;

namespace MaintenanceWarrantySystem.Application.Interfaces;

public interface IMaintenanceRequestService
{
    Task<MaintenanceRequestPagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null, int? status = null);
    Task<MaintenanceRequestDto?> GetByIdAsync(int id);
    Task<IEnumerable<MaintenanceRequestDto>> GetByDeviceIdAsync(int deviceId);
    Task<IEnumerable<MaintenanceRequestDto>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<MaintenanceRequestDto>> GetByTechnicianIdAsync(int technicianId);
    Task<MaintenanceRequestDto> CreateAsync(CreateMaintenanceRequestDto dto);
    Task<MaintenanceRequestDto> UpdateAsync(UpdateMaintenanceRequestDto dto);
    Task<MaintenanceRequestDto> UpdateStatusAsync(MaintenanceRequestStatusUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<string> GenerateRequestCodeAsync();
}

public interface IWarrantyClaimService
{
    Task<WarrantyClaimPagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null, int? status = null);
    Task<WarrantyClaimDto?> GetByIdAsync(int id);
    Task<IEnumerable<WarrantyClaimDto>> GetByDeviceIdAsync(int deviceId);
    Task<IEnumerable<WarrantyClaimDto>> GetByCustomerIdAsync(int customerId);
    Task<WarrantyClaimDto> CreateAsync(CreateWarrantyClaimDto dto);
    Task<WarrantyClaimDto> UpdateAsync(UpdateWarrantyClaimDto dto);
    Task<WarrantyClaimDto> UpdateStatusAsync(WarrantyClaimStatusUpdateDto dto, int userId);
    Task<bool> DeleteAsync(int id);
    Task<string> GenerateClaimCodeAsync();
}
