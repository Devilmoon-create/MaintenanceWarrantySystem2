using Dapper;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;

namespace MaintenanceWarrantySystem.Infrastructure.Repositories;

public class WarrantyClaimRepository : BaseRepository<WarrantyClaim>, IWarrantyClaimRepository
{
    public WarrantyClaimRepository(DapperContext context) : base(
        context,
        "WarrantyClaims",
        "Id, ClaimCode, Title, Description, DefectDescription, Type, Status, ClaimDate, ApprovedDate, ResolvedDate, ClaimAmount, ApprovedAmount, Resolution, RejectionReason, Attachments, DeviceId, CustomerId, ProcessedById, CreatedAt, UpdatedAt, IsDeleted",
        "ClaimCode, Title, Description, DefectDescription, Type, Status, ClaimDate, ApprovedDate, ResolvedDate, ClaimAmount, ApprovedAmount, Resolution, RejectionReason, Attachments, DeviceId, CustomerId, ProcessedById, CreatedAt",
        "ClaimCode = @ClaimCode, Title = @Title, Description = @Description, DefectDescription = @DefectDescription, Type = @Type, Status = @Status, ClaimDate = @ClaimDate, ApprovedDate = @ApprovedDate, ResolvedDate = @ResolvedDate, ClaimAmount = @ClaimAmount, ApprovedAmount = @ApprovedAmount, Resolution = @Resolution, RejectionReason = @RejectionReason, Attachments = @Attachments, DeviceId = @DeviceId, CustomerId = @CustomerId, ProcessedById = @ProcessedById, UpdatedAt = @UpdatedAt")
    {
    }

    protected override string GetInsertParameters()
        => "@ClaimCode, @Title, @Description, @DefectDescription, @Type, @Status, @ClaimDate, @ApprovedDate, @ResolvedDate, @ClaimAmount, @ApprovedAmount, @Resolution, @RejectionReason, @Attachments, @DeviceId, @CustomerId, @ProcessedById, @CreatedAt";

    public async Task<IEnumerable<WarrantyClaim>> GetByDeviceIdAsync(int deviceId)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE DeviceId = @DeviceId AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<WarrantyClaim>(sql, new { DeviceId = deviceId });
    }

    public async Task<IEnumerable<WarrantyClaim>> GetByCustomerIdAsync(int customerId)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE CustomerId = @CustomerId AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<WarrantyClaim>(sql, new { CustomerId = customerId });
    }

    public async Task<IEnumerable<WarrantyClaim>> GetByStatusAsync(WarrantyClaimStatus status)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Status = @Status AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<WarrantyClaim>(sql, new { Status = (int)status });
    }

    public async Task<IEnumerable<WarrantyClaim>> GetByDateRangeAsync(DateTime from, DateTime to)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE ClaimDate BETWEEN @From AND @To AND IsDeleted = 0 ORDER BY ClaimDate DESC";
        return await connection.QueryAsync<WarrantyClaim>(sql, new { From = from, To = to });
    }

    public async Task<string> GenerateClaimCodeAsync()
    {
        using var connection = _context.CreateConnection();
        var year = DateTime.Now.Year;
        var prefix = $"BH{year}";
        var sql = $"SELECT MAX(CAST(SUBSTRING(ClaimCode, {prefix.Length + 1}, 10) AS INT)) FROM {_tableName} WHERE ClaimCode LIKE @Prefix + '%'";
        var maxNum = await connection.ExecuteScalarAsync<int?>(sql, new { Prefix = prefix });
        var nextNum = (maxNum ?? 0) + 1;
        return $"{prefix}{nextNum:D5}";
    }

    protected override string GetSearchClause(string search, DynamicParameters parameters)
    {
        parameters.Add("Search", $"%{search}%");
        return "(ClaimCode LIKE @Search OR Title LIKE @Search OR Description LIKE @Search OR DefectDescription LIKE @Search)";
    }
}
