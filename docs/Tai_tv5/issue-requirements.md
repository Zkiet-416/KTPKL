# TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG - PHÂN HỆ KHO HÀNG
## Module: Tra cứu & Xuất/Nhập kho (Thành viên 5 - TV5)

---

## 1. Khảo sát hiện trạng thực tế
* **Thực trạng:** Tại các kho hàng quản lý thủ công, việc kiểm soát hàng tồn gặp nhiều sai sót, dễ thất thoát và mất thời gian khi tìm kiếm thông tin sản phẩm.
* **Bất cập:** Việc xuất kho thiếu cơ chế kiểm soát tự động dẫn đến tình trạng xuất quá số lượng hiện có trong kho (gây âm kho).
* **Nhu cầu:** Cần một hệ thống quản lý kho tự động hóa giúp kiểm soát lượng tồn chính xác, hỗ trợ tra cứu nhanh và ràng buộc chặt chẽ các giao dịch xuất/nhập kho.

---

## 2. Giới thiệu phân hệ
* **Tác nhân chính:** Nhân viên kho (`NHÂN VIÊN KHO`).
* **Mục tiêu hệ thống:** 
  * Cung cấp công cụ tra cứu thông tin sản phẩm, số lượng tồn kho và lọc sản phẩm theo tên/giá bán.
  * Hỗ trợ lập phiếu Nhập kho (tăng tồn) và Xuất kho (giảm tồn, chặn xuất quá số lượng tồn hiện tại).
  * Đảm bảo tính toàn vẹn dữ liệu thông qua cơ chế Transaction trong cơ sở dữ liệu.

---

## 3. Sơ đồ chức năng (Functional Decomposition Diagram - FDD)
Phân rã các chức năng nghiệp vụ của phân hệ Kho hàng:
* **3.1. Tra cứu & Quản lý thông tin hàng hóa:**
  * Xem toàn bộ danh sách hàng hóa và số lượng tồn kho thực tế.
  * Tìm kiếm sản phẩm theo tên.
  * Lọc sản phẩm theo khoảng giá bán (từ - đến).
* **3.2. Quản lý Lập phiếu Kho:**
  * **Lập phiếu Nhập kho:** Tự động tăng số lượng tồn kho (`StockQuantity`).
  * **Lập phiếu Xuất kho:** Ràng buộc điều kiện tồn kho, tự động giảm số lượng tồn kho (`StockQuantity`).

---

## 4. Sơ đồ ngữ cảnh (Context Diagram)
* **Tác nhân ngoài:** Nhân viên kho.
* **Hệ thống trung tâm:** Hệ thống Quản lý Kho (Warehouse System).
* **Luồng tương tác chính:**
  * **Tra cứu:** Nhân viên kho gửi yêu cầu tìm kiếm/lọc -> Hệ thống xử lý và trả về danh sách sản phẩm kèm số lượng tồn.
  * **Lập phiếu:** Nhân viên kho gửi yêu cầu xuất/nhập kho -> Hệ thống kiểm tra điều kiện tồn kho, thực hiện cập nhật CSDL và trả về thông báo kết quả giao dịch.

---

## 5. Sơ đồ Luồng Dữ liệu (DFD mức đỉnh & dưới đỉnh)

### 5.1. DFD Mức đỉnh (Level 0) & Dưới đỉnh (Level 1)
* **Tiến trình 5.1 (Tra cứu & Lọc hàng hóa):** Tiếp nhận thông tin tìm kiếm từ Nhân viên kho -> Truy vấn dữ liệu từ kho `Products` -> Trả về danh sách sản phẩm & tồn kho.
* **Tiến trình 5.2 (Lập phiếu Xuất/Nhập kho):** 
  * Đọc dữ liệu từ `Products` để kiểm tra số lượng tồn hiện tại.
  * Ghi nhận giao dịch vào kho dữ liệu `GoodsIssues` và `GoodsIssueDetails`.
  * Cập nhật số lượng tồn kho trong `Products` (TĂNG khi Nhập kho, GIẢM khi Xuất kho).

