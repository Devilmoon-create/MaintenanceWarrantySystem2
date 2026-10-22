using Dapper;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;

namespace MaintenanceWarrantySystem.Infrastructure.Repositories;

public class DeviceMaintenanceHistoryRepository : BaseRepository<DeviceMaintenanceHistory>, IDeviceMaintenanceHistoryRepository
{
    public DeviceMaintenanceHistoryRepository(DapperContext context) : base(
        context,
        "DeviceMaintenanceHistories",
        "Id, DeviceId, MaintenanceRequestId, ActionPerformed, PartsReplaced, Cost, PerformedAt, PerformedById, Notes, CreatedAt, UpdatedAt, IsDeleted",
        "DeviceId, MaintenanceRequestId, ActionPerformed, PartsReplaced, Cost, PerformedAt, PerformedById, Notes, CreatedAt",
        "DeviceId = @DeviceId, MaintenanceRequestId = @MaintenanceRequestId, ActionPerformed = @ActionPerformed, PartsReplaced = @PartsReplaced, Cost = @Cost, PerformedAt = @PerformedAt, PerformedById = @PerformedById, Notes = @Notes, UpdatedAt = @UpdatedAt")
    {
    }

    protected override string GetInsertParameters()
        => "@DeviceId, @MaintenanceRequestId, @ActionPerformed, @PartsReplaced, @Cost, @PerformedAt, @PerformedById, @Notes, @CreatedAt";

    public async Task<IEnumerable<DeviceMaintenanceHistory>> GetByDeviceIdAsync(int deviceId)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE DeviceId = @DeviceId AND IsDeleted = 0 ORDER BY PerformedAt DESC";
        return await connection.QueryAsync<DeviceMaintenanceHistory>(sql, new { DeviceId = deviceId });
    }

    public async Task<IEnumerable<DeviceMaintenanceHistory>> GetByMaintenanceRequestIdAsync(int requestId)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE MaintenanceRequestId = @RequestId AND IsDeleted = 0 ORDER BY PerformedAt DESC";
        return await connection.QueryAsync<DeviceMaintenanceHistory>(sql, new { RequestId = requestId });
    }

    protected override string GetSearchClause(string search, DynamicParameters parameters)
    {
        parameters.Add("Search", $"%{search}%");
        return "(ActionPerformed LIKE @Search OR Notes LIKE @Search)";
    }
}
