# Yêu cầu chức năng – Phần Sản phẩm (tiến trình 2.0)

> Phụ trách: TV2 · Vai trò sử dụng: **Quản lý kho** · Sơ đồ: [`DFD_2.0.puml`](DFD_2.0.puml) · ERD: [`ERD-product.dbml`](ERD-product.dbml)

## 1. Phạm vi

Phần sản phẩm gồm 4 chức năng, ứng với nhóm 2 trong sơ đồ chức năng của hệ thống:

| Mã | Chức năng | Mô tả ngắn |
|----|-----------|------------|
| 2.1 | Quản lý loại sản phẩm | Thêm, sửa, xóa loại sản phẩm |
| 2.2 | Quản lý sản phẩm | Thêm, sửa, xóa sản phẩm |
| 2.3 | Tìm kiếm, sắp xếp theo sản phẩm | Tìm kiếm, lọc theo loại và sắp xếp danh sách sản phẩm |
| 2.4 | Tổng quan | Hiển thị tổng sản phẩm tồn kho và tổng doanh thu |

Bảng dữ liệu của phần này: `Categories`, `Products` (kèm dữ liệu mẫu), liên kết với lịch sử phiếu nhập (`GoodsReceipts/Phiếu nhập kho`) và phiếu xuất (`GoodsIssues/Phiếu xuất kho`).

## 2. Mô tả chi tiết chức năng

### 2.1. Quản lý loại sản phẩm
- **Dữ liệu vào:** tên loại, mô tả.
- **Xử lý:** kiểm tra tên không trống và không trùng; thêm, sửa hoặc xóa loại. **Không cho xóa loại đang có sản phẩm liên kết**.
- **Kết quả:** danh sách loại sản phẩm cập nhật, thông báo kết quả hoặc lỗi.

### 2.2. Quản lý sản phẩm (thêm, sửa, xóa)
- **Dữ liệu vào:** mã sản phẩm, tên, loại (chọn trong danh sách loại), đơn vị tính, giá bán, mô tả.
- **Xử lý:**
  - **Thêm:** kiểm tra mã không trùng, giá bán > 0; số lượng tồn khởi tạo bằng 0.
  - **Sửa:** cập nhật thông tin; **không sửa trực tiếp số lượng tồn** trên form sản phẩm (số lượng tồn chỉ thay đổi tự động thông qua phiếu nhập, phiếu xuất).
  - **Xóa:** nếu sản phẩm chưa phát sinh trong phiếu nhập/xuất thì xóa hẳn khỏi cơ sở dữ liệu; nếu đã có lịch sử giao dịch thì chuyển trạng thái sang **ngừng bán** (`IsActive = 0`) để bảo toàn vẹn toàn dữ liệu lịch sử phiếu kho.
- **Kết quả:** sản phẩm được lưu, thông báo kết quả hoặc lỗi.

### 2.3. Tìm kiếm, sắp xếp theo sản phẩm
- **Dữ liệu vào:** từ khóa (tên hoặc mã sản phẩm), loại sản phẩm (tùy chọn), tiêu chí và chiều sắp xếp.
- **Xử lý:** lọc và sắp xếp danh sách sản phẩm theo các tiêu chí: tên, mã, giá bán, số lượng tồn, ngày tạo; hỗ trợ phân trang dữ liệu.
- **Kết quả:** danh sách sản phẩm hiển thị đầy đủ kèm tên loại và số lượng tồn.

### 2.4. Tổng quan
- **Dữ liệu vào:** yêu cầu xem tổng quan từ giao diện Quản lý kho.
- **Xử lý:**
  - *Tổng sản phẩm tồn kho* = tổng số lượng tồn (`StockQuantity`) của các sản phẩm đang kinh doanh (`IsActive = 1`).
  - *Tổng doanh thu* = tổng (`số lượng xuất × giá bán tại thời điểm xuất` hoặc `SalePrice` hiện tại) trên các dòng chi tiết phiếu xuất kho.
- **Kết quả:** các thẻ số liệu tổng hợp (KPI cards) hiển thị trên trang tổng quan của Quản lý kho.

## 3. Quy tắc nghiệp vụ

| Mã | Quy tắc |
|----|---------|
| BR-P1 | Mã sản phẩm (`Code`) và tên loại (`Name`) phải là duy nhất, không trùng lặp. |
| BR-P2 | Giá bán (`SalePrice`) phải lớn hơn 0; số lượng tồn (`StockQuantity`) không âm. |
| BR-P3 | Số lượng tồn chỉ thay đổi tự động khi lập phiếu nhập (tăng) hoặc phiếu xuất (giảm), tuyệt đối không sửa tay trong form sản phẩm. |
| BR-P4 | Sản phẩm đã có trong phiếu nhập/xuất không được xóa hẳn, chỉ chuyển sang trạng thái ngừng bán (`IsActive = 0`). |
| BR-P5 | Loại sản phẩm còn chứa sản phẩm liên kết tuyệt đối không được xóa. |
| BR-P6 | Chỉ **Quản lý kho** có quyền thêm, sửa, xóa sản phẩm/loại sản phẩm; Nhân viên kho chỉ có quyền tra cứu (thông qua phân hệ Tra cứu hàng hóa của TV5). |

## 4. Mô tả bảng dữ liệu

**Quan hệ:** Một loại có nhiều sản phẩm (`Categories` 1 – N `Products`).

