using System.Data.SqlClient;
using BCrypt.Net;

var connectionString = "Server=(localdb)\\MSSQLLocalDB;Database=MaintenanceWarrantyDb;Trusted_Connection=True;";
var hash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
Console.WriteLine($"Generated hash: {hash}");

using var conn = new SqlConnection(connectionString);
await conn.OpenAsync();
var cmd = new SqlCommand("UPDATE Users SET PasswordHash = @hash WHERE Username = 'admin'", conn);
cmd.Parameters.AddWithValue("@hash", hash);
var rows = await cmd.ExecuteNonQueryAsync();
Console.WriteLine($"Rows updated: {rows}");
