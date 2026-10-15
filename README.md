# 📦 Quản Lý Kho Phụ Kiện Điện Thoại – Hệ Thống Nhập Xuất Kho

> **Môn học:** Phân tích thiết kế Hệ thống thông tin | **Học kỳ:** I – Năm học 2026–2027  
> **Kiến trúc:** Monorepo gồm **NestJS** (Backend REST API) + **React + Vite + TailwindCSS** (Frontend) + **SQL Server** (Docker)

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY TRÊN MÁY SẠCH (QUICK START)

Dành cho tất cả các thành viên trong nhóm clone về chạy lần đầu:

### Bước 1: Tạo file môi trường & khởi động Cơ sở dữ liệu SQL Server (Docker)
Đảm bảo bạn đã bật **Docker Desktop**, sau đó mở terminal tại thư mục gốc của dự án (`quan-ly-kho-phu-kien/`):
```bash
cp .env.example .env        # Windows: copy .env.example .env
docker compose up -d
```
> Lệnh này sẽ tự động tải image SQL Server 2022 và khởi chạy tại cổng `1433` (user `sa`, mật khẩu `QLKho@2026`). Đợi khoảng 20–30 giây cho SQL Server sẵn sàng.

### Bước 2: Khởi động Backend (NestJS)
Mở một cửa sổ Terminal mới:
```bash
cd backend
npm install
npm run db:init
npm run start:dev
```
* **API URL:** `http://localhost:3000/api`
* **Test API:** `http://localhost:3000/api/health`
* **Swagger:** `http://localhost:3000/api/docs`

### Bước 3: Khởi động Frontend (React)
Mở thêm một cửa sổ Terminal khác:
```bash
cd frontend
npm install
npm run dev
```
* **Giao diện Web:** `http://localhost:5173`

---

## 📁 CẤU TRÚC MONOREPO

```
quan-ly-kho-phu-kien/
├── backend/                  # NestJS API (Port 3000)
│   ├── src/
│   │   ├── common/            # Enum, DTO, Guard, Filter dùng chung
│   │   └── modules/          # auth, users, categories, products, suppliers,
│   │                         # goods-receipts, goods-issues, statistics
│   ├── database/             # Script SQL nộp kèm đồ án
│   │   ├── 00_create_database.sql
│   │   ├── 01_schema.sql     # Bảng, khóa, ràng buộc
│   │   └── 02_seed.sql       # Dữ liệu mẫu + tài khoản test
│   ├── scripts/run-sql.js    # `npm run db:init` – chạy các file trong backend/database
├── frontend/                 # React + Vite (Port 5173)
│   ├── src/
│   │   ├── pages/            # auth/, admin/, manager/, staff/ (3 cổng tách biệt)
│   │   ├── layouts/          # AdminLayout, ManagerLayout, StaffLayout
│   │   ├── components/       # layout/ & common/ (dùng chung)
│   │   └── api/client.ts     # Axios wrapper chuẩn hóa
├── docs/                     # Quy chuẩn làm việc nhóm & tài liệu báo cáo
│   ├── git-convention.md     # Quy tắc nhánh & commit
│   ├── naming-convention.md  # Tiêu chuẩn đặt tên Code, API & DB
│   ├── checklist-review.md   # Tiêu chí review code trước khi merge
│   └── troubleshooting.md    # Lỗi thường gặp
├── docker-compose.yml        # SQL Server container
├── .env.example              # Mẫu biến môi trường (BE + FE + Docker)
└── README.md
```

---

## 📌 QUY ƯỚC LÀM VIỆC DÀNH CHO THÀNH VIÊN
Trước khi bắt tay vào code các tính năng tiếp theo, tất cả thành viên bắt buộc đọc qua các tài liệu trong thư mục `docs/`:
1. [Quy chuẩn Git & Commit](docs/git-convention.md)
2. [Quy chuẩn đặt tên Code, API & Database](docs/naming-convention.md)
3. [Checklist review code trước khi merge](docs/checklist-review.md)
