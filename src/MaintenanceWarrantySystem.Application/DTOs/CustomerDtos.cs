namespace MaintenanceWarrantySystem.Application.DTOs;

public record CustomerDto(
    int Id,
    string Code,
    string FullName,
    string Phone,
    string Email,
    string Address,
    string? TaxCode,
    string? CompanyName,
    int Type,
    string? Notes,
    DateTime CreatedAt
);

public record CreateCustomerDto(
    string Code,
    string FullName,
    string Phone,
    string Email,
    string Address,
    string? TaxCode,
    string? CompanyName,
    int Type,
    string? Notes
);

public record UpdateCustomerDto(
    int Id,
    string Code,
    string FullName,
    string Phone,
    string Email,
    string Address,
    string? TaxCode,
    string? CompanyName,
    int Type,
    string? Notes
);

public record CustomerPagedResult(
    IEnumerable<CustomerDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
