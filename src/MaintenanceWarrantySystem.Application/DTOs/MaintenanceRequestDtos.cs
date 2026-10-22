namespace MaintenanceWarrantySystem.Application.DTOs;

public record MaintenanceRequestDto(
    int Id,
    string RequestCode,
    string Title,
    string Description,
    int Type,
    int Priority,
    int Status,
    DateTime RequestDate,
    DateTime? ScheduledDate,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    decimal EstimatedCost,
    decimal ActualCost,
    string? TechnicianNotes,
    string? CustomerNotes,
    string? ReplacementParts,
    int DeviceId,
    string DeviceName,
    string DeviceCode,
    int CustomerId,
    string CustomerName,
    int? AssignedTechnicianId,
    string? TechnicianName,
    DateTime CreatedAt
);

public record CreateMaintenanceRequestDto(
    string Title,
    string Description,
    int Type,
    int Priority,
    DateTime? ScheduledDate,
    decimal EstimatedCost,
    string? CustomerNotes,
    int DeviceId,
    int CustomerId
);

public record UpdateMaintenanceRequestDto(
    int Id,
    string Title,
    string Description,
    int Type,
    int Priority,
    int Status,
    DateTime? ScheduledDate,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    decimal EstimatedCost,
    decimal ActualCost,
    string? TechnicianNotes,
    string? CustomerNotes,
    string? ReplacementParts,
    int? AssignedTechnicianId
);

public record MaintenanceRequestPagedResult(
    IEnumerable<MaintenanceRequestDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public record MaintenanceRequestStatusUpdateDto(
    int Id,
    int Status,
    string? TechnicianNotes,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    decimal? ActualCost,
    string? ReplacementParts
);
