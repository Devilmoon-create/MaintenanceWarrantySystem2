namespace MaintenanceWarrantySystem.Domain.Entities;

public class Customer : BaseEntity
{
    public string Code { get; set; } = string.Empty; // KH001
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? TaxCode { get; set; } // Mã số thuế (nếu là công ty)
    public string? CompanyName { get; set; }
    public CustomerType Type { get; set; } = CustomerType.Individual;
    public string? Notes { get; set; }
    
    // Navigation
    public ICollection<Device> Devices { get; set; } = new List<Device>();
    public ICollection<MaintenanceRequest> MaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
    public ICollection<WarrantyClaim> WarrantyClaims { get; set; } = new List<WarrantyClaim>();
}

public enum CustomerType
{
    Individual = 1,    // Cá nhân
    Company = 2        // Doanh nghiệp
}
