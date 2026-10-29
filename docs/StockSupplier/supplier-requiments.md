# Yêu cầu chức năng – Phần Nhà cung cấp (tiến trình 3.0)

> Phụ trách: TV3 · Vai trò sử dụng: **Quản lý kho** · Sơ đồ: [`DFD_3.0.puml`](DFD_3.0.puml) · ERD: [`ERD-supplier.dbml`](ERD-supplier.dbml)

## 1. Phạm vi

Phần nhà cung cấp gồm 2 chức năng, ứng với nhóm 3 trong sơ đồ chức năng của hệ thống:

| Mã | Chức năng | Mô tả ngắn |
|----|-----------|------------|
| 3.1 | Quản lý nhà cung cấp | Thêm, sửa, xóa nhà cung cấp |
| 3.2 | Tìm kiếm, sắp xếp theo nhà cung cấp | Tìm kiếm và sắp xếp danh sách nhà cung cấp |

Bảng dữ liệu của phần này: `Suppliers` (kèm dữ liệu mẫu).

## 2. Mô tả chi tiết chức năng

### 3.1. Quản lý nhà cung cấp (thêm, sửa, xóa)
- **Dữ liệu vào:** tên nhà cung cấp, người liên hệ, số điện thoại, email, địa chỉ.
- **Xử lý:**
  - Thêm: kiểm tra tên không trống, không trùng; số điện thoại hợp lệ; email (nếu nhập) đúng định dạng.
  - Sửa: cập nhật thông tin, ghi ngày cập nhật.
  - Xóa: nếu nhà cung cấp chưa có phiếu nhập thì xóa hẳn; nếu đã có phiếu nhập thì chuyển sang **ngừng hợp tác** (`IsActive = 0`) để giữ lịch sử phiếu.
- **Kết quả:** nhà cung cấp được lưu, thông báo kết quả hoặc lỗi.

### 3.2. Tìm kiếm, sắp xếp theo nhà cung cấp
- **Dữ liệu vào:** từ khóa (tên, người liên hệ hoặc số điện thoại), tiêu chí và chiều sắp xếp.
- **Xử lý:** lọc và sắp xếp danh sách nhà cung cấp; sắp xếp theo tên, ngày tạo; có phân trang.
- **Kết quả:** danh sách nhà cung cấp phù hợp.

## 3. Quy tắc nghiệp vụ

| Mã | Quy tắc |
|----|---------|
| BR-S1 | Tên nhà cung cấp không trùng; số điện thoại bắt buộc. |
| BR-S2 | Email (nếu có) phải đúng định dạng; số điện thoại chỉ gồm chữ số. |
| BR-S3 | Nhà cung cấp đã có phiếu nhập không xóa hẳn, chỉ chuyển sang ngừng hợp tác. |
| BR-S4 | Nhà cung cấp ngừng hợp tác không xuất hiện trong danh sách chọn khi lập phiếu nhập mới, nhưng vẫn xem được trên các phiếu cũ. |
| BR-S5 | Chỉ **Quản lý kho** được thêm, sửa, xóa nhà cung cấp. |

## 4. Mô tả bảng dữ liệu

**Quan hệ:** một nhà cung cấp có nhiều phiếu nhập (`Suppliers` 1 – N `GoodsReceipts`); khóa ngoại `SupplierId` nằm ở bảng phiếu nhập của TV4.

**Bảng `Suppliers`**

| Thuộc tính | Kiểu dữ liệu | Khóa | Null | Mô tả / ràng buộc |
|------------|--------------|------|------|-------------------|
| `Id` | INT IDENTITY(1,1) | PK | Không | Mã nhà cung cấp |
| `Name` | NVARCHAR(150) | UNIQUE | Không | Tên nhà cung cấp |
| `ContactName` | NVARCHAR(100) | | Có | Người liên hệ |
| `Phone` | VARCHAR(20) | | Không | Số điện thoại |
| `Email` | NVARCHAR(100) | | Có | Email |
| `Address` | NVARCHAR(255) | | Có | Địa chỉ |
| `IsActive` | BIT | | Không | 1 = đang hợp tác, 0 = ngừng; mặc định 1 |
| `CreatedAt` | DATETIME2 | | Không | Ngày tạo |
| `UpdatedAt` | DATETIME2 | | Có | Ngày cập nhật |

**Ràng buộc:** `UQ_Suppliers_Name`; chỉ mục `IX_Suppliers_Name`, `IX_Suppliers_Phone` phục vụ tìm kiếm.

## 5. API dự kiến (backend)

| Phương thức | Đường dẫn | Chức năng |
|-------------|-----------|-----------|
| GET | `/api/suppliers?search=&sortBy=&order=&page=&limit=&activeOnly=` | Tìm kiếm, sắp xếp, phân trang (`activeOnly=true` để lấy danh sách chọn khi lập phiếu nhập) |
| GET | `/api/suppliers/:id` | Chi tiết nhà cung cấp |
| POST | `/api/suppliers` | Thêm nhà cung cấp |
| PATCH | `/api/suppliers/:id` | Sửa nhà cung cấp |
| DELETE | `/api/suppliers/:id` | Xóa hoặc ngừng hợp tác |

## 6. Màn hình (frontend, cổng Quản lý kho)

| Màn hình | Nội dung |
|----------|----------|
| Quản lý nhà cung cấp | Bảng nhà cung cấp có ô tìm kiếm, sắp xếp theo cột, phân trang; nút thêm, sửa, xóa; form nhập (cửa sổ hiện lên) có kiểm tra dữ liệu |

## 7. Dữ liệu mẫu dự kiến

| Bảng | Số dòng | Nội dung |
|------|---------|----------|
| `Suppliers` | ≥ 5 | Các nhà cung cấp phụ kiện khác nhau; ít nhất 1 nhà cung cấp đã có phiếu nhập (để thử xóa / ngừng hợp tác) và 1 nhà cung cấp chưa có phiếu nhập |

## 8. Phụ thuộc với phần của thành viên khác

- **TV4 (phiếu nhập):** bảng `GoodsReceipts` có `SupplierId → Suppliers.Id`; khi lập phiếu nhập, danh sách chọn nhà cung cấp lấy từ `GET /api/suppliers?activeOnly=true`. Để thực hiện BR-S3, cần có cách kiểm tra "nhà cung cấp đã có phiếu nhập" (đọc bảng `GoodsReceipts`).
- **TV1:** phân quyền, chỉ vai trò Quản lý kho vào được màn hình nhà cung cấp.
- **Thống kê nhập kho theo tháng/năm** không thuộc phần này (thuộc phiếu nhập, TV4).
