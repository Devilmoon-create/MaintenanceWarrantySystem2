using Dapper;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;
using MaintenanceWarrantySystem.Infrastructure.Data;

namespace MaintenanceWarrantySystem.Infrastructure.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(DapperContext context) : base(
        context,
        "Users",
        "Id, Username, Email, PasswordHash, FullName, Phone, Role, IsActive, LastLoginAt, RefreshToken, RefreshTokenExpiryTime, CreatedAt, UpdatedAt, IsDeleted",
        "Username, Email, PasswordHash, FullName, Phone, Role, IsActive, LastLoginAt, RefreshToken, RefreshTokenExpiryTime, CreatedAt",
        "Username = @Username, Email = @Email, PasswordHash = @PasswordHash, FullName = @FullName, Phone = @Phone, Role = @Role, IsActive = @IsActive, LastLoginAt = @LastLoginAt, RefreshToken = @RefreshToken, RefreshTokenExpiryTime = @RefreshTokenExpiryTime, UpdatedAt = @UpdatedAt")
    {
    }

    protected override string GetInsertParameters()
        => "@Username, @Email, @PasswordHash, @FullName, @Phone, @Role, @IsActive, @LastLoginAt, @RefreshToken, @RefreshTokenExpiryTime, @CreatedAt";

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Username = @Username AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Username = username });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Email = @Email AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE RefreshToken = @RefreshToken AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { RefreshToken = refreshToken });
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Role = @Role AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<User>(sql, new { Role = (int)role });
    }

    public async Task<bool> IsUsernameUniqueAsync(string username, int? excludeId = null)
    {
        using var connection = _context.CreateConnection();
        var sql = "SELECT COUNT(1) FROM Users WHERE Username = @Username AND IsDeleted = 0";
        var parameters = new DynamicParameters();
        parameters.Add("Username", username);
        
        if (excludeId.HasValue)
        {
            sql += " AND Id != @ExcludeId";
            parameters.Add("ExcludeId", excludeId.Value);
        }
        
        var count = await connection.ExecuteScalarAsync<int>(sql, parameters);
        return count == 0;
    }

    public async Task<bool> IsEmailUniqueAsync(string email, int? excludeId = null)
    {
        using var connection = _context.CreateConnection();
        var sql = "SELECT COUNT(1) FROM Users WHERE Email = @Email AND IsDeleted = 0";
        var parameters = new DynamicParameters();
        parameters.Add("Email", email);
        
        if (excludeId.HasValue)
        {
            sql += " AND Id != @ExcludeId";
            parameters.Add("ExcludeId", excludeId.Value);
        }
        
        var count = await connection.ExecuteScalarAsync<int>(sql, parameters);
        return count == 0;
    }

    public async Task<User?> ValidateCredentialsAsync(string username, string passwordHash)
    {
        using var connection = _context.CreateConnection();
        var sql = $"SELECT {_columns} FROM {_tableName} WHERE Username = @Username AND PasswordHash = @PasswordHash AND IsDeleted = 0 AND IsActive = 1";
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Username = username, PasswordHash = passwordHash });
    }

    protected override string GetSearchClause(string search, DynamicParameters parameters)
    {
        parameters.Add("Search", $"%{search}%");
        return "(Username LIKE @Search OR Email LIKE @Search OR FullName LIKE @Search OR Phone LIKE @Search)";
    }
}
