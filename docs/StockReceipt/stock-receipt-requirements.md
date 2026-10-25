# PHÂN HỆ QUẢN LÝ KHO - PHIẾU NHẬP KHO
## 1. Giới thiệu phân hệ
### 1.1 Bối cảnh 
* Trong kinh doanh phụ kiện, việc nhập hàng diễn ra thường xuyên nhưng nếu phương thức quản lý không phù hợp sẽ dễ thất lạc chứng từ và khó khăn khi tra cứu. Phân hệ Quản lý kho – Phiếu nhập kho ra đời nhằm giải quyết vấn đề nêu trên, giúp hỗ trợ lưu trữ, in ấn và thống kê lịch sử nhập hàng một cách minh bạch, hiệu quả.

### 1.2 Mục tiêu 
* OBJ-01 – In phiếu nhập kho: Hỗ trợ quản lý kho in phiếu nhập phục vụ đối chiếu chứng từ.
* OBJ-02 – Tra cứu phiếu nhập: Cho phép quản lý kho xem lại các phiếu nhập đã lưu.
* OBJ-03 – Theo dõi lịch sử nhập kho: Cho phép quản lý kho xem lịch sử nhập hàng, có thể xem theo bộ lọc tháng/năm.
* OBJ-04 – Thống kê nhập kho: Tổng hợp dữ liệu nhập kho tổng quát hoặc theo khoảng thời gian được chọn để hỗ trợ theo dõi tình hình nhập hàng.

### 1.3 Phạm vi chức năng
* F-01 – Xem lại phiếu đã lưu: Cho phép quản lý kho tìm kiếm, lựa chọn và xem chi tiết các phiếu nhập kho đã được lưu trong hệ thống.
* F-02 – In phiếu nhập kho: Hỗ trợ in phiếu nhập khi xem lại phiếu đã lưu.
* F-03 – Xem lịch sử nhập kho: Cho phép quản lý kho xem danh sách các phiếu nhập đã lưu; hỗ trợ lọc danh sách theo tháng/năm khi cần.
* F-04 – Thống kê nhập kho: Tổng hợp dữ liệu nhập kho theo tháng/năm được chọn.

## 2. Khảo sát nghiệp vụ
### 2.1. Mục đích khảo sát
* Khảo sát nghiệp vụ nhằm tìm hiểu nhu cầu quản lý chứng từ nhập kho, cách lưu trữ và tra cứu phiếu nhập đã lập, hình thức in phiếu và các tiêu chí thống kê lịch sử nhập hàng theo tháng hoặc năm.
* Kết quả khảo sát là cơ sở để xác định các chức năng cần xây dựng, thông tin cần hiển thị trên phiếu nhập, cách tra cứu dữ liệu và yêu cầu thống kê phục vụ công tác quản lý kho.

### 2.2. Đối tượng khảo sát
| Đối tượng | Mục đích |
|---|---|
| Nhân viên kho | Tìm hiểu các thông tin được ghi nhận trên phiếu nhập và cách lập phiếu trong nghiệp vụ nhập kho, làm cơ sở xác định dữ liệu cần hiển thị khi tra cứu, in ấn và thống kê. |
| Quản lý kho | Tìm hiểu nhu cầu xem lại phiếu đã lưu, in phiếu, tra cứu lịch sử nhập kho và các tiêu chí thống kê theo tháng/năm. |

## 3. NGHIỆP VỤ 
### 3.1. Quy trình chính
1. Quản lý kho truy cập chức năng phiếu nhập kho.
2. Quản lý kho chọn chức năng xem lại phiếu nhập kho đã lưu.
3. Hệ thống truy xuất và hiển thị danh sách phiếu nhập phù hợp với yêu cầu tra cứu.
4. Quản lý kho chọn một phiếu nhập để xem chi tiết thông tin phiếu và danh sách hàng hóa tương ứng.
5. Khi cần lưu bản giấy để đối chiếu, quản lý kho chọn chức năng in phiếu nhập kho.
6. Khi cần theo dõi lịch sử nhập hàng, quản lý kho chọn chức năng xem lịch sử và có thể lựa chọn tháng/năm để lọc danh sách phiếu nhập.
7. Hệ thống truy xuất dữ liệu và hiển thị danh sách phiếu nhập theo khoảng thời gian được lựa chọn.
8. Khi cần tổng hợp số liệu, quản lý kho chọn chức năng thống kê nhập kho và có thể lựa chọn tháng/năm cần thống kê.
9. Hệ thống tổng hợp dữ liệu phiếu nhập trong khoảng thời gian tương ứng và hiển thị kết quả thống kê tổng quát hoặc theo bộ lọc quản lý kho chọn.

### 3.2 Quy tắc nghiệp vụ
* BR-01: Mỗi phiếu nhập kho phải có mã phiếu duy nhất.
* BR-02: Chỉ hiển thị và in các phiếu nhập đã được lưu.
* BR-03: Việc xem hoặc in lại phiếu đã lưu không làm thay đổi dữ liệu tồn kho.
* BR-04: Thống kê lịch sử nhập kho phải dựa trên tháng/năm được lựa chọn.

## 4. Phân quyền 
| Chức năng | Nhân viên kho | Quản lý kho |
|---|---|---|
| In phiếu nhập kho | Không | Có |
| Xem lại phiếu đã lưu | Không | Có |
| Xem lịch sử nhập kho | Không | Có |
| Thống kê lịch sử nhập kho | Không | Có |


## 5. Bảng mô tả thuộc tính
### 5.1. Bảng GoodsReceipts – Phiếu nhập kho

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| Id | integer | PK, tự tăng | Id phiếu nhập kho do hệ thống tự sinh, dùng định danh nội bộ và liên kết với bảng chi tiết phiếu nhập. |
| ReceiptCode | varchar(20) | NOT NULL, UNIQUE | Mã phiếu nhập |
| SupplierId | integer | NOT NULL | Mã nhà cung cấp |
| CreatedBy | varchar(100) | FK, NOT NULL | Người lập phiếu |
| CreatedAt | datetime | NOT NULL | Ngày giờ lập phiếu |
| TotalAmount | decimal(18,2) | NOT NULL | Tổng tiền phiếu nhập |
| Note | varchar(500) | Cho phép NULL | Ghi chú |

### 5.2. Bảng GoodsReceiptDetails – Chi tiết phiếu nhập kho

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| Id | integer | PK, tự tăng | Mã chi tiết phiếu nhập |
| GoodsReceiptId | integer | FK, NOT NULL | Mã phiếu nhập |
| ProductId | integer | FK, NOT NULL | Mã sản phẩm/nguyên vật liệu |
| Unit | varchar(30) | NOT NULL | Đơn vị tính |
| UnitPrice | decimal(18,2) | NOT NULL | Đơn giá nhập |
| Quantity | decimal(12,2) | NOT NULL | Số lượng nhập |
| LineTotal | decimal(18,2) | NOT NULL | Thành tiền dòng chi tiết | 
