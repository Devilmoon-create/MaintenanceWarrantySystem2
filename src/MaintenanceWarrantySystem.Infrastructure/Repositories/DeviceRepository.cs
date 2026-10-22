using Dapper;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;

namespace MaintenanceWarrantySystem.Infrastructure.Repositories;

public class DeviceRepository : BaseRepository<Device>, IDeviceRepository
{
    public DeviceRepository(DapperContext context) : base(
        context,
        "Devices",
        "Id, Code, SerialNumber, Name, Model, Brand, Category, PurchaseDate, WarrantyExpiryDate, PurchasePrice, Specifications, Status, Location, Notes, CustomerId, CreatedAt, UpdatedAt, IsDeleted",
        "Code, SerialNumber, Name, Model, Brand, Category, PurchaseDate, WarrantyExpiryDate, PurchasePrice, Specifications, Status, Location, Notes, CustomerId, CreatedAt",
        "Code = @Code, SerialNumber = @SerialNumber, Name = @Name, Model = @Model, Brand = @Brand, Category = @Category, PurchaseDate = @PurchaseDate, WarrantyExpiryDate = @WarrantyExpiryDate, PurchasePrice = @PurchasePrice, Specifications = @Specifications, Status = @Status, Location = @Location, Notes = @Notes, CustomerId = @CustomerId, UpdatedAt = @UpdatedAt")
    {
    }

    protected override string GetInsertParameters()
        => "@Code, @SerialNumber, @Name, @Model, @Brand, @Category, @PurchaseDate, @WarrantyExpiryDate, @PurchasePrice, @Specifications, @Status, @Location, @Notes, @CustomerId, @CreatedAt";

    public async Task<Device?> GetByCodeAsync(string code)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Code = @Code AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<Device>(sql, new { Code = code });
    }

    public async Task<Device?> GetBySerialNumberAsync(string serialNumber)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE SerialNumber = @SerialNumber AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<Device>(sql, new { SerialNumber = serialNumber });
    }

    public async Task<IEnumerable<Device>> GetByCustomerIdAsync(int customerId)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE CustomerId = @CustomerId AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<Device>(sql, new { CustomerId = customerId });
    }

    public async Task<IEnumerable<Device>> GetByCategoryAsync(DeviceCategory category)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Category = @Category AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<Device>(sql, new { Category = (int)category });
    }

    public async Task<IEnumerable<Device>> GetByStatusAsync(DeviceStatus status)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Status = @Status AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<Device>(sql, new { Status = (int)status });
    }

    public async Task<IEnumerable<Device>> GetWarrantyExpiringSoonAsync(int days = 30)
    {
        using var connection = _context.CreateConnection();
        var sql = $@"
            SELECT {_columns} FROM {_tableName} 
            WHERE WarrantyExpiryDate IS NOT NULL 
            AND WarrantyExpiryDate BETWEEN GETDATE() AND DATEADD(DAY, @Days, GETDATE())
            AND IsDeleted = 0
            ORDER BY WarrantyExpiryDate ASC";
        return await connection.QueryAsync<Device>(sql, new { Days = days });
    }

    public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
    {
        using var connection = _context.CreateConnection();
        var sql = "SELECT COUNT(1) FROM Devices WHERE Code = @Code AND IsDeleted = 0";
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

    public async Task<bool> IsSerialUniqueAsync(string serial, int? excludeId = null)
    {
        using var connection = _context.CreateConnection();
        var sql = "SELECT COUNT(1) FROM Devices WHERE SerialNumber = @Serial AND IsDeleted = 0";
        var parameters = new DynamicParameters();
        parameters.Add("Serial", serial);
        
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
        return "(Code LIKE @Search OR SerialNumber LIKE @Search OR Name LIKE @Search OR Model LIKE @Search OR Brand LIKE @Search)";
    }
}
