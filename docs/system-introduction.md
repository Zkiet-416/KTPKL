# Giới thiệu hệ thống thông tin

> Phụ trách: Nguyễn Trần Gia Kiệt (TV1) · Đề tài: Hệ thống quản lý kho phụ kiện điện thoại

## 1. Giới thiệu chung

Một doanh nghiệp thương mại kinh doanh phụ kiện điện thoại (ốp lưng, cường lực, sạc, cáp, tai nghe, pin dự phòng…) có số lượng mặt hàng lớn, nhập từ nhiều nhà cung cấp. Kho hàng là nơi hàng hóa vào và ra liên tục, nên cần biết chính xác mỗi mặt hàng còn bao nhiêu, nhập từ đâu, khi nào.

Đề tài xây dựng **một phần nhỏ của hệ thống thông tin doanh nghiệp thương mại**: hệ thống **quản lý kho** (nhập, xuất, tồn kho) cho cửa hàng phụ kiện điện thoại.

## 2. Mô tả công việc của hệ thống

Hệ thống hỗ trợ các công việc của bộ phận kho:

- **Quản lý danh mục:** lưu thông tin sản phẩm, loại sản phẩm và nhà cung cấp.
- **Nhập kho:** khi hàng về, nhân viên lập phiếu nhập; hệ thống lưu phiếu và **tăng số lượng tồn** của từng sản phẩm. Phiếu nhập được in và lưu trữ để tra cứu.
- **Xuất kho:** khi xuất hàng, nhân viên lập phiếu xuất; hệ thống lưu phiếu và **giảm số lượng tồn**, không cho xuất vượt số lượng đang có.
- **Tra cứu:** xem thông tin hàng hóa, số lượng tồn; tìm kiếm; lọc theo giá bán, tên sản phẩm.
- **Thống kê:** xem lịch sử nhập kho theo tháng, năm tùy chọn.
- **Quản trị:** Admin tạo tài khoản và phân quyền cho người dùng; mỗi vai trò có giao diện riêng.

## 3. Người dùng và chức năng

| Vai trò | Giao diện | Chức năng chính |
|---------|-----------|-----------------|
| **Admin** | `/admin` (tách biệt) | Quản lý người dùng: thêm, sửa, xóa; phân quyền |
| **Quản lý kho** | `/manager` | Thêm, sửa, xóa sản phẩm và nhà cung cấp; tìm kiếm, sắp xếp theo sản phẩm, theo nhà cung cấp; in và lưu trữ phiếu nhập kho; xem và thống kê lịch sử nhập kho theo tháng, năm |
| **Nhân viên kho** | `/staff` | Xem thông tin hàng hóa, số lượng; tìm kiếm; lọc theo giá bán, tên sản phẩm; lập phiếu nhập kho, phiếu xuất kho |

Chi tiết từng chức năng xem ở [Sơ đồ chức năng](functional-diagram.md).

## 4. Mục tiêu xây dựng hệ thống

| Vấn đề cần giải quyết | Mục tiêu của hệ thống |
|-----------------------|-----------------------|
| Ghi chép nhập, xuất hàng thủ công dễ sai sót, khó tra cứu | Lưu trữ tập trung phiếu nhập, phiếu xuất; tra cứu nhanh |
| Khó biết chính xác số lượng tồn kho | Tồn kho tự động tăng khi nhập, giảm khi xuất; chặn xuất vượt tồn |
| Khó thống kê hàng nhập theo thời gian | Thống kê lịch sử nhập kho theo tháng, năm |
| Mọi người đều có thể sửa dữ liệu | Phân quyền theo vai trò; mỗi vai trò chỉ thấy chức năng của mình |

## 5. Dữ liệu vào, ra và xử lý chính

| Dữ liệu đầu vào | Xử lý | Dữ liệu đầu ra |
|------------------|-------|-----------------|
| Tên đăng nhập, mật khẩu | Xác thực, xác định vai trò | Giao diện theo vai trò / thông báo lỗi |
| Thông tin người dùng, vai trò | Kiểm tra hợp lệ, băm mật khẩu, lưu | Danh sách người dùng, kết quả thao tác |
| Thông tin sản phẩm, loại sản phẩm, nhà cung cấp | Kiểm tra hợp lệ, lưu; tìm kiếm, sắp xếp | Danh sách và chi tiết sản phẩm, nhà cung cấp |
| Phiếu nhập (nhà cung cấp, sản phẩm, số lượng, đơn giá) | Lưu phiếu, **tăng tồn kho** | Phiếu nhập đã lưu, bản in, tồn kho mới |
| Phiếu xuất (sản phẩm, số lượng) | Kiểm tra tồn, lưu phiếu, **giảm tồn kho** | Phiếu xuất đã lưu, tồn kho mới |
| Tiêu chí tìm kiếm, lọc (tên, giá bán), tháng/năm thống kê | Truy vấn, tổng hợp | Danh sách hàng hóa, báo cáo thống kê nhập kho |

## 6. Phạm vi

- quản trị người dùng và phân quyền; quản lý sản phẩm, nhà cung cấp; nhập kho, xuất kho; tra cứu, tìm kiếm, lọc; in và lưu trữ phiếu nhập; thống kê nhập kho theo tháng, năm.

## 7. Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Giao diện (Frontend) | React, TypeScript, TailwindCSS |
| Máy chủ (Backend) | NestJS, TypeScript |
| Cơ sở dữ liệu | Microsoft SQL Server |
