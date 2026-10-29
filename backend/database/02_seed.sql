/* ============================================================
   02_seed.sql  -  DỮ LIỆU MẪU ĐỂ DEMO

   Yêu cầu của đồ án:
   - Có đầy đủ dữ liệu trong TẤT CẢ các bảng
   - Có sẵn tài khoản để test: 1 Admin, 1 Quản lý kho, 1-2 Nhân viên kho
   - Có vài giao dịch mẫu (phiếu nhập, phiếu xuất)
   Viết idempotent: kiểm tra IF NOT EXISTS trước khi INSERT.
   ============================================================ */

USE QuanLyKhoPhuKien;
GO

-- 1. Seed Roles
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Code = 'ADMIN')
    INSERT INTO dbo.Roles (Code, Name, Description) VALUES ('ADMIN', N'Quản trị hệ thống', N'Quản trị toàn bộ hệ thống, tài khoản và phân quyền');

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Code = 'WAREHOUSE_MANAGER')
    INSERT INTO dbo.Roles (Code, Name, Description) VALUES ('WAREHOUSE_MANAGER', N'Quản lý kho', N'Quản lý sản phẩm, danh mục, nhà cung cấp');

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Code = 'WAREHOUSE_STAFF')
    INSERT INTO dbo.Roles (Code, Name, Description) VALUES ('WAREHOUSE_STAFF', N'Nhân viên kho', N'Tra cứu hàng hóa, lập phiếu nhập/xuất kho');
GO

-- 2. Seed Users
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'admin')
    INSERT INTO dbo.Users (Username, PasswordHash, FullName, Email, Phone, RoleId) 
    VALUES ('admin', '$2a$10$X7vQ42hX5v8dZ4WjP5bWuuK5E3p9qX0k2hVj5L2jQ5k2hVj5L2jQ5', N'Nguyễn Quản Trị', 'admin@warehouse.com', '0901111222', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'manager1')
    INSERT INTO dbo.Users (Username, PasswordHash, FullName, Email, Phone, RoleId) 
    VALUES ('manager1', '$2a$10$X7vQ42hX5v8dZ4WjP5bWuuK5E3p9qX0k2hVj5L2jQ5k2hVj5L2jQ5', N'Trần Quản Lý', 'manager@warehouse.com', '0903333444', 2);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'staff1')
    INSERT INTO dbo.Users (Username, PasswordHash, FullName, Email, Phone, RoleId) 
    VALUES ('staff1', '$2a$10$X7vQ42hX5v8dZ4WjP5bWuuK5E3p9qX0k2hVj5L2jQ5k2hVj5L2jQ5', N'Lê Nhân Viên', 'staff@warehouse.com', '0905555666', 3);
GO

-- 3. Seed Suppliers
IF NOT EXISTS (SELECT 1 FROM dbo.Suppliers WHERE Name = N'Công ty TNHH Phụ Kiện Số VN')
    INSERT INTO dbo.Suppliers (Name, ContactName, Phone, Email, Address) 
    VALUES (N'Công ty TNHH Phụ Kiện Số VN', N'Nguyễn Văn A', '02838111222', 'contact@phukienso.vn', N'123 Tôn Đức Thắng, Quận 1, TP.HCM');

IF NOT EXISTS (SELECT 1 FROM dbo.Suppliers WHERE Name = N'Phân phối linh kiện Minh Phát')
    INSERT INTO dbo.Suppliers (Name, ContactName, Phone, Email, Address) 
    VALUES (N'Phân phối linh kiện Minh Phát', N'Trần Thị B', '02838333444', 'minhphat@gmail.com', N'456 Lê Văn Sỹ, Quận 3, TP.HCM');
GO

-- 4. Seed Categories
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Ốp lưng điện thoại')
    INSERT INTO dbo.Categories (Name, Description) VALUES (N'Ốp lưng điện thoại', N'Các loại ốp lưng silicon, nhựa cứng, chống sốc');

IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Kính cường lực')
    INSERT INTO dbo.Categories (Name, Description) VALUES (N'Kính cường lực', N'Miếng dán cường lực màn hình các dòng máy');

IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Củ sạc & Cáp sạc')
    INSERT INTO dbo.Categories (Name, Description) VALUES (N'Củ sạc & Cáp sạc', N'Củ sạc nhanh PD, cáp Type-C, Lightning');
GO

-- 5. Seed Products
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Code = 'OL-IP15-01')
    INSERT INTO dbo.Products (Code, Name, CategoryId, Unit, SalePrice, StockQuantity, Description) 
    VALUES ('OL-IP15-01', N'Ốp lưng iPhone 15 trong suốt chống sốc', 1, N'cái', 150000.00, 50, N'Chất liệu TPU cao cấp chống ố vàng');

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Code = 'CL-IP15-01')
    INSERT INTO dbo.Products (Code, Name, CategoryId, Unit, SalePrice, StockQuantity, Description) 
    VALUES ('CL-IP15-01', N'Kính cường lực iPhone 15 Pro Max full màn hình', 2, N'cái', 120000.00, 100, N'Độ cứng 9H chống trầy xước tuyệt đối');
GO
