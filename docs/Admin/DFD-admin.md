# DFD mức dưới đỉnh – Tiến trình 1.0 Quản trị hệ thống

> Phụ trách: Nguyễn Trần Gia Kiệt (TV1)

## 1. Sơ đồ

Sơ đồ viết bằng PlantUML: [`DFD-admin.puml`](dfd-level1-admin.puml).

## 2. Tác nhân ngoài và kho dữ liệu

| Thành phần | Mô tả |
|------------|-------|
| Người dùng hệ thống | Gồm Admin, Quản lý kho, Nhân viên kho khi đăng nhập. Ở sơ đồ này gom thành một hộp để dễ đọc; DFD mức đỉnh có thể tách thành 3 tác nhân. |
| Admin | Người quản lý tài khoản và phân quyền. |
| D1 – Người dùng & vai trò | Lưu tài khoản (tên đăng nhập, mật khẩu băm, họ tên, trạng thái khóa) và danh sách vai trò. Ứng với bảng `Users`, `Roles` trong CSDL. |

> Mã kho D1 và tên tác nhân cần **khớp với DFD mức đỉnh** (TV3). Nếu TV3 đánh số khác, chỉ cần đổi nhãn.

## 3. Các tiến trình

| Mã | Tiến trình | Luồng vào | Luồng ra | Kho dữ liệu | Mô tả xử lý |
|----|-----------|-----------|----------|--------------|-------------|
| 1.1 | Đăng nhập / đăng xuất | Tên đăng nhập, mật khẩu (từ Người dùng); tài khoản, mật khẩu băm, vai trò, trạng thái khóa (từ D1) | Kết quả đăng nhập (token, vai trò) hoặc thông báo lỗi (về Người dùng) | Đọc D1 | Tìm tài khoản theo tên đăng nhập, so khớp mật khẩu đã băm, kiểm tra tài khoản chưa bị khóa; thành công thì cấp token kèm vai trò để chuyển vào đúng giao diện. |
| 1.2 | Quản lý người dùng | Thông tin người dùng: thêm, sửa, xóa/khóa, đặt lại mật khẩu (từ Admin); danh sách người dùng (từ D1) | Danh sách người dùng, kết quả thao tác (về Admin); tài khoản mới / đã sửa / đã khóa (vào D1) | Đọc, ghi D1 | Kiểm tra dữ liệu hợp lệ (tên đăng nhập không trùng, mật khẩu đủ mạnh), băm mật khẩu trước khi lưu, ghi các thay đổi, trả lại danh sách cập nhật. |
| 1.3 | Phân quyền | Người dùng cần phân quyền và vai trò được gán (từ Admin); thông tin người dùng, danh sách vai trò (từ D1) | Kết quả phân quyền (về Admin); vai trò mới của người dùng (vào D1) | Đọc, ghi D1 | Gán một vai trò cho tài khoản, cập nhật vào D1; từ lần đăng nhập sau người dùng chỉ vào được giao diện và chức năng đúng vai trò. |

## 4. Bảng luồng dữ liệu

| Từ | Đến | Luồng dữ liệu |
|----|-----|---------------|
| Người dùng hệ thống | 1.1 | Tên đăng nhập, mật khẩu |
| 1.1 | Người dùng hệ thống | Kết quả đăng nhập (token, vai trò) / thông báo lỗi |
| D1 | 1.1 | Tài khoản, mật khẩu băm, vai trò, trạng thái khóa |
| Admin | 1.2 | Thông tin người dùng (thêm, sửa, xóa/khóa, đặt lại mật khẩu) |
| 1.2 | Admin | Danh sách người dùng, kết quả thao tác |
| 1.2 | D1 | Tài khoản mới / đã sửa / đã khóa |
| D1 | 1.2 | Danh sách người dùng |
| Admin | 1.3 | Người dùng cần phân quyền và vai trò được gán |
| 1.3 | Admin | Kết quả phân quyền |
| 1.3 | D1 | Vai trò mới của người dùng |
| D1 | 1.3 | Thông tin người dùng, danh sách vai trò |

## 5. Quy tắc liên quan (đề xuất, nhóm xác nhận)

- Không có chức năng đăng ký: tài khoản chỉ do Admin tạo.
- Mật khẩu lưu dạng băm, không lưu mật khẩu gốc.
- Tài khoản bị khóa không đăng nhập được.
- Tài khoản đã phát sinh phiếu nhập/xuất thì không xóa hẳn mà chuyển sang trạng thái khóa, để giữ lịch sử phiếu.
- Admin không tự xóa hoặc tự khóa chính tài khoản của mình.
