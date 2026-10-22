namespace MaintenanceWarrantySystem.Application.DTOs;

public record DeviceDto(
    int Id,
    string Code,
    string SerialNumber,
    string Name,
    string Model,
    string Brand,
    int Category,
    DateTime PurchaseDate,
    DateTime? WarrantyExpiryDate,
    decimal PurchasePrice,
    string? Specifications,
    int Status,
    string? Location,
    string? Notes,
    int CustomerId,
    string CustomerName,
    DateTime CreatedAt
);

public record CreateDeviceDto(
    string Code,
    string SerialNumber,
    string Name,
    string Model,
    string Brand,
    int Category,
    DateTime PurchaseDate,
    DateTime? WarrantyExpiryDate,
    decimal PurchasePrice,
    string? Specifications,
    int Status,
    string? Location,
    string? Notes,
    int CustomerId
);

public record UpdateDeviceDto(
    int Id,
    string Code,
    string SerialNumber,
    string Name,
    string Model,
    string Brand,
    int Category,
    DateTime PurchaseDate,
    DateTime? WarrantyExpiryDate,
    decimal PurchasePrice,
    string? Specifications,
    int Status,
    string? Location,
    string? Notes,
    int CustomerId
);

public record DevicePagedResult(
    IEnumerable<DeviceDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public record DeviceWarrantyExpiryDto(
    int Id,
    string Code,
    string Name,
    string SerialNumber,
    DateTime WarrantyExpiryDate,
    int DaysRemaining,
    string CustomerName,
    string CustomerPhone
);
