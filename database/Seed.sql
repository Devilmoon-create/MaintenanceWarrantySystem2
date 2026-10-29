/*
 * Database Seed Script for Maintenance Warranty System
 * Generates >= 2,000 sample records
 * Run after applying Schema.sql
 */

-- =============================================
-- Seed Categories (60 records)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Categories)
BEGIN
    INSERT INTO Categories (Code, Name, Description, DefaultWarrantyMonths, MaintenanceCycleMonths)
    VALUES
        ('CAT001', 'Laptop Gaming', 'Laptop gaming cấu hình cao', 24, 12),
        ('CAT002', 'Laptop Văn phòng', 'Laptop dùng cho công việc văn phòng', 24, 12),
        ('CAT003', 'Desktop Office', 'Barebone để làm văn phòng', 24, 12),
        ('CAT004', 'ServerMini', 'Server mini từ 4 luồng', 12, 6),
        ('CAT005', 'PrinterLaser', 'Máy in laser văn phòng', 12, 6),
        ('CAT006', 'PrinterInk', 'Máy in ink cho nhà', 12, 6),
        ('CAT007', 'Scanner', 'Máy quét màu chuyên nghiệp', 18, 12),
        ('CAT008', 'NetworkSwitch', 'Mạng switch 8/16/24 port', 36, 18),
        ('CAT009', 'AccessPoint', 'AP wi-fi 5/6', 24, 12),
        ('CAT010', 'Firewall', 'Mã Guard doanh nghiệp', 36, 18),
        ('CAT011', 'ServerRack', 'Server rack 42U', 12, 6),
        ('CAT012', 'UPS', 'Bộ nguồn dự phòng 1kVA', 24, 12),
        ('CAT013', 'WebCamera', 'Máy quay web HD', 12, 6),
        ('CAT014', 'Headset', 'Tai nghe gaming surround', 12, 6),
        ('CAT015', 'Mouse', 'Chuột không dây gaming', 12, 6),
        ('CAT016', 'Keyboard', 'Bàn phím cơ mechanical', 12, 6),
        ('CAT017', 'Monitor', 'Màn hình 27 inch 4K', 24, 12),
        ('CAT018', 'Monitor2', 'Màn hình 24 inch Full HD', 24, 12),
        ('CAT019', 'Projector', 'Máy chiếu bản đồ', 24, 12),
        ('CAT020', 'ScannerDoc', 'Máy quét văn phòng', 18, 12),
        ('CAT021', 'ScannerOffice', 'Máy quét văn phòng A4', 18, 12),
        ('CAT022', 'Hub1000', 'Hub mạng 1000M', 12, 6),
        ('CAT023', 'CableCat5', 'Cáp mạng Cat5e', 12, 6),
        ('CAT024', 'CableCat6', 'Cáp mạng Cat6', 12, 6),
        ('CAT025', 'UPS5000', 'UPS 5000VA for server', 24, 12),
        ('CAT026', 'Monitor27', 'Màn hình 27 inch 144Hz', 24, 12),
        ('CAT027', 'KeyboardMechanical', 'Bàn phím cơ RGB', 12, 6),
        ('CAT028', 'MouseGaming', 'Chuột gaming RGB', 12, 6),
        ('CAT029', 'HeadsetGaming', 'Tai nghe gaming 7.1', 12, 6),
        ('CAT030', 'Webcam1080', 'Máy quay 1080p HD', 12, 6),
        ('CAT031', 'PrinterEco', 'Máy in ecoTank', 36, 18),
        ('CAT032', 'Monitor34', 'Màn hình 34 inch Curved', 24, 12),
        ('CAT033', 'Monitor24', 'Màn hình 24 inch 1080p', 12, 6),
        ('CAT034', 'Monitor32', 'Màn hình 32 inch 4K', 36, 18),
        ('CAT035', 'ProjectorW', 'Máy chiếu wall projector', 24, 12),
        ('CAT036', 'ScannerA3', 'Máy quét A3', 24, 12),
        ('CAT037', 'Switch8', 'Switch 8 port 1G', 36, 18),
        ('CAT038', 'Switch16', 'Switch 16 port 1G', 36, 18),
        ('CAT039', 'Switch24', 'Switch 24 port 1G', 36, 18),
        ('CAT040', 'Switch48', 'Switch 48 port 1G', 36, 18),
        ('CAT041', 'AccessPoint2', 'AP wi-fi 5 lease', 24, 12),
        ('CAT042', 'AccessPoint5', 'AP wi-fi 5 enterprise', 36, 18),
        ('CAT043', 'AccessPoint6', 'AP wi-fi 6', 36, 18),
        ('CAT044', 'FirewallTenant', 'Mã Guard cloud', 36, 18),
        ('CAT045', 'ServerVirtual', 'Server để virtualize', 24, 12),
        ('CAT046', 'ServerHyper', 'Server cho Hyper-V', 24, 12),
        ('CAT047', 'ServerVMware', 'Server cho VMware', 24, 12),
        ('CAT048', 'PrinterAllin', 'Máy in All-in-One', 24, 12),
        ('CAT049', 'ScannerFlat', 'Máy quét phẳng', 24, 12),
        ('CAT050', 'Hub8', 'Hub 8 port', 12, 6),
        ('CAT051', 'MonitorCurved', 'Màn hình cong 34 inch', 24, 12),
        ('CAT052', 'MonitorUltra', 'Màn hình ultra-wide', 24, 12),
        ('CAT053', 'KeyboardClick', 'Bàn phím mechanical click', 12, 6),
        ('CAT054', 'MouseWireless', 'Chuột không dây Reddy', 12, 6),
        ('CAT055', 'HeadsetStudio', 'Tai nghe studio професионал', 12, 6),
        ('CAT056', 'Webcam4K', 'Máy quay 4K UHD', 18, 12),
        ('CAT057', 'PrinterLabel', 'Máy in nhãn dây chuyền', 24, 12),
        ('CAT058', 'PrinterMultifunction', 'Máy in đa năng', 24, 12),
        ('CAT059', 'ScannerDocu', 'Máy quét văn phòng A3', 18, 12),
        ('CAT060', 'NetworkDevice', 'Thiết bị mạng doanh nghiệp', 36, 18);
