namespace MaintenanceWarrantySystem.Domain.Entities;

public class WarrantyClaim : BaseEntity
{
    public string ClaimCode { get; set; } = string.Empty; // BH001
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DefectDescription { get; set; } = string.Empty;
    public WarrantyClaimType Type { get; set; }
    public WarrantyClaimStatus Status { get; set; } = WarrantyClaimStatus.Submitted;
    public DateTime ClaimDate { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedDate { get; set; }
    public DateTime? ResolvedDate { get; set; }
    public decimal ClaimAmount { get; set; }
    public decimal ApprovedAmount { get; set; }
    public string? Resolution { get; set; }
    public string? RejectionReason { get; set; }
    public string? Attachments { get; set; } // JSON array of file paths
    
    // Foreign Keys
    public int DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int? ProcessedById { get; set; }
    public User? ProcessedBy { get; set; }
    
    // Navigation
    public ICollection<WarrantyClaimHistory> ClaimHistories { get; set; } = new List<WarrantyClaimHistory>();
}

public enum WarrantyClaimType
{
    Repair = 1,        // Sửa chữa
    Replacement = 2,   // Đổi mới
    Refund = 3         // Hoàn tiền
}

public enum WarrantyClaimStatus
{
    Submitted = 1,      // Đã nộp
    UnderReview = 2,    // Đang xem xét
    Approved = 3,       // Đã duyệt
    InProgress = 4,     // Đang xử lý
    Resolved = 5,       // Đã giải quyết
    Rejected = 6,       // Từ chối
    Cancelled = 7       // Hủy
}
