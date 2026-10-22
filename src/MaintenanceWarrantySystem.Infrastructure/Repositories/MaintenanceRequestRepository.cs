using Dapper;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;

namespace MaintenanceWarrantySystem.Infrastructure.Repositories;

public class MaintenanceRequestRepository : BaseRepository<MaintenanceRequest>, IMaintenanceRequestRepository
{
    public MaintenanceRequestRepository(DapperContext context) : base(
        context,
        "MaintenanceRequests",
        "Id, RequestCode, Title, Description, Type, Priority, Status, RequestDate, ScheduledDate, StartedAt, CompletedAt, EstimatedCost, ActualCost, TechnicianNotes, CustomerNotes, ReplacementParts, DeviceId, CustomerId, AssignedTechnicianId, CreatedAt, UpdatedAt, IsDeleted",
        "RequestCode, Title, Description, Type, Priority, Status, RequestDate, ScheduledDate, StartedAt, CompletedAt, EstimatedCost, ActualCost, TechnicianNotes, CustomerNotes, ReplacementParts, DeviceId, CustomerId, AssignedTechnicianId, CreatedAt",
        "RequestCode = @RequestCode, Title = @Title, Description = @Description, Type = @Type, Priority = @Priority, Status = @Status, RequestDate = @RequestDate, ScheduledDate = @ScheduledDate, StartedAt = @StartedAt, CompletedAt = @CompletedAt, EstimatedCost = @EstimatedCost, ActualCost = @ActualCost, TechnicianNotes = @TechnicianNotes, CustomerNotes = @CustomerNotes, ReplacementParts = @ReplacementParts, DeviceId = @DeviceId, CustomerId = @CustomerId, AssignedTechnicianId = @AssignedTechnicianId, UpdatedAt = @UpdatedAt")
    {
    }

    protected override string GetInsertParameters()
        => "@RequestCode, @Title, @Description, @Type, @Priority, @Status, @RequestDate, @ScheduledDate, @StartedAt, @CompletedAt, @EstimatedCost, @ActualCost, @TechnicianNotes, @CustomerNotes, @ReplacementParts, @DeviceId, @CustomerId, @AssignedTechnicianId, @CreatedAt";

    public async Task<IEnumerable<MaintenanceRequest>> GetByDeviceIdAsync(int deviceId)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE DeviceId = @DeviceId AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<MaintenanceRequest>(sql, new { DeviceId = deviceId });
    }

    public async Task<IEnumerable<MaintenanceRequest>> GetByCustomerIdAsync(int customerId)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE CustomerId = @CustomerId AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<MaintenanceRequest>(sql, new { CustomerId = customerId });
    }

    public async Task<IEnumerable<MaintenanceRequest>> GetByTechnicianIdAsync(int technicianId)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE AssignedTechnicianId = @TechnicianId AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<MaintenanceRequest>(sql, new { TechnicianId = technicianId });
    }

    public async Task<IEnumerable<MaintenanceRequest>> GetByStatusAsync(MaintenanceStatus status)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Status = @Status AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<MaintenanceRequest>(sql, new { Status = (int)status });
    }

    public async Task<IEnumerable<MaintenanceRequest>> GetByDateRangeAsync(DateTime from, DateTime to)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE RequestDate BETWEEN @From AND @To AND IsDeleted = 0 ORDER BY RequestDate DESC";
        return await connection.QueryAsync<MaintenanceRequest>(sql, new { From = from, To = to });
    }

    public async Task<string> GenerateRequestCodeAsync()
    {
        using var connection = _context.CreateConnection();
        var year = DateTime.Now.Year;
        var prefix = $"YC{year}";
        var sql = $"SELECT MAX(CAST(SUBSTRING(RequestCode, {prefix.Length + 1}, 10) AS INT)) FROM {_tableName} WHERE RequestCode LIKE @Prefix + '%'";
        var maxNum = await connection.ExecuteScalarAsync<int?>(sql, new { Prefix = prefix });
        var nextNum = (maxNum ?? 0) + 1;
        return $"{prefix}{nextNum:D5}";
    }

    protected override string GetSearchClause(string search, DynamicParameters parameters)
    {
        parameters.Add("Search", $"%{search}%");
        return "(RequestCode LIKE @Search OR Title LIKE @Search OR Description LIKE @Search)";
    }
}
