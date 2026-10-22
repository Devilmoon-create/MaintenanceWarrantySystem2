using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;
using MaintenanceWarrantySystem.Infrastructure.Repositories;
using Microsoft.Data.SqlClient;

namespace MaintenanceWarrantySystem.Infrastructure.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly DapperContext _context;
    private SqlConnection? _connection;
    private SqlTransaction? _transaction;
    private bool _disposed = false;

    public ICustomerRepository Customers { get; }
    public IDeviceRepository Devices { get; }
    public IMaintenanceRequestRepository MaintenanceRequests { get; }
    public IWarrantyClaimRepository WarrantyClaims { get; }
    public IUserRepository Users { get; }
    public IDeviceMaintenanceHistoryRepository MaintenanceHistories { get; }
    public IWarrantyClaimHistoryRepository ClaimHistories { get; }

    public UnitOfWork(DapperContext context)
    {
        _context = context;
        Customers = new CustomerRepository(context);
        Devices = new DeviceRepository(context);
        MaintenanceRequests = new MaintenanceRequestRepository(context);
        WarrantyClaims = new WarrantyClaimRepository(context);
        Users = new UserRepository(context);
        MaintenanceHistories = new DeviceMaintenanceHistoryRepository(context);
        ClaimHistories = new WarrantyClaimHistoryRepository(context);
    }

    public async Task BeginTransactionAsync()
    {
        _connection = _context.CreateConnection();
        await _connection.OpenAsync();
        _transaction = _connection.BeginTransaction();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            _transaction.Commit();
            _transaction.Dispose();
            _transaction = null;
        }
        if (_connection != null)
        {
            await _connection.CloseAsync();
            _connection.Dispose();
            _connection = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            _transaction.Rollback();
            _transaction.Dispose();
            _transaction = null;
        }
        if (_connection != null)
        {
            await _connection.CloseAsync();
            _connection.Dispose();
            _connection = null;
        }
    }

    public async Task<int> SaveChangesAsync()
    {
        // With Dapper, changes are saved immediately per operation
        // This method exists for interface compatibility
        return await Task.FromResult(1);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _transaction?.Dispose();
            _connection?.Dispose();
            _disposed = true;
        }
    }
}
