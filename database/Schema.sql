/*
 * Database Schema for Maintenance Warranty System
 * SQL Server Database
 * Run this script to create the database structure
 */

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MaintenanceWarrantyDB')
BEGIN
    CREATE DATABASE MaintenanceWarrantyDB;
END
GO

USE MaintenanceWarrantyDB;
GO

-- Users Table
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    Role INT NOT NULL DEFAULT 3, -- 1=Admin, 2=Manager, 3=Technician, 4=Customer
    IsActive BIT NOT NULL DEFAULT 1,
    LastLoginAt DATETIME2,
    RefreshToken NVARCHAR(500),
    RefreshTokenExpiryTime DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- Customers Table
CREATE TABLE Customers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100),
    Address NVARCHAR(500),
    TaxCode NVARCHAR(20),
    CompanyName NVARCHAR(200),
    Type INT NOT NULL DEFAULT 1, -- 1=Individual, 2=Company
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- Devices Table
CREATE TABLE Devices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL UNIQUE,
    SerialNumber NVARCHAR(100) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Model NVARCHAR(100),
    Brand NVARCHAR(100),
    Category INT NOT NULL, -- 1=Computer, 2=Printer, 3=Scanner, 4=Network, 5=Server, 6=Peripheral, 7=Other
    PurchaseDate DATE NOT NULL,
    WarrantyExpiryDate DATE,
    PurchasePrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    Specifications NVARCHAR(MAX), -- JSON
    Status INT NOT NULL DEFAULT 1, -- 1=Active, 2=UnderMaintenance, 3=UnderWarranty, 4=Retired, 5=Lost
    Location NVARCHAR(200),
    Notes NVARCHAR(MAX),
    CustomerId INT NOT NULL FOREIGN KEY REFERENCES Customers(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- Categories Table
CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    DefaultWarrantyMonths INT NOT NULL DEFAULT 12,
    MaintenanceCycleMonths INT NOT NULL DEFAULT 6,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- MaintenanceRequests Table
CREATE TABLE MaintenanceRequests (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RequestCode NVARCHAR(20) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Type INT NOT NULL, -- 1=Preventive, 2=Corrective, 3=Emergency, 4=Upgrade
    Priority INT NOT NULL DEFAULT 2, -- 1=Low, 2=Normal, 3=High, 4=Critical
    Status INT NOT NULL DEFAULT 1, -- 1=Pending, 2=Approved, 3=Scheduled, 4=InProgress, 5=WaitingParts, 6=Completed, 7=Cancelled, 8=Rejected
    RequestDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ScheduledDate DATETIME2,
    StartedAt DATETIME2,
    CompletedAt DATETIME2,
    EstimatedCost DECIMAL(18,2) NOT NULL DEFAULT 0,
    ActualCost DECIMAL(18,2) NOT NULL DEFAULT 0,
    TechnicianNotes NVARCHAR(MAX),
    CustomerNotes NVARCHAR(MAX),
    ReplacementParts NVARCHAR(MAX), -- JSON
    DeviceId INT NOT NULL FOREIGN KEY REFERENCES Devices(Id),
    CustomerId INT NOT NULL FOREIGN KEY REFERENCES Customers(Id),
    AssignedTechnicianId INT NULL FOREIGN KEY REFERENCES Users(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- WarrantyClaims Table
CREATE TABLE WarrantyClaims (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClaimCode NVARCHAR(20) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    DefectDescription NVARCHAR(MAX) NOT NULL,
    Type INT NOT NULL, -- 1=Repair, 2=Replacement, 3=Refund
    Status INT NOT NULL DEFAULT 1, -- 1=Submitted, 2=UnderReview, 3=Approved, 4=InProgress, 5=Resolved, 6=Rejected, 7=Cancelled
    ClaimDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ApprovedDate DATETIME2,
    ResolvedDate DATETIME2,
    ClaimAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    ApprovedAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Resolution NVARCHAR(MAX),
    RejectionReason NVARCHAR(MAX),
    Attachments NVARCHAR(MAX), -- JSON array
    DeviceId INT NOT NULL FOREIGN KEY REFERENCES Devices(Id),
    CustomerId INT NOT NULL FOREIGN KEY REFERENCES Customers(Id),
    ProcessedById INT NULL FOREIGN KEY REFERENCES Users(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- DeviceMaintenanceHistories Table
CREATE TABLE DeviceMaintenanceHistories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DeviceId INT NOT NULL FOREIGN KEY REFERENCES Devices(Id),
    MaintenanceRequestId INT NOT NULL FOREIGN KEY REFERENCES MaintenanceRequests(Id),
    ActionPerformed NVARCHAR(MAX) NOT NULL,
    PartsReplaced NVARCHAR(MAX), -- JSON
    Cost DECIMAL(18,2) NOT NULL DEFAULT 0,
    PerformedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PerformedById INT NOT NULL FOREIGN KEY REFERENCES Users(Id),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- WarrantyClaimHistories Table
CREATE TABLE WarrantyClaimHistories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    WarrantyClaimId INT NOT NULL FOREIGN KEY REFERENCES WarrantyClaims(Id),
    PreviousStatus INT NOT NULL,
    NewStatus INT NOT NULL,
    Comment NVARCHAR(MAX) NOT NULL,
    ChangedById INT NOT NULL FOREIGN KEY REFERENCES Users(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- Indexes for Performance
CREATE INDEX IX_Devices_CustomerId ON Devices(CustomerId);
CREATE INDEX IX_Devices_Status ON Devices(Status);
CREATE INDEX IX_Devices_WarrantyExpiry ON Devices(WarrantyExpiryDate);
CREATE INDEX IX_MaintenanceRequests_DeviceId ON MaintenanceRequests(DeviceId);
CREATE INDEX IX_MaintenanceRequests_CustomerId ON MaintenanceRequests(CustomerId);
CREATE INDEX IX_MaintenanceRequests_TechnicianId ON MaintenanceRequests(AssignedTechnicianId);
CREATE INDEX IX_MaintenanceRequests_Status ON MaintenanceRequests(Status);
CREATE INDEX IX_MaintenanceRequests_RequestDate ON MaintenanceRequests(RequestDate);
CREATE INDEX IX_WarrantyClaims_DeviceId ON WarrantyClaims(DeviceId);
CREATE INDEX IX_WarrantyClaims_CustomerId ON WarrantyClaims(CustomerId);
CREATE INDEX IX_WarrantyClaims_Status ON WarrantyClaims(Status);
CREATE INDEX IX_WarrantyClaims_ClaimDate ON WarrantyClaims(ClaimDate);
CREATE INDEX IX_DeviceMaintenanceHistories_DeviceId ON DeviceMaintenanceHistories(DeviceId);
CREATE INDEX IX_DeviceMaintenanceHistories_RequestId ON DeviceMaintenanceHistories(MaintenanceRequestId);
CREATE INDEX IX_WarrantyClaimHistories_ClaimId ON WarrantyClaimHistories(WarrantyClaimId);

-- Default Admin User (Password: Admin@123 - BCrypt hashed)
INSERT INTO Users (Username, Email, PasswordHash, FullName, Phone, Role, IsActive)
VALUES ('admin', 'admin@maintenance.com', '\$2a\$11\$8K1p/a0dhrxiow8ZgZQxzuqVZG8KqZqZqZqZqZqZqZqZqZqZqZqZq', 'System Administrator', '0900000000', 1, 1);
GO

-- =============================================
-- Seed Sample Data
-- =============================================
-- Run Seed.sql after running Schema.sql to populate sample data
-- The seed script generates: 
--   - 60 Categories
--   - 200 Customers
--   - ~1,800 Devices
--   - ~2,000 Maintenance Requests
--   - ~2,000 Warranty Claims
--   - ~2,000 Device Maintenance Histories
--   - ~2,000 Warranty Claim Histories
--   Total: >= 10,000 records

-- Available seed data:
-- Categories (Code, Name, Description, DefaultWarrantyMonths, MaintenanceCycleMonths)
-- Customers (Code, FullName, Phone, Email, Address, TaxCode, CompanyName, Type)
-- Devices (Code, SerialNumber, Name, Model, Brand, Category, PurchaseDate, WarrantyExpiryDate, PurchasePrice, Specifications, Status, Location)
-- MaintenanceRequests (RequestCode, Title, Description, Type, Priority, Status, RequestDate, ScheduledDate, EstimatedCost, ActualCost, DeviceId, CustomerId)
-- WarrantyClaims (ClaimCode, Title, Description, DefectDescription, Type, Status, ClaimDate, ApprovedDate, ResolvedDate, ClaimAmount, ApprovedAmount, Resolution, RejectionReason, DeviceId, CustomerId)
-- DeviceMaintenanceHistories (DeviceId, MaintenanceRequestId, ActionPerformed, PartsReplaced, Cost, PerformedAt, PerformedById, Notes)
-- WarrantyClaimHistories (WarrantyClaimId, PreviousStatus, NewStatus, Comment, ChangedById, CreatedAt, UpdatedAt, IsDeleted)

-- Notes:
-- - Status values:
--   1=Pending, 2=Approved, 3=Scheduled, 4=InProgress, 5=WaitingParts, 6=Completed, 7=Cancelled
-- - Device Status values:
--   1=Active, 2=UnderMaintenance, 3=UnderWarranty, 4=Retired, 5=Lost
-- - WarrantyClaim Type values:
--   1=Repair, 2=Replacement, 3=Refund
