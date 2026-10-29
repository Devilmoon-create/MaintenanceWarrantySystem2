namespace MaintenanceWarrantySystem.Application.DTOs;

public record CategoryDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    int DeviceCount,
    int DefaultWarrantyMonths,
    int MaintenanceCycleMonths,
    DateTime CreatedAt
);

public record CreateCategoryDto(
    string Code,
    string Name,
    string? Description,
    int DefaultWarrantyMonths,
    int MaintenanceCycleMonths
);

public record UpdateCategoryDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    int DefaultWarrantyMonths,
    int MaintenanceCycleMonths
);

public record CategoryPagedResult(
    IEnumerable<CategoryDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
