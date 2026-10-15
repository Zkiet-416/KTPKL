/* ============================================================
   01_schema.sql  -  TẠO BẢNG, KHÓA, RÀNG BUỘC, INDEX
   Phụ trách: TV2 (sau khi nhóm chốt lược đồ CSDL ở docs/05-thiet-ke-csdl.md)

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
   - Tên bảng/cột dùng tiếng Anh, thống nhất với entity trong backend/src/modules/*/entities
   ============================================================ */
USE QuanLyKhoPhuKien;
GO

-- TODO (TV2): tạo bảng tại đây
-- Gợi ý nhóm bảng cần có (nhóm tự quyết định tên & thuộc tính cuối cùng):
--   Roles, Users
--   Categories, Products
--   Suppliers
--   GoodsReceipts (phiếu nhập), GoodsReceiptDetails
--   GoodsIssues   (phiếu xuất), GoodsIssueDetails
GO
