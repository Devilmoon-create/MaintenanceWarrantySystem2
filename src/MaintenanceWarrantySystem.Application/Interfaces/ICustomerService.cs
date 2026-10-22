using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Domain.Interfaces;

namespace MaintenanceWarrantySystem.Application.Interfaces;

public interface ICustomerService
{
    Task<CustomerPagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null);
    Task<CustomerDto?> GetByIdAsync(int id);
    Task<CustomerDto?> GetByCodeAsync(string code);
    Task<CustomerDto> CreateAsync(CreateCustomerDto dto);
    Task<CustomerDto> UpdateAsync(UpdateCustomerDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
}
