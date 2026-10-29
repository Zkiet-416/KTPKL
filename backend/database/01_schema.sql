/* ============================================================
   01_schema.sql  -  TẠO BẢNG, KHÓA, RÀNG BUỘC, INDEX

   Quy ước:
   - Viết dạng IDEMPOTENT: chạy lại nhiều lần không lỗi, ví dụ:
       IF OBJECT_ID(N'dbo.Products', N'U') IS NULL
       BEGIN
           CREATE TABLE dbo.Products (...);
       END
     (sau mỗi khối nhớ có 1 dòng lệnh GO riêng - KHÔNG viết dòng GO trong comment)
   - Dùng NVARCHAR cho chuỗi tiếng Việt.
   - Mỗi bảng có khóa chính, các cột thời gian: CreatedAt, UpdatedAt.
   - Thứ tự tạo bảng: bảng cha trước, bảng con (có FK) sau.
   - Tên bảng/cột dùng tiếng Anh, thống nhất với entity trong thư mục entities của từng module trong backend/src/modules
   ============================================================ */

USE QuanLyKhoPhuKien;
GO

-- 1. Bảng Roles (Phân quyền)
IF OBJECT_ID(N'dbo.Roles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(30) NOT NULL UNIQUE,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(255) NULL
    );
END
GO

-- 2. Bảng Users (Người dùng hệ thống)
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100) NULL,
        Phone NVARCHAR(20) NULL,
        RoleId INT NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT(1),
        LastLoginAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT(GETDATE()),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id)
    );
    CREATE INDEX IX_Users_RoleId ON dbo.Users(RoleId);
END
GO

-- 3. Bảng Suppliers (Nhà cung cấp)
IF OBJECT_ID(N'dbo.Suppliers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Suppliers (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL UNIQUE,
        ContactName NVARCHAR(100) NULL,
        Phone VARCHAR(20) NOT NULL,
        Email NVARCHAR(100) NULL,
        Address NVARCHAR(255) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Suppliers_IsActive DEFAULT(1),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Suppliers_CreatedAt DEFAULT(GETDATE()),
        UpdatedAt DATETIME2 NULL
    );
    CREATE INDEX IX_Suppliers_Name ON dbo.Suppliers(Name);
    CREATE INDEX IX_Suppliers_Phone ON dbo.Suppliers(Phone);
END
GO

-- 4. Bảng Categories (Loại sản phẩm)
IF OBJECT_ID(N'dbo.Categories', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Description NVARCHAR(255) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Categories_IsActive DEFAULT(1),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Categories_CreatedAt DEFAULT(GETDATE()),
        UpdatedAt DATETIME2 NULL
    );
END
GO

-- 5. Bảng Products (Sản phẩm)
IF OBJECT_ID(N'dbo.Products', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Products (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(30) NOT NULL UNIQUE,
        Name NVARCHAR(200) NOT NULL,
        CategoryId INT NOT NULL,
        Unit NVARCHAR(30) NOT NULL CONSTRAINT DF_Products_Unit DEFAULT(N'cái'),
        SalePrice DECIMAL(18,2) NOT NULL CONSTRAINT CK_Products_SalePrice CHECK (SalePrice > 0),
        StockQuantity INT NOT NULL CONSTRAINT DF_Products_StockQuantity DEFAULT(0) CONSTRAINT CK_Products_StockQuantity CHECK (StockQuantity >= 0),
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT(1),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT(GETDATE()),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id)
    );
    CREATE INDEX IX_Products_CategoryId ON dbo.Products(CategoryId);
    CREATE INDEX IX_Products_Name ON dbo.Products(Name);
END
GO

