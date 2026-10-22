using Dapper;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;
using Microsoft.Data.SqlClient;

namespace MaintenanceWarrantySystem.Infrastructure.Repositories;

public abstract class BaseRepository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly DapperContext _context;
    protected readonly string _tableName;
    protected readonly string _columns;
    protected readonly string _insertColumns;
    protected readonly string _updateColumns;

    protected BaseRepository(DapperContext context, string tableName, string columns, string insertColumns, string updateColumns)
    {
        _context = context;
        _tableName = tableName;
        _columns = columns;
        _insertColumns = insertColumns;
        _updateColumns = updateColumns;
    }

    public virtual async Task<T?> GetByIdAsync(int id)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Id = @Id AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<T>(sql, new { Id = id });
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<T>(sql);
    }

    public virtual async Task<IEnumerable<T>> GetPagedAsync(int page, int pageSize, string? search = null)
    {
        using var connection = _context.CreateConnection();
        var offset = (page - 1) * pageSize;
        var whereClause = "WHERE IsDeleted = 0";
        var parameters = new DynamicParameters();
        parameters.Add("Offset", offset);
        parameters.Add("PageSize", pageSize);

        if (!string.IsNullOrWhiteSpace(search))
        {
            whereClause += " AND " + GetSearchClause(search, parameters);
        }

        var sql = $@"
            SELECT {_columns} FROM {_tableName} 
            {whereClause}
            ORDER BY CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

        return await connection.QueryAsync<T>(sql, parameters);
    }

    public virtual async Task<int> GetTotalCountAsync(string? search = null)
    {
        using var connection = _context.CreateConnection();
        var whereClause = "WHERE IsDeleted = 0";
        var parameters = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(search))
        {
            whereClause += " AND " + GetSearchClause(search, parameters);
        }

        var sql = $"SELECT COUNT(*) FROM {_tableName} {whereClause}";
        return await connection.ExecuteScalarAsync<int>(sql, parameters);
    }

    protected virtual string GetSearchClause(string search, DynamicParameters parameters)
    {
        parameters.Add("Search", $"%{search}%");
        return "(1=0)"; // Override in derived classes
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        using var connection = _context.CreateConnection();
        var sql = $@"
            INSERT INTO {_tableName} ({_insertColumns})
            VALUES ({GetInsertParameters()});
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        var parameters = new DynamicParameters();
        foreach (var prop in typeof(T).GetProperties())
        {
            if (prop.CanRead && prop.Name != "Id")
            {
                // Include all properties except Id, even nullable ones and generics
                // Dapper handles null values and nullable types correctly
                parameters.Add(prop.Name, prop.GetValue(entity));
            }
        }

        var newId = await connection.ExecuteScalarAsync<int>(sql, parameters);
        entity.Id = newId;
        return entity;
    }

    public virtual async Task<T> UpdateAsync(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        using var connection = _context.CreateConnection();
        var sql = $@"
            UPDATE {_tableName} SET {_updateColumns} WHERE Id = @Id AND IsDeleted = 0;
            SELECT {_columns} FROM {_tableName} WHERE Id = @Id;";

        await connection.ExecuteAsync(sql, entity);
        return entity;
    }

    public virtual async Task<bool> DeleteAsync(int id)
    {
        using var connection = _context.CreateConnection();
        var sql = $"UPDATE {_tableName} SET IsDeleted = 1, UpdatedAt = GETUTCDATE() WHERE Id = @Id";
        var affected = await connection.ExecuteAsync(sql, new { Id = id });
        return affected > 0;
    }

    public virtual async Task<bool> ExistsAsync(int id)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT COUNT(1) FROM {_tableName} WHERE Id = @Id AND IsDeleted = 0";
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Id = id });
        return count > 0;
    }

    protected abstract string GetInsertParameters();
}
