using Dapper;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;

namespace MaintenanceWarrantySystem.Infrastructure.Repositories;

public class CustomerRepository : BaseRepository<Customer>, ICustomerRepository
{
    public CustomerRepository(DapperContext context) : base(
        context,
        "Customers",
        "Id, Code, FullName, Phone, Email, Address, TaxCode, CompanyName, Type, Notes, CreatedAt, UpdatedAt, IsDeleted",
        "Code, FullName, Phone, Email, Address, TaxCode, CompanyName, Type, Notes, CreatedAt",
        "Code = @Code, FullName = @FullName, Phone = @Phone, Email = @Email, Address = @Address, TaxCode = @TaxCode, CompanyName = @CompanyName, Type = @Type, Notes = @Notes, UpdatedAt = @UpdatedAt")
    {
    }

    protected override string GetInsertParameters()
        => "@Code, @FullName, @Phone, @Email, @Address, @TaxCode, @CompanyName, @Type, @Notes, @CreatedAt";

    public async Task<Customer?> GetByCodeAsync(string code)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Code = @Code AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<Customer>(sql, new { Code = code });
    }

    public async Task<Customer?> GetByEmailAsync(string email)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Email = @Email AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<Customer>(sql, new { Email = email });
    }

    public async Task<Customer?> GetByPhoneAsync(string phone)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Phone = @Phone AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<Customer>(sql, new { Phone = phone });
    }

    public async Task<IEnumerable<Customer>> GetByTypeAsync(CustomerType type)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Type = @Type AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<Customer>(sql, new { Type = (int)type });
    }

    public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
    {
        using var connection = _context.CreateConnection();
        var sql = "SELECT COUNT(1) FROM Customers WHERE Code = @Code AND IsDeleted = 0";
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
        return "(Code LIKE @Search OR FullName LIKE @Search OR Phone LIKE @Search OR Email LIKE @Search OR CompanyName LIKE @Search)";
    }
}
