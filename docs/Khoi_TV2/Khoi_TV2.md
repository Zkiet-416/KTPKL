1) Khảo sát \
Ngành kinh doanh sản phẩm phụ kiện điện thoại có đặc thù: Mẫu mã đa dạng (ốp lưng, cáp sạc, tai nghe, …), vòng đời sản phẩm ngắn theo từng đợt ra mắt máy mới, giá trị đơn vị từ thấp đến trung bình nhưng số lượng SKU (mã hàng) cực lớn. Do đó, việc quản lý thường gặp các vấn đề như:
- Nhầm lẫn phân loại giữa các dòng máy tương tự nhau (ví dụ: iPhone 13 và 14, ốp bản Pro và Pro Max).
- Tồn kho lệch thực tế do thất thoát phụ kiện nhỏ hoặc hàng vỡ/hỏng.
- Tồn đọng hàng lỗi thời khi các dòng điện thoại cũ ngừng sản xuất.
Chính vì thế chúng ta cần tự động hóa kiểm soát xuất - nhập - tồn, quản lý vị trí lưu kho, cảnh báo hàng cận hạn hoặc tồn kho dưới ngưỡng an toàn để giảm thiểu tối đa sai sót thao tác tay.

2) Giới thiệu phân mục \
Phân hệ Danh mục quản lý kho đóng vai trò nền tảng dữ liệu cho toàn bộ hoạt động kho vận. Phân hệ chịu trách nhiệm chuẩn hóa thông tin định danh hàng hóa, sơ đồ bố trí kho, chính sách lưu trữ và quy tắc quản lý thuộc tính sản phẩm trước khi phát sinh các giao dịch xuất/nhập thực tế.

3) Danh mục sơ đồ thiết kế

a) Sơ đồ chức năng (BFD)
*(Đính kèm file sơ đồ)*

b) Sơ đồ ngữ cảnh (DFD ngữ cảnh)
*(Đính kèm file sơ đồ)*

c) Sơ đồ DFD mức đỉnh
*(Đính kèm file sơ đồ)*

d) Sơ đồ DFD mức 2 (mục 2.0)
*(Đính kèm file sơ đồ)*

e) Sơ đồ DFD mức 2 (mục 1.0)
*(Đính kèm file sơ đồ)*

f) Sơ đồ DFD mức 3 (mục 1.1)
*(Đính kèm file sơ đồ)*

g) Sơ đồ DFD mức 3 (mục 1.2)
*(Đính kèm file sơ đồ)*

h) Sơ đồ DFD mức 2 (mục 3.0)
*(Đính kèm file sơ đồ)*

i) Sơ đồ DFD mức 3 (mục 3.1)
*(Đính kèm file sơ đồ)*

j) Sơ đồ DFD mức 3 (mục 3.2)
*(Đính kèm file sơ đồ)*

4) Mô tả chi tiết nghiệp vụ

a) Phân hệ 1.0 - Quản lý Tổng quan
- 1.1.1 Xem tổng sản phẩm tồn: Hệ thống tổng hợp và tính toán tổng lượng hàng hóa lưu kho bằng cách cộng dồn số lượng tồn của tất cả các sản phẩm đang có trong hệ thống.
- 1.1.2 Cảnh báo sắp hết hàng: Hệ thống tự động so khớp số lượng tồn kho thực tế với ngưỡng an toàn quy định (min_threshold). Những sản phẩm có lượng tồn bé hơn hoặc bằng ngưỡng sẽ được gắn cờ cảnh báo đỏ để kịp thời lập kế hoạch nhập hàng.
- 1.2.1 Doanh thu theo thời gian: Hệ thống tiếp nhận tiêu chí lọc theo thời gian (theo ngày, tuần, tháng, quý, năm) và truy xuất dữ liệu đơn hàng đã hoàn tất để tính tổng doanh thu bán ra.
- 1.2.2 Biểu đồ doanh thu: Tiếp nhận tập dữ liệu doanh thu đã được phân tích và tổng hợp theo chu kỳ thời gian từ tiến trình 1.2.1, trực quan hóa thành đồ thị (cột hoặc đường) giúp theo dõi xu hướng tăng trưởng trực quan.

