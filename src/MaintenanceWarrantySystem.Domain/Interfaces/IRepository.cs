using MaintenanceWarrantySystem.Domain.Entities;

namespace MaintenanceWarrantySystem.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> GetPagedAsync(int page, int pageSize, string? search = null);
    Task<int> GetTotalCountAsync(string? search = null);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}

public interface IUnitOfWork : IDisposable
{
    ICustomerRepository Customers { get; }
    IDeviceRepository Devices { get; }
    IMaintenanceRequestRepository MaintenanceRequests { get; }
    IWarrantyClaimRepository WarrantyClaims { get; }
    IUserRepository Users { get; }
    IDeviceMaintenanceHistoryRepository MaintenanceHistories { get; }
    IWarrantyClaimHistoryRepository ClaimHistories { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
