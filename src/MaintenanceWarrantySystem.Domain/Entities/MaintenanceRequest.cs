namespace MaintenanceWarrantySystem.Domain.Entities;

public class MaintenanceRequest : BaseEntity
{
    public string RequestCode { get; set; } = string.Empty; // YC001
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MaintenanceType Type { get; set; }
    public MaintenancePriority Priority { get; set; } = MaintenancePriority.Normal;
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Pending;
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    public DateTime? ScheduledDate { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public decimal EstimatedCost { get; set; }
    public decimal ActualCost { get; set; }
    public string? TechnicianNotes { get; set; }
    public string? CustomerNotes { get; set; }
    public string? ReplacementParts { get; set; } // JSON
    
    // Foreign Keys
    public int DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int? AssignedTechnicianId { get; set; }
    public User? AssignedTechnician { get; set; }
    
    // Navigation
    public ICollection<DeviceMaintenanceHistory> MaintenanceHistories { get; set; } = new List<DeviceMaintenanceHistory>();
}

public enum MaintenanceType
{
    Preventive = 1,    // Bảo trì định kỳ
    Corrective = 2,    // Bảo trì sửa chữa
    Emergency = 3,     // Khẩn cấp
    Upgrade = 4        // Nâng cấp
}

public enum MaintenancePriority
{
    Low = 1,
    Normal = 2,
    High = 3,
    Critical = 4
}

public enum MaintenanceStatus
{
    Pending = 1,           // Chờ duyệt
    Approved = 2,          // Đã duyệt
    Scheduled = 3,         // Đã lên lịch
    InProgress = 4,        // Đang thực hiện
    WaitingParts = 5,      // Chờ linh kiện
    Completed = 6,         // Hoàn thành
    Cancelled = 7,         // Hủy
    Rejected = 8           // Từ chối
}
