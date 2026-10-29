using MaintenanceWarrantySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dapper;

namespace MaintenanceWarrantySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly DapperContext _context;

    public UsersController(DapperContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? role = null,
        [FromQuery] string? status = null)
    {
        using var connection = _context.CreateConnection();

        var whereClause = "WHERE IsDeleted = 0";
        var parameters = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(search))
        {
            whereClause += " AND (Username LIKE @Search OR FullName LIKE @Search OR Email LIKE @Search OR Phone LIKE @Search)";
            parameters.Add("Search", $"%{search}%");
        }

        if (role.HasValue)
        {
            whereClause += " AND Role = @Role";
            parameters.Add("Role", role.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status == "active") whereClause += " AND IsActive = 1";
            else if (status == "inactive") whereClause += " AND IsActive = 0";
        }

        var totalCount = await connection.ExecuteScalarAsync<int>(
            $"SELECT COUNT(*) FROM Users {whereClause}", parameters);

        var offset = (page - 1) * pageSize;
        parameters.Add("Offset", offset);
        parameters.Add("PageSize", pageSize);

        var users = await connection.QueryAsync<dynamic>(
            $@"SELECT Id, Username, Email, FullName, Phone, Role, IsActive, LastLoginAt, CreatedAt, UpdatedAt
               FROM Users {whereClause}
               ORDER BY CreatedAt DESC
               OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY", parameters);

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return Ok(new
        {
            items = users,
            totalCount,
            page,
            pageSize,
            totalPages
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        using var connection = _context.CreateConnection();
        var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT Id, Username, Email, FullName, Phone, Role, IsActive, LastLoginAt, CreatedAt, UpdatedAt FROM Users WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id });

        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng" });

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateUserRequest dto)
    {
        using var connection = _context.CreateConnection();

        // Check duplicate username/email
        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Users WHERE (Username = @Username OR Email = @Email) AND IsDeleted = 0",
            new { dto.Username, dto.Email });

        if (exists > 0)
            return BadRequest(new { message = "Tên đăng nhập hoặc email đã tồn tại" });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var id = await connection.ExecuteScalarAsync<int>(
            @"INSERT INTO Users (Username, Email, PasswordHash, FullName, Phone, Role, IsActive, CreatedAt)
              OUTPUT INSERTED.Id
              VALUES (@Username, @Email, @PasswordHash, @FullName, @Phone, @Role, 1, GETUTCDATE())",
            new
            {
                dto.Username,
                dto.Email,
                PasswordHash = passwordHash,
                dto.FullName,
                dto.Phone,
                dto.Role
            });

        var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT Id, Username, Email, FullName, Phone, Role, IsActive, CreatedAt FROM Users WHERE Id = @Id",
            new { Id = id });

        return CreatedAtAction(nameof(GetById), new { id }, user);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateUserRequest dto)
    {
        using var connection = _context.CreateConnection();

        // Check user exists
        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Users WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id });

        if (exists == 0)
            return NotFound(new { message = "Không tìm thấy người dùng" });

        // Check duplicate email
        var emailExists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Users WHERE Email = @Email AND Id != @Id AND IsDeleted = 0",
            new { dto.Email, Id = id });

        if (emailExists > 0)
            return BadRequest(new { message = "Email đã tồn tại" });

        await connection.ExecuteAsync(
            @"UPDATE Users SET FullName = @FullName, Email = @Email, Phone = @Phone, 
              Role = @Role, IsActive = @IsActive, UpdatedAt = GETUTCDATE()
              WHERE Id = @Id AND IsDeleted = 0",
            new
            {
                Id = id,
                dto.FullName,
                dto.Email,
                dto.Phone,
                dto.Role,
                dto.IsActive
            });

        var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT Id, Username, Email, FullName, Phone, Role, IsActive, CreatedAt, UpdatedAt FROM Users WHERE Id = @Id",
            new { Id = id });

        return Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        using var connection = _context.CreateConnection();

        var affected = await connection.ExecuteAsync(
            "UPDATE Users SET IsDeleted = 1, UpdatedAt = GETUTCDATE() WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id });

        if (affected == 0)
            return NotFound(new { message = "Không tìm thấy người dùng" });

        return NoContent();
    }

    [HttpPost("{id}/reset-password")]
    public async Task<ActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest dto)
    {
        using var connection = _context.CreateConnection();

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

        var affected = await connection.ExecuteAsync(
            "UPDATE Users SET PasswordHash = @PasswordHash, UpdatedAt = GETUTCDATE() WHERE Id = @Id AND IsDeleted = 0",
            new { PasswordHash = passwordHash, Id = id });

        if (affected == 0)
            return NotFound(new { message = "Không tìm thấy người dùng" });

        return Ok(new { message = "Đặt lại mật khẩu thành công" });
    }

    [HttpGet("roles")]
    public ActionResult GetRoles()
    {
        var roles = new[]
        {
            new { id = 1, name = "Admin", description = "Quản trị viên hệ thống" },
            new { id = 2, name = "Manager", description = "Quản lý" },
            new { id = 3, name = "Technician", description = "Kỹ thuật viên" },
            new { id = 4, name = "Customer", description = "Khách hàng" }
        };

        return Ok(roles);
    }
}

// Request DTOs for Users
public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int Role { get; set; } = 3;
}

public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int Role { get; set; } = 3;
    public bool IsActive { get; set; } = true;
}

public class ResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}