b) Phân hệ 2.0 - Quản lý Danh mục
- 2.1 Thêm loại sản phẩm: Cho phép nhập thông tin danh mục mới (mã loại, tên danh mục, mô tả). Ràng buộc: tên loại sản phẩm không được trùng lặp trong cơ sở dữ liệu.
- 2.2 Sửa loại sản phẩm: Cập nhật lại tên hiển thị hoặc mô tả của danh mục mà không làm đứt gãy liên kết khóa ngoại với các sản phẩm đang trực thuộc.
- 2.3 Xóa loại sản phẩm: Ràng buộc toàn vẹn dữ liệu nghiêm ngặt: hệ thống không cho phép xóa loại sản phẩm nếu đang có ít nhất 1 sản phẩm thuộc danh mục này (phải chuyển danh mục hoặc xóa sản phẩm trước).
- 2.4 Xem danh sách danh mục: Hiển thị đầy đủ danh sách danh mục hiện có phục vụ quản lý và phân loại khi nhập kho.

c) Phân hệ 3.0 - Quản lý Sản phẩm
- 3.1.1 Thêm mới sản phẩm: Ghi nhận các thông tin hàng hóa bao gồm: Tên sản phẩm, Loại sản phẩm (Category ID), Đơn giá, Đơn vị tính, Ngưỡng cảnh báo tồn kho tối thiểu.
- 3.1.2 Chỉnh sửa sản phẩm: Cho phép sửa đổi quy cách, giá niêm yết, danh mục hoặc mô tả. Không cho phép sửa đổi tùy tiện số lượng tồn kho trực tiếp tại chức năng này (số lượng tồn kho chỉ được cập nhật tự động thông qua Phiếu Nhập / Phiếu Xuất kho).
- 3.1.3 Xóa / Vô hiệu hóa: Áp dụng cơ chế Xóa mềm (Soft Delete / Deactivate) bằng cờ trạng thái để bảo lưu lịch sử giao dịch và thống kê của sản phẩm trên các hóa đơn cũ.
- 3.2 Tra cứu & Hiển thị: Hỗ trợ tìm kiếm theo từ khóa, sắp xếp đa chiều (theo giá tăng/giảm, theo số lượng tồn tăng/giảm, theo thứ tự A-Z) và xem hồ sơ chi tiết của từng mặt hàng.

5) Bảng ma trận phân quyền\
Quy ước: C = Create (Thêm mới) | R = Read (Xem/Tra cứu) | U = Update (Chỉnh sửa) | D = Delete (Xóa/Vô hiệu hóa) | - = Không được phép | D* = Xóa mềm

| Chức năng | Quản lý kho | Nhân viên kho |
| :--- | :---: | :---: |
| 1.1.1 Xem tổng sản phẩm tồn | R | R |
| 1.1.2 Cảnh báo sắp hết hàng | R | R |
| 1.2.1 Doanh thu theo thời gian | R | - |
| 1.2.2 Biểu đồ doanh thu | R | - |
| 2.1 Thêm loại sản phẩm | C | - |
| 2.2 Sửa loại sản phẩm | U | - |
| 2.3 Xóa loại sản phẩm | D | - |
| 2.4 Xem danh sách danh mục | R | R |
| 3.1.1 Thêm mới sản phẩm | C | C |
| 3.1.2 Chỉnh sửa sản phẩm | U | U |
| 3.1.3 Xóa / Vô hiệu hóa sản phẩm | D* | D* |
| 3.2.1 Tìm kiếm theo tên | R | R |
| 3.2.2 Sắp xếp sản phẩm | R | R |
| 3.2.3 Xem chi tiết sản phẩm | R | R |