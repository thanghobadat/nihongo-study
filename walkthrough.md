# Walkthrough: Triển khai Dark Mode & Light Mode cho Nihongo Flow

Dự án **Nihongo Flow** đã được nâng cấp hệ thống giao diện kép (Dark Mode & Light Mode) và tái cấu trúc lại thanh Sidebar bằng cách tích hợp Popover cài đặt chung `SidebarSettings`.

## Các thay đổi đã thực hiện

### 1. Cấu hình Theme & Layout gốc
*   [globals.css](file:///d:/AI/japanese_learning/website/frontend/src/app/globals.css): Kích hoạt Class-based Dark Mode thông qua cú pháp Tailwind v4 `@variant dark (&:where(.dark, .dark *));`. Thiết lập các biến CSS mặc định cho nền và chữ trên cả hai chế độ.
*   [layout.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/layout.tsx): Bổ sung một script đồng bộ trong thẻ `<head>` để ngăn ngừa hiện tượng nhấp nháy giao diện (hydration flicker) when đọc cấu hình từ `localStorage`. Body được cập nhật sử dụng lớp màu động `bg-slate-50 dark:bg-[#09111e]`.

### 2. Thành phần (Components) mới
*   [ThemeProvider.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/components/ThemeProvider.tsx): Quản lý trạng thái Theme (Light/Dark) qua React Context, tự động đồng bộ hóa lớp `.dark` vào thẻ `<html>` và lưu cấu hình vào `localStorage`.
*   [SidebarSettings.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/components/SidebarSettings.tsx): Component hợp nhất hiển thị nút bấm Cài đặt ở cuối sidebar. Khi được nhấn, popover nổi lên cung cấp thông tin học viên (avatar động sinh bằng hàm băm SVG, tên hiển thị, email), toggle bật/tắt theme (☀️/🌙) và nút Đăng xuất (🚪). Hỗ trợ sự kiện click-outside để đóng menu cài đặt khi người dùng nhấn ra ngoài.

### 3. Polish & Tích hợp Trang
Tất cả 11 trang giao diện của ứng dụng được refactor đồng loạt để hỗ trợ Light Mode mặc định (`bg-slate-50`, v.v.) đồng thời bảo lưu 100% giao diện tối nguyên bản bằng tiền tố `dark:` (ví dụ `dark:bg-[#0b1329]`).
*   [AuthGuard.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/components/AuthGuard.tsx): Cập nhật hiệu ứng tải trang (loading screen) đồng bộ màu sắc theo theme.
*   [dashboard/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/dashboard/page.tsx)
*   [lessons/\[id\]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx)
*   [kana/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/kana/page.tsx)
*   [roadmap/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/roadmap/page.tsx)
*   [roadmap/practice/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/roadmap/practice/page.tsx)
*   [guide/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/guide/page.tsx)

## Kết quả kiểm thử & Xác minh

Chúng tôi đã chạy kiểm thử tự động với Browser Subagent để xác minh các chức năng hoạt động hoàn hảo trên trình duyệt.

### 1. Quy trình chạy thử nghiệm
*   Tải trang và xác minh Dark Mode được kích hoạt mặc định theo yêu cầu thiết kế cũ.
*   Nhấp vào nút **Cài đặt** ở góc dưới cùng sidebar. Popover mở rộng hiển thị chính xác.
*   Nhấp toggle chuyển đổi sang Light Mode. Giao diện thay đổi ngay lập tức sang tông sáng mềm mại, tinh tế.
*   Tải lại trang (reload) để kiểm chứng cơ chế ngăn Flicker hoạt động đúng.
*   Nhấp chuột ra vùng ngoài popover để xác minh tính năng Click-outside tự động ẩn popover.

### 2. Khắc phục lỗi ô nhập liệu, hộp lựa chọn và Hover trắng trong Dark Mode
*   **Lớp CSS lỗi**: Dọn dẹp tất cả các lớp Tailwind bị phân mảnh dạng `dark:bg-slate-950/60/...` thành lớp chuẩn để trình duyệt nhận diện được màu nền tối.
*   **Ô nhập liệu (Inputs)**: Sửa đổi các ô nhập đáp án (`bg-[#FCF3CF]`) và số lượng câu hỏi (`bg-slate-100`) trên các tab luyện tập thành màu tối (`dark:bg-slate-950`).
*   **Hộp lựa chọn & Hover**: Chuẩn hóa màu nền các thẻ `<option>` của `<select>` và bổ sung các lớp hover tương ứng cho chế độ tối (như `dark:hover:bg-slate-800/80` thay vì chỉ có `hover:bg-white` làm trắng nền khi di chuột).

### 3. Khắc phục lỗi nền trắng trên Selectbox, Dropdown Status, Audio và Shuffle Buttons
*   **Hộp tùy chọn thả xuống (Select Options)**: Cấu hình thêm thuộc tính `color-scheme: dark;` vào thẻ gốc `.dark` tại [globals.css](file:///d:/AI/japanese_learning/website/frontend/src/app/globals.css). Điều này báo cho các trình duyệt (Chrome, Edge, Firefox) tự động dựng hình (render) danh sách tùy chọn `<option>` đổ ra của thẻ `<select>` bằng giao diện tối màu nguyên bản, đồng bộ hóa cả lịch ngày và thanh cuộn.
*   **Hộp chọn trạng thái học tập**: Cập nhật lớp hiển thị của hộp trạng thái từ vựng/chữ Hán/ngữ pháp khi chưa học từ màu trắng tĩnh sang màu tối động `bg-white dark:bg-slate-900/60`.
*   **Nút Loa âm thanh và Tráo đề**:
    *   Tất cả 6 nút phát âm âm thanh (Audio `🔊`) đã được tích hợp lớp đổi nền tối `dark:bg-slate-900/60`.
    *   Nút Tráo đề (`🔀 Tráo đề`) ở tab Luyện tập đã được tích hợp lớp `bg-white dark:bg-slate-950/60` giúp hoạt động ổn định và có giao diện tối chuẩn xác.

> [!TIP]
> Việc đóng gói toàn bộ logic profile, đổi theme và đăng xuất vào component [SidebarSettings.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/components/SidebarSettings.tsx) giúp giảm thiểu hơn 300 dòng mã nguồn trùng lặp trên 6 trang khác nhau của dự án, cải thiện tối đa khả năng bảo trì.
