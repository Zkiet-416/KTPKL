# Checklist review code trước khi merge

Người duyệt đi qua từng mục; chưa đạt thì **Request changes** kèm comment cụ thể, đạt đủ thì **Approve**.

## 1. Về Pull Request
- [ ] Nhánh đặt tên đúng quy ước; PR đi từ nhánh làm việc → `develop`
- [ ] Tiêu đề + mô tả PR rõ (làm gì, cách test); có ảnh chụp nếu là giao diện
- [ ] PR nhỏ gọn, chỉ làm 1 việc; commit message đúng chuẩn (xem [git-convention](git-convention.md))
- [ ] Không có xung đột với `develop` (đã merge `develop` về nhánh mình)

## 2. Chạy được
- [ ] `npm run build` thành công ở thư mục bị ảnh hưởng (backend / frontend)
- [ ] `npm run lint` không có lỗi
- [ ] Người duyệt đã chạy thử chức năng trên máy và thấy đúng yêu cầu
- [ ] Không còn `console.log` thừa, code bị comment, file tạm

## 3. Đúng nghiệp vụ
- [ ] Đúng yêu cầu đồ án (B3 / B4 / Admin) và quy tắc nghiệp vụ đã thống nhất trong nhóm
- [ ] Nhập kho → tồn **tăng**; xuất kho → tồn **giảm**, không xuất quá tồn; lưu phiếu + cập nhật tồn trong **1 transaction**
- [ ] Phân quyền đúng: API kiểm tra vai trò ở backend, menu/route FE chỉ hiện đúng cổng

## 4. Chất lượng code
- [ ] Đặt tên đúng [naming-convention](naming-convention.md)
- [ ] Dữ liệu đầu vào được validate (DTO ở BE, kiểm tra form ở FE); có xử lý lỗi và thông báo tiếng Việt dễ hiểu
- [ ] Không lặp code lớn; hàm gọn, dễ đọc
- [ ] FE gọi API qua `src/api/`, không hard-code URL

## 5. Bảo mật & cấu hình
- [ ] Không commit `.env`, mật khẩu, khóa bí mật, `node_modules`, `dist`
- [ ] Mật khẩu lưu dạng băm; không trả mật khẩu/băm ra API
- [ ] Biến môi trường mới đã thêm vào `.env.example`

## 6. Cơ sở dữ liệu
- [ ] Đổi cấu trúc CSDL đã cập nhật `backend/database/*.sql` (idempotent) và tài liệu thiết kế CSDL
- [ ] Dữ liệu mẫu mới không làm hỏng dữ liệu cũ; chạy lại `npm run db:init` không lỗi

## 7. Tài liệu
- [ ] Thư viện mới: đã báo nhóm, commit cả `package.json` lẫn `package-lock.json`
- [ ] Docs liên quan được cập nhật (README, docs/…) nếu thay đổi cách chạy hoặc cấu trúc
