# Thư mục `backend/database/`

Chứa **script SQL** của đồ án (một trong các file bắt buộc phải nộp).

| File | Nội dung | Chạy trên DB |
|------|----------|--------------|
| `00_create_database.sql` | Tạo database `QuanLyKhoPhuKien` | `master` |
| `01_schema.sql` | Tạo bảng, khóa, ràng buộc, index | `QuanLyKhoPhuKien` |
| `02_seed.sql` | Dữ liệu mẫu + tài khoản test | `QuanLyKhoPhuKien` |

## Cách chạy

**Cách 1 (khuyến nghị) – chạy bằng npm, không cần cài thêm gì:**

```bash
cd backend
npm run db:init
```

Lệnh này tự chạy tất cả file `NN_*.sql` theo thứ tự số (file bắt đầu bằng `00_` chạy trên `master`, các file còn lại chạy trên database của dự án). Có thể chạy lại nhiều lần.

**Cách 2 – chạy tay bằng SSMS / Azure Data Studio / VS Code (extension SQL Server):** mở và chạy lần lượt từng file theo thứ tự `00 → 01 → 02`.

## Quy ước
1. Mọi thay đổi cấu trúc CSDL phải nằm trong các file `.sql` này (không sửa tay trên máy rồi quên commit).
2. Script phải **idempotent** (chạy lại không lỗi).
3. Đổi cấu trúc bảng → báo TV2, cập nhật `docs/05-thiet-ke-csdl.md` và entity tương ứng trong `backend`.
4. Thêm file mới thì đánh số tiếp theo (`03_...sql`) và ghi vào bảng trên.
