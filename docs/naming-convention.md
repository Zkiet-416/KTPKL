# Quy chuẩn đặt tên Code, API & Database

## 1. Nguyên tắc chung
- **Tên trong code (biến, hàm, class, route API, tên bảng/cột): tiếng Anh.**
- **Giao diện hiển thị, thông báo cho người dùng, tài liệu: tiếng Việt.**
- Tên phải rõ nghĩa, không viết tắt khó hiểu (`supplierName`, không `spName`).

## 2. Code
| Hạng mục | Quy ước | Ví dụ |
|----------|---------|-------|
| File Backend | `kebab-case` + hậu tố | `products.controller.ts`, `create-product.dto.ts`, `product.entity.ts` |
| File Frontend – component/page | `PascalCase.tsx` | `ProductTable.tsx`, `ReceiptCreatePage.tsx` |
| File Frontend – hook / api | `useXxx.ts` / `xxx.api.ts` | `useDebounce.ts`, `products.api.ts` |
| Biến, hàm | `camelCase` | `totalAmount`, `calculateStock()` |
| Class, interface, type, component | `PascalCase` | `GoodsReceiptsService`, `ProductDto` |
| Hằng số, enum member | `UPPER_SNAKE_CASE` | `WAREHOUSE_MANAGER` |
| Biến boolean | tiền tố `is/has/can` | `isActive`, `hasStock` |

## 3. REST API
- Tiền tố `/api`; danh từ **số nhiều**, `kebab-case`.
- Dùng đúng phương thức HTTP:

| Thao tác | Method + đường dẫn |
|----------|--------------------|
| Danh sách (tìm kiếm, sắp xếp, phân trang) | `GET /api/products?search=ốp&sortBy=salePrice&order=ASC&page=1&limit=10` |
| Chi tiết | `GET /api/products/:id` |
| Tạo mới | `POST /api/goods-receipts` |
| Cập nhật | `PATCH /api/products/:id` |
| Xóa | `DELETE /api/products/:id` |

- Query dùng chung cho danh sách: `page`, `limit`, `search`, `sortBy`, `order` (xem `backend/src/common/dto/pagination-query.dto.ts`).
- Mã trạng thái: `200` OK · `201` tạo mới · `400` dữ liệu sai · `401` chưa đăng nhập · `403` không đủ quyền · `404` không tìm thấy · `409` trùng/xung đột.
- Dữ liệu gửi lên validate bằng DTO + `class-validator`; JSON dùng `camelCase`.
- Mọi API (trừ đăng nhập, health) phải kiểm tra đăng nhập + vai trò ở backend.

## 4. Database (SQL Server)
| Hạng mục | Quy ước | Ví dụ |
|----------|---------|-------|
| Tên bảng | tiếng Anh, `PascalCase`, số nhiều | `Products`, `GoodsReceiptDetails` |
| Tên cột | `PascalCase` | `SalePrice`, `StockQuantity` |
| Khóa chính | `Id` (1 kiểu thống nhất cả nhóm) | `Id INT IDENTITY` |
| Khóa ngoại | `<TênBảngSốÍt>Id` | `SupplierId`, `CategoryId` |
| Cột thời gian | `CreatedAt`, `UpdatedAt` (DATETIME2) | |
| Ràng buộc | `PK_`, `FK_`, `UQ_`, `CK_` + bảng + cột | `FK_Products_Categories`, `CK_Products_StockQuantity` |
| Chuỗi tiếng Việt | `NVARCHAR` | `Name NVARCHAR(200)` |

Script SQL phải **idempotent** (chạy lại không lỗi). Đổi cấu trúc bảng → cập nhật `backend/database/*.sql`, tài liệu thiết kế CSDL và entity trong backend, rồi báo TV2.

## 5. Frontend
- Gọi API **chỉ** qua `src/api/*.api.ts` (dùng chung `http` trong `api/client.ts`), không gọi axios trực tiếp trong component.
- Giao diện dùng Tailwind utility classes; thành phần dùng lại từ 2 nơi trở lên → đưa vào `components/common/`.
- Mỗi cổng (admin / manager / staff) chỉ import layout & trang của cổng đó.
