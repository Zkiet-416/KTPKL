# PHÂN HỆ QUẢN TRỊ HỆ THỐNG – ĐĂNG NHẬP, NGƯỜI DÙNG, PHÂN QUYỀN

> Phụ trách: TV1 · Sơ đồ: [`DFD-admin.puml`](DFD-admin.puml) (mức 1), [`DFD-admin-level2.md`](DFD-admin-level2.md) (mức 2) · ERD: [`ERD-admin.dbml`](ERD-admin.dbml)

## 1. Giới thiệu phân hệ
### 1.1 Bối cảnh
* Hệ thống có ba nhóm người dùng với quyền khác nhau (Admin, Quản lý kho, Nhân viên kho). Cần có cơ chế đăng nhập và phân quyền để mỗi người chỉ dùng đúng chức năng của mình, tránh sửa nhầm hoặc xem dữ liệu không thuộc phần việc.
* Hệ thống **không có đăng ký**: tài khoản do Admin tạo và gán vai trò.

### 1.2 Mục tiêu
* ADM-OBJ-01 – Kiểm soát truy cập: chỉ người có tài khoản hợp lệ mới vào được hệ thống.
* ADM-OBJ-02 – Quản lý tài khoản: Admin thêm, sửa, đặt lại mật khẩu, xóa hoặc khóa người dùng.
* ADM-OBJ-03 – Phân quyền: mỗi người dùng có một vai trò, vai trò quyết định giao diện và chức năng được dùng.

### 1.3 Phạm vi chức năng
* ADM-F01 – Đăng nhập / đăng xuất: xác thực, cấp token kèm vai trò, chuyển vào đúng giao diện.
* ADM-F02 – Quản lý người dùng: xem danh sách, tìm kiếm, thêm, sửa thông tin, đặt lại mật khẩu, xóa hoặc khóa tài khoản.
* ADM-F03 – Phân quyền: xem và gán, đổi vai trò cho người dùng.

## 2. Khảo sát nghiệp vụ
### 2.1 Mục đích khảo sát
* Tìm hiểu ai được phép làm gì trong kho (ai lập phiếu, ai xem báo cáo) để xác định các vai trò và quyền của từng vai trò.

### 2.2 Đối tượng khảo sát
| Đối tượng | Mục đích |
|---|---|
| Chủ cửa hàng / người quản trị | Xác định ai cấp tài khoản, quy định mật khẩu và việc khóa tài khoản khi nhân viên nghỉ việc. |
| Quản lý kho, Nhân viên kho | Xác định các chức năng mỗi người cần dùng hằng ngày. |

## 3. Nghiệp vụ
### 3.1 Quy trình chính
1. Người dùng mở hệ thống, nhập tên đăng nhập và mật khẩu.
2. Hệ thống kiểm tra tài khoản, mật khẩu, tình trạng khóa; thành công thì cấp token kèm vai trò và chuyển vào giao diện tương ứng.
3. Admin vào cổng `/admin`, thêm tài khoản mới và chọn vai trò (hoặc sửa, đặt lại mật khẩu, khóa, đổi vai trò khi cần).
4. Từ lần đăng nhập sau, người dùng chỉ dùng được các chức năng đúng vai trò.

### 3.2 Quy tắc nghiệp vụ
* ADM-BR01: Không có chức năng đăng ký; tài khoản chỉ do Admin tạo.
* ADM-BR02: Tên đăng nhập không trùng; mỗi người dùng có đúng một vai trò.
* ADM-BR03: Mật khẩu lưu dạng băm (bcrypt), không lưu mật khẩu gốc.
* ADM-BR04: Tài khoản bị khóa không đăng nhập được.
* ADM-BR05: Tài khoản đã lập phiếu nhập/xuất thì chuyển sang khóa thay vì xóa hẳn, để giữ lịch sử phiếu.
* ADM-BR06: Admin không tự xóa hoặc tự khóa tài khoản của mình.
* ADM-BR07: API nào cũng kiểm tra đăng nhập và vai trò ở backend, không chỉ ẩn nút trên giao diện.

## 4. Phân quyền
| Chức năng | Admin | Quản lý kho | Nhân viên kho |
|---|---|---|---|
| Đăng nhập / đăng xuất | Có | Có | Có |
| Quản lý người dùng | Có | Không | Không |
| Phân quyền | Có | Không | Không |

## 5. Bảng mô tả thuộc tính
Quan hệ: một vai trò có nhiều người dùng (`Roles` 1 – N `Users`).

### 5.1 Bảng `Roles` – Vai trò
| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `Id` | INT IDENTITY(1,1) | PK | Mã vai trò |
| `Code` | NVARCHAR(30) | NOT NULL, UNIQUE | `ADMIN`, `WAREHOUSE_MANAGER`, `WAREHOUSE_STAFF` |
| `Name` | NVARCHAR(100) | NOT NULL | Tên hiển thị |
| `Description` | NVARCHAR(255) | NULL | Mô tả quyền hạn |

### 5.2 Bảng `Users` – Người dùng
| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `Id` | INT IDENTITY(1,1) | PK | Mã người dùng |
| `Username` | NVARCHAR(50) | NOT NULL, UNIQUE | Tên đăng nhập |
| `PasswordHash` | NVARCHAR(255) | NOT NULL | Mật khẩu đã băm |
| `FullName` | NVARCHAR(100) | NOT NULL | Họ và tên |
| `Email` | NVARCHAR(100) | NULL | Email |
| `Phone` | NVARCHAR(20) | NULL | Số điện thoại |
| `RoleId` | INT | FK → `Roles.Id`, NOT NULL | Vai trò |
| `IsActive` | BIT | NOT NULL, mặc định 1 | 1 = hoạt động, 0 = bị khóa |
| `LastLoginAt` | DATETIME2 | NULL | Lần đăng nhập gần nhất |
| `CreatedAt` | DATETIME2 | NOT NULL | Ngày tạo |
| `UpdatedAt` | DATETIME2 | NULL | Ngày cập nhật |

Dữ liệu mẫu: 3 vai trò; ít nhất 4 người dùng (1 Admin, 1 Quản lý kho, 2 Nhân viên kho), mật khẩu lưu dạng băm, mật khẩu test ghi trong báo cáo.

## 6. API và màn hình dự kiến
| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập, trả token và vai trò |
| GET | `/api/auth/me` | Thông tin người đang đăng nhập |
| GET / POST | `/api/users` | Danh sách (tìm kiếm, phân trang) / thêm người dùng |
| GET / PATCH | `/api/users/:id` | Chi tiết / sửa thông tin |
| PATCH | `/api/users/:id/password` | Đặt lại mật khẩu |
| PATCH | `/api/users/:id/role` | Gán, đổi vai trò |
| PATCH | `/api/users/:id/status` | Khóa / mở khóa |
| DELETE | `/api/users/:id` | Xóa (hoặc chuyển sang khóa nếu đã lập phiếu) |

Màn hình: **Đăng nhập** (trang đầu tiên) · **Admin – Quản lý người dùng** (danh sách, tìm kiếm, thêm, sửa, đặt lại mật khẩu, khóa/xóa, đổi vai trò).

## 7. Phụ thuộc với phần của thành viên khác
* **Tất cả TV:** dùng chung đăng nhập và guard theo vai trò; khóa `Users.Id` được các bảng phiếu trỏ tới.
* **TV4, TV5:** bảng phiếu có `CreatedByUserId → Users.Id`; TV4 đọc họ tên người lập khi in phiếu.
* Dữ liệu mẫu tài khoản test do TV1 cung cấp trong script SQL.
