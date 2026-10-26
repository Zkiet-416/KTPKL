# Yêu cầu chức năng – Phần Sản phẩm (tiến trình 2.0)

> Phụ trách: TV2 · Vai trò sử dụng: **Quản lý kho** · Sơ đồ: [`DFD_2.0.puml`](DFD_2.0.puml) · ERD: [`ERD-product.dbml`](ERD-product.dbml)

## 1. Phạm vi

Phần sản phẩm gồm 4 chức năng, ứng với nhóm 2 trong sơ đồ chức năng của hệ thống:

| Mã | Chức năng | Mô tả ngắn |
|----|-----------|------------|
| 2.1 | Quản lý loại sản phẩm | Thêm, sửa, xóa loại sản phẩm |
| 2.2 | Quản lý sản phẩm | Thêm, sửa, xóa sản phẩm |
| 2.3 | Tìm kiếm, sắp xếp theo sản phẩm | Tìm kiếm và sắp xếp danh sách sản phẩm |
| 2.4 | Tổng quan | Hiển thị tổng sản phẩm tồn kho và tổng doanh thu |

Bảng dữ liệu của phần này: `Categories`, `Products` (kèm dữ liệu mẫu).

## 2. Mô tả chi tiết chức năng

### 2.1. Quản lý loại sản phẩm
- **Dữ liệu vào:** tên loại, mô tả.
- **Xử lý:** kiểm tra tên không trống và không trùng; thêm, sửa hoặc xóa loại. Không cho xóa loại đang có sản phẩm.
- **Kết quả:** danh sách loại sản phẩm cập nhật, thông báo kết quả hoặc lỗi.

### 2.2. Quản lý sản phẩm (thêm, sửa, xóa)
- **Dữ liệu vào:** mã sản phẩm, tên, loại (chọn trong danh sách loại), đơn vị tính, giá bán, mô tả.
- **Xử lý:**
  - Thêm: kiểm tra mã không trùng, giá bán > 0; số lượng tồn khởi tạo bằng 0.
  - Sửa: cập nhật thông tin; **không sửa trực tiếp số lượng tồn** (chỉ thay đổi qua phiếu nhập, phiếu xuất).
  - Xóa: nếu sản phẩm chưa có trong phiếu nhập/xuất thì xóa hẳn; nếu đã có thì chuyển sang **ngừng bán** (`IsActive = 0`) để giữ lịch sử phiếu.
- **Kết quả:** sản phẩm được lưu, thông báo kết quả hoặc lỗi.

### 2.3. Tìm kiếm, sắp xếp theo sản phẩm
- **Dữ liệu vào:** từ khóa (tên hoặc mã), loại sản phẩm (tùy chọn), tiêu chí và chiều sắp xếp.
- **Xử lý:** lọc và sắp xếp danh sách sản phẩm; sắp xếp theo tên, mã, giá bán, số lượng tồn, ngày tạo; có phân trang.
- **Kết quả:** danh sách sản phẩm (kèm tên loại, số lượng tồn).

### 2.4. Tổng quan
- **Dữ liệu vào:** yêu cầu xem tổng quan.
- **Xử lý:**
  - *Tổng sản phẩm tồn kho* = tổng số lượng tồn của các sản phẩm đang bán.
  - *Tổng doanh thu* = tổng (số lượng xuất × giá bán) trên các dòng phiếu xuất kho.
- **Kết quả:** các ô số liệu tổng hợp trên trang tổng quan của Quản lý kho.

## 3. Quy tắc nghiệp vụ

| Mã | Quy tắc |
|----|---------|
| BR-P1 | Mã sản phẩm và tên loại không trùng. |
| BR-P2 | Giá bán phải lớn hơn 0; số lượng tồn không âm. |
| BR-P3 | Số lượng tồn chỉ đổi khi lập phiếu nhập (tăng) hoặc phiếu xuất (giảm), không sửa tay trong form sản phẩm. |
| BR-P4 | Sản phẩm đã có trong phiếu nhập/xuất không xóa hẳn, chỉ ngừng bán. |
| BR-P5 | Loại sản phẩm còn sản phẩm không được xóa. |
| BR-P6 | Chỉ **Quản lý kho** được thêm, sửa, xóa; Nhân viên kho chỉ xem qua trang tra cứu hàng hóa (phần của TV5). |

## 4. Mô tả bảng dữ liệu

**Quan hệ:** một loại có nhiều sản phẩm (`Categories` 1 – N `Products`).

**Bảng `Categories`**

