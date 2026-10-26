# KHẢO SÁT VÀ GIỚI THIỆU MODULE NHÀ CUNG CẤP

## 1. Khảo sát hiện trạng
Hiện nay, tại nhiều kho hàng và doanh nghiệp quy mô vừa và nhỏ, công tác quản lý thông tin nhà cung cấp vẫn được thực hiện theo phương pháp bán thủ công, chủ yếu dựa vào sổ sách giấy tờ hoặc các tệp tin Excel phân tán. Việc thiếu một cơ sở dữ liệu tập trung đã dẫn đến nhiều hạn chế trong khâu vận hành kho. Thứ nhất, thông tin liên hệ cốt lõi (số điện thoại, email, người đại diện) dễ bị thất lạc, sai sót hoặc không được cập nhật đồng bộ khi đối tác có sự thay đổi về nhân sự hay trụ sở.

Thứ hai, bộ phận thu mua và thủ kho gặp rất nhiều rào cản trong việc tra cứu lịch sử giao dịch. Khi phát sinh nhu cầu nhập vật tư gấp hoặc cần đổi trả hàng hóa lỗi, nhân viên phải dò tìm lại từng chứng từ cũ để xác định đúng nhà cung cấp, làm giảm hiệu suất làm việc và gián đoạn chuỗi cung ứng. Hơn nữa, do không có công cụ thống kê tự động, ban quản lý thiếu cơ sở dữ liệu trực quan để đánh giá năng lực, độ uy tín và tần suất hợp tác của từng đối tác. Do đó, việc số hóa và tích hợp module Quản lý Nhà cung cấp vào hệ thống kho là yêu cầu cấp thiết.

## 2. Giới thiệu chức năng
Module **Quản lý Nhà cung cấp** được xây dựng nhằm số hóa toàn bộ thông tin đối tác cung cấp hàng hóa cho hệ thống. Các chức năng chính bao gồm:
- **Quản lý thông tin:** Thêm mới, cập nhật chi tiết, và xóa thông tin nhà cung cấp.
- **Tra cứu nhanh:** Tìm kiếm và sắp xếp danh sách nhà cung cấp theo tên, mã số (ID), hoặc trạng thái hoạt động.
- **Thống kê:** Hỗ trợ thống kê dữ liệu liên quan đến nhà cung cấp (ví dụ: số lượng phiếu nhập, tổng giá trị giao dịch) để phục vụ quản lý kho.

## 3. Mô tả nghiệp vụ & Phân quyền
- **Phân quyền:** Chỉ tài khoản có vai trò Quản lý kho (hoặc Admin) mới được quyền Thêm/Sửa/Xóa thông tin nhà cung cấp. Nhân viên kho chỉ được phép Xem và Tìm kiếm.
- **Nghiệp vụ Thêm mới:** Người dùng nhập các thông tin bắt buộc bao gồm Mã nhà cung cấp (ID), Tên, Số điện thoại, Email và Địa chỉ. Hệ thống sẽ tự động kiểm tra tính hợp lệ của định dạng và từ chối nếu phát hiện trùng lặp dữ liệu quan trọng (**ID, SĐT, Email**). Nếu dữ liệu hợp lệ --> Lưu thông tin vào cơ sở dữ liệu.
- **Nghiệp vụ Xóa:** Hệ thống sẽ dùng **ID** để kiểm tra xem nhà cung cấp này đã từng phát sinh "Phiếu nhập kho" nào trong hệ thống hay chưa. 
  - Nếu chưa --> Cho phép xóa vĩnh viễn (xóa cứng). 
  - Nếu đã có --> Từ chối thao tác xóa cứng, đồng thời yêu cầu quản trị viên chuyển trạng thái thành "Ngừng hợp tác" (xóa mềm) để bảo toàn dữ liệu lịch sử đối soát về sau.

## 4. Phân tích và Mô tả thuộc tính (Data Dictionary)
Bảng dưới đây mô tả chi tiết kiểu dữ liệu và các ràng buộc của thực thể `Suppliers`:

| Tên trường (Field) | Kiểu dữ liệu | Ràng buộc | Mô tả (Description) |
| :--- | :--- | :--- | :--- |
| **SupplierID** | `VARCHAR(20)` | `PRIMARY KEY` | Mã định danh duy nhất của nhà cung cấp (VD: NCC001). |
| **SupplierName** | `NVARCHAR(100)` | `NOT NULL` | Tên đầy đủ của công ty hoặc cá nhân cung cấp hàng hóa. |
| **PhoneNumber** | `VARCHAR(15)` | `UNIQUE`, `NOT NULL` | Số điện thoại liên hệ chính. Không được trùng lặp. |
| **Email** | `VARCHAR(100)` | `UNIQUE`, `NULL` | Địa chỉ email liên hệ. Không được trùng lặp. |
| **Address** | `NVARCHAR(255)` | `NOT NULL` | Địa chỉ trụ sở hoặc kho hàng của nhà cung cấp. |
| **Status** | `BIT` | `DEFAULT 1` | Trạng thái hoạt động (`1`: Đang hợp tác, `0`: Ngừng hợp tác). |