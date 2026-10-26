# Sơ đồ chức năng (BFD)

> Phụ trách: Nguyễn Trần Gia Kiệt (TV1) · Hệ thống quản lý kho phụ kiện điện thoại

## 1. Sơ đồ

Sơ đồ viết bằng PlantUML: [`functional-diagram.puml`](functional-diagram.puml). Mở file trong VS Code rồi nhấn `Alt + D` (extension **PlantUML**) để xem; xuất ra `.svg` hoặc `.png` khi cần chèn vào báo cáo.

## 2. Cách đọc sơ đồ

- Hệ thống chia thành **5 nhóm chức năng cấp 1**. Đây cũng chính là **5 tiến trình 1.0 – 5.0** ở DFD mức đỉnh; mỗi thành viên vẽ DFD mức dưới đỉnh cho nhóm của mình.
- Mã chức năng cấp 2 có dạng `<nhóm>.<số thứ tự>` (ví dụ `4.2` thuộc nhóm 4).

| Nhóm | Tên nhóm chức năng | Người phụ trách |
|------|--------------------|-----------------|
| 1 | Quản trị hệ thống | TV1 |
| 2 | Quản lý sản phẩm | TV2 |
| 3 | Quản lý nhà cung cấp | TV3 |
| 4 | Quản lý nhập kho | TV4 |
| 5 | Tra cứu & xuất kho | TV5 |

## 3. Mô tả các chức năng

| Mã | Chức năng | Mô tả | Vai trò sử dụng |
|----|-----------|-------|------------------|
| 1.1 | Đăng nhập / đăng xuất | Xác thực tên đăng nhập, mật khẩu; chuyển người dùng vào đúng giao diện theo vai trò. Hệ thống **không có đăng ký**, tài khoản do Admin cấp. | Admin, Quản lý kho, Nhân viên kho |
| 1.2 | Quản lý người dùng | Xem, tìm kiếm danh sách; thêm tài khoản mới; sửa thông tin; đặt lại mật khẩu; xóa hoặc khóa tài khoản. | Admin |
| 1.3 | Phân quyền | Gán vai trò (Admin / Quản lý kho / Nhân viên kho) cho từng tài khoản; vai trò quyết định giao diện và chức năng được dùng. | Admin |
| 2.1 | Quản lý loại sản phẩm | Thêm, sửa, xóa loại sản phẩm (ốp lưng, sạc, cáp, tai nghe…). | Quản lý kho |
| 2.2 | Quản lý sản phẩm | Thêm, sửa, xóa sản phẩm. | Quản lý kho |
| 2.3 | Tìm kiếm, sắp xếp theo sản phẩm | Tìm kiếm và sắp xếp danh sách sản phẩm. | Quản lý kho |
| 2.4 | Tổng quan | Hiển thị số liệu tổng hợp của kho (tổng sản phẩm tồn kho, tổng doanh thu). | Quản lý kho |
| 3.1 | Quản lý nhà cung cấp | Thêm, sửa, xóa nhà cung cấp. | Quản lý kho |
| 3.2 | Tìm kiếm, sắp xếp theo nhà cung cấp | Tìm kiếm và sắp xếp danh sách nhà cung cấp. | Quản lý kho |
| 4.1 | Lập phiếu nhập kho | Chọn nhà cung cấp, thêm các dòng sản phẩm (số lượng, đơn giá nhập), lưu phiếu → **số lượng tồn tăng**. | Nhân viên kho, Quản lý kho |
| 4.2 | In phiếu nhập kho | In phiếu nhập đã lập. | Quản lý kho |
| 4.3 | Lưu trữ, xem lại phiếu nhập | Phiếu nhập được lưu trong CSDL, tra cứu và xem lại khi cần. | Quản lý kho |
| 4.4 | Thống kê lịch sử nhập kho | Xem và thống kê lịch sử nhập kho theo tháng, năm tùy chọn. | Quản lý kho |
| 5.1 | Xem thông tin hàng hóa, số lượng | Xem thông tin sản phẩm và số lượng tồn kho. | Nhân viên kho |
| 5.2 | Tìm kiếm hàng hóa | Tìm kiếm dữ liệu hàng hóa. | Nhân viên kho |
| 5.3 | Lọc theo giá bán, tên sản phẩm | Lọc danh sách hàng hóa theo giá bán, theo tên sản phẩm. | Nhân viên kho |
| 5.4 | Lập phiếu xuất kho | Chọn sản phẩm, số lượng xuất (không vượt quá tồn), lưu phiếu → **số lượng tồn giảm**. | Nhân viên kho |