-- 6. Bảng GoodsReceipts (Phiếu nhập kho)
IF OBJECT_ID(N'dbo.GoodsReceipts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.GoodsReceipts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ReceiptCode VARCHAR(20) NOT NULL UNIQUE,
        SupplierId INT NOT NULL,
        CreatedByUserId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_GoodsReceipts_CreatedAt DEFAULT(GETDATE()),
        TotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_GoodsReceipts_TotalAmount DEFAULT(0),
        Note NVARCHAR(500) NULL,
        CONSTRAINT FK_GoodsReceipts_Suppliers FOREIGN KEY (SupplierId) REFERENCES dbo.Suppliers(Id),
        CONSTRAINT FK_GoodsReceipts_Users FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(Id)
    );
    CREATE INDEX IX_GoodsReceipts_SupplierId ON dbo.GoodsReceipts(SupplierId);
    CREATE INDEX IX_GoodsReceipts_ReceiptCode ON dbo.GoodsReceipts(ReceiptCode);
END
GO

-- 7. Bảng GoodsReceiptDetails (Chi tiết phiếu nhập)
IF OBJECT_ID(N'dbo.GoodsReceiptDetails', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.GoodsReceiptDetails (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        GoodsReceiptId INT NOT NULL,
        ProductId INT NOT NULL,
        Unit NVARCHAR(30) NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL CONSTRAINT CK_GoodsReceiptDetails_UnitPrice CHECK (UnitPrice >= 0),
        Quantity DECIMAL(12,2) NOT NULL CONSTRAINT CK_GoodsReceiptDetails_Quantity CHECK (Quantity > 0),
        LineTotal DECIMAL(18,2) NOT NULL,
        CONSTRAINT FK_GoodsReceiptDetails_Receipts FOREIGN KEY (GoodsReceiptId) REFERENCES dbo.GoodsReceipts(Id) ON DELETE CASCADE,
        CONSTRAINT FK_GoodsReceiptDetails_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id)
    );
    CREATE INDEX IX_GoodsReceiptDetails_GoodsReceiptId ON dbo.GoodsReceiptDetails(GoodsReceiptId);
    CREATE INDEX IX_GoodsReceiptDetails_ProductId ON dbo.GoodsReceiptDetails(ProductId);
END
GO

-- 8. Bảng GoodsIssues (Phiếu xuất / nhập kho tổng hợp)
IF OBJECT_ID(N'dbo.GoodsIssues', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.GoodsIssues (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(30) NOT NULL UNIQUE,
        IssueType NVARCHAR(10) NOT NULL CONSTRAINT CK_GoodsIssues_Type CHECK (IssueType IN ('NHAP', 'XUAT')),
        IssueDate DATETIME2 NOT NULL CONSTRAINT DF_GoodsIssues_IssueDate DEFAULT(GETDATE()),
        CreatedByUserId INT NOT NULL,
        Note NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_GoodsIssues_CreatedAt DEFAULT(GETDATE()),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_GoodsIssues_Users FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(Id)
    );
    CREATE INDEX IX_GoodsIssues_Code ON dbo.GoodsIssues(Code);
    CREATE INDEX IX_GoodsIssues_IssueType ON dbo.GoodsIssues(IssueType);
    CREATE INDEX IX_GoodsIssues_IssueDate ON dbo.GoodsIssues(IssueDate);
END
GO

-- 9. Bảng GoodsIssueDetails (Chi tiết phiếu xuất / nhập)
IF OBJECT_ID(N'dbo.GoodsIssueDetails', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.GoodsIssueDetails (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        GoodsIssueId INT NOT NULL,
        ProductId INT NOT NULL,
        Quantity INT NOT NULL CONSTRAINT CK_GoodsIssueDetails_Quantity CHECK (Quantity > 0),
        UnitPrice DECIMAL(18,2) NOT NULL CONSTRAINT CK_GoodsIssueDetails_UnitPrice CHECK (UnitPrice >= 0),
        Note NVARCHAR(255) NULL,
        CONSTRAINT FK_GoodsIssueDetails_GoodsIssues FOREIGN KEY (GoodsIssueId) REFERENCES dbo.GoodsIssues(Id) ON DELETE CASCADE,
        CONSTRAINT FK_GoodsIssueDetails_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id)
    );
    CREATE INDEX IX_GoodsIssueDetails_GoodsIssueId ON dbo.GoodsIssueDetails(GoodsIssueId);
    CREATE INDEX IX_GoodsIssueDetails_ProductId ON dbo.GoodsIssueDetails(ProductId);
END
GO
