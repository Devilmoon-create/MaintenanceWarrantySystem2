namespace MaintenanceWarrantySystem.Domain.Entities;

public class DeviceMaintenanceHistory : BaseEntity
{
    public int DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    public int MaintenanceRequestId { get; set; }
    public MaintenanceRequest MaintenanceRequest { get; set; } = null!;
    public string ActionPerformed { get; set; } = string.Empty;
    public string PartsReplaced { get; set; } = string.Empty; // JSON
    public decimal Cost { get; set; }
    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    public int PerformedById { get; set; }
    public User PerformedBy { get; set; } = null!;
    public string? Notes { get; set; }
}

public class WarrantyClaimHistory : BaseEntity
{
    public int WarrantyClaimId { get; set; }
    public WarrantyClaim WarrantyClaim { get; set; } = null!;
    public WarrantyClaimStatus PreviousStatus { get; set; }
    public WarrantyClaimStatus NewStatus { get; set; }
    public string Comment { get; set; } = string.Empty;
    public int ChangedById { get; set; }
    public User ChangedBy { get; set; } = null!;
}