END
GO

-- =============================================
-- Seed Customers (200 records)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Customers WHERE Id > 0)
BEGIN
    DECLARE @i INT = 1;
    WHILE @i <= 200
    BEGIN
        DECLARE @code NVARCHAR(20) = 'CUST' + RIGHT('0000' + CAST(@i AS NVARCHAR(4)), 4);
        DECLARE @fullName NVARCHAR(100) = 'Customer ' + CAST(@i AS NVARCHAR(10));
        DECLARE @phone NVARCHAR(20) = '0' + CAST((@i * 7 + 100000000) % 900000000 + 100000000 AS NVARCHAR(10));
        DECLARE @email NVARCHAR(100) = 'customer' + CAST(@i AS NVARCHAR(10)) + '@gmail.com';
        DECLARE @address NVARCHAR(500) = 'Address ' + CAST(@i AS NVARCHAR(10)) + ', District ' + CAST((@i % 5) + 1 AS NVARCHAR(10)) + ', City';
        DECLARE @taxCode NVARCHAR(20) = CAST(@i AS NVARCHAR(10)) + '123456';
        DECLARE @companyName NVARCHAR(200) = CASE WHEN (@i % 2 = 0) THEN 'Company ' + CAST(@i AS NVARCHAR(10)) ELSE NULL END;
        DECLARE @type INT = CASE WHEN (@i % 2 = 0) THEN 2 ELSE 1 END;

        INSERT INTO Customers (Code, FullName, Phone, Email, Address, TaxCode, CompanyName, Type)
        VALUES (@code, @fullName, @phone, @email, @address, @taxCode, @companyName, @type);

        SET @i = @i + 1;
    END
END
GO

