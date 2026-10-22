namespace MaintenanceWarrantySystem.Application.DTOs;

public record WarrantyClaimDto(
    int Id,
    string ClaimCode,
    string Title,
    string Description,
    string DefectDescription,
    int Type,
    int Status,
    DateTime ClaimDate,
    DateTime? ApprovedDate,
    DateTime? ResolvedDate,
    decimal ClaimAmount,
    decimal ApprovedAmount,
    string? Resolution,
    string? RejectionReason,
    string? Attachments,
    int DeviceId,
    string DeviceName,
    string DeviceCode,
    int CustomerId,
    string CustomerName,
    int? ProcessedById,
    string? ProcessedByName,
    DateTime CreatedAt
);

public record CreateWarrantyClaimDto(
    string Title,
    string Description,
    string DefectDescription,
    int Type,
    decimal ClaimAmount,
    string? Attachments,
    int DeviceId,
    int CustomerId
);

public record UpdateWarrantyClaimDto(
    int Id,
    string Title,
    string Description,
    string DefectDescription,
    int Type,
    int Status,
    DateTime? ApprovedDate,
    DateTime? ResolvedDate,
    decimal ClaimAmount,
    decimal ApprovedAmount,
    string? Resolution,
    string? RejectionReason,
    string? Attachments,
    int? ProcessedById
);

public record WarrantyClaimPagedResult(
    IEnumerable<WarrantyClaimDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public record WarrantyClaimStatusUpdateDto(
    int Id,
    int Status,
    string? Comment,
    decimal? ApprovedAmount,
    string? Resolution,
    string? RejectionReason
);
