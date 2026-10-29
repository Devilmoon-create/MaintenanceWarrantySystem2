using MaintenanceWarrantySystem.Application.DTOs;

namespace MaintenanceWarrantySystem.Application.Interfaces;

public interface ICategoryService
{
    Task<CategoryPagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null);
    Task<CategoryDto?> GetByIdAsync(int id);
    Task<CategoryDto?> GetByCodeAsync(string code);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
    Task<CategoryDto> UpdateAsync(UpdateCategoryDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
}
