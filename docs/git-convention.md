# Quy chuẩn Git & Commit

## 1. Khởi tạo repo (chỉ nhóm trưởng làm 1 lần)

```bash
(cd backend && npm install)             # sinh package-lock.json (BẮT BUỘC commit)
(cd frontend && npm install)
git init -b main
git add .
git commit -m "chore: khởi tạo cấu trúc dự án"
git remote add origin <URL-repo>
git push -u origin main
git checkout -b develop
git push -u origin develop
```

Trên GitHub: đặt **default branch = `develop`**, bật **branch protection** cho `main` và `develop` (bắt buộc Pull Request, tối thiểu 1 người duyệt), mời đủ 5 thành viên.

## 2. Mô hình nhánh

| Nhánh | Mục đích | Ai được merge |
|-------|----------|---------------|
| `main` | Bản **ổn định** để demo / nộp bài | Chỉ nhóm trưởng, merge từ `develop` vào cuối mỗi tuần |
| `develop` | Nhánh **tích hợp** | Qua Pull Request đã được duyệt |
| `feature/<module>-<mô-tả>` | Làm chức năng mới | Tạo từ `develop`, PR vào `develop` |
| `fix/<module>-<mô-tả>` | Sửa lỗi | Tạo từ `develop` |
| `docs/<mô-tả>` | Viết tài liệu / báo cáo | Tạo từ `develop` |
| `db/<mô-tả>` | Sửa script SQL / dữ liệu mẫu | Tạo từ `develop`, **TV2 duyệt** |

**Đặt tên nhánh:** chữ thường, không dấu, nối bằng `-`. Ví dụ: `feature/products-crud`, `feature/receipt-print`, `fix/issue-stock-check`, `docs/dfd-nhap-kho`, `db/seed-products`.

## 3. Quy trình làm việc hằng ngày

```bash
# 1) Cập nhật develop
git checkout develop
git pull origin develop

# 2) Tạo nhánh làm việc
git checkout -b feature/products-crud

# 3) Code + commit thường xuyên (commit nhỏ, rõ nghĩa)
git add .
git commit -m "feat(products): thêm API danh sách sản phẩm có tìm kiếm"

# 4) Trước khi đẩy: lấy code mới nhất của develop, xử lý conflict (nếu có)
git fetch origin
git merge origin/develop

# 5) Kiểm tra build + lint rồi đẩy nhánh
npm run build && npm run lint           # trong backend/ hoặc frontend/
git push -u origin feature/products-crud

# 6) Lên GitHub tạo Pull Request: feature/products-crud → develop
```

## 4. Quy ước commit (Conventional Commits)

Định dạng: `<type>(<scope>): <mô tả ngắn gọn bằng tiếng Việt>`

| type | Dùng khi | Ví dụ |
|------|----------|-------|
| `feat` | Thêm chức năng | `feat(receipts): lập phiếu nhập kho và tăng tồn` |
| `fix` | Sửa lỗi | `fix(issues): chặn xuất vượt số lượng tồn` |
| `docs` | Tài liệu / báo cáo | `docs(dfd): vẽ DFD mức 1 tiến trình nhập kho` |
| `db` | Script SQL, dữ liệu mẫu | `db(seed): thêm 30 sản phẩm mẫu` |
| `style` | Format, không đổi logic | `style(fe): format lại ProductPage` |
| `refactor` | Cải tổ code, không đổi hành vi | `refactor(be): tách hàm tính tồn kho` |
| `chore` | Cấu hình, thư viện | `chore: thêm thư viện recharts` |

`scope` gợi ý: `be`, `fe`, `db`, `docs` hoặc tên module (`auth`, `users`, `products`, `suppliers`, `receipts`, `issues`, `statistics`).
Mỗi commit chỉ làm **1 việc**; không đặt message kiểu “update”, “fix bug”, “abc”.

## 5. Pull Request & duyệt code

- PR đi từ `feature/*`, `fix/*`, `docs/*`, `db/*` → **`develop`**. **Cấm push trực tiếp** lên `main` và `develop`.
- Tiêu đề PR theo định dạng commit; mô tả rõ làm gì, cách test, kèm ảnh chụp màn hình nếu có giao diện.
- Cần **ít nhất 1 thành viên khác** Approve mới được merge; người duyệt dùng [checklist review](checklist-review.md).
- Dùng **Squash and merge** khi gộp vào `develop`; xóa nhánh sau khi merge.
- PR nhỏ (dưới ~400 dòng); **duyệt PR của bạn trong vòng 24 giờ**.
- Cặp review chéo mặc định: TV1→TV2→TV3→TV4→TV5→TV1 (người sau duyệt PR người trước).
- Nhóm trưởng merge `develop` → `main` cuối mỗi tuần sau khi cả nhóm xác nhận chạy ổn.

## 6. Tuyệt đối không làm

- ❌ Commit `.env`, `node_modules/`, `dist/`, mật khẩu, khóa bí mật.
- ❌ Push thẳng lên `main` / `develop`; `git push --force` lên nhánh dùng chung.
- ❌ Sửa file / module của bạn khác mà không báo.
- ❌ Sửa cấu trúc CSDL trên máy rồi quên cập nhật `backend/database/*.sql`.

## 7. Xử lý tình huống thường gặp

| Tình huống | Cách xử lý |
|------------|------------|
| Conflict khi merge | Xử lý **trên máy bạn** (VS Code → *Resolve in Merge Editor*), build + test lại rồi mới commit. Không hiểu đoạn code của người khác → hỏi trước khi xóa. |
| Conflict `package-lock.json` | `git checkout origin/develop -- package-lock.json` rồi `npm install` và commit. |
| Cần thêm thư viện | Báo nhóm, `npm install <tên>` đúng thư mục, commit **cả `package.json` lẫn `package-lock.json`** trong 1 PR `chore: thêm thư viện ...`. |
| Commit nhầm vào `develop` | Đừng push; hỏi nhóm trưởng cách `git reset`. Đã push: báo ngay. |
| Cất tạm code làm dở | `git stash` → đổi nhánh → `git stash pop` |

## 8. Quy ước tài liệu (docs)

- Mỗi người **chỉ sửa file thuộc phần mình** để tránh conflict.
- Sơ đồ vẽ bằng **draw.io**: lưu `.drawio` **và** `.png` vào `docs/diagrams/`, tên dạng `dfd-muc-1-nhap-kho.png`; chèn vào `.md` bằng `![mô tả](diagrams/ten-file.png)`.
- Ảnh chụp giao diện đặt trong `docs/images/`, tên dạng `<module>-<man-hinh>.png`.
