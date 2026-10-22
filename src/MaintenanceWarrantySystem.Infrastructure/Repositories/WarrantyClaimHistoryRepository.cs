using Dapper;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;

namespace MaintenanceWarrantySystem.Infrastructure.Repositories;

public class WarrantyClaimHistoryRepository : BaseRepository<WarrantyClaimHistory>, IWarrantyClaimHistoryRepository
{
    public WarrantyClaimHistoryRepository(DapperContext context) : base(
        context,
        "WarrantyClaimHistories",
        "Id, WarrantyClaimId, PreviousStatus, NewStatus, Comment, ChangedById, CreatedAt, UpdatedAt, IsDeleted",
        "WarrantyClaimId, PreviousStatus, NewStatus, Comment, ChangedById, CreatedAt",
        "WarrantyClaimId = @WarrantyClaimId, PreviousStatus = @PreviousStatus, NewStatus = @NewStatus, Comment = @Comment, ChangedById = @ChangedById, UpdatedAt = @UpdatedAt")
    {
    }

    protected override string GetInsertParameters()
        => "@WarrantyClaimId, @PreviousStatus, @NewStatus, @Comment, @ChangedById, @CreatedAt";

    public async Task<IEnumerable<WarrantyClaimHistory>> GetByClaimIdAsync(int claimId)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE WarrantyClaimId = @ClaimId AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<WarrantyClaimHistory>(sql, new { ClaimId = claimId });
    }

    protected override string GetSearchClause(string search, DynamicParameters parameters)
    {
        parameters.Add("Search", $"%{search}%");
        return "(Comment LIKE @Search)";
    }
}