-- =============================================
-- Seed Devices (~1,800 records) - Referencing Customers
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Devices WHERE Id > 0)
BEGIN
    DECLARE @catId INT;
    DECLARE @custId INT;
    DECLARE @devId INT = 0;
    
    -- Get max customer id
    SELECT @custId = MAX(Id) FROM Customers;
    
    -- Ensure we have customers
    IF @custId IS NULL OR @custId = 0
    BEGIN
        -- Insert 50 default customers
        INSERT INTO Customers (Code, FullName, Phone, Email, Address, TaxCode)
        VALUES ('CUST0001', 'Default Customer 1', '0900000001', 'default1@gmail.com', 'Default Address 1', '1234567890');
        SET @custId = 1;
    END

    DECLARE @categoryNames TABLE (Id INT IDENTITY(1,1), Name NVARCHAR(100));
    INSERT INTO @categoryNames (Name)
    SELECT Name FROM Categories ORDER BY Name;

    SET @i = 1;
    WHILE @i <= 1800
    BEGIN
        SET @devId = @devId + 1;
        SET @catId = (@i % 60) + 1;
        SET @custId = ((@i % 200) + 1);

        -- Get category name from table
        DECLARE @catName NVARCHAR(100);
        SELECT @catName = Name FROM @categoryNames WHERE Id = @catId;

        -- Generate random purchase date within the last 5 years
        DECLARE @purchaseDate DATE = DATEADD(DAY, -RAND() * 1825, GETDATE());
        DECLARE @warrantyMonths INT = (SELECT DefaultWarrantyMonths FROM Categories WHERE Id = @catId);
        DECLARE @warrantyExpiryDate DATE = DATEADD(MONTH, @warrantyMonths, @purchaseDate);
        DECLARE @purchasePrice DECIMAL(18,2) = ROUND((SELECT DefaultWarrantyMonths FROM Categories WHERE Id = @catId) * 100000 + RAND() * 2000000, 0);

        DECLARE @status INT = 
            CASE 
                WHEN RAND() < 0.7 THEN 1 
                WHEN RAND() < 0.85 THEN 2 
                WHEN RAND() < 0.92 THEN 3 
                WHEN RAND() < 0.96 THEN 4 
                ELSE 5 
            END;

        DECLARE @location NVARCHAR(200) = 'Location ' + CAST((@i % 50) + 1 AS NVARCHAR(10));

        INSERT INTO Devices (Code, SerialNumber, Name, Model, Brand, Category, PurchaseDate, 
                            WarrantyExpiryDate, PurchasePrice, Specifications, Status, Location)
        VALUES ('DEV' + RIGHT('0000' + CAST(@devId AS NVARCHAR(4)), 4), 
                'SN' + RIGHT('00000000' + CAST(@devId AS NVARCHAR(8)), 8) + '@' + RIGHT('0000' + CAST(@i AS NVARCHAR(4)), 4),
                'Device ' + CAST(@devId AS NVARCHAR(10)),
                'Model ' + CAST((@i % 100 + 1) AS NVARCHAR(10)),
                'Brand ' + CAST((@i % 20 + 1) AS NVARCHAR(10)),
                @catId,
                @purchaseDate,
                @warrantyExpiryDate,
                @purchasePrice,
                (SELECT '{"CPU":"' + CHAR(64 + (@i % 8) + 1) + ' Core","RAM":"' + CAST((@i % 16) + 8) + 'GB","Storage":"' + CAST((@i % 6) + 256) + 'GB SSD","GPU":"' + CHAR(64 + (@i % 5) + 1) + 'GB"}' FROM Categories WHERE Id = @catId),
                @status,
                @location);

        SET @i = @i + 1;
    END
END
GO

-- =============================================
-- Seed Maintenance Requests (~2,000 records) - Referencing Devices & Customers
-- =============================================
IF NOT EXISTS (SELECT 1 FROM MaintenanceRequests WHERE Id > 0)
BEGIN
    DECLARE @devId INT;
    DECLARE @custId INT;
    DECLARE @reqId INT = 0;
    
    SELECT @custId = MAX(Id) FROM Customers;
    IF @custId IS NULL OR @custId = 0 SET @custId = 100;
    
    -- Use a CTE to generate numbers
    WITH Nums AS (
        SELECT 1 AS Num UNION ALL SELECT Num + 1 FROM Nums WHERE Num < 2000
    )
    INSERT INTO MaintenanceRequests (RequestCode, Title, Description, Type, Priority, Status, 
                                    RequestDate, ScheduledDate, EstimatedCost, ActualCost,
                                    DeviceId, CustomerId)
    SELECT 
        'MTR' + RIGHT('0000' + CAST(Num AS NVARCHAR(4)), 4),
        'Maintenance Request ' + CAST(Num AS NVARCHAR(10)),
        'Maintenance request for device ' + CAST(Num AS NVARCHAR(10)) + ' - ' + CASE 
            WHEN Num % 3 = 0 THEN 'Preventive check' 
            WHEN Num % 3 = 1 THEN 'Equipment failure detected'
            ELSE 'Upgrade required' 
        END,
        CASE 
            WHEN Num % 5 = 0 THEN 1 
            WHEN Num % 5 = 1 THEN 2 
            WHEN Num % 5 = 2 THEN 3 
            ELSE 4 
        END,
        CASE 
            WHEN Num % 4 = 0 THEN 1 
            WHEN Num % 4 = 1 THEN 2 
            WHEN Num % 4 = 2 THEN 3 
            ELSE 4 
        END,
        CASE 
            WHEN Num % 8 = 0 THEN 1 
            WHEN Num % 8 = 1 THEN 2 
            WHEN Num % 8 = 2 THEN 3 
            WHEN Num % 8 = 3 THEN 4 
            WHEN Num % 8 = 4 THEN 5 
            WHEN Num % 8 = 5 THEN 6 
            WHEN Num % 8 = 6 THEN 7 
            ELSE 8 
        END,
        DATEADD(DAY, -RAND() * 365, GETDATE()),
        CASE 
            WHEN Num % 10 = 0 THEN NULL 
            ELSE DATEADD(DAY, (NUM % 30) * 7, GETDATE()) 
        END,
        ROUND((NUM % 100) * 50000 + RAND() * 2000000, 0),
        ROUND((NUM % 100) * 40000 + RAND() * 1500000, 0),
        (Num % 1800) + 1,
        (Num % 200) + 1
    FROM Nums
    OPTION (MAXRECURSION 2000);
