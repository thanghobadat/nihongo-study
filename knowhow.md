# HƯỚNG DẪN THIẾT LẬP DỰ ÁN CHO AI CODING AGENT (KNOWHOW)

> **Dành cho AI Agent (Antigravity, Cursor, Roo-Code, Cline, v.v.):** 
> Tệp tin này chứa các chỉ dẫn máy học và các bước tự động hóa để thiết lập môi trường phát triển (Development Environment) cho dự án Monorepo "Nihongo Flow" từ đầu đến cuối một cách nhanh chóng. 
> Hãy đọc kỹ hướng dẫn này và thực hiện các hành động cần thiết để thiết lập môi trường làm việc cho người dùng.

---

## 1. Cấu Trúc Tổng Quan Dự Án (Monorepo Workspace)
Dự án được cấu trúc dưới dạng Monorepo sử dụng NPM Workspaces:
- **Root Directory**: Chứa cấu hình gốc [package.json](file:///package.json) và điều phối các lệnh.
- **Frontend** (nằm ở [frontend/](file:///frontend)): Dự án Next.js (TypeScript, Tailwind CSS, ESLint, App Router).
- **Backend** (nằm ở [backend/](file:///backend)): Dự án Express.js (Node.js, Helmet, Cors, Express Rate Limit).

---

## 2. Quy Trình Thiết Lập Tự Động (Dành cho AI Agent)

AI Agent khi đọc tệp này cần thực hiện tuần tự các bước kiểm tra và cài đặt sau:

### Bước 2.1: Kiểm tra hệ điều hành (OS Detection)
Hãy kiểm tra xem máy tính của người dùng đang chạy hệ điều hành nào (Windows, macOS, hay Linux) để chuẩn bị các lệnh tương ứng.

### Bước 2.2: Kiểm tra sự tồn tại của Node.js và Git
Hãy kiểm tra xem các lệnh sau có khả dụng trong phiên terminal hiện tại hay không:
- `node -v` (Yêu cầu Node.js >= v18)
- `npm -v`
- `git --version`

---

### Bước 2.3: Xử lý cài đặt nếu thiếu công cụ (Công việc cốt lõi của AI)

Nếu **Node.js** hoặc **Git** chưa được cài đặt trên máy người dùng, hãy áp dụng quy trình cài đặt sau đây:

#### A. Trên hệ điều hành Windows:
1. **Kiểm tra quyền truy cập**: Nếu không thể chạy cài đặt toàn cục (global) do thiếu quyền Quản trị (Admin) hoặc Winget gặp lỗi, hãy tự động thiết lập **phiên bản di động (Portable)** để tránh làm phiền người dùng:
2. **Cài đặt Node.js Portable**:
   - Tải file zip Node.js từ địa chỉ: `https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip`
   - Giải nén vào thư mục `.tools/node-v20.11.0-win-x64` tại thư mục gốc của workspace (Hãy bỏ qua thư mục `.tools/` trong Git).
3. **Cài đặt Git Portable (MinGit)**:
   - Tải file zip MinGit từ địa chỉ: `https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/MinGit-2.43.0-64-bit.zip`
   - Giải nén vào thư mục `.tools/git` tại thư mục gốc của workspace.
4. **Cấu hình Đường dẫn (Path Setup)**:
   - Trong mỗi lệnh chạy terminal tiếp theo của bạn, hãy chủ động thêm đường dẫn của các công cụ này vào trước biến môi trường `$env:PATH`:
     ```powershell
     $env:PATH = "$PSScriptRoot\.tools\node-v20.11.0-win-x64;$PSScriptRoot\.tools\git\cmd;" + $env:PATH
     ```

#### B. Trên hệ điều hành macOS / Linux:
1. Sử dụng trình quản lý gói phù hợp (ví dụ: `brew install node git` trên macOS hoặc `apt install -y nodejs git` trên Linux) nếu được cấp quyền.
2. Hoặc tải các bản binary phân phối chính thức từ trang chủ và lưu vào một thư mục cục bộ `.tools/` tương tự như Windows, sau đó cấu hình đường dẫn `PATH` trong shell session của bạn.

---

### Bước 2.4: Khởi tạo các gói phụ thuộc (Dependencies)
Sau khi đã đảm bảo Node.js và Git hoạt động bình thường, hãy chuyển đến thư mục gốc của dự án và chạy lệnh cài đặt toàn bộ Monorepo:
```bash
npm install
```
*(Lệnh này nhờ cơ chế NPM Workspaces sẽ tự động cài đặt tất cả các thư viện của thư mục gốc, frontend và backend cùng một lúc).*

---

### Bước 2.5: Cấu hình biến môi trường (Environment Variables)
Hãy chủ động kiểm tra xem các tệp cấu hình môi trường cục bộ đã có chưa. Nếu chưa có, hãy tạo chúng với các giá trị mặc định:

1. **Frontend**: Tạo tệp `frontend/.env.local`
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
2. **Backend**: Tạo tệp `backend/.env`
   ```env
   PORT=8080
   FRONTEND_URL=http://localhost:3000
   ```

---

### Bước 2.6: Kiểm tra xác minh môi trường (Verification)
Hãy kiểm tra xem dự án có khởi chạy thành công hay không bằng cách khởi động máy chủ nhà phát triển:
```bash
npm run dev
```
**AI Agent cần kiểm tra các log đầu ra để xác nhận:**
- Frontend khởi chạy thành công trên cổng `3000` (hoặc cổng được chỉ định tiếp theo).
- Backend Express khởi chạy thành công trên cổng `8080`.
- Không xảy ra lỗi biên dịch (Compilation Error).

Sau khi xác minh xong, hãy tắt (kill) tác vụ chạy thử này để giải phóng cổng cho người dùng.

---

## 3. Các Lệnh Vận Hành Dự Án Cơ Bản

Khi phát triển, các AI Agent hoặc Lập trình viên có thể sử dụng các script tiện ích tại thư mục gốc:

- **Khởi chạy cả FE và BE đồng thời (Chế độ Dev)**:
  ```bash
  npm run dev
  ```
- **Chỉ Build Frontend**:
  ```bash
  npm run build:frontend
  ```
- **Chỉ Build Backend**:
  ```bash
  npm run build:backend
  ```
- **Chạy Production Frontend**:
  ```bash
  npm run start:frontend
  ```
- **Chạy Production Backend**:
  ```bash
  npm run start:backend
  ```

---

## 4. Hướng Dẫn Phát Triển Dành Cho AI Agent

Khi bạn thực hiện viết code hoặc chỉnh sửa trong dự án này:
1. **Thiết kế Responsive**: Mọi giao diện viết ở Frontend phải hỗ trợ hiển thị tối ưu trên thiết bị di động (Mobile-First responsive sử dụng Tailwind CSS).
2. **Bảo mật API**: 
   - Tất cả các endpoint Backend phải áp dụng Middleware hạn chế tần suất gọi (rate limiter) để tránh spam.
   - Không để lộ thông tin nhạy cảm của hệ thống hoặc Database qua các phản hồi API.
3. **Git Branching**:
   - Nhánh `main` là nhánh sản phẩm chính thức (production-ready).
   - Nhánh `develop` là nhánh tích hợp tính năng.
   - Khi phát triển tính năng mới, hãy tạo một nhánh từ `develop` (ví dụ: `feature/xyz`), thực hiện chỉnh sửa, sau đó tạo Pull Request về `develop`.