| Thuộc tính | Kiểu dữ liệu | Khóa | Null | Mô tả / ràng buộc |
|------------|--------------|------|------|-------------------|
| `Id` | INT IDENTITY(1,1) | PK | Không | Mã loại sản phẩm |
| `Name` | NVARCHAR(100) | UNIQUE | Không | Tên loại |
| `Description` | NVARCHAR(255) | | Có | Mô tả |
| `IsActive` | BIT | | Không | Mặc định 1 |
| `CreatedAt` | DATETIME2 | | Không | Ngày tạo |
| `UpdatedAt` | DATETIME2 | | Có | Ngày cập nhật |

**Bảng `Products`**

| Thuộc tính | Kiểu dữ liệu | Khóa | Null | Mô tả / ràng buộc |
|------------|--------------|------|------|-------------------|
| `Id` | INT IDENTITY(1,1) | PK | Không | Mã sản phẩm |
| `Code` | NVARCHAR(30) | UNIQUE | Không | Mã hiển thị, không trùng |
| `Name` | NVARCHAR(200) | | Không | Tên sản phẩm |
| `CategoryId` | INT | FK → `Categories.Id` | Không | Loại sản phẩm |
| `Unit` | NVARCHAR(30) | | Không | Đơn vị tính, mặc định `cái` |
| `SalePrice` | DECIMAL(18,2) | | Không | Giá bán, `> 0` |
| `StockQuantity` | INT | | Không | Số lượng tồn, `>= 0`, mặc định 0 |
| `Description` | NVARCHAR(500) | | Có | Mô tả |
| `IsActive` | BIT | | Không | 1 = đang bán, 0 = ngừng bán; mặc định 1 |
| `CreatedAt` | DATETIME2 | | Không | Ngày tạo |
| `UpdatedAt` | DATETIME2 | | Có | Ngày cập nhật |

**Ràng buộc:** `UQ_Categories_Name`, `UQ_Products_Code`, `FK_Products_Categories`, `CK_Products_SalePrice` (`SalePrice > 0`), `CK_Products_StockQuantity` (`StockQuantity >= 0`).

## 5. API dự kiến (backend)

| Phương thức | Đường dẫn | Chức năng |
|-------------|-----------|-----------|
| GET / POST | `/api/categories` | Danh sách / thêm loại |
| PATCH / DELETE | `/api/categories/:id` | Sửa / xóa loại |
| GET | `/api/products?search=&categoryId=&sortBy=&order=&page=&limit=` | Tìm kiếm, sắp xếp, phân trang |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| POST | `/api/products` | Thêm sản phẩm |
| PATCH | `/api/products/:id` | Sửa sản phẩm |
| DELETE | `/api/products/:id` | Xóa hoặc ngừng bán |
| GET | `/api/products/overview` | Tổng sản phẩm tồn kho, tổng doanh thu |

## 6. Màn hình (frontend, cổng Quản lý kho)

| Màn hình | Nội dung |
|----------|----------|
| Quản lý loại sản phẩm | Danh sách, thêm, sửa, xóa loại |
| Quản lý sản phẩm | Bảng sản phẩm có ô tìm kiếm, lọc theo loại, sắp xếp; nút thêm, sửa, xóa |
| Tổng quan | Ô số liệu: tổng sản phẩm tồn kho, tổng doanh thu |

## 7. Dữ liệu mẫu dự kiến

| Bảng | Số dòng | Nội dung |
|------|---------|----------|
| `Categories` | ≥ 5 | Ốp lưng, cường lực, sạc, cáp, tai nghe… |
| `Products` | ≥ 30 | Nhiều loại, giá bán khác nhau, một số có tồn bằng 0 để thử xuất kho |

## 8. Phụ thuộc với phần của thành viên khác

- **TV4 (phiếu nhập)** và **TV5 (phiếu xuất)** dùng khóa ngoại `ProductId → Products.Id` và cập nhật `Products.StockQuantity`.
- **Tổng doanh thu (2.4)** cần dòng chi tiết phiếu xuất lưu **giá bán tại thời điểm xuất** (`GoodsIssueDetails.UnitPrice`). Cần TV5 xác nhận có cột này; nếu không, tính doanh thu theo `Products.SalePrice` hiện tại.
- **TV5 (tra cứu hàng hóa)** đọc dữ liệu `Products` cho Nhân viên kho; chỉ đọc, không sửa.
- **TV1** cung cấp phân quyền: chỉ vai trò Quản lý kho vào được các màn hình trên.
