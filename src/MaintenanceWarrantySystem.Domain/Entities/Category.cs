namespace MaintenanceWarrantySystem.Domain.Entities;

public class Category : BaseEntity
{
    public string Code { get; set; } = string.Empty; // PC, LAPTOP, PRINTER, etc.
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DefaultWarrantyMonths { get; set; }
    public int MaintenanceCycleMonths { get; set; }

    // Navigation
    public ICollection<Device> Devices { get; set; } = new List<Device>();
}