*(Mã nguồn PlantUML chi tiết được lưu riêng tại file `DFD_5.0.puml`)*

---

## 6. Nghiệp vụ & Phân quyền (Business Rules & Access Control)

### 6.1. Phân quyền hệ thống
* Chỉ người dùng có vai trò **`NHÂN VIÊN KHO`** hoặc **`ADMIN`** mới được phép truy cập và thực hiện thao tác trên phân hệ này.

### 6.2. Quy tắc nghiệp vụ cốt lõi (Business Rules)
* **Nghiệp vụ Nhập kho:** Khi phát sinh giao dịch nhập kho (`IssueType = 'NHAP'`), hệ thống thực hiện:
  $$\text{StockQuantity}_{\text{mới}} = \text{StockQuantity}_{\text{cũ}} + \text{Số lượng nhập}$$
* **Nghiệp vụ Xuất kho:** Khi phát sinh giao dịch xuất kho (`IssueType = 'XUAT'`), hệ thống kiểm tra ràng buộc:
  $$\text{Số lượng xuất} \le \text{StockQuantity hiện tại}$$
  * Nếu thỏa mãn: Thao tác hợp lệ, cập nhật số lượng tồn:
    $$\text{StockQuantity}_{\text{mới}} = \text{StockQuantity}_{\text{cũ}} - \text{Số lượng xuất}$$
  * Nếu không thỏa mãn (Số lượng xuất > Tồn kho): Hệ thống lập tức từ chối giao dịch, **Rollback** toàn bộ dữ liệu và thông báo lỗi *"Không đủ hàng trong kho"*. **Tuyệt đối không cho phép tồn kho bị âm.**

---

## 7. ERD & Bảng mô tả thuộc tính (Entity Relationship Diagram)

*(Mã sơ đồ DBML chi tiết được lưu riêng tại file `ERD-warehouse.dbml`)*

### A. Bảng `Products` (Sản phẩm & Tồn kho)
| Tên thuộc tính | Kiểu dữ liệu | Khóa | Ràng buộc / Mô tả |
| :--- | :--- | :--- | :--- |
| `ProductID` | INT | PK | Identity (1,1) - Mã sản phẩm tự tăng |
| `ProductName` | NVARCHAR(255) | | Not Null - Tên sản phẩm |
| `UnitPrice` | DECIMAL(18,2) | | Not Null - Đơn giá bán |
| `StockQuantity` | INT | | Not Null, Default 0 - Số lượng tồn kho |
| `Description` | NVARCHAR(500) | | Mô tả thêm về sản phẩm |

### B. Bảng `GoodsIssues` (Phiếu xuất / nhập kho)
| Tên thuộc tính | Kiểu dữ liệu | Khóa | Ràng buộc / Mô tả |
| :--- | :--- | :--- | :--- |
| `IssueID` | INT | PK | Identity (1,1) - Mã phiếu kho |
| `IssueDate` | DATETIME | | Default GETDATE() - Ngày giờ lập phiếu |
| `EmployeeID` | INT | | Not Null - Mã nhân viên lập phiếu |
| `IssueType` | VARCHAR(10) | | Check ('NHAP', 'XUAT') - Loại phiếu |
| `Note` | NVARCHAR(500) | | Ghi chú lý do xuất/nhập |

### C. Bảng `GoodsIssueDetails` (Chi tiết phiếu kho)
| Tên thuộc tính | Kiểu dữ liệu | Khóa | Ràng buộc / Mô tả |
| :--- | :--- | :--- | :--- |
| `DetailID` | INT | PK | Identity (1,1) - Mã chi tiết phiếu |
| `IssueID` | INT | FK | Nối với `GoodsIssues(IssueID)` |
| `ProductID` | INT | FK | Nối với `Products(ProductID)` |
| `Quantity` | INT | | Not Null, > 0 - Số lượng xuất hoặc nhập |
| `UnitPrice` | DECIMAL(18,2) | | Not Null - Đơn giá tại thời điểm xuất/nhập |
