using MaintenanceWarrantySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dapper;

namespace MaintenanceWarrantySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DapperContext _context;

    public DashboardController(DapperContext context)
    {
        _context = context;
    }

    [HttpGet("overview")]
    public async Task<ActionResult> GetOverview()
    {
        using var connection = _context.CreateConnection();

        var totalDevices = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Devices WHERE IsDeleted = 0");

        var activeDevices = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Devices WHERE IsDeleted = 0 AND Status = 1");

        var maintenanceDevices = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Devices WHERE IsDeleted = 0 AND Status IN (2, 3)");

        var expiringWarranty = await connection.ExecuteScalarAsync<int>(
            @"SELECT COUNT(*) FROM Devices 
              WHERE IsDeleted = 0 AND WarrantyExpiryDate IS NOT NULL 
              AND WarrantyExpiryDate BETWEEN GETUTCDATE() AND DATEADD(day, 30, GETUTCDATE())");

        // Monthly trends (compare with last month)
        var thisMonthMaintenance = await connection.ExecuteScalarAsync<int>(
            @"SELECT COUNT(*) FROM MaintenanceRequests 
              WHERE IsDeleted = 0 AND MONTH(CreatedAt) = MONTH(GETUTCDATE()) AND YEAR(CreatedAt) = YEAR(GETUTCDATE())");

        var lastMonthMaintenance = await connection.ExecuteScalarAsync<int>(
            @"SELECT COUNT(*) FROM MaintenanceRequests 
              WHERE IsDeleted = 0 AND MONTH(CreatedAt) = MONTH(DATEADD(month, -1, GETUTCDATE())) AND YEAR(CreatedAt) = YEAR(DATEADD(month, -1, GETUTCDATE()))");

        var deviceTrend = lastMonthMaintenance > 0 
            ? Math.Round(((double)(thisMonthMaintenance - lastMonthMaintenance) / lastMonthMaintenance) * 100, 1) 
            : 0;

        return Ok(new
        {
            totalDevices,
            activeDevices,
            maintenanceDevices,
            expiringWarranty,
            deviceTrend,
            activeTrend = 0,
            maintenanceTrend = thisMonthMaintenance,
            warrantyTrend = expiringWarranty
        });
    }

    [HttpGet("devices/stats")]
    public async Task<ActionResult> GetDeviceStats()
    {
        using var connection = _context.CreateConnection();

        var stats = await connection.QueryAsync<dynamic>(
            @"SELECT Status, COUNT(*) as Count 
              FROM Devices WHERE IsDeleted = 0 
              GROUP BY Status");

        var statusLabels = new Dictionary<int, string>
        {
            { 1, "Hoạt động" },
            { 2, "Đang bảo trì" },
            { 3, "Đang bảo hành" },
            { 4, "Ngưng sử dụng" },
            { 5, "Mất/Thất lạc" }
        };

        var labels = new List<string>();
        var data = new List<int>();
        var backgroundColors = new List<string>
        {
            "#22c55e", "#f59e0b", "#3b82f6", "#6b7280", "#ef4444"
        };

        foreach (var stat in stats)
        {
            int status = (int)stat.Status;
            labels.Add(statusLabels.ContainsKey(status) ? statusLabels[status] : $"Trạng thái {status}");
            data.Add((int)stat.Count);
        }

        return Ok(new
        {
            labels,
            datasets = new[]
            {
                new
                {
                    data,
                    backgroundColor = backgroundColors.Take(data.Count).ToList(),
                    borderWidth = 0,
                    hoverOffset = 8
                }
            }
        });
    }

    [HttpGet("maintenance/chart")]
    public async Task<ActionResult> GetMaintenanceChart([FromQuery] int months = 12)
    {
        using var connection = _context.CreateConnection();

        var maintenanceData = await connection.QueryAsync<dynamic>(
            @"SELECT 
                FORMAT(RequestDate, 'yyyy-MM') as Month,
                COUNT(*) as Count
              FROM MaintenanceRequests 
              WHERE IsDeleted = 0 AND RequestDate >= DATEADD(month, -@Months, GETUTCDATE())
              GROUP BY FORMAT(RequestDate, 'yyyy-MM')
              ORDER BY Month",
            new { Months = months });

        var warrantyData = await connection.QueryAsync<dynamic>(
            @"SELECT 
                FORMAT(ClaimDate, 'yyyy-MM') as Month,
                COUNT(*) as Count
              FROM WarrantyClaims 
              WHERE IsDeleted = 0 AND ClaimDate >= DATEADD(month, -@Months, GETUTCDATE())
              GROUP BY FORMAT(ClaimDate, 'yyyy-MM')
              ORDER BY Month",
            new { Months = months });

        // Build labels for last N months
        var labels = new List<string>();
        var maintenance = new List<int>();
        var warranty = new List<int>();

        var maintenanceDict = maintenanceData.ToDictionary(x => (string)x.Month, x => (int)x.Count);
        var warrantyDict = warrantyData.ToDictionary(x => (string)x.Month, x => (int)x.Count);

        for (int i = months - 1; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var key = date.ToString("yyyy-MM");
            labels.Add($"T{date.Month}");
            maintenance.Add(maintenanceDict.ContainsKey(key) ? maintenanceDict[key] : 0);
            warranty.Add(warrantyDict.ContainsKey(key) ? warrantyDict[key] : 0);
        }

        return Ok(new
        {
            labels,
            maintenance,
            warranty,
            datasets = new[]
            {
                new
                {
                    label = "Bảo trì",
                    data = maintenance,
                    borderColor = "#6366f1",
                    backgroundColor = "rgba(99, 102, 241, 0.1)",
                    fill = true,
                    tension = 0.4
                },
                new
                {
                    label = "Bảo hành",
                    data = warranty,
                    borderColor = "#ec4899",
                    backgroundColor = "rgba(236, 72, 153, 0.1)",
                    fill = true,
                    tension = 0.4
                }
            }
        });
    }

    [HttpGet("recent-activity")]
    public async Task<ActionResult> GetRecentActivity([FromQuery] int limit = 10)
    {
        using var connection = _context.CreateConnection();

        var activities = await connection.QueryAsync<dynamic>(
            @"SELECT TOP (@Limit) * FROM (
                SELECT 
                    'maintenance' as EntityType,
                    mr.Id,
                    mr.RequestCode as Code,
                    mr.Title as Description,
                    'create' as Action,
                    mr.CreatedAt
                FROM MaintenanceRequests mr WHERE mr.IsDeleted = 0
                
                UNION ALL
                
                SELECT 
                    'warranty' as EntityType,
                    wc.Id,
                    wc.ClaimCode as Code,
                    wc.Title as Description,
                    'create' as Action,
                    wc.CreatedAt
                FROM WarrantyClaims wc WHERE wc.IsDeleted = 0
              ) AS Combined
              ORDER BY CreatedAt DESC",
            new { Limit = limit });

        return Ok(activities);
    }

    [HttpGet("alerts")]
    public async Task<ActionResult> GetAlerts()
    {
        using var connection = _context.CreateConnection();

        var expiringWarranty = await connection.QueryAsync<dynamic>(
            @"SELECT TOP 10
                d.Id, d.Code, d.Name as DeviceName, d.WarrantyExpiryDate,
                DATEDIFF(day, GETUTCDATE(), d.WarrantyExpiryDate) as DaysRemaining,
                'Thiết bị ' + d.Name + ' sẽ hết bảo hành trong ' + 
                    CAST(DATEDIFF(day, GETUTCDATE(), d.WarrantyExpiryDate) AS NVARCHAR) + ' ngày' as Message
              FROM Devices d
              WHERE d.IsDeleted = 0 AND d.WarrantyExpiryDate IS NOT NULL
              AND d.WarrantyExpiryDate BETWEEN GETUTCDATE() AND DATEADD(day, 30, GETUTCDATE())
              ORDER BY d.WarrantyExpiryDate ASC");

        var overdueMaintenance = await connection.QueryAsync<dynamic>(
            @"SELECT TOP 10
                mr.Id, mr.RequestCode as Code, mr.Title as DeviceName,
                mr.ScheduledDate as DueDate,
                'Phiếu ' + mr.RequestCode + ' đã quá hạn xử lý' as Message
              FROM MaintenanceRequests mr
              WHERE mr.IsDeleted = 0 AND mr.Status NOT IN (6, 7, 8)
              AND mr.ScheduledDate IS NOT NULL AND mr.ScheduledDate < GETUTCDATE()
              ORDER BY mr.ScheduledDate ASC");

        return Ok(new
        {
            expiringWarranty,
            overdueMaintenance,
            lowStock = Array.Empty<object>()
        });
    }
}