### Bảng `Categories` (Loại sản phẩm)
| Thuộc tính | Kiểu dữ liệu | Khóa | Null | Mô tả / ràng buộc |
|------------|--------------|------|------|-------------------|
| `Id` | INT IDENTITY(1,1) | PK | Không | Mã loại sản phẩm |
| `Name` | NVARCHAR(100) | UNIQUE | Không | Tên loại (UQ_Categories_Name) |
| `Description` | NVARCHAR(255) | | Có | Mô tả loại |
| `IsActive` | BIT | | Không | Trạng thái hoạt động (mặc định 1) |
| `CreatedAt` | DATETIME2 | | Không | Ngày tạo |
| `UpdatedAt` | DATETIME2 | | Có | Ngày cập nhật |

### Bảng `Products` (Sản phẩm)
| Thuộc tính | Kiểu dữ liệu | Khóa | Null | Mô tả / ràng buộc |
|------------|--------------|------|------|-------------------|
| `Id` | INT IDENTITY(1,1) | PK | Không | Mã định danh sản phẩm |
| `Code` | NVARCHAR(30) | UNIQUE | Không | Mã hiển thị, không trùng (UQ_Products_Code) |
| `Name` | NVARCHAR(200) | | Không | Tên sản phẩm |
| `CategoryId` | INT | FK → `Categories.Id` | Không | Loại sản phẩm (FK_Products_Categories) |
| `Unit` | NVARCHAR(30) | | Không | Đơn vị tính, mặc định `'cái'` |
| `SalePrice` | DECIMAL(18,2) | | Không | Giá bán, `> 0` (CK_Products_SalePrice) |
| `StockQuantity` | INT | | Không | Số lượng tồn, `>= 0`, mặc định 0 (CK_Products_StockQuantity) |
| `Description` | NVARCHAR(500) | | Có | Mô tả chi tiết sản phẩm |
| `IsActive` | BIT | | Không | 1 = đang bán, 0 = ngừng bán; mặc định 1 |
| `CreatedAt` | DATETIME2 | | Không | Ngày tạo |
| `UpdatedAt` | DATETIME2 | | Có | Ngày cập nhật |

## 5. API dự kiến (Backend)

| Phương thức | Đường dẫn | Chức năng |
|-------------|-----------|-----------|
| GET / POST | `/api/categories` | Lấy danh sách / Thêm mới loại sản phẩm |
| PATCH / DELETE | `/api/categories/:id` | Cập nhật / Xóa loại sản phẩm |
| GET | `/api/products?search=&categoryId=&sortBy=&order=&page=&limit=` | Tìm kiếm, lọc, sắp xếp và phân trang sản phẩm |
| GET | `/api/products/:id` | Xem chi tiết sản phẩm |
| POST | `/api/products` | Thêm mới sản phẩm |
| PATCH | `/api/products/:id` | Cập nhật thông tin sản phẩm |
| DELETE | `/api/products/:id` | Xóa hẳn hoặc chuyển sang ngừng bán sản phẩm |
| GET | `/api/products/overview` | Lấy số liệu tổng quan (tổng tồn kho, tổng doanh thu) |

## 6. Màn hình (Frontend - Cổng Quản lý kho)

| Màn hình | Nội dung giao diện & Tính năng |
|----------|---------------------------------|
| **Quản lý loại sản phẩm** | Danh sách dạng bảng, form thêm/sửa/xóa loại, kiểm tra ràng buộc sản phẩm trực thuộc. |
| **Quản lý sản phẩm** | Bảng dữ liệu sản phẩm tích hợp ô tìm kiếm, bộ lọc theo loại, sắp xếp cột, và các nút thao tác (Thêm, Sửa, Xóa/Ngừng bán). |
| **Tổng quan kho** | Dashboard hiển thị các thẻ KPI: Tổng sản phẩm tồn kho, Tổng doanh thu hệ thống. |

## 7. Dữ liệu mẫu dự kiến

| Bảng | Số lượng dòng | Nội dung mẫu |
|------|---------------|--------------|
| `Categories` | ≥ 5 | Phụ kiện điện thoại: Ốp lưng, Kính cường lực, Củ sạc, Cáp sạc, Tai nghe... |
| `Products` | ≥ 30 | Đa dạng các mặt hàng thuộc danh mục trên, mức giá khác nhau, bao gồm một vài sản phẩm có tồn kho bằng `0` để tiện kiểm thử nghiệp vụ xuất kho. |

## 8. Phụ thuộc với phần của thành viên khác

- **TV4 (Phiếu nhập kho) & TV5 (Phiếu xuất kho):** Sử dụng khóa ngoại liên kết (`ProductId → Products.Id`) và thực hiện cập nhật tự động trường `Products.StockQuantity` (tăng khi nhập, giảm khi xuất).
- **Tổng doanh thu (2.4):** Cần dòng chi tiết phiếu xuất lưu **giá bán tại thời điểm xuất** (`GoodsIssueDetails.UnitPrice`). Nếu không có, hệ thống sẽ quy đổi tạm tính theo `Products.SalePrice` hiện tại.
- **TV5 (Tra cứu hàng hóa cho Nhân viên kho):** Được phép đọc dữ liệu từ bảng `Products` để phục vụ nhân viên kho, nhưng chỉ có quyền xem, không được quyền chỉnh sửa.
- **TV1 (Hệ thống / Phân quyền):** Cung cấp cơ chế phân quyền RBAC đảm bảo chỉ tài khoản mang vai trò **Quản lý kho** mới truy cập và thao tác được trên các màn hình quản lý sản phẩm.