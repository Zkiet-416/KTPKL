/* ============================================================
   00_create_database.sql
   Tạo database cho hệ thống Quản lý kho phụ kiện điện thoại.
   Chạy trên database [master]. Có thể chạy lại nhiều lần (idempotent).
   Lưu ý: tên DB phải trùng DB_NAME trong file .env (thư mục gốc)
   ============================================================ */
IF DB_ID(N'QuanLyKhoPhuKien') IS NULL
BEGIN
    CREATE DATABASE QuanLyKhoPhuKien COLLATE Vietnamese_CI_AS;
END
GO
