using Dapper;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;

namespace MaintenanceWarrantySystem.Infrastructure.Repositories;

public class CategoryRepository : BaseRepository<Category>, ICategoryRepository
{
    public CategoryRepository(DapperContext context) : base(
        context,
        "Categories",
        "Id, Code, Name, Description, DefaultWarrantyMonths, MaintenanceCycleMonths, CreatedAt, UpdatedAt, IsDeleted",
        "Code, Name, Description, DefaultWarrantyMonths, MaintenanceCycleMonths, CreatedAt",
        "Code = @Code, Name = @Name, Description = @Description, DefaultWarrantyMonths = @DefaultWarrantyMonths, MaintenanceCycleMonths = @MaintenanceCycleMonths, UpdatedAt = @UpdatedAt")
    {
    }

    protected override string GetInsertParameters()
        => "@Code, @Name, @Description, @DefaultWarrantyMonths, @MaintenanceCycleMonths, @CreatedAt";

    public async Task<Category?> GetByCodeAsync(string code)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Code = @Code AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<Category>(sql, new { Code = code });
    }

    public async Task<IEnumerable<Category>> GetAllWithDeviceCountAsync()
    {
        using var connection = _context.CreateConnection();
        var sql = @"
            SELECT c.Id, c.Code, c.Name, c.Description, c.DefaultWarrantyMonths, c.MaintenanceCycleMonths, c.CreatedAt, c.UpdatedAt, c.IsDeleted,
                   COUNT(d.Id) as DeviceCount
            FROM Categories c
            LEFT JOIN Devices d ON d.Category = c.Id AND d.IsDeleted = 0
            WHERE c.IsDeleted = 0
            GROUP BY c.Id, c.Code, c.Name, c.Description, c.DefaultWarrantyMonths, c.MaintenanceCycleMonths, c.CreatedAt, c.UpdatedAt, c.IsDeleted
            ORDER BY c.CreatedAt DESC";
        return await connection.QueryAsync<Category>(sql);
    }

    public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
    {
        using var connection = _context.CreateConnection();
        var sql = "SELECT COUNT(1) FROM Categories WHERE Code = @Code AND IsDeleted = 0";
        var parameters = new DynamicParameters();
        parameters.Add("Code", code);

        if (excludeId.HasValue)
        {
            sql += " AND Id != @ExcludeId";
            parameters.Add("ExcludeId", excludeId.Value);
        }

        var count = await connection.ExecuteScalarAsync<int>(sql, parameters);
        return count == 0;
    }

    protected override string GetSearchClause(string search, DynamicParameters parameters)
    {
        parameters.Add("Search", $"%{search}%");
        return "(Code LIKE @Search OR Name LIKE @Search OR Description LIKE @Search)";
    }
}
