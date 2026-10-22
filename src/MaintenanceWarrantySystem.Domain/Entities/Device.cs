namespace MaintenanceWarrantySystem.Domain.Entities;

public class Device : BaseEntity
{
    public string Code { get; set; } = string.Empty; // TB001
    public string SerialNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public DeviceCategory Category { get; set; }
    public DateTime PurchaseDate { get; set; }
    public DateTime? WarrantyExpiryDate { get; set; }
    public decimal PurchasePrice { get; set; }
    public string? Specifications { get; set; } // JSON specs
    public DeviceStatus Status { get; set; } = DeviceStatus.Active;
    public string? Location { get; set; }
    public string? Notes { get; set; }
    
    // Foreign Keys
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    // Navigation
    public ICollection<MaintenanceRequest> MaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
    public ICollection<WarrantyClaim> WarrantyClaims { get; set; } = new List<WarrantyClaim>();
    public ICollection<DeviceMaintenanceHistory> MaintenanceHistories { get; set; } = new List<DeviceMaintenanceHistory>();
}

public enum DeviceCategory
{
    Computer = 1,        // Máy tính, Laptop
    Printer = 2,         // Máy in
    Scanner = 3,         // Máy quét
    Network = 4,         // Thiết bị mạng
    Server = 5,          // Server
    Peripheral = 6,      // Thiết bị ngoại vi
    Other = 7            // Khác
}

public enum DeviceStatus
{
    Active = 1,           // Đang sử dụng
    UnderMaintenance = 2, // Đang bảo trì
    UnderWarranty = 3,    // Đang bảo hành
    Retired = 4,          // Đã thanh lý
    Lost = 5              // Mất/hỏng hoàn toàn
}