END
GO

-- =============================================
-- Seed Warranty Claims (~2,000 records) - Referencing Devices & Customers
-- =============================================
IF NOT EXISTS (SELECT 1 FROM WarrantyClaims WHERE Id > 0)
BEGIN
    DECLARE @devId INT;
    DECLARE @custId INT;
    DECLARE @claimId INT = 0;
    
    SELECT @custId = MAX(Id) FROM Customers;
    IF @custId IS NULL OR @custId = 0 SET @custId = 100;
    
    -- Use a CTE to generate numbers
    WITH Nums AS (
        SELECT 1 AS Num UNION ALL SELECT Num + 1 FROM Nums WHERE Num < 2000
    )
    INSERT INTO WarrantyClaims (ClaimCode, Title, Description, DefectDescription, Type, Status, 
                               ClaimDate, ApprovedDate, ResolvedDate, ClaimAmount, ApprovedAmount,
                               Resolution, RejectionReason, DeviceId, CustomerId)
    SELECT 
        'WRC' + RIGHT('0000' + CAST(Num AS NVARCHAR(4)), 4),
        'Warranty Claim ' + CAST(Num AS NVARCHAR(10)),
        'Claim issue with device ' + CAST(Num AS NVARCHAR(10)) + ' - ' + CASE 
            WHEN Num % 3 = 0 THEN 'Screen showing defects' 
            WHEN Num % 3 = 1 THEN 'Device not turning on'
            ELSE 'Battery not working' 
        END,
        'Defect details for device ' + CAST(Num AS NVARCHAR(10)) + ': ' + 
            CASE 
                WHEN Num % 2 = 0 THEN 'Display requires calibration'
                WHEN Num % 2 = 1 THEN 'Power supply failure'
                ELSE 'Hardware failure after extended use'
            END,
        CASE 
            WHEN Num % 4 = 0 THEN 1 
            WHEN Num % 4 = 1 THEN 2 
            WHEN Num % 4 = 2 THEN 3 
            ELSE 1 
        END,
        CASE 
            WHEN Num % 7 = 0 THEN 1 
            WHEN Num % 7 = 1 THEN 2 
            WHEN Num % 7 = 2 THEN 3 
            WHEN Num % 7 = 3 THEN 4 
            WHEN Num % 7 = 4 THEN 5 
            WHEN Num % 7 = 5 THEN 6 
            ELSE 7 
        END,
        DATEADD(DAY, -RAND() * 730, GETDATE()),
        CASE 
            WHEN Num % 3 = 0 THEN DATEADD(DAY, -RAND() * 365, GETDATE()) 
            ELSE NULL 
        END,
        CASE 
            WHEN Num % 2 = 0 THEN DATEADD(DAY, -RAND() * 180, GETDATE()) 
            ELSE NULL 
        END,
        ROUND((NUM % 100) * 100000 + RAND() * 5000000, 0),
        CASE 
            WHEN Num % 5 = 0 THEN ROUND((NUM % 100) * 80000 + RAND() * 3000000, 0) 
            ELSE 0 
        END,
        CASE 
            WHEN Num % 4 = 0 THEN 'Repair completed successfully'
            WHEN Num % 4 = 1 THEN 'Parts replaced within warranty period'
            WHEN Num % 4 = 2 THEN 'Service request resolved'
            ELSE NULL 
        END,
        CASE 
            WHEN Num % 6 = 0 THEN 'Device exceeded warranty period'
            WHEN Num % 6 = 1 THEN 'Damage not covered by warranty'
            ELSE NULL 
        END,
        (Num % 1800) + 1,
        (Num % 200) + 1
    FROM Nums
    OPTION (MAXRECURSION 2000);
END
GO

-- =============================================
-- Seed Device Maintenance Histories (~2,000 records)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM DeviceMaintenanceHistories WHERE Id > 0)
BEGIN
    WITH Nums AS (
        SELECT 1 AS Num UNION ALL SELECT Num + 1 FROM Nums WHERE Num < 2000
    )
    INSERT INTO DeviceMaintenanceHistories (DeviceId, MaintenanceRequestId, ActionPerformed, PartsReplaced, Cost, PerformedAt, PerformedById)
    SELECT 
        (Num % 1800) + 1,
        (Num % 2000) + 1,
        'Maintenance action performed on device ' + CAST(Num AS NVARCHAR(10)) + ' - Part replacement',
        CASE 
            WHEN Num % 3 = 0 THEN '{"part1":"$500"}' 
            WHEN Num % 3 = 1 THEN '{"part2":"$300"}' 
            ELSE '{"part3":"$800"}' 
        END,
        ROUND((NUM % 50) * 50000 + RAND() * 1000000, 0),
        DATEADD(DAY, -RAND() * 365, GETDATE()),
        (Num % 10) + 1
    FROM Nums
    OPTION (MAXRECURSION 2000);
END
GO

-- =============================================
-- Seed Warranty Claim Histories (~2,000 records)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM WarrantyClaimHistories WHERE Id > 0)
BEGIN
    WITH Nums AS (
        SELECT 1 AS Num UNION ALL SELECT Num + 1 FROM Nums WHERE Num < 2000
    )
    INSERT INTO WarrantyClaimHistories (WarrantyClaimId, PreviousStatus, NewStatus, Comment, ChangedById)
    SELECT 
        (Num % 2000) + 1,
        CASE 
            WHEN Num % 3 = 0 THEN 1 
            WHEN Num % 3 = 1 THEN 2 
            WHEN Num % 3 = 2 THEN 3 
            ELSE 4 
        END,
        CASE 
            WHEN Num % 7 = 0 THEN 1 
            WHEN Num % 7 = 1 THEN 2 
            WHEN Num % 7 = 2 THEN 3 
            WHEN Num % 7 = 3 THEN 4 
            WHEN Num % 7 = 4 THEN 5 
            WHEN Num % 7 = 5 THEN 6 
            ELSE 7 
        END,
        'Status changed from ' + CAST((Num % 7) + 1 AS NVARCHAR(10)) + ' to ' + CAST((Num % 7) + 1 AS NVARCHAR(10)) + ' - ' + 'Claim updated',
        (Num % 10) + 1,
        GETUTCDATE(),
        0
    FROM Nums
    OPTION (MAXRECURSION 2000);
END
GO

-- =============================================
-- Seed Summary
-- =============================================
PRINT 'Seed completed successfully!';
PRINT 'Categories: ' + CAST((SELECT COUNT(*) FROM Categories) AS NVARCHAR(10));
PRINT 'Customers: ' + CAST((SELECT COUNT(*) FROM Customers) AS NVARCHAR(10));
PRINT 'Devices: ' + CAST((SELECT COUNT(*) FROM Devices) AS NVARCHAR(10));
PRINT 'MaintenanceRequests: ' + CAST((SELECT COUNT(*) FROM MaintenanceRequests) AS NVARCHAR(10));
PRINT 'WarrantyClaims: ' + CAST((SELECT COUNT(*) FROM WarrantyClaims) AS NVARCHAR(10));
PRINT 'DeviceMaintenanceHistories: ' + CAST((SELECT COUNT(*) FROM DeviceMaintenanceHistories) AS NVARCHAR(10));
PRINT 'WarrantyClaimHistories: ' + CAST((SELECT COUNT(*) FROM WarrantyClaimHistories) AS NVARCHAR(10));
PRINT 'Total records: ' + 
    CAST(((SELECT COUNT(*) FROM Categories) +
          (SELECT COUNT(*) FROM Customers) +
          (SELECT COUNT(*) FROM Devices) +
          (SELECT COUNT(*) FROM MaintenanceRequests) +
          (SELECT COUNT(*) FROM WarrantyClaims) +
          (SELECT COUNT(*) FROM DeviceMaintenanceHistories) +
          (SELECT COUNT(*) FROM WarrantyClaimHistories)) AS NVARCHAR(20));
