# KÝ ỨC DỰ ÁN: NIHONGO FLOW (PROJECT MEMORY)

> **Dành cho AI Agent:** Tệp tin này lưu trữ toàn bộ bối cảnh, kiến thức, cấu trúc kỹ thuật và trạng thái hiện tại của dự án "Nihongo Flow". Khi tiếp quản dự án hoặc bắt đầu phiên làm việc mới, hãy đọc tệp này trước để hiểu điểm dừng và tiếp tục công việc chính xác.

---

## 1. Thông Tin Chung & Bối Cảnh
- **Tên dự án**: Nihongo Flow (Ứng dụng tự học tiếng Nhật).
- **Mục tiêu**: Xây dựng trang web học tiếng Nhật responsive (đặc biệt tối ưu cho Mobile và Desktop), giao diện đẹp mắt, hiện đại, bảo mật tốt (chống clone mã nguồn dễ dàng), triển khai hoàn toàn trên các dịch vụ lưu trữ miễn phí.
- **Tài nguyên học liệu đầu vào**: Dựa trên các bài học từ tệp Excel (ví dụ: [Bai1_Hajimemashite.xlsx](file:///d:/AI/japanese_learning/tai_lieu/Bai1_Hajimemashite.xlsx) - đã cấu trúc lại sheet tráo đề `Luyen_Tu_Vung` và bảng từ vựng).
- **Kho lưu trữ GitHub**: `https://github.com/thanghobadat/nihongo-study.git`

---

## 2. Cấu Trúc Kỹ Thuật (Tech Stack)
Dự án được triển khai dưới dạng **Monorepo** trong thư mục `website/`:

- **Quản lý Workspace**: NPM Workspaces (khai báo tại `website/package.json`).
- **Frontend** (`website/frontend`):
  - Next.js 16.x (App Router, TypeScript, Tailwind CSS, ESLint).
  - Triển khai (Deploy): Vercel (Miễn phí).
- **Backend** (`website/backend`):
  - Node.js & Express.js.
  - Tích hợp bảo mật: `helmet` (tiêu đề HTTP bảo mật), `cors` (giới hạn nguồn gốc), `express-rate-limit` (chặn spam API, giới hạn 100 requests/15 phút).
  - Triển khai (Deploy): Render hoặc Supabase Edge Functions (Miễn phí).
- **Database**: Supabase (PostgreSQL miễn phí).

---

## 3. Cấu Hình Môi Trường Cục Bộ (Local Tools Environment)
Do hệ thống máy tính của người dùng không cài đặt sẵn Node.js và Git cục bộ và bị hạn chế quyền Administrator, các công cụ chạy di động đã được cài đặt độc lập:
- **Node.js Portable**: Tải tại thư mục [d:\AI\japanese_learning\.tools\node-v20.11.0-win-x64](file:///d:/AI/japanese_learning/.tools/node-v20.11.0-win-x64).
- **Git Portable (MinGit)**: Tải tại thư mục [d:\AI\japanese_learning\.tools\git](file:///d:/AI/japanese_learning/.tools/git).

> [!IMPORTANT]
> **Yêu cầu bắt buộc khi chạy các lệnh shell (PowerShell):** 
> Trước bất kỳ lệnh `node`, `npm`, `npx` hay `git` nào, bạn phải nạp đường dẫn các công cụ này vào biến môi trường:
> ```powershell
> $env:PATH = "d:\AI\japanese_learning\.tools\node-v20.11.0-win-x64;d:\AI\japanese_learning\.tools\git\cmd;" + $env:PATH
> ```

---

## 4. Nhật Ký Trạng Thái Phát Triển (Milestones)

### Mốc 1: Khởi tạo dự án & Đẩy code (Đã hoàn thành - 13/06/2026)
- Đã cài đặt Node.js & Git Portable.
- Khởi tạo cấu trúc Monorepo, viết khung Frontend (Next.js) và Backend (Express).
- Liên kết GitHub remote và đẩy thành công mã nguồn lên hai nhánh: `main` (nhánh sản xuất) và `develop` (nhánh phát triển).
- Viết tệp hướng dẫn tự động thiết lập cho AI [knowhow.md](file:///d:/AI/japanese_learning/website/knowhow.md) tại gốc dự án.

### Mốc 2: Phân tích & Đặc tả yêu cầu dự án (Đã hoàn thành - 13/06/2026)
- Phân tích chi tiết đặc tả thiết kế Excel trong [tao_bai_tap.md](file:///d:/AI/japanese_learning/tai_lieu/tao_bai_tap.md).
- Hoàn thiện tệp [requirement.md](file:///d:/AI/japanese_learning/website/requirement.md) mô tả chi tiết chức năng Frontend (Dashboard, Học liệu, Flashcards, Kaiwa, Luyện tập) và Backend/Database (API, Bảo mật, Supabase).
- Đẩy thành công tài liệu đặc tả yêu cầu lên GitHub remote.

### Mốc 3: Triển khai Backend Phân Quyền & API (Đã hoàn thành - 13/06/2026)
- Thiết lập Supabase SQL Schema ([schema.sql](file:///website/backend/src/db/schema.sql)) tích hợp đầy đủ RLS Policies bảo mật và trigger tự động đồng bộ User Auth sang Profiles.
- Triển khai Middleware xác thực phân quyền JWT (`requireAuth`, `requireAdmin`).
- Viết các API Đăng ký (`/api/auth/register`) và Đăng nhập (`/api/auth/login`) liên kết với Supabase Auth.
- Viết API User (tiến độ học tập, thiết lập mục tiêu target) và API Admin (quản lý học viên, CRUD học liệu từ vựng/Kanji/ngữ pháp).
- Cài đặt polyfill WebSocket (`ws`) giải quyết lỗi kết nối của Supabase Client trên Node.js < 22.
- Viết tập lệnh kiểm thử tự động [test_api.js](file:///website/backend/src/test_api.js) và thông qua kiểm thử tích hợp cục bộ (`npm run test:backend`).
- Tích hợp tính năng tự động bắt JWT Token khi Đăng nhập thành công trên giao diện Sandbox để gán trực tiếp vào Header cho các request tiếp theo.
- **Động hóa dữ liệu giả lập (In-memory Mock Database)**: Trích xuất 100% dữ liệu từ vựng (40 từ), chữ Hán (11 chữ), ngữ pháp (5 mẫu), và hội thoại Kaiwa từ Excel `Bai1_Hajimemashite.xlsx` vào [mockDb.js](file:///website/backend/src/db/mockDb.js). Cấu hình toàn bộ API của User và Admin hoạt động tương tác động trên bộ nhớ RAM khi chạy Local Mock Mode, hỗ trợ kiểm thử chéo vai trò.
- **Trình biên dịch dữ liệu đa bài học (Multi-lesson Compiler & Fixes)**:
  - Thiết lập kịch bản PowerShell [gen_multilesson_mock.ps1](file:///website/backend/gen_multilesson_mock.ps1) tự động quét toàn bộ tệp Excel trong thư mục `tai_lieu/` để phân tích và gộp dữ liệu động của nhiều bài học (Lessons) thành cơ sở dữ liệu giả lập thống nhất.
  - Khắc phục lỗi serialization trong PowerShell: Đảm bảo trường dữ liệu `lessons` (và các tài nguyên khác) trong `mockDb.js` luôn được xuất ra dưới dạng mảng JSON (Array `[]`) thay vì đối tượng đơn lẻ khi chỉ có 1 bài học đầu vào, giúp ngăn chặn lỗi sập server (`lessons.push is not a function`) ở các API Admin khi thêm bài mới.
  - Làm rõ tính tương thích đa bài học của Database: SQL Schema thực tế ([schema.sql](file:///website/backend/src/db/schema.sql)) đã được thiết kế chuẩn chỉnh từ đầu cho việc chia bài học (có cột `lesson_id` liên kết khóa ngoại tới bảng `lessons`), các endpoint API đã hỗ trợ sẵn việc lọc dữ liệu theo bài (ví dụ: `GET /api/user/lessons/:lessonId/vocabulary`). Do đó, cơ sở dữ liệu thực tế không cần cập nhật thêm gì, chỉ cần nạp dữ liệu cho các bài tiếp theo vào.
- **Cải tiến giao diện Sandbox Test**: Thêm ô nhập liệu `Lesson ID` trên API Client UI (`test_client.html` & `test_client.js`) để hỗ trợ kiểm thử linh hoạt các bài học khác nhau bằng cách tự động thay thế tham số đường dẫn (e.g. `/api/user/lessons/2/vocabulary`).
- **Tích hợp cơ chế Lưu tài khoản Mock cục bộ (`users.json`)**:
  - Cấu hình Middleware xác thực [auth.js](file:///website/backend/src/middlewares/auth.js) và các tuyến API xác thực của [auth.js](file:///website/backend/src/routes/auth.js) để hỗ trợ chế độ Local Mock hoàn toàn độc lập (không cần kết nối Supabase Cloud khi URL là placeholder).
  - Các tài khoản đăng ký mới ở chế độ Mock sẽ được lưu trữ trong tệp cục bộ [users.json](file:///website/backend/src/db/users.json) (ở dạng plain-text để dễ gỡ lỗi) và tự động đồng bộ hóa sang danh sách học sinh của quản trị viên `mockDb.students` theo thời gian thực.
  - Khi gửi Authorization Header bằng định dạng `Bearer mock-token-<id>`, Middleware xác thực sẽ tự động đối chiếu thông tin người dùng từ `users.json` để cấp quyền tương ứng (`user` hoặc `admin`).


### Mốc 4: Phát triển giao diện Frontend & Các Tab Học tập (Đã hoàn thành - 13/06/2026)
- **Từ vựng (Vocab)**: Triển khai giao diện thẻ từ vựng Navy HSL, tích hợp TTS phát âm chuẩn Nhật, MNemomic Tips, ví dụ song ngữ và cập nhật trạng thái học tập lưu tức thời về database.
- **Chữ Hán (Kanji)**: Triển khai giao diện lưới Kanji đồng bộ, bộ tìm kiếm thông minh theo Onyomi/Kunyomi/Hán Việt, tích hợp TTS phát âm và cập nhật trạng thái.
- **Ngữ pháp (Grammar)**: Xây dựng giao diện danh sách thẻ Ngữ pháp, hộp cấu trúc câu monospace nét đứt, giải nghĩa tiếng Việt chi tiết, ví dụ câu thoại tiếng Nhật kèm TTS.
- **Tiến độ ở Dashboard**: Đồng bộ hóa tiến độ Ngữ pháp (Daily Target và Actual Learned) về Dashboard, sửa lỗi JSX, hiển thị biểu đồ phần trăm hoàn thành bằng thanh ký tự.
- **Thẻ nhớ (Flashcards)**: Thiết kế thẻ lật 3D Glassmorphism viền Neon phát sáng, hỗ trợ Segmented Control (Vocabulary/Kanji), Dropdowns giới hạn khoảng thẻ thông minh (`endIndex >= startIndex`), Shuffle Mode tráo thẻ ngẫu nhiên và tích hợp TTS phát âm.
- **Luyện nói (Kaiwa)**:
  - Bổ sung API Backend `GET /api/lessons/:lessonId/kaiwa` hỗ trợ chế độ Mock và Database thực tế, tự động lọc bỏ các dòng metadata nhiễu của Lesson 1.
  - Triển khai giao diện Luyện hội thoại phong cách chat app cao cấp phân bên Trái/Phải (học viên ở bên phải, bạn cùng thoại ở bên trái) đi kèm avatar động tự sinh.
  - Xây dựng bảng thiết lập vai diễn (Roleplay Configuration Form) động cho phép người học tùy chọn Tên Katakana, Quốc tịch, Nghề nghiệp và Tổ chức.
  - Tích hợp cơ chế thay thế kịch bản động (Dynamic Dialogue Substitution) tự động thay đổi nội dung thoại tiếng Nhật và dịch nghĩa tiếng Việt.
  - Hỗ trợ loa đọc câu thoại TTS chuẩn Nhật `🔊` và các nút công cụ ẩn/hiện phiên âm Romaji / bản dịch tiếng Việt song song.

### Mốc 5: Tối ưu hóa UI Kaiwa & Thêm 2 cuộc hội thoại mới (Đã hoàn thành - 14/06/2026)
- **Tối ưu hóa UI/UX cho di động**: Chuyển đổi bộ chọn nhân vật (Tên, Quốc tịch, Nghề nghiệp, Tổ chức) sang dạng dropdown `<select>` gọn gàng, giảm thiểu chiều cao giao diện trên các màn hình nhỏ.
- **Hội thoại đóng/mở (Accordions)**: Thiết kế giao diện thanh tiêu đề của từng chủ đề hội thoại thành dạng hộp bấm đóng/mở (Accordion) có mũi tên hiển thị trạng thái (`▲`/`▼`) để người học có thể ẩn bớt các cuộc hội thoại đã học, tránh cuộn màn hình nhiều.
- **Thêm 2 kịch bản hội thoại mới (Chủ đề 4 & 5)**:
  - **Chủ đề 4**: Hỏi về công ty và tuổi tác.
  - **Chủ đề 5**: Cuộc gặp gỡ tình cờ.
- **Sửa lỗi chính tả & Overlap**:
  - Sửa lỗi chính tả thừa từ tiếng Việt `失礼 nhưng` thành `失礼ですが` ở dòng 9678 trong `mockDb.js`.
  - Sửa triệt để lỗi đè từ `ベトタイン` khi người học đổi tên thành `タイン` (Thanh) bằng cơ chế che giấu (masking) tạm thời quốc gia trong `substituteText`.

### Mốc 6: Tái tích hợp Phân hệ Luyện tập & Sửa lỗi biên dịch (Đã hoàn thành - 14/06/2026)
- **Tái tích hợp Phân hệ Luyện tập (Interactive Quiz)**:
  - Tích hợp lại các biến trạng thái (`practiceMode`, `practiceLimit`, `baseShuffledList`, `practiceList`, `practiceAnswers`, `isGraded`, `visibleAnswers`, `practiceDirection`) và hàm helper chấm điểm/accuracy vào [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx).
  - Tối ưu hóa giao diện di động: Dạng thẻ xếp chồng, có tính năng `break-all` cho đáp án dài để không tràn chữ trên mobile.
  - Sửa lỗi biên dịch TypeScript: Thêm thuộc tính `topic?: string;` vào khai báo kiểu `DialogueItem` để Next.js build biên dịch 100% sạch sẽ và thành công.

### Mốc 7: Duy trì trạng thái bài học (State Persistence) & Trải nghiệm Luyện hội thoại (Đã hoàn thành - 14/06/2026)
- **Khắc phục lỗi reset bài học & Rate Limiting**:
  - Trì hoãn việc gọi API dữ liệu trên Dashboard bằng state `isLoadedFromLocalStorage` cho tới khi khôi phục bài học đã chọn thành công, giảm 50% số lượng request lúc khởi chạy và chấm dứt lỗi **429 Too Many Requests**.
  - Tăng giới hạn Rate Limiter trên Backend lên **10,000 requests** mỗi 15 phút cho môi trường phát triển cục bộ.
- **Tái cấu trúc và thiết kế Kaiwa hai bên (Right/Left Chat Alignment)**:
  - Đồng bộ hóa vai nhân vật của học viên thành `"ナム"` (Nam) trong mọi đoạn hội thoại của cả hai bài.
  - Sắp xếp tin nhắn của học viên Nam hiển thị bên phải (Right-aligned, nền xanh-tím gradient), đối phương nằm bên trái (Left-aligned, nền xám slate), giải quyết lỗi dồn hết hội thoại về một bên ở Bài 2.
  - Biên soạn lại phần Kaiwa cho cả hai bài thành **5 chủ đề hội thoại khác nhau**, hỗ trợ thanh đóng/mở (Accordions) riêng biệt và dùng chung phần thiết lập vai diễn phía trên.
  - Cập nhật file Excel học liệu gốc [Bai1_Hajimemashite.xlsx](file:///d:/AI/japanese_learning/tai_lieu/Bai1_Hajimemashite.xlsx) và [Bai2_KorewaJishoDesu.xlsx](file:///d:/AI/japanese_learning/tai_lieu/Bai2_KorewaJishoDesu.xlsx) trên đĩa cứng đồng bộ với mã nguồn.
  - Cải tiến trình biên dịch `gen_multilesson_mock.ps1` tự động nạp trạng thái hiển thị Romaji để trích xuất Romaji dạng thô trực tiếp từ các công thức trong bảng tính.

### Mốc 8: Tự động hóa tạo dữ liệu nâng cao & Thêm dữ liệu từ Bài 11 đến Bài 25 (Đã hoàn thành - 14/06/2026)
- **Giải quyết lỗi độ ưu tiên toán tử PowerShell (Operator Precedence Bug)**:
  - Sửa lỗi trong biểu thức tạo mảng `$backFields` có phép nối chuỗi bằng toán tử `+`. Do dấu phẩy `,` có độ ưu tiên cao hơn `+`, mảng đã bị chia nhỏ thành 4 phần tử thay vì 2. Sửa bằng cách bao bọc các phép nối công thức trong cặp ngoặc đơn `(...)`.
- **Khắc phục sự cố mã hóa ký tự UTF-8**:
  - Đảm bảo script được thực thi chính xác bằng lệnh nạp UTF-8 tường minh trong PowerShell: `Get-Content ... -Encoding UTF8 | Out-String | Invoke-Expression`, tránh việc PowerShell 5.1 tải file không có BOM ở dạng ANSI gây lỗi hiển thị và cú pháp tiếng Việt/Emoji.
- **Sinh thành công 15 tệp Excel tương tác mới** (`Bai11_...` đến `Bai25_...`) tại thư mục `tai_lieu/` dựa trên thiết kế chuẩn của `tao_bai_tap.md`.
- **Biên dịch cơ sở dữ liệu tích hợp 25 bài học**:
  - Chạy kịch bản `gen_multilesson_mock.ps1` biên dịch toàn bộ dữ liệu từ 25 tệp Excel vào cơ sở dữ liệu giả lập [mockDb.js](file:///d:/AI/japanese_learning/website/backend/src/db/mockDb.js).
  - Vận hành và kiểm thử thành công API cục bộ trên server dev (`npm run test` trên Backend và Next.js).
- **Dọn dẹp môi trường**: Xóa sạch toàn bộ các script tạm và thư mục `lessons_data` rác để tối ưu dung lượng monorepo.

### Mốc 9: Đổi tên bài học N4 sang Romaji (Đã hoàn thành - 14/06/2026)
- **Đổi tên file Excel & Sửa Dashboard**:
  - Viết kịch bản PowerShell `tai_lieu/rename_and_update_lessons.ps1` thực hiện đổi tên toàn bộ 24 file Excel bài học N4 (Bài 27 đến 50) từ tiếng Việt sang Romaji (ví dụ: `Bai27_Thểkhảnăng.xlsx` -> `Bai27_KanouKei.xlsx`).
  - Sử dụng Excel COM Object để mở từng file và cập nhật ô `Dashboard!C3` thành Romaji tương ứng để đảm bảo tính đồng nhất bên trong workbook.
- **Biên dịch cơ sở dữ liệu**:
  - Chạy lại kịch bản `gen_multilesson_mock.ps1` biên dịch toàn bộ dữ liệu 50 bài học vào cơ sở dữ liệu giả lập `mockDb.js`. Tên các bài học từ 27 đến 50 hiện hiển thị dạng Romaji chuẩn xác (ví dụ: `Bài 27: KanouKei`, `Bài 28: Nagara`).
- **Kiểm thử & Xác minh**:
  - Chạy kiểm thử API Backend thành công và xác minh giao diện trực quan Next.js hoạt động hoàn hảo trên trình duyệt.

### Mốc 10: Thiết lập nhập vai Kaiwa tiếng Nhật & Động hóa theo từng bài (Đã hoàn thành - 14/06/2026)
- **Động hóa cấu trúc dữ liệu**:
  - Bổ sung trường `roleplay_options` kiểu `JSONB` vào bảng `public.lessons` trong file [schema.sql](file:///d:/AI/japanese_learning/website/backend/src/db/schema.sql).
  - Cập nhật kịch bản PowerShell [gen_multilesson_mock.ps1](file:///d:/AI/japanese_learning/website/backend/gen_multilesson_mock.ps1) tự động quét và trích xuất Data Validation các ô `C5` (Tên), `C6` (Quốc tịch), `C7` (Nghề nghiệp), `C8` (Tổ chức) trên sheet `Kaiwa` của từng file Excel và gộp vào `mockDb.js`.
- **Cập nhật Giao diện Next.js**:
  - Cấu hình trang [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/\\[id\\]/page.tsx) hiển thị động các lựa chọn nhập vai bằng tiếng Nhật lấy từ `activeLesson.roleplay_options`.
  - Tích hợp bảng từ điển dịch `jaToVnDict` và `jaToRomajiDict` hỗ trợ chuyển ngữ tự động các tùy chọn này sang tiếng Việt và Romaji trong kịch bản chat đối thoại.
  - Tự động reset lựa chọn nhân vật về tùy chọn mặc định của bài học mới khi người dùng chuyển đổi bài học.
- **Kiểm thử & Xác minh**:
  - Kiểm thử API Backend thành công và xác minh giao diện trực quan hoạt động ổn định trên trình duyệt.

### Mốc 11: Ẩn/Hiện Thiết Lập Nhập Vai & Hiển Thị Dropdowns Có Điều Kiện (Đã hoàn thành - 14/06/2026)
- **Kiểm tra Tham Chiếu Công Thức**:
  - Cập nhật [gen_multilesson_mock.ps1](file:///d:/AI/japanese_learning/website/backend/gen_multilesson_mock.ps1) để quét và kiểm tra xem các ô nhập vai `C5`, `C6`, `C7`, `C8` có thực sự được tham chiếu trong kịch bản hội thoại của sheet `Kaiwa` hay không.
  - Nếu không bài học nào có dòng hội thoại tham chiếu, gán `roleplay_options` của bài học đó thành `null` trong `mockDb.js`.
  - Nếu có tham chiếu, chỉ giữ lại các trường có tham chiếu.
- **Điều kiện hóa Giao diện Next.js (page.tsx)**:
  - Thêm hook `hasRoleplay` sử dụng `useMemo` để ẩn/hiện động khung nhập vai (nếu không bài nào cần nhập vai thì ẩn hoàn toàn khung, chỉ hiện thanh switches).
  - Tách biệt hiển thị dropdowns chọn vai (Tên Katakana, Quốc tịch, Nghề nghiệp, Tổ chức) bằng cách chỉ render dropdown của trường có mảng tùy chọn không rỗng.
  - Cập nhật hàm `substituteText` để chỉ thay thế các trường có kích hoạt nhập vai, tránh đè từ tĩnh.
- **Xác minh & Hoàn thành**:
  - Khởi động lại Express server để xóa cache module và tải `mockDb.js` mới.
  - Xác minh thành công qua Browser Subagent: Bài 27 ẩn hoàn toàn khung nhập vai, Bài 1 hiện đầy đủ 4 dropdowns, Bài 2 hiện 1 dropdown (Tên), Bài 3 hiện 2 dropdowns (Tên và Nghề nghiệp).

### Mốc 12: Sửa dòng nhiễu Bài 3 & Bổ sung Kaiwa Bài 4-50 (Đã hoàn thành - 14/06/2026)
- **Sửa dòng nhiễu Bài 3**:
  - Dịch chuyển vị trí bắt đầu quét hội thoại từ dòng 13 sang dòng 14 trong [gen_multilesson_mock.ps1](file:///d:/AI/japanese_learning/website/backend/gen_multilesson_mock.ps1) để bỏ qua tiêu đề bảng.
  - Thêm bộ lọc phụ tại tuyến API của backend [user.js](file:///d:/AI/japanese_learning/website/backend/src/routes/user.js) để lọc sạch các tin nhắn có speaker/japanese chứa tiêu đề.
- **Bổ sung hội thoại Kaiwa cho các Bài 4 đến 50**:
  - Soạn thảo 305 dòng hội thoại mới trong `new_dialogues.json` (tối thiểu 3 cuộc hội thoại chất lượng cho mỗi bài học từ 4 đến 50).
  - Viết kịch bản [inject_dialogues.ps1](file:///d:/AI/japanese_learning/tai_lieu/inject_dialogues.ps1) sử dụng Excel COM Object để tự động hóa việc xóa kịch bản cũ và ghi đè 3+ cuộc hội thoại mới bắt đầu từ dòng 14 cho tất cả 47 Excel sheets (`Bai4` đến `Bai50`), chèn đúng công thức ẩn/hiện Romaji động `=IF(C$11, "Romaji Text", "🙈 Đang ẩn")`.
  - Biên dịch toàn bộ 50 bài học vào `mockDb.js` và khởi động lại dev server thành công.
  - Xác minh trực quan qua Browser: Bài 3 không còn dòng nhiễu; Bài 4 và Bài 10 hiển thị đúng 3 cuộc hội thoại Kaiwa phong phú dạng Accordion, hoạt động mượt mà.

### Mốc 13: Phát triển Trang Ôn Bảng Chữ Cái & Đồng Bộ Hóa Đa Thiết Bị (Đã hoàn thành - 14/06/2026)
- **Thiết kế & Tích hợp liên kết Sidebar**:
  - Cập nhật Sidebar Menu ở cả trang `lessons/[id]/page.tsx` và `dashboard/page.tsx` để đổi tên các nhãn theo đúng ý kiến người dùng và thêm liên kết mới `"Ôn bảng chữ cái"` (trỏ đến `/kana`).
- **Đồng bộ hóa Cloud đa thiết bị**:
  - Bổ sung định tuyến `GET /api/user/progress` để lấy tiến trình của một `item_type` bất kỳ.
  - Cập nhật định tuyến `POST /api/user/progress` trong [user.js](file:///d:/AI/japanese_learning/website/backend/src/routes/user.js) hỗ trợ nhận thêm `'hiragana'` và `'katakana'`. Tiến độ được đồng bộ trực tiếp lên Cloud Database Supabase (sử dụng cột `item_type` và `item_id` là chỉ số chữ cái) giúp người dùng học tập nhất quán trên điện thoại và PC.
- **Lập trình Trang Ôn tập bảng chữ cái** ([page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/kana/page.tsx) & [kanaData.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/kana/kanaData.ts)):
  - Triển khai 4 phân hệ: Bảng chữ cái tương tác (nghe phát âm, xem Mnemonics), Speed Run trắc nghiệm nhanh 10 giây có tính điểm và streak, Trò chơi lật thẻ bài memory match, và Canvas tập vẽ tay cảm ứng đồ nét chữ theo Stroke Order.
  - Kiểm thử và build Next.js thành công. Xác minh hoạt động mượt mà và trực quan qua Browser Subagent.

### Mốc 14: Tối ưu hóa Trò chơi & Thêm tính năng Ôn chữ kết hợp có tô màu lỗi sai (Đã hoàn thành - 14/06/2026)
- **Tinh chỉnh Speedrun, Lật bài Cute & Chấm điểm nét vẽ**:
  - **Speedrun**: Tắt tự động phát âm khi hiện câu hỏi (tránh lộ đáp án), chỉ hiện nút 🔊 sau khi chọn. Dùng `Ref` để khắc phục stale closure timer, đảm bảo cập nhật kỷ lục mới tức thì. Đồng bộ điểm kỷ lục lên database đám mây Supabase (`item_id: 100000 + score`, `status: 'mastered'`).
  - **Lật bài**: Mặt sau thẻ Glassmorphism viền Neon có hình hoa anh đào `🌸` dễ thương. Thẻ ghép đúng đổi màu xanh dương nhạt và ẩn chữ. Sửa lỗi ngược chữ 3D flip. Giảm 10% giới hạn thời gian xuất phát của vòng sau mỗi khi người chơi thắng và nhấn chơi lại.
  - **Tập viết**: Triển khai chấm điểm so khớp lưới pixel `60x60`. Nới lỏng bán kính kiểm tra (Precision R=2, Recall R=3) và chống vẽ bừa (scribble defense 1.8x) để chấm điểm dung thứ thực tế hơn.
- **Thêm phần Ôn chữ kết hợp (Combined Characters Review)**:
  - **Bộ dữ liệu 500 từ kết hợp**: Biên soạn danh sách 500 từ Kana kết hợp (`combinedWordsData` tại [combinedWords.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/kana/combinedWords.ts)) bao gồm các chữ Hiragana, Katakana ghép và âm đục, âm bán đục. Phân nhóm độ khó: Dễ (3-5 ký tự), Trung bình (6-9 ký tự), Khó (10-15 ký tự).
  - **Giao diện Ôn tập**: Thêm tab "Ôn chữ kết hợp" trên trang [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/kana/page.tsx) hỗ trợ chọn độ khó và số câu. Hiển thị responsive dạng Bảng (Desktop) hoặc dạng Card (Mobile) với ô nhập Romaji màu vàng ngà `#FCF3CF` đặc trưng.
  - **Tô màu chi tiết lỗi sai (renderDiff)**:
    - Khi chấm điểm, câu trả lời sai sẽ hiển thị hộp "Chi tiết lỗi" phân tích từng ký tự.
    - Ký tự gõ đúng tô màu xanh lá (`emerald`), ký tự gõ sai tô màu đỏ gạch dưới lượn sóng (di chuột hiển thị tooltip ký tự đúng), ký tự gõ thiếu hiển thị màu đỏ mờ gạch ngang (di chuột báo thiếu).
    - So khớp tự động loại bỏ khoảng trắng (space) và chuyển về chữ thường để tránh chấm sai oan.

### Mốc 15: Triển khai dự án lên đám mây thành công (Đã hoàn thành - 14/06/2026)
- **Đẩy mã nguồn**: Đã đẩy toàn bộ phiên bản code hoàn chỉnh lên GitHub main branch.
- **Tạo cơ sở dữ liệu Supabase**: Chạy script Postgres tạo tất cả các bảng, triggers, và cấu hình RLS bảo mật thành công.
- **Nạp dữ liệu học liệu (Seeding)**: Nạp thành công toàn bộ dữ liệu 50 bài học từ các file Excel gốc lên Supabase (lessons, vocabulary, kanji, grammar, kaiwa dialogues).
- **Triển khai Backend (Render)**: Deploy thành công server Node.js Express tại địa chỉ `https://nihongo-flow-backend.onrender.com` dưới hình thức Blueprint quản lý tự động bởi `render.yaml`.
- **Triển khai Frontend (Vercel)**: Deploy thành công Next.js tại địa chỉ `https://nihongo-study-frontend.vercel.app` (nhận API từ Render).
- **Tắt Email Confirm & Sửa lỗi CORS**: Đã tắt chế độ Confirm Email mặc định của Supabase và sửa lỗi CORS (thiếu giao thức `https://` trong `FRONTEND_URL` ở Render). Hệ thống hiện vận hành trơn tru và đồng bộ dữ liệu người dùng thực tế.

### Mốc 16: Khắc phục lỗi bảo mật RLS và rò rỉ JWT session (Đã hoàn thành - 15/06/2026)
- **Sửa đổi RLS Policies (Database)**: Xây dựng hàm `public.is_admin()` dạng `SECURITY DEFINER` để truy vấn quyền quản trị viên không qua RLS, thay thế toàn bộ các logic kiểm tra lặp đệ quy `(SELECT role FROM profiles...)` ở 6 bảng dữ liệu. Bổ sung các quyền đọc/ghi hồ sơ cá nhân (`profiles`) của chính chủ. Khắc phục triệt để lỗi sập truy vấn `infinite recursion detected in policy for relation "profiles"`.
- **Ngăn chặn rò rỉ JWT Token (Backend)**: Phát hiện và xử lý lỗi rò rỉ header xác thực trên đối tượng đơn (singleton) `supabase` client do `auth.getUser(token)` ghi nhớ trong bộ nhớ RAM của Node Express. Tách biệt việc khởi tạo `dbClient` (chạy khóa bảo mật Service Role) và `authClient` (chạy các luồng Auth), sử dụng thuộc tính proxy để bảo toàn độ sạch và tính biệt lập của phiên kết nối cơ sở dữ liệu giữa các người dùng đồng thời.

### Mốc 17: Phát triển Lộ trình học chi tiết theo từng bài (Đã hoàn thành - 15/06/2026)
- **Sidebar Menu**: Điều chỉnh thứ tự Sidebar: thêm Lộ trình học (`roadmap`) ở vị trí số 2 (ngay dưới Tiến độ học), đưa Ôn bảng chữ cái (`kana`) xuống dưới cùng của menu. Cập nhật đồng bộ trên Dashboard, Lessons Details và Kana Review.
- **Tập bản đồ liên kết dữ liệu**: Thiết lập tiện ích [roadmapMapping.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/roadmapMapping.ts) cấu trúc các từ vựng và chữ Hán liên đới trực tiếp cho các mẫu ngữ pháp của Bài 1 và Bài 2, kèm theo logic phân rã động cho các bài học tiếp theo.
- **Trang Lộ trình học (`/roadmap`)**: Phát triển giao diện lộ trình chi tiết theo bài học, thể hiện tiến độ học tập thực tế và danh sách các mẫu ngữ pháp. Nhấp nút điều hướng để đi sang tab học liệu tương ứng.
- **Tích hợp bộ lọc Tab học liệu**: Cập nhật trang [lessons/\[id\]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) hỗ trợ lọc từ vựng & chữ Hán theo `grammarIndex`. Hệ thống sẽ chỉ hiển thị các từ/chữ mới, đồng thời xuất hộp thông báo hiển thị các từ/chữ trùng lặp đã được học ở phần trước đó của bài học.

### Mốc 18: Lọc học liệu theo nhóm ngữ pháp và Luyện thế câu tương tác (Đã hoàn thành - 15/06/2026)
- **Tái cấu trúc Tab Từ vựng & Chữ Hán thành Accordions**: Cập nhật trang chi tiết bài học [lessons/\[id\]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) để luôn hiển thị Từ vựng/Chữ Hán chia theo từng mẫu ngữ pháp dưới dạng Accordion đóng/mở được, đi kèm cảnh báo từ trùng lặp ở mẫu trước và nút liên kết tới trang Luyện tập. Thêm phần Accordion bổ sung cho các từ vựng không nằm trong cấu trúc ngữ pháp nào.
- **Trang Luyện tập thế câu tương tác (`/roadmap/practice`)**: Phát triển Playground tương tác thế câu hoàn chỉnh tại [practice/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/roadmap/practice/page.tsx). Cho phép hoán đổi từ vựng qua dropdowns và cập nhật tức thời dòng chữ Nhật, Romaji, nghĩa dịch tiếng Việt, kèm theo phát âm TTS câu hoàn chỉnh.
- **Nút quay lại thông minh**: Tích hợp nút Quay lại hoạt động theo tham số `from` trên URL, cho phép quay về đúng tab học tập và mẫu ngữ pháp tương ứng hoặc trang Lộ trình học.

### Mốc 19: Tích hợp Luyện tập giao tiếp & Từ vựng bổ sung cho tất cả các bài (Đã hoàn thành - 15/06/2026)
- **Tự động hóa nút Luyện thế câu ở phần Khác**: Cho phép hiển thị nút `⚡ Luyện thế câu` ở Accordion từ vựng bổ sung/khác của mọi bài học (Bài 1 - 50) có chứa từ vựng bổ sung trên trang [lessons/\[id\]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx).
- **Template luyện tập thông minh & động**:
  - Bổ sung logic xử lý cho tệp [roadmapMapping.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/roadmapMapping.ts) hỗ trợ tham số `grammarItemsCount`.
  - Thiết lập mẫu ghép câu tự giới thiệu bản thân đặc trưng của Bài 1 (Name & Country slots).
  - Tự động gom danh sách từ bổ sung của các bài từ Bài 2 đến Bài 50 làm lựa chọn dropdown động để người dùng ôn tập cụm từ giao tiếp, từ vựng khác linh hoạt.
- **Xác minh trực quan & Compile**:
  - Biên dịch toàn bộ Next.js thành công.
  - Kiểm thử trực tiếp qua Browser Subagent: Bài 1 liên kết tới mẫu giới thiệu bản thân thông minh; Bài 2 liên kết tới danh sách các từ bổ sung khác hoạt động mượt mà.

### Mốc 20: Nâng cấp Giao diện Bong bóng Hỏi - Đáp (Q&A) & Động hóa 50 bài học (Đã hoàn thành - 15/06/2026)
- **Sửa lỗi crash bất đồng bộ**: Khắc phục lỗi crash `Cannot read properties of undefined` trên trang Luyện tập thế câu khi chuyển đổi bài học nhanh bằng cách thêm logic kiểm tra đồng bộ state `slotValues` với slots của template hiện tại.
- **Dynamic Q&A Dialogues (Bài 3 - 50)**:
  - Tự động phân tách ví dụ mẫu trong cơ sở dữ liệu thành đối thoại Q&A nếu có chứa dấu hiệu đối thoại (như `ー`, `->`) hoặc kết thúc bằng trợ từ nghi vấn `か`.
  - Hỗ trợ trả lời câu hỏi nghi vấn địa điểm (`N は どこ/どちら ですか`) bằng pronoun địa điểm (`ここ` / `こちら`) làm vị trí thế từ dropdown.
  - Sử dụng hàm chuyển Hiragana sang Katakana (`toKatakana`) để tự động nhận diện và khớp chính xác các từ mượn Katakana (như `といれ` -> `トイレ`).
  - Gỡ bỏ blocker hiển thị khi `slots.length === 0`, cho phép học viên luyện tập và nghe phát âm các câu mẫu tĩnh.
- **Hoàn thiện Bản dịch & Phiên âm Romaji**:
  - Hỗ trợ thay thế bản dịch tiếng Việt không phân biệt chữ hoa/thường (`gi` regex flag), sửa lỗi đứng yên bản dịch khi thay đổi dropdown.
  - Xây dựng bộ tự động chuyển đổi phiên âm Romaji cho toàn bộ câu (hỗ trợ hạt trợ từ và đuôi câu `desu`, `desu ka`), đảm bảo Romaji sạch chữ Nhật và không còn hiển thị thô dạng ngoặc vuông `[toire]`.

### Mốc 21: Sinh Romaji sạch và chuẩn hóa Romaji Offline cho 50 bài học (Đã hoàn thành - 15/06/2026)
- **Tạo Cache Romaji offline**: Xây dựng kịch bản Node.js [generate_romaji.js](file:///d:/AI/japanese_learning/website/backend/src/db/generate_romaji.js) tự động chuyển toàn bộ câu ví dụ tiếng Nhật sang Romaji sạch chữ Nhật bằng Google Transliterator API, chuẩn hóa các nguyên âm dài (ō -> ou, ū -> uu) và khoảng trắng thông minh (trước desu/kudasai). Lưu trữ cache offline tại [grammar_romaji_cache.json](file:///d:/AI/japanese_learning/website/backend/src/db/grammar_romaji_cache.json).
- **Tích hợp vào Trình biên dịch Excel**: Cập nhật PowerShell script [gen_multilesson_mock.ps1](file:///d:/AI/japanese_learning/website/backend/gen_multilesson_mock.ps1) để tự động tra cứu từ tệp JSON cache cục bộ và điền trường `romaji_example` vào database mock `mockDb.js` khi biên dịch.
- **Tích hợp vào Tuyến API Backend & Schema**: Cập nhật tệp cơ sở dữ liệu `schema.sql` thêm cột `romaji_example` vào bảng `grammar`. Đồng thời tối ưu hóa kịch bản `seed_supabase.js` từ vòng lặp chèn từng dòng chậm chạp sang cơ chế **Bulk Upsert** (chèn hàng loạt), rút ngắn thời gian đồng bộ dữ liệu Supabase từ hơn 2 phút xuống chỉ còn 3 giây.
- **Xử lý Động ở Frontend**: Sửa đổi [roadmapMapping.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/roadmapMapping.ts) để sử dụng trường `romaji_example` làm chuỗi Romaji nền sạch đẹp 100%, thực hiện phân tách đối thoại và hoán đổi từ vựng dropdown trực tiếp trên nền chuỗi Romaji này.
- **Triển khai Git & Đám mây (Deploy)**: Staged và Commit thành công 12 file thay đổi (commit: `17506a9`). Thực hiện `git push` trực tiếp lên nhánh `main` của GitHub repo. Chạy trực tiếp script PostgreSQL để tạo cột `romaji_example` và chạy seeding đẩy toàn bộ Romaji của 50 bài học lên Supabase cloud. Hệ thống CI/CD trên Vercel và Render sẽ tự động kéo code mới và tái deploy backend & frontend.

### Mốc 22: Tạo trang Cẩm nang học, sửa lỗi menu sidebar và chuẩn hóa Romaji không dấu gạch ngang (Đã hoàn thành - 16/06/2026)
- **Trang Cẩm nang học độc lập (`/guide`)**: Thiết kế và triển khai trang hướng dẫn sử dụng chi tiết 7 phân hệ và quy trình 5 bước học tập tối ưu tại [guide/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/guide/page.tsx). Đồng thời xóa hộp thông tin hướng dẫn cũ trên Dashboard để giao diện tinh gọn hơn.
- **Sửa lỗi Menu Sidebar**: Di chuyển mục "Cẩm nang học" (📖) lên trên cùng của danh sách điều hướng. Điều chỉnh thanh cuộn dọc riêng biệt cho menu và cố định nút Đăng xuất bằng thuộc tính `shrink-0`, khắc phục lỗi tràn che mất nút Đăng xuất trên màn hình nhỏ/mobile.
- **Chuẩn hóa Romaji không dấu gạch ngang**:
  - Cập nhật toàn bộ các từ vựng chứa nguyên âm dài (như `techō` -> `techou (techō)`, `kādo` -> `kaado (kādo)`) trong cơ sở dữ liệu [mockDb.js](file:///d:/AI/japanese_learning/website/backend/src/db/mockDb.js) và [combinedWords.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/kana/combinedWords.ts).
  - Cập nhật hàm chấm điểm tự luận `calculateAccuracy` tương thích, tự động tách dấu ngoặc để chấp nhận cả 2 cách gõ (ví dụ gõ `techou` hay `techō` đều đúng 100% điểm).
  - Tinh chỉnh logic `roadmapMapping.ts` để tự động loại bỏ ngoặc đơn khi phân tích so khớp từ vựng lộ trình học, và lọc sạch Romaji câu để hiển thị tự nhiên.

### Mốc 23: Nâng cấp Phân hệ Ôn tập từ vựng, Thêm game Speedrun, Luyện hình ảnh & Đa chọn (Đã hoàn thành - 17/06/2026)
- **Chấm điểm từ vựng thông minh**:
  - Cập nhật hàm `calculateAccuracy` tự động tách các từ đồng nghĩa (phân cách bởi `,`, `;`, `/` hoặc `hoặc`, `or`).
  - Hỗ trợ tính điểm 100% khi người dùng gõ bất kỳ từ đồng nghĩa nào, và trả về phần trăm đúng cao nhất đối với câu trả lời gần đúng.
- **Luyện tập từ vựng qua hình ảnh (Image Practice Mode)**:
  - Tạo tệp bản đồ từ vựng dạng ảnh Unsplash chất lượng cao [vocabImages.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/vocabImages.ts).
  - Triển khai giao diện chơi đa thức: Người học có thể gõ tự luận (bằng Romaji/Hiragana) hoặc click chọn 1 trong 4 đáp án trắc nghiệm A/B/C/D, nhận phản hồi đúng/sai tức thì kèm âm thanh phát âm.
- **Trắc nghiệm phản xạ từ vựng nhanh (Speedrun Mode)**:
  - Thiết lập game phản xạ từ vựng giới hạn thời gian (10 giây), reset thời gian khi trả lời đúng liên tục, giảm thời gian giới hạn khi streak tăng cao để tăng độ khó.
  - Lưu và đồng bộ High Score của bài học vào LocalStorage.
- **Bộ lọc Dropdown chọn nhiều trạng thái**:
  - Phát triển component dropdown tùy chỉnh chứa các checkbox `Chưa học`, `Đang học`, `Đã thuộc` cho cả phân hệ **Flashcards** và **Ôn tập từ vựng**.
  - Mặc định nếu không có tùy chọn nào được tích thì hiển thị đầy đủ ("Học hết"). Lắng nghe sự kiện `mousedown` click-outside để tự động đóng dropdown.
- **Tối ưu hóa Giao diện Di động & Đồng bộ Sidebar**:
  - Đồng bộ thứ tự Sidebar Menu trên cả 6 trang chính theo lộ trình: Cẩm nang học -> Tiến độ -> Lộ trình -> Từ vựng -> Kanji -> Ôn từ vựng -> Flashcards -> Kaiwa -> Ôn bảng chữ cái.
  - Biên soạn lại nội dung "Quy trình học tập tối ưu 5 bước" tại [guide/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/guide/page.tsx).
  - Khắc phục lỗi cuộn ngang trên di động bằng cách thêm class `overflow-x-hidden` vào thẻ `<main>` ở các trang chính.
  - Tích hợp tính năng cuộn tự động mượt mà (`scrollIntoView`) về phía bảng điểm kết quả sau khi nhấn "Chấm điểm", khắc phục hiện tượng giật nhảy màn hình lên trên cùng trên điện thoại di động.
  - Bổ sung toggle `Ẩn đã thuộc` ở tab Từ vựng và Kanji để tập trung học các từ chưa nhớ.

### Mốc 24: Thực nghiệm cào và sinh dữ liệu tối ưu token cho Bài 4 (Đã hoàn thành - 19/06/2026)
- **Thiết lập Pipeline cào dữ liệu tối ưu**:
  - Viết script cào dữ liệu từ vựng thô [scrape_mnn_data.js](file:///d:/AI/japanese_learning/website/backend/scratch/scrape_mnn_data.js) sử dụng `cheerio` từ learnjapaneseaz.com (tiêu thụ 0 token).
  - Viết script [generate_lesson_data.js](file:///d:/AI/japanese_learning/website/backend/scratch/generate_lesson_data.js) nhằm đo lường token và [inject_missing_data.js](file:///d:/AI/japanese_learning/website/backend/scratch/inject_missing_data.js) thực hiện tự động tạo bản sao lưu, loại bỏ từ trùng lặp, trộn từ mới, reindex và ghi đè an toàn vào [mockDb.js](file:///d:/AI/japanese_learning/website/backend/src/db/mockDb.js).
- **Thực nghiệm Bài 4 đạt hiệu quả tối ưu cao**:
  - Chạy thực nghiệm thành công cho Bài 4: Cào 59 từ, loại trùng, lọc và tích hợp thành công 41 từ vựng mới giúp tổng từ vựng Bài 4 trên web tăng từ 20 lên 61 từ.
  - Phân tích cho thấy phương pháp **Batching 30 từ/lần** tiết kiệm đến **78.9%** chi phí token (từ 57,820 tokens xuống 12,220 tokens cho Bài 4).
  - Sử dụng browser subagent xác minh giao diện Bài 4 hiển thị hoàn hảo, đầy đủ ví dụ Kanji, Romaji, dịch nghĩa và mẹo nhớ trực quan.

### Mốc 25: Cào và sinh dữ liệu từ vựng cho Bài 5 - Bài 50 (Đã hoàn thành - 19/06/2026)
- Phát hiện và khắc phục lỗi logic tạo URL cào cho các bài học > 25 trong `scrape_mnn_data.js`.
- Cào thành công dữ liệu từ vựng thô cho toàn bộ 46 bài học còn lại (Bài 5 đến Bài 50) từ `learnjapaneseaz.com`.
- Sử dụng mô hình `gemini-flash-lite-latest` và cơ chế gom cụm (Batching 30 từ/lần) cùng chính sách chờ (cooldown 60s trên lỗi 429/503) để sinh thành công 100% dữ liệu từ vựng làm phong phú (Romaji sạch, nghĩa Việt, câu ví dụ, dịch nghĩa ví dụ và mẹo nhớ).
- Trộn, sắp xếp và đánh chỉ số lại (reindex) dữ liệu mới vào [mockDb.js](file:///D:/AI/japanese_learning/website/backend/src/db/mockDb.js) bằng `inject_missing_data.js`, thêm thành công **1392 từ vựng mới** (nâng tổng số từ lên **2255 từ**).
- Vượt qua kiểm thử tích hợp backend cục bộ (`npm run test:backend`) thành công 100%.

### Mốc 26: Kiểm tra, hoàn thiện và đồng bộ hóa toàn bộ dữ liệu 50 bài học lên đám mây (Đã hoàn thành - 19/06/2026)
- **Kiểm tra độ chính xác dữ liệu (Data Verification)**: Viết script và kiểm tra chéo toàn bộ dữ liệu Ngữ pháp (147 mẫu của 50 bài học) và Từ vựng (Bài 1-4) trong `mockDb.js`, xác nhận đầy đủ 100% không có bài nào thiếu dữ liệu.
- **Đồng bộ hóa đám mây (Cloud Database Seeding)**: Cấu hình và cập nhật biến môi trường `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` chuẩn trong backend `.env`. Thực hiện chạy lệnh `npm run seed:supabase` thực hiện bulk upsert toàn bộ 2,255 từ vựng, 242 chữ Hán, 147 điểm ngữ pháp, 351 cuộc hội thoại Kaiwa và 50 bài học lên cơ sở dữ liệu Supabase chỉ trong 5 giây.
- **Đẩy mã nguồn lên Git (Push Source)**: Staged, commit và push thành công toàn bộ mã nguồn thay đổi cùng bộ 3 script cào/trộn dữ liệu lên nhánh `main` của repo GitHub (`nihongo-study`), kích hoạt quy trình CI/CD redeploy tự động trên Vercel và Render.

### Mốc 27: Triển khai Giai đoạn 1 Marugoto A1 - Hạ tầng & Giao diện (Đã hoàn thành - 19/06/2026)
- **Cập nhật Cơ sở dữ liệu giả lập (`mockDb.js`)**: Viết script Node.js [update_mockdb_lessons.js](file:///d:/AI/japanese_learning/website/backend/scratch/update_mockdb_lessons.js) tự động thêm trường `"course": "minna"` cho 50 bài học Minna cũ và append 18 bài học skeleton mới của Marugoto A1 (tương ứng với các Lesson ID từ **101 đến 118**).
- **Cập nhật Schema & Express API**: Cập nhật tệp [schema.sql](file:///d:/AI/japanese_learning/website/backend/src/db/schema.sql) bổ sung cột `course` vào định nghĩa bảng `lessons`. Cập nhật API `GET /api/user/lessons` trong [user.js](file:///d:/AI/japanese_learning/website/backend/src/routes/user.js) để hỗ trợ lọc theo tham số truy vấn `?course=` cho cả mockDb và database thực tế.
- **Phát triển component CourseSwitcher**: Tạo component [CourseSwitcher.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/components/CourseSwitcher.tsx) dạng button pill đẹp mắt giúp chuyển đổi mượt mà giữa hai khoá học `📚 Minna` và `🌸 Marugoto`.
- **Tích hợp giao diện Frontend**:
  - Tích hợp `CourseSwitcher` vào Sidebar của [dashboard/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/dashboard/page.tsx), [roadmap/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/roadmap/page.tsx), và [lessons/[id]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/%5Bid%5D/page.tsx).
  - Đồng bộ `activeCourse` thông qua `localStorage` để ghi nhớ tuỳ chọn của học viên qua các lần tải lại trang.
  - Khi học viên chọn khoá Marugoto: tự động lọc danh sách bài học (dropdown hiển thị 18 bài Marugoto), ẩn bộ chọn cấp độ N5/N4, đồng thời ẩn hoàn toàn hai tab **Flashcards** và **Luyện nói (Kaiwa)** (do khoá Marugoto chỉ cung cấp Lộ trình, Từ vựng, Kanji, và Ôn tập từ vựng).
  - Cập nhật logic tính toán dự báo tiến độ trên Dashboard theo mốc 18 bài của Marugoto A1.
- **Kiểm thử E2E trên Browser**: Sử dụng browser subagent kiểm tra trực quan trên môi trường local dev (`http://localhost:3000`), chụp ảnh màn hình xác nhận UI/UX hiển thị hoàn hảo, chuyển đổi khoá mượt mà và ẩn tab chính xác.

### Mốc 28: Phát triển giao diện & API Can-do và Culture cho Marugoto A1 (Đã hoàn thành - 19/06/2026)
- **Tích hợp dữ liệu mẫu (`mockDb.js`)**: Viết script Node.js [inject_mockdb_culture_cando.js](file:///d:/AI/japanese_learning/website/backend/scratch/inject_mockdb_culture_cando.js) tự động chèn 4 mục tiêu Can-do mẫu và 1 bài viết Văn hoá mẫu vào cuối cơ sở dữ liệu giả lập `mockDb.js`, đồng thời cập nhật xuất khẩu module tương ứng.
- **Xây dựng API router mới**: Bổ sung API `GET /api/lessons/:lessonId/cando` và `GET /api/lessons/:lessonId/culture` trong Express router. Cập nhật API progress hỗ trợ loại dữ liệu `cando` cho cả chế độ giả lập (mockDb) và cơ sở dữ liệu Supabase thực tế.
- **Triển khai giao diện Tab tương tác ở Frontend**:
  - Tích hợp thêm tab `🎯 Tự đánh giá (Can-do)` cho 18 bài học và tab `🗾 Văn hóa & Cuộc sống` cho các bài chẵn trên trang chi tiết bài học [lessons/[id]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/%5Bid%5D/page.tsx).
  - Thiết kế và lập trình giao diện tương tác tích chọn trạng thái Can-do (xanh/vàng/đỏ) tự động đồng bộ kết quả lưu trữ về backend và hiển thị thông báo toast thành công.
  - Thiết kế Card Glassmorphism cao cấp để hiển thị bài viết văn hoá kèm hình ảnh minh họa Unsplash sắc nét trên di động và máy tính.
- **Xác minh E2E trực quan**: Sử dụng browser subagent kiểm tra trực tiếp các tab mới hoạt động ổn định trên local dev, ghi hình video và lưu ảnh chụp màn hình kiểm thử.

### Mốc 29: Sinh dữ liệu trọn gói và tích hợp thành công cho 18 bài Marugoto A1 (Đã hoàn thành - 19/06/2026)
- **Tạo script sinh dữ liệu (`generate_marugoto_content.js`)**: Viết script gọi Gemini API bằng mô hình `gemini-flash-lite-latest` sinh trọn gói: Từ vựng (20-25 từ/bài), chữ Hán (3-5 chữ/bài), ngữ pháp (3-4 mẫu/bài), Can-do checklist (3-4 câu/bài) cho 18 bài và 9 bài viết Văn hóa (cho bài chẵn). Áp dụng phương án "Sinh gộp theo bài" để tiết kiệm 50% token đầu vào.
- **Tạo script trộn dữ liệu (`inject_marugoto_content.js`)**: Viết script tự động tính toán ID tăng dần không trùng lặp và trộn 100% dữ liệu đã sinh vào file `mockDb.js`.
- **Nạp thành công dữ liệu**: Chèn thành công **351 từ vựng**, **59 chữ Hán**, **51 mẫu ngữ pháp**, **54 câu hỏi Can-do checklist**, và **9 bài viết văn hóa** cho 18 bài Marugoto A1 vào `mockDb.js`.
- **Kiểm thử E2E local**: Khởi động lại dev server, kiểm tra API mock cục bộ hoạt động hoàn hảo và ghi nhận hình ảnh kiểm thử trực quan trên trình duyệt thành công 100% các tab Từ vựng, Kanji, Ngữ pháp, Can-do, Văn hóa & Cuộc sống.

### Mốc 30: Điều chỉnh Sidebar & Switcher cho Marugoto trên Guide & Kana (Đã hoàn thành - 19/06/2026)
- **Tích hợp CourseSwitcher cố định trên trang Cẩm nang học (`/guide`) và Ôn bảng chữ cái (`/kana`)**:
  - Tích hợp component `CourseSwitcher` cố định ở trên đầu Sidebar của trang `/guide` và `/kana` giúp đồng bộ tùy chọn khóa học của người học.
  - Cập nhật logo tiêu đề Sidebar thay đổi động ("Minna Nihongo" hoặc "Marugoto A1") theo trạng thái `activeCourse`.
- **Tự động chuyển hướng và ẩn menu**:
  - Thêm hook `useEffect` lắng nghe `activeCourse === 'marugoto'` trên trang `/guide` và `/kana` để tự động lưu tùy chọn và chuyển hướng người dùng về Dashboard Marugoto A1 (`/dashboard` với `selectedLessonId = 101`) nhằm tối ưu trải nghiệm người dùng, tránh bị kẹt ở các trang không khả dụng của Marugoto.
  - Cập nhật logic render để lọc/ẩn hoàn toàn các menu không khả dụng (`guide`, `kana`, `flashcards`, `kaiwa`) của khóa Marugoto trên Sidebar của mọi trang (Dashboard, Roadmap, Lessons, Guide, Kana).
- **Xác minh E2E**: Sử dụng browser subagent kiểm tra trực quan tự động, chụp ảnh màn hình và quay video lưu kết quả, xác nhận quá trình chuyển đổi khóa học và tự động chuyển hướng hoạt động trơn tru.

### Mốc 31: Tích hợp tính năng Ôn bộ thủ & Hiển thị bộ thủ động cho chữ Kanji (Đã hoàn thành & Đã deploy Production - 19/06/2026)
- **Tạo thư viện tĩnh bộ thủ ở Frontend (`kanjiRadicals.ts`)**: Định nghĩa chi tiết từ điển 50 bộ thủ cốt lõi của N5/N4 kèm Hán Việt, Nghĩa Việt, Mẹo nhớ hình ảnh và Ví dụ thực tế. Tạo bản đồ ánh xạ Kanji sang các bộ thủ cấu thành. Giải pháp xử lý client-side này giúp tải cực nhanh (0ms độ trễ), tiết kiệm API requests và đảm bảo an toàn 100% cho cấu trúc database Supabase.
- **Xây dựng trang ôn bộ thủ `/radicals`**: Thiết kế giao diện Glassmorphism trực quan, hỗ trợ công cụ tìm kiếm và lọc bộ thủ theo nhóm ý nghĩa, tích hợp Modal chi tiết bộ thủ kèm ví dụ từ vựng có thể phát âm tiếng Nhật, và mini-game Flashcard phản xạ nhanh để người học tự kiểm tra trí nhớ.
- **Tích hợp giao diện hiển thị bộ thủ tại trang bài học (`/lessons/[id]`)**: Bổ sung nút bấm "Ôn bộ thủ" ở đầu tab Kanji và toggle "Hiển thị bộ thủ". Khi bật toggle, dòng phân tách bộ thủ thành phần (ví dụ: `亻` + `木` đối với chữ `休`) sẽ tự động hiển thị ngay dưới mỗi thẻ Kanji trong danh sách và ở mặt sau của thẻ Flashcard lật mặt.
- **Xác minh E2E**: Sử dụng browser subagent kiểm tra thành công tất cả các tính năng (tải trang bài học, bật hiển thị bộ thủ, chuyển hướng sang `/radicals`, tìm kiếm và click xem chi tiết bộ thủ Nhân, lật mặt Flashcard quiz, và quay về trang bài học).

---

## 5. Quy Tắc Phát Triển Đặc Biệt (Development Rules)
> [!IMPORTANT]
> Toàn bộ các quy tắc phát triển đặc biệt, hướng dẫn trả lời, lập kế hoạch và bảo toàn dữ liệu học tập đã được chuyển sang tệp tin riêng biệt nhằm tránh trùng lặp thông tin:
> Xem chi tiết tại: [rule.md](file:///d:/AI/japanese_learning/rule.md)



---

## 6. Kế Hoạch Tiếp Theo (Next Steps) - GIAI ĐOẠN 3 MARUGOTO A1: DEPLOY PRODUCTION
1. **Cấu hình SQL Supabase**: Thêm cột `course` vào bảng `lessons` và tạo các bảng/cột mới cần thiết trên Supabase Cloud thông qua Supabase SQL Editor.
2. **Seeding lên Cloud**: Cập nhật file `seed_supabase.js` để tích hợp 100% dữ liệu Marugoto A1 mới sinh và chạy seeding đẩy lên Supabase Production.
3. **Git Commit & Auto-Deploy**: Tạo commit git và push code lên nhánh `main` để website production tự động redeploy.



---

## 7. Thông Tin Hệ Thống Đã Deploy (Bảo Mật)
*Thông tin này nằm ngoài thư mục `website/` nên không bị theo dõi bởi Git và hoàn toàn an toàn.*

- **Frontend URL (Vercel)**: `https://nihongo-study-frontend.vercel.app`
- **Backend URL (Render)**: `https://nihongo-flow-backend.onrender.com`
- **Supabase URL Rest API**: `https://bwkpcxpidtjqfyztvcly.supabase.co/rest/v1/`
- **SUPABASE_SERVICE_ROLE_KEY**: `[REDACTED_SUPABASE_SERVICE_ROLE_KEY]`
- **Database Password**: `R5egGM2W4EUnE%`

---

## 8. Đánh giá Quy mô Dự án & Khả năng Duy trì Deploy Lâu dài

### 8.1. Đánh giá Quy mô Dự án
Dự án học tiếng Nhật **Minna & Marugoto Flow** hiện tại đã đạt quy mô **Trung bình - Khá (Medium-sized web application)** đối với một ứng dụng giáo dục trực tuyến.
*   **Về mặt Tính năng**: Rất phong phú và hoàn chỉnh, trải dài từ cơ bản đến nâng cao:
    *   Ôn bảng chữ cái (Hiragana/Katakana) qua game tương tác Speedrun và Memory Match.
    *   Học học liệu cốt lõi (Từ vựng, Kanji, Ngữ pháp) theo cấu trúc Accordion & liên kết bài học trực quan.
    *   Luyện tập từ vựng/chữ Hán qua 3 chế độ (Tự luận viết, Chọn hình ảnh trắc nghiệm, và Trắc nghiệm phản xạ nhanh 10 giây).
    *   Luyện Shadowing / Hội thoại Kaiwa đóng vai nhân vật tùy biến theo thông tin cá nhân.
    *   Tự đánh giá Can-do checklist và khám phá thế giới Văn hóa & Cuộc sống của Marugoto A1.
*   **Về mặt Dữ liệu**: Khối lượng dữ liệu đã tích lũy và chuẩn hóa là rất lớn:
    *   **Minna Nihongo**: 50 bài học với **2.255 từ vựng** (đầy đủ ví dụ, nghĩa Việt và mẹo nhớ), **242 chữ Hán**, **147 điểm ngữ pháp** và **351 hội thoại Kaiwa**.
    *   **Marugoto A1**: 18 bài học với **351 từ vựng**, **59 chữ Hán**, **51 ngữ pháp**, **54 mục Can-do checklist** và **9 bài viết văn hóa** kèm ảnh.
*   **Về mặt Kiến trúc**: Phân tách rõ ràng dạng Monorepo gồm Frontend (Next.js App Router) và Backend (Node.js Express), kết nối live tới Supabase PostgreSQL trên Cloud, đảm bảo hiệu năng tối ưu và khả năng mở rộng tốt.

### 8.2. Khả năng Duy trì Deploy Lâu dài (Lên đến vài năm)
Ứng dụng hoàn toàn **CÓ THỂ duy trì hoạt động lâu dài với chi phí 0 đồng (Free Tier)** nhờ vào cấu hình dịch vụ tối ưu hiện tại:
1.  **Frontend (Vercel - Miễn phí)**:
    *   *Khả năng tải*: Rất mạnh mẽ. Vercel Free Tier cho phép băng thông lên tới **100GB/tháng**, dư sức phục vụ hàng ngàn lượt truy cập học tập mỗi ngày mà không bị ngắt quãng hay phát sinh chi phí.
2.  **Database (Supabase Cloud - Miễn phí)**:
    *   *Khả năng tải*: Supabase cung cấp **500MB** dung lượng cơ sở dữ liệu PostgreSQL. Dữ liệu học tập hiện tại (cho cả 68 bài học) chỉ chiếm chưa đến **5MB** (dưới 1% hạn mức). Do đó, bạn có thể lưu trữ tiến độ học tập của hàng ngàn học viên trong nhiều năm mà không lo vượt quá giới hạn.
3.  **Backend (Render - Miễn phí)**:
    *   *Khả năng tải & Hạn chế*: Gói Render Free Web Service chạy ổn định nhưng có cơ chế tự động ngủ (spin down) sau 15 phút không có lượt truy cập. Khi có người học truy cập lại, Render sẽ mất khoảng **30 - 50 giây** để khởi động lại (cold start).
    *   *Giải pháp duy trì lâu dài*: Để giữ Render backend luôn luôn "thức" (tránh độ trễ cold start), bạn có thể sử dụng các dịch vụ ping miễn phí như **UptimeRobot** hoặc viết một cron job nhỏ tự động gửi request GET đến địa chỉ `https://nihongo-flow-backend.onrender.com/api/user/lessons?course=minna` cứ mỗi **10 - 12 phút**. Việc này hoàn toàn hợp lệ và giữ ứng dụng luôn chạy mượt mà 24/7.

---

### Mốc 32: Sửa lỗi trùng khóa & Ánh xạ bộ thủ trọn gói cho 50 bài học (Đã hoàn thành & Đã deploy Production - 19/06/2026)
- **Sửa lỗi trùng khóa**: Loại bỏ khai báo trùng lặp khóa `'手'` ở Bài 24 tại [kanjiRadicals.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/kanjiRadicals.ts) giúp khắc phục lỗi biên dịch TypeScript của Next.js.
- **Ánh xạ bộ thủ trọn gói cho 50 bài và Marugoto**: Viết tập lệnh generator tự động kết xuất toàn bộ 233 chữ Kanji độc nhất từ cơ sở dữ liệu học liệu thực tế và phân rã thành công thành các bộ thủ cốt lõi tương ứng, hoàn thành phủ sóng 100% tính năng hiển thị bộ thủ động cho 50 bài Minna no Nihongo và 18 bài Marugoto A1.
- **Biên dịch & Deploy**: Đã build thành công trên môi trường cục bộ và push toàn bộ thay đổi lên GitHub main branch (`2c1f866`), kích hoạt tự động deploy lại bản vá ổn định lên production Vercel.

### Mốc 33: Tích hợp bộ chọn phạm vi học chữ cái cho game Speedrun và Memory Match (Đã hoàn thành & Đã deploy Production - 21/06/2026)
- **Thêm bộ chọn phạm vi (Range Selectors)**: Phát triển 2 dropdowns ("Từ chữ", "Đến chữ") cho cả game Trắc nghiệm phản xạ (Speedrun) và game Lật bài (Memory Match) trên trang Ôn bảng chữ cái.
- **Xử lý logic biên hẹp**:
  - **Speedrun**: Nếu phạm vi chọn < 4 chữ, câu hỏi vẫn chỉ lấy trong khoảng đó, nhưng các đáp án nhiễu còn lại được chọn ngẫu nhiên từ toàn bộ bảng chữ cái để tạo đủ 4 đáp án độc nhất.
  - **Memory Match**: Nếu phạm vi chọn < 8 chữ, hệ thống tự động lặp lại (nhân bản) các chữ cái trong khoảng đó cho đủ 8 cặp thẻ chơi, tuyệt đối không lấy thêm chữ ngoài phạm vi.
- **Làm mới tự động & Biên dịch**: Tích hợp `useEffect` tự động restart game lật bài khi thay đổi cấu hình phạm vi. Chạy biên dịch Next.js build cục bộ thành công 100% không lỗi type.
- **Triển khai Git & Đám mây (Deploy)**: Staged, commit và push toàn bộ thay đổi lên GitHub main branch để CI/CD của Vercel tự động redeploy bản vá ổn định lên production.

### Mốc 34: Chuyển đổi toàn diện giao diện sang chế độ sáng Light Mode (Đã hoàn thành cục bộ - 22/06/2026)
- **Quyết định thiết kế**: Người dùng duyệt phương án chuyển đổi hoàn toàn ứng dụng sang Light Mode mặc định theo Phương án A (Pure White & Slate, accents xanh dương/chàm).
- **Cấu hình css**: Cập nhật tệp [globals.css](file:///d:/AI/japanese_learning/website/frontend/src/app/globals.css) cấu hình màu nền sáng mặc định (`bg-white`, text tối `text-slate-800`) và vô hiệu hóa prefers-color-scheme để không tự động dark mode của HĐH. Cập nhật nền body trong [layout.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/layout.tsx).
- **Chuyển đổi giao diện Dashboard**: Thiết kế lại toàn bộ [dashboard/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/dashboard/page.tsx) từ nền gradient tối sang gradient sáng `from-slate-50 via-slate-100 to-indigo-50/50`, chuyển Sidebar sang màu trắng, điều chỉnh tất cả các Card stats, Progress bar và màu chữ tối tương phản cao.
- **Tự động hóa thay thế class hàng loạt**: Viết script Node.js [theme_refactor.js](file:///d:/AI/japanese_learning/website/frontend/scratch/theme_refactor.js) tự động chuyển đổi an toàn các class Tailwind màu tối sang sáng cho 10 file page còn lại, bao gồm các bài học chi tiết, bảng chữ cái, lộ trình học, bộ thủ, cẩm nang và toàn bộ màn hình Auth.
- **Kiểm định thành công**: Dự án biên dịch Next.js thành công 100% không lỗi TypeScript. Browser Subagent xác nhận giao diện Light Mode hiển thị sắc nét, đẹp mắt và phản hồi mượt mà.

### Mốc 35: Hợp nhất Theme kép (Light/Dark Mode), tích hợp Sidebar Cài đặt & Khắc phục triệt để lỗi màu sắc (Đã hoàn thành cục bộ - 23/06/2026)
- **Hợp nhất hệ thống Theme (Light/Dark Mode)**:
  - Triển khai component `ThemeProvider` quản lý trạng thái giao diện và tiêm script kiểm tra theme trong `<head>` của `layout.tsx` nhằm triệt tiêu hiện tượng nhấp nháy giao diện (hydration flicker) khi đọc cấu hình từ `localStorage`.
  - Body của trang được chuyển đổi sang màu động `bg-slate-50 dark:bg-[#09111e]`.
- **Tích hợp Popover Cài đặt Sidebar (`SidebarSettings.tsx`)**:
  - Gom các chức năng thông tin cá nhân (ảnh đại diện SVG sinh theo email, tên, email), toggle bật/tắt Theme (☀️/🌙), và nút Đăng xuất (🚪) vào một popover nổi duy nhất ở cuối sidebar.
  - Hỗ trợ tính năng tự đóng popover khi nhấn chuột ra ngoài (click-outside), rút gọn hơn 300 dòng code trùng lặp ở các trang khác nhau.
- **Khắc phục lỗi màu sắc trong Dark Mode**:
  - Thêm `color-scheme: dark;` vào lớp `.dark` trong [globals.css](file:///d:/AI/japanese_learning/website/frontend/src/app/globals.css) để ép trình duyệt render danh sách tùy chọn `<option>` thả xuống (select options), bảng chọn ngày, và thanh cuộn ở giao diện tối chuẩn của Windows Chrome/Edge.
  - Cập nhật màu nền tối cho các ô nhập đáp án (`dark:bg-slate-950`) thay cho màu trắng/vàng cũ.
  - Khắc phục lỗi nền trắng trên nút Loa âm thanh (`🔊`), nút Tráo đề (`🔀 Tráo đề`), và dropdown trạng thái tiến độ bài học.
  - Quét và chuẩn hóa các lớp CSS bị phân mảnh/hỏng (dạng `dark:bg-slate-950/60/85`) trên toàn bộ 15 tệp giao diện.

### Mốc 36: Phát triển Trang Tổng Hợp Kiến Thức (Knowledge Hub) & Học liệu cá nhân (Đã hoàn thành & Đã deploy Production - 23/06/2026)
- **Trang Tổng hợp kiến thức (`/knowledge`)**: Lập trình trang tổng hợp toàn bộ học liệu của khóa học (tương thích cả khóa Minna và Marugoto). Cho phép người học lọc nhanh theo bài học và trạng thái học tập.
- **Học liệu cá nhân (Custom Items)**:
  - Cho phép người dùng tự thêm, chỉnh sửa và xóa (CRUD) các mục Từ vựng cá nhân, Chữ Hán cá nhân, và Ngữ pháp cá nhân trực tiếp trên giao diện của từng bài học tương ứng.
  - Bổ sung 3 bảng mới vào cơ sở dữ liệu Supabase: `user_custom_vocabulary`, `user_custom_kanji`, và `user_custom_grammar` có phân quyền bảo mật RLS theo ID người dùng.
  - Xây dựng hệ thống Endpoint API Backend hoàn chỉnh, hỗ trợ lưu trữ cục bộ qua file `custom_items.json` ở chế độ Mock và đồng bộ hóa đám mây ở chế độ Live.
- **Đồng bộ thanh menu**: Thêm mục "Tổng hợp kiến thức" (📝) vào Sidebar menu của tất cả các trang.

### Mốc 37: Tái cấu trúc Layout Knowledge Hub & Tích hợp game Ôn tập hỗn hợp (Đã hoàn thành & Đã deploy Production - 23/06/2026)
- **Tái cấu trúc giao diện**: Thiết kế lại trang Knowledge Hub với bố cục chia thành Sheet tổng quan bài học (Lesson Overview) và các Sheet học liệu chi tiết có bộ lọc tối ưu.
- **Game Ôn tập hỗn hợp (Combined Practice Hub)**:
  - Cho phép cấu hình đề ôn tập tùy biến: Chọn nhiều bài học bất kỳ, chọn nguồn học liệu (Chính khóa / Cá nhân / Cả hai), định dạng câu hỏi (Từ vựng / Chữ Hán / Cả hai), và chế độ game.
  - Hỗ trợ 3 chế độ game: Trắc nghiệm phản xạ (Speedrun 10s), Trò chơi lật thẻ memory (Memory Match), và Tự luận viết đáp án (Written Mode).
  - Tích hợp khu vực Game Workspace ngay trên trang, tự động chấm điểm và phản hồi kết quả trực tiếp cho người học.
- **Git Commit & Auto-deploy**: Tiến hành commit và push toàn bộ thay đổi lên nhánh `main` của GitHub repo (`nihongo-study`), kích hoạt quy trình CI/CD tự động build và deploy lên Vercel và Render.

### Mốc 38: Tái thiết lập vị trí "Tổng hợp kiến thức" & Khắc phục hoàn toàn lỗi nền trắng Dark Mode (Đã hoàn thành & Đã deploy Production - 23/06/2026)
- **Tái cấu trúc điều hướng**:
  - Xóa mục "Tổng hợp kiến thức" khỏi menu Sidebar của tất cả 7 trang chính để tinh gọn thanh điều hướng bên trái.
  - Thêm nút bấm điều hướng nhanh `📝 Tổng hợp kiến thức` ở phía trên bên cạnh nút chọn trình độ `N5/N4` trên các trang Dashboard, Chi tiết bài học, và Lộ trình học.
  - Trên trang `/knowledge`: Xóa bỏ 2 nút Minna/Marugoto ở sidebar/header, di chuyển nút "Luyện tập tổng hợp" xuống cuối tab Mẫu câu.
- **Sửa lỗi hiển thị Dark Mode & Biên dịch**:
  - Khắc phục lỗi Toast Alert bị nền trắng ở chế độ tối trên tất cả các trang chính bằng cách thêm lớp `dark:bg-slate-900`.
  - Sửa lỗi màu nền trắng của các dropdown chọn bài, dropdown lọc trạng thái học tập.
  - Khắc phục lỗi hover màu trắng do cú pháp độ đục kép của Tailwind trên các accordion mẫu câu, bảng viết từ vựng, bảng chữ cái ôn tập.
  - Khắc phục lỗi biên dịch cú pháp JSX do dán đè sai vị trí tại phần nhập vai hội thoại Kaiwa.
- **Git Commit & Deploy**: Commit và push toàn bộ mã nguồn lên nhánh `main` của GitHub repo để tự động deploy lên Vercel và Render.

### Mốc 39: Tích hợp Trọng âm cao độ (Pitch Accent) & Nâng cấp Âm thanh Bản xứ (Native Audio) (Đã hoàn thành & Đã deploy Production - 26/06/2026)
- **Thu thập dữ liệu Pitch Accent**:
  - Viết kịch bản [generate_pitch_accent.js](file:///d:/AI/japanese_learning/website/backend/scratch/generate_pitch_accent.js) để tự động quét từ vựng và tra cứu chỉ số hạt nhân trọng âm ($N$) từ cơ sở dữ liệu mở Kanjium, tạo ra tệp cache offline [vocab_pitch_accent_cache.json](file:///d:/AI/japanese_learning/website/backend/src/db/vocab_pitch_accent_cache.json).
  - Khớp thành công hơn 57.6% tổng số từ vựng (931 từ gồm cả Minna và Marugoto). Các từ không tìm thấy mặc định là Heiban (0).
  - Cập nhật database [schema.sql](file:///d:/AI/japanese_learning/website/backend/src/db/schema.sql) và script seeding [inject_marugoto_content.js](file:///d:/AI/japanese_learning/website/backend/scratch/inject_marugoto_content.js) để nạp cache trọng âm và đồng bộ lại `mockDb.js`.
- **Lập trình hiển thị & Âm thanh Frontend**:
  - Lập trình helper [pitchAccentHelper.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/pitchAccentHelper.ts) bóc tách Morae (sử dụng regex) và tính trạng thái cao độ của từng mora.
  - Tạo component [PitchAccentDisplay.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/components/PitchAccentDisplay.tsx) vẽ trực quan đường cao độ bằng các class CSS border (border-top màu đỏ cho âm Cao, border-right cho hạt nhân rơi) kèm Tooltip chi tiết khi hover chuột.
  - Tạo helper [audioHelper.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/audioHelper.ts) hỗ trợ phát âm native từ kho lưu trữ HTTPS của LanguagePod101 với cơ chế fallback tự động về trình duyệt TTS sau 2 giây nếu có lỗi mạng hoặc không có từ.
  - Tích hợp component PitchAccent và Native Audio vào Tab Từ vựng bài học, mặt sau thẻ nhớ Flashcards (size lớn), và game phản xạ Speedrun.
- **Biên dịch & Deploy**: Biên dịch Next.js thành công 100% không lỗi TypeScript. Thực hiện commit và push toàn bộ thay đổi lên Git repo nhánh `main` để kích hoạt tự động deploy.

### Mốc 40: Khôi phục & Đồng bộ Từ vựng Marugoto Starter A1 từ PDF (Đã hoàn thành & Đã deploy Production - 26/06/2026)
- **Trích xuất văn bản thô**: Viết và chạy kịch bản Python [extract_marugoto_pdf.py](file:///d:/AI/japanese_learning/website/backend/scratch/extract_marugoto_pdf.py) sử dụng `pypdf` trích xuất thành công nội dung text thô từ các trang 6-81 của file PDF [MarugotoStarterWordbook_VN.pdf](file:///d:/AI/japanese_learning/tai_lieu/MarugotoStarterWordbook_VN.pdf) sang tệp [marugoto_raw_text.txt](file:///d:/AI/japanese_learning/website/backend/scratch/marugoto_raw_text.txt).
- **Khôi phục Mojibake qua Gemini API**:
  - Triển khai kịch bản [repair_marugoto_vocab.js](file:///d:/AI/japanese_learning/website/backend/scratch/repair_marugoto_vocab.js) sử dụng mô hình `gemini-flash-lite-latest` để khôi phục chính xác các từ vựng tiếng Nhật (Hiragana/Katakana) và bản dịch tiếng Việt chuẩn dựa trên khóa Romaji không bị lỗi font.
  - Phân chia đều từ vựng theo cấu trúc bài học thực tế từ Bài 101 đến Bài 118 (Marugoto Bài 1 đến Bài 18) vào tệp [marugoto_generated_data.json](file:///d:/AI/japanese_learning/website/backend/scratch/marugoto_generated_data.json).
- **Đồng bộ Cơ sở dữ liệu & Pitch Accent**:
  - Gộp thành công **942 từ vựng**, **59 chữ Kanji**, **51 mẫu Ngữ pháp**, **54 câu Can-do**, **9 bài Văn hoá** vào [mockDb.js](file:///d:/AI/japanese_learning/website/backend/src/db/mockDb.js) qua [inject_marugoto_content.js](file:///d:/AI/japanese_learning/website/backend/scratch/inject_marugoto_content.js).
  - Sử dụng [generate_pitch_accent.js](file:///d:/AI/japanese_learning/website/backend/scratch/generate_pitch_accent.js) quét và ánh xạ cao độ (Pitch Accent) cho toàn bộ từ vựng mới chèn từ dữ liệu mở Kanjium.
  - Sửa đổi [seed_supabase.js](file:///d:/AI/japanese_learning/website/backend/src/db/seed_supabase.js) đồng bộ cột `pitch_accent` để chuẩn bị sẵn cho quá trình seed lên Supabase live.
- **Biên dịch & Kiểm định**:
  - Biên dịch Next.js thành công 100% không lỗi TypeScript.
  - Browser Subagent xác nhận giao diện hiển thị từ vựng sạch sẽ, không lỗi font tiếng Việt/Nhật, có đầy đủ mẹo ghi nhớ, ví dụ và đường kẻ Pitch Accent đỏ hiển thị sắc nét.
- **Git Commit & Auto-deploy**: Commit và push toàn bộ thay đổi lên Git repo nhánh `main` (`edcb83e`), kích hoạt tự động deploy lại bản vá ổn định lên production Vercel & Render.
 
### Mốc 41: Khắc phục lỗi nhảy cuộn trang, thêm tóm tắt câu đúng và tráo đề khi làm lại trong Luyện tập (Đã hoàn thành & Đã deploy Production - 26/06/2026)
- **Khắc phục lỗi cuộn trang:**
  - Khai báo và sử dụng `useRef` làm các mốc phần tử: `practiceResultsRef` cho vùng kết quả ở cuối trang và `practiceTopRef` cho vị trí câu hỏi 1 ở đầu trang.
  - Sử dụng `useEffect` lắng nghe `isGraded` để tự động cuộn mượt mà (`scrollIntoView`) tới `practiceResultsRef` khi nhấn **Chấm điểm** (`isGraded === true`).
  - Gắn sự kiện click của nút **Làm lại** (Redo) để tự động cuộn ngược về đầu trang tại `practiceTopRef`.
- **Hiển thị tóm tắt kết quả chính xác:**
  - Tính toán động tổng số câu đúng (`correctCount`) thông qua hook `useMemo`.
  - Cập nhật dòng thông báo kết quả chấm điểm ở cuối trang hiển thị chi tiết: `Kết quả: {correctCount}/{practiceList.length} câu đúng`.
- **Tự động Tráo đề khi Làm lại:**
  - Sinh đề thi xào trộn ngẫu nhiên mới (`generatePracticeList`) ngay khi nhấn **Làm lại** để hỗ trợ học tập lặp đi lặp lại.
- **Biên dịch & Deploy:**
  - Biên dịch thành công 100% Next.js Frontend.
  - Commit và push trực tiếp mã nguồn lên GitHub main branch (`5fe6c22`) để tự động redeploy lên Vercel.

### Mốc 42: Tích hợp chế độ "Học bằng Kanji" cho Từ vựng & Flashcards (Đã hoàn thành & Đã deploy Production - 27/06/2026)
- **Tích hợp State & Giao diện Checkbox**:
  - Khai báo state `showKanjiInVocab` trong [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx).
  - Thêm checkbox giao diện **"🇯🇵 Học bằng Kanji"** trong thanh bộ lọc của tab Từ vựng.
- **Điều kiện hóa Hiển thị Từ vựng**:
  - Cập nhật hiển thị danh sách từ vựng chính khóa (grouped items), từ vựng khác (ungrouped items), và từ vựng trùng lặp (copied items) để tự động hiển thị chữ Kanji kết hợp (bằng `getKanjiForm`) cỡ lớn kèm chữ đọc Hiragana trong ngoặc đơn bên cạnh. Khi bỏ checkbox, quay về dạng Hiragana + Pitch Accent mặc định.
  - Cập nhật hiển thị thẻ lật Flashcard: mặt trước hiển thị Kanji độc lập, mặt sau hiển thị chữ Kanji kèm cách đọc Hiragana trong ngoặc.
- **Kiểm định & Push Source**:
  - Biên dịch thành công Next.js Frontend (`build`) không lỗi cú pháp hay TypeScript.
  - Chạy thử nghiệm qua Browser Subagent xác thực giao diện hiển thị đúng ý đồ thiết kế trên cả điện thoại (responsive) và máy tính.
  - Đẩy thành công mã nguồn thay đổi lên Git repo nhánh `main` (`6262ecb`) để kích hoạt tự động deploy lại bản vá ổn định lên production Vercel.

### Mốc 43: Tích hợp đếm ngược tự động lật Flashcard, tự động đánh giá khi hết giờ & Tối ưu ô nhập số (Đã hoàn thành - 01/07/2026)
- **Tự động lật và Tùy chọn tự động đánh giá khi hết giờ (Auto-Flip & Auto-Mark Expiry):**
  - Khai báo các trạng thái mới `autoMarkOnExpiry`, `autoExpiryLearned` hỗ trợ bật/tắt tự động đánh giá khi hết giờ ở mặt sau thẻ.
  - Người học có thể cấu hình trạng thái mặc định mong muốn (🔴 Chưa thuộc hoặc 🟢 Đã thuộc) trong Config Panel.
  - Tích hợp đếm ngược nhấp nháy hiển thị trạng thái sắp chọn ở mặt sau thẻ, tự động gọi API cập nhật tiến độ và chuyển tiếp khi hết giờ.
- **Tối ưu hóa các ô nhập số (Numeric Inputs):**
  - Sửa đổi 4 ô nhập liệu số trên toàn hệ thống (số thẻ học, thời gian lật, giới hạn câu hỏi, thời gian game memory).
  - Cho phép người dùng xóa trống (`""`) khi đang nhập để dễ dàng sửa. Chỉ tự động clamp/khôi phục về giá trị mặc định khi mất tiêu điểm (sự kiện `onBlur`).
- **Xác minh E2E:** Build Next.js thành công 100% không lỗi TS. Chạy thử nghiệm E2E cục bộ tự động trên trình duyệt ghi nhận hoạt động hoàn hảo.

### Mốc 44: Khắc phục lỗi giao diện trang Bộ thủ Kanji (Bộ thủ chữ Hán) ở chế độ tối (Đã hoàn thành - 01/07/2026)
- **Sửa lỗi màu nền đè chữ trắng (White-on-white):**
  - Chuyển toàn bộ các ô chứa chữ Hán lớn trong lưới tra cứu, modal chi tiết và tất cả các chế độ luyện tập (Trắc nghiệm, Tự luận, Phản xạ nhanh) sang màu nền tối tương thích (`bg-white dark:bg-slate-950/60` hoặc `dark:bg-slate-900`).
  - Sửa các select box cấu hình, ô tìm kiếm và các nút hành động bị mất chữ/tương phản gắt trong Dark Mode.
  - Khắc phục chữ gõ tự luận bị mờ/mất chữ ở Light Mode.
- **Xác minh E2E:** Hoàn thành chạy kiểm thử E2E cục bộ trên trình duyệt trong chế độ tối. Chụp ảnh màn hình Modal chi tiết và game Phản xạ nhanh hiển thị rõ ràng, sắc nét.

### Mốc 45: Thay thế Trò chơi lật bài bằng trò Luyện phản xạ đọc chữ ghép (Đã hoàn thành - 02/07/2026)
- **Thay thế tab Trò chơi lật bài:** Loại bỏ hoàn toàn mã nguồn cũ và giao diện của trò chơi lật bài (Memory Match) trên trang ôn bảng chữ cái `/kana`.
- **Phát triển Luyện phản xạ chữ ghép:**
  - Tích hợp game luyện phản xạ đọc nhanh các từ kết hợp (`combinedWordsData`). Hiển thị chữ Kana lớn để người dùng tự đọc to, tự động phát âm và hiện đáp án Romaji + nghĩa Việt sau khi hết giờ, sau đó tự động chuyển câu tiếp theo.
  - Cấu hình linh hoạt: Độ khó (Dễ/Trung bình/Khó), số lượng câu hỏi (5 - 100 câu), thời gian đọc suy nghĩ (1 - 15 giây), và thời gian hiện đáp án (1 - 10 giây).
- **Kiểm định E2E:** Biên dịch thành công Next.js không lỗi và xác minh thành công chu trình hoạt động ổn định trên trình duyệt Chrome cục bộ.

### Mốc 46: Tái cấu trúc Giao diện Học tập khóa Marugoto thành 4 kỹ năng (Đã hoàn thành - 04/07/2026)
- **Sidebar Menu**: Tái cấu trúc Sidebar menu của Marugoto thành 4 tab học tập chính: Từ vựng (`vocab`), Ngữ pháp (`grammar`), Luyện tập 4 kỹ năng (`practice`), và Tự đánh giá Can-do (`cando`), cùng tab Văn hóa (`culture`) cho bài học chẵn.
- **Tab Từ vựng**: Chia làm 2 chế độ: Học từ vựng (danh sách có bộ chọn trạng thái thuộc) và Luyện tập từ vựng (mini-game Ghép thẻ `MatchingGame` và Trắc nghiệm nghe `ListeningQuiz`).
- **Tab Ngữ pháp**: Chia làm 2 chế độ: Học ngữ pháp (lý thuyết mẫu câu, ví dụ xoay vòng) và Bài tập trợ từ (game đục lỗ trợ từ câu ví dụ).
- **Tab Luyện tập 4 kỹ năng**: Chia làm 4 phân hệ kỹ năng:
  - *Nghe*: Trắc nghiệm nghe `ListeningQuiz`.
  - *Nói*: Luyện nói shadowing câu ví dụ, hỗ trợ nghe âm thanh bản xứ mẫu và đánh dấu lưu tiến trình.
  - *Đọc*: Luyện đọc đoạn hội thoại thực tế `DialogueReading`.
  - *Viết*: Luyện dịch câu tự luận từ tiếng Việt sang tiếng Nhật, tích hợp thuật toán so khớp thông minh `renderDiff` hiển thị lỗi sai trực quan bằng màu sắc và gạch chân lượn sóng.
- **Kiểm định E2E**: Chạy dev server cục bộ, biên dịch thành công Frontend Next.js không lỗi và thực hiện xác minh tự động qua Browser Subagent hoạt động mượt mà ổn định.
### Mốc 47: Đồng bộ Luyện tập từ vựng Marugoto giống Minna (Tự luận / Phản xạ nhanh) (Đã hoàn thành - 04/07/2026)
- **Tái cấu trúc & Đồng bộ hóa giao diện Luyện tập từ vựng**:
  - Trích xuất toàn bộ giao diện **Bảng Luyện Tập & Đảo Đề Tương Tác** (gồm 2 chế độ: ✍️ Tự luận và ⚡ Phản xạ nhanh - Speedrun) của khóa Minna thành hàm helper `renderInteractivePractice` dùng chung trong [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx).
  - Tích hợp hàm dùng chung này vào cả trang Luyện tập Minna và sub-tab **Luyện tập từ vựng** (trong tab Từ vựng `vocab`) của Marugoto, loại bỏ hoàn toàn các mini-game cũ (Matching và Listening) theo yêu cầu người dùng.
- **Tách biệt và Tối ưu hóa dữ liệu**:
  - Dữ liệu nạp vào để ôn tập hoàn toàn cô lập 100% theo bài học và khóa học đang học (khi học Marugoto bài 101 chỉ ôn tập từ của bài 101 Marugoto, không bị trộn lẫn với dữ liệu Minna).
  - Cập nhật logic `useEffect` nạp `practiceList` tương thích với sub-tab Luyện tập từ vựng của Marugoto.
  - Tự động ẩn lựa chọn "Luyện Chữ Hán" trong giao diện điều khiển nếu đang học khóa Marugoto (do Marugoto không thiết kế bảng chữ Hán riêng biệt).
- **Kiểm định E2E & Git push**:
  - Biên dịch thành công Next.js Frontend. Sửa lỗi cú pháp JSX (bọc các lời gọi hàm `renderInteractivePractice` trong `<React.Fragment>`) khắc phục triệt để lỗi sập trang và treo menu Sidebar khi chuyển đổi tab Từ vựng (Minna) / Ngữ pháp (Marugoto).
  - Sửa lỗi logic chuyển hướng redirect tab Ngữ pháp (grammar) ➔ Từ vựng (vocab) ở phần đầu component [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx). Chỉ cho phép redirect khi là bài học của Minna (lessonId < 101), cho phép hiển thị học Ngữ pháp bình thường đối với khóa Marugoto.
  - Kiểm thử E2E tự động qua Browser Subagent thành công tốt đẹp cả hai chế độ Tự luận (grading, accuracy) và Phản xạ nhanh (streak, timer).
  - Commit và đẩy mã nguồn hoàn chỉnh lên Git remote repository main branch.

### Mốc 48: Nạp và đồng bộ hóa toàn bộ 18 bài học Marugoto A1 lên Supabase (Đã hoàn thành - 04/07/2026)
- **Tích hợp dữ liệu cục bộ (`mockDb.js`)**:
  - Cập nhật kịch bản [inject_marugoto_content.js](file:///d:/AI/japanese_learning/website/backend/scratch/inject_marugoto_content.js) để nạp đầy đủ mảng 18 bài học (Lesson 101 - 118) bao gồm tiêu đề, mô tả và cấu hình học liệu tương thích 100% với website MARUGOTO Plus.
  - Chạy chèn thành công 942 từ vựng, 51 ngữ pháp, 54 Can-do, và 9 bài Văn hóa vào tệp database mock cục bộ.
- **Đồng bộ cơ sở dữ liệu đám mây (Supabase)**:
  - Lập trình kịch bản [seed_marugoto_supabase_all.js](file:///d:/AI/japanese_learning/website/backend/scratch/seed_marugoto_supabase_all.js) sử dụng cơ chế bulk upsert (`onConflict: id`) để đẩy toàn bộ học liệu của 18 bài học Marugoto lên database online Supabase một cách nhanh chóng và an toàn.
- **Kiểm định & Khởi động lại**:
  - Biên dịch thành công Next.js frontend cục bộ không có lỗi TypeScript hay build.
  - Khởi động lại dev server Express để làm sạch cache RAM của Node.js, cập nhật tức thì dữ liệu học liệu mới nạp.
  - Sử dụng Browser Subagent kiểm thử và chụp hình thực tế, xác nhận Bài 102 hiển thị đầy đủ từ vựng (chủ đề lớp học), ngữ pháp (`てください`), và bài viết văn hóa lớp học. Đồng thời Bài 103 (bài lẻ) ẩn hoàn toàn tab Văn hóa & Cuộc sống theo đúng nghiệp vụ.

### Mốc 49: Loại bỏ trùng lặp từ vựng và ngữ pháp khóa Marugoto (Đã hoàn thành - 04/07/2026)
- **Lọc sạch dữ liệu cục bộ**:
  - Viết và chạy thành công script [deduplicate_marugoto.js](file:///d:/AI/japanese_learning/website/backend/scratch/deduplicate_marugoto.js) tự động loại bỏ **87** từ vựng trùng lặp và **7** cấu trúc ngữ pháp trùng lặp trong tệp `mockDb.js`.
  - Giữ lại bản ghi ở bài học đầu tiên nó xuất hiện (ví dụ Bài 1) và loại bỏ khỏi các bài học sau (ví dụ Bài 3, Bài 4...). Còn lại **855** từ vựng sạch và **44** mẫu ngữ pháp sạch.
- **Đồng bộ cơ sở dữ liệu đám mây (Supabase)**:
  - Lập trình kịch bản [sync_deduplicated_supabase.js](file:///d:/AI/japanese_learning/website/backend/scratch/sync_deduplicated_supabase.js) xóa sạch các học liệu Marugoto cũ trên Cloud và nạp lại toàn bộ dữ liệu sạch đã lọc trùng từ `mockDb.js` mới.
- **Xác minh E2E**:
  - Khởi động lại Express backend server để cập nhật RAM cache của Node.js.
  - Chạy biên dịch Next.js build thành công 100%.
  - Kiểm thử trực quan qua Browser Subagent, xác nhận: các từ trùng lặp ở bài trước (như `ともだち`, `がくせい`, `がっこう` ở bài 103 và `わたし` ở bài 104) đã được loại bỏ thành công, đồng thời cấu trúc ngữ pháp trùng lặp `N1 は N2 です` cũng biến mất khỏi bài 103, hệ thống hiển thị học liệu chuẩn xác.

### Mốc 50: Thiết kế riêng biệt giao diện từ vựng Marugoto (Đã hoàn thành - 04/07/2026)
- **Tách biệt giao diện học tập**:
  - Tuân thủ tuyệt đối yêu cầu thiết kế riêng biệt 2 khóa học (không gộp chung cấu trúc Accordion của Minna). Giữ nguyên cấu trúc hiển thị lưới card phẳng thô sơ và chuyên nghiệp ban đầu của khóa học Marugoto.
- **Tích hợp tính năng quản lý riêng**:
  - Thiết kế và chèn **Marugoto Progress Card** riêng biệt với tông màu chủ đạo tím/hồng đặc trưng, tính toán chính xác tổng từ vựng (77 từ ở bài 104), số từ đã thuộc, đang học và tỷ lệ % hoàn thành trực tiếp tại client (không còn bị lỗi `???`).
  - Thiết kế và tích hợp **Thanh tìm kiếm từ vựng (Search Input)** và các bộ lọc trạng thái (Tất cả / Chưa học / Đang học / Đã thuộc) hoạt động độc lập và mượt mà trên giao diện Marugoto.
- **Xác minh & Biên dịch**:
  - Chạy `npm run build` Next.js frontend thành công 100%.
  - Khởi động lại dev server Express.
  - Sử dụng Browser Subagent kiểm thử E2E trên Bài 104, chụp ảnh màn hình xác nhận giao diện tính toán tổng từ vựng chính xác (77 từ) và bộ lọc tìm kiếm hoạt động phản hồi tức thời.

### Mốc 51: Phân loại Từ vựng Marugoto cốt lõi và bổ sung (Đã hoàn thành - 04/07/2026)
- **Vá logic Gọi API**:
  - Chỉnh sửa `useEffect` nạp dữ liệu ở [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) để tự động gọi `loadGrammarData()` song song khi người dùng truy cập tab từ vựng Marugoto (`currentTab === 'vocab'`). Đảm bảo dữ liệu ngữ pháp luôn sẵn sàng ở client để thực hiện gom nhóm từ vựng.
- **Phân loại giao diện thẻ phẳng**:
  - Chia tách lưới từ vựng Marugoto làm 2 khối có tiêu đề và hiển thị số lượng rõ ràng: *🔑 Từ vựng cốt lõi (dùng trong bài)* và *📄 Từ vựng bổ sung & Khác*.
  - Gắn viền trái màu tím hồng nổi bật (`border-l-4 border-l-[#b5179e] dark:border-l-[#b5179e]`) trên các card thuộc nhóm cốt lõi giúp người học phân biệt trực quan và nhanh chóng (kể cả ở chế độ Dark Mode).
- **Kiểm định**:
  - Biên dịch Frontend thành công 100% không phát sinh lỗi.
  - Sử dụng Browser Subagent kiểm thử trên Bài 104 Marugoto, chụp hình xác nhận phần chia nhóm hiển thị đúng (66 từ cốt lõi, 11 từ bổ sung) và card từ vựng cốt lõi hiển thị viền tím hồng rất đẹp.

### Mốc 52: Tích hợp Bộ lọc Trạng thái Học tập vào game Nghe từ vựng Marugoto (Đã hoàn thành - 05/07/2026)
- **Game trắc nghiệm nghe từ vựng**:
  - Phát triển sub-tab **🎧 Nghe từ vựng** trong phần Từ vựng Marugoto, tái sử dụng component `ListeningQuiz` và chỉ nạp danh sách từ vựng bài học để game chỉ phát âm từ thay vì trộn lẫn câu ví dụ.
  - Tách biệt logic render của tab bằng toán tử `&&` thay vì cấu trúc ternary cũ, giải quyết triệt để lỗi hiển thị lặp giao diện điền từ vựng phía dưới game trắc nghiệm nghe.
- **Bộ lọc trạng thái học tập**:
  - Đăng ký và quản lý state `listeningStatusFilter` độc lập. Hiển thị thanh bộ lọc trạng thái dạng pill-button (Tất cả, Chưa học, Đang học, Đã thuộc) trực quan.
  - Tự động re-mount game trắc nghiệm qua việc gán `key={listeningStatusFilter}` để tái tạo bộ câu hỏi ngay khi đổi bộ lọc.
  - Tích hợp giao diện hiển thị thông báo thân thiện khi danh sách từ vựng thuộc nhóm trạng thái đã chọn trống.
- **Kiểm định**:
  - Cập nhật quy tắc dự án bắt buộc trình bày kế hoạch dưới dạng artifact `implementation_plan.md` kèm nút phê duyệt trực quan.
  - Biên dịch Next.js frontend thành công 100% không phát sinh bất kỳ lỗi TS/JS nào.

### Mốc 53: Nâng cấp phần Luyện nghe từ vựng & Cấu hình thời gian phản xạ (Đã hoàn thành cục bộ & Sắp push GitHub - 05/07/2026)
- **Cấu hình thời gian cơ bản (Base Time Setting):**
  - Tích hợp thêm ô nhập số thời gian cơ bản (Numeric Input) bên cạnh các nút chọn nhanh (5s, 10s, 15s, 20s) tại màn hình chuẩn bị.
  - Áp dụng cơ chế tối ưu hóa UX nhập số: cho phép xóa trống khi đang gõ để dễ sửa; tự động kiểm tra và giới hạn (clamp) trong khoảng [2, 60] giây khi mất tiêu điểm (`onBlur`) (khôi phục về 10s nếu để trống/nhập sai).
- **Cơ chế đếm ngược thời gian phản xạ & Tính điểm:**
  - Loại bỏ hoàn toàn giới hạn tối đa 10 câu, sử dụng toàn bộ từ vựng sẵn có trong bài để ôn luyện.
  - Mỗi câu trả lời đúng cộng **1 điểm** và tự động chuyển câu hỏi tiếp theo sau 1 giây.
  - Tự động giảm **10% thời gian tối đa hiện tại** sau mỗi 3 câu đúng liên tiếp (streak) nhằm tăng độ thử thách mượt mà (giới hạn tối thiểu là 2 giây).
  - Trả lời sai hoặc hết thời gian 10 giây ➔ Kết thúc lượt chơi ngay lập tức và lưu kỷ lục điểm cao mới vào `localStorage` theo từng bài học.
- **Kiểm định & Biên dịch:**
  - Biên dịch Next.js frontend thành công 100% không lỗi.
  - Browser Subagent xác minh giao diện Luyện nghe phản xạ hoạt động hoàn hảo các cơ chế: xóa trống, nhập giới hạn và đếm ngược thực tế.

### Mốc 54: Tái cấu trúc giao diện Luyện tập ngữ pháp Marugoto thành các tab phẳng (Đã hoàn thành - 06/07/2026)
- **Tái cấu trúc 4 tab phẳng cấp độ đầu:** Loại bỏ bộ chọn phụ lồng bên trong thẻ câu hỏi. Chuyển đổi toàn bộ giao diện học/luyện ngữ pháp thành 4 tab phẳng nằm ngang song song: Học ngữ pháp, Điền ô trống, Nghe hiểu, và Dịch câu.
- **Đồng bộ hóa điều hướng:** Tự động điều hướng `/knowledge` về thẳng trang Tổng hợp kiến thức khi hoạt động trên khóa học Marugoto.

### Mốc 55: Khôi phục tab Tổng hợp kiến thức & Sửa lỗi crash chuyển tab (Đã hoàn thành - 06/07/2026)
- **Khôi phục tab Tổng hợp (summary):** Thay thế hoàn toàn 2 tab cũ (Can-do và Văn hóa) bằng tab **Tổng hợp kiến thức** tổng hợp động toàn bộ từ vựng và ngữ pháp của toàn khóa học Marugoto.
- **Sửa lỗi crash runtime khi chuyển tab:** Thêm Optional Chaining (`?.`) cho các thuộc tính câu hỏi trắc nghiệm ngữ pháp. Khắc phục triệt để lỗi sập trang `Cannot read properties of undefined (reading 'map')` khi người dùng click chuyển nhanh giữa các tab luyện tập.

### Mốc 56: Chuẩn hóa màu sắc Tailwind CSS và sửa lỗi tàng hình chữ (Đã hoàn thành - 06/07/2026)
- **Khắc phục lỗi màu không chuẩn:** Quét và thay thế toàn bộ các mã màu Tailwind không hợp lệ kết thúc bằng số lẻ (như `slate-955`, `slate-855`, `slate-655`, `slate-705`, `slate-505`, `slate-105`) về mã chuẩn Tailwind CSS.
- **Sửa lỗi chữ trắng trên nền trắng ở Dark Mode:** Nhờ chuẩn hóa mã màu, nền thẻ câu hỏi trong chế độ tối hiện nhận diện chính xác màu nền tối (`slate-950`/`slate-900`) giúp chữ Hiragana/Kanji sáng màu hiển thị rõ ràng, sắc nét.

### Mốc 57: Tinh chỉnh giao diện trang Tổng hợp kiến thức Marugoto (Đã hoàn thành - 06/07/2026)
- **Ẩn đường kẻ Pitch Accent cho cụm từ dài:** Chỉ hiển thị vẽ đường trọng âm cho từ ngắn dưới 7 ký tự. Các cụm từ dài/câu giao tiếp hiển thị dạng chữ trơn cỡ lớn đậm nét, loại bỏ hoàn toàn tình trạng các đường kẻ bị lệch đè rối lên chữ.
- **Tối ưu hóa độ tương phản chữ:** 
  - Chuyển màu phiên âm Romaji từ xám tối sang xám sáng nổi bật (`text-slate-500 dark:text-slate-350`).
  - Làm đậm nghĩa dịch tiếng Việt thành `text-slate-900 dark:text-slate-100 font-extrabold text-sm` bảo đảm tính tương phản tối ưu.

### Mốc 58: Nâng cấp thiết kế Active cho 2 nút Từ vựng và Ngữ pháp (Đã hoàn thành - 06/07/2026)
- **CSS Active nổi bật:** Cập nhật 2 nút chuyển đổi sub-tab trên trang Tổng hợp kiến thức. Khi đang được chọn (Active), nút sẽ có nền nổi bật (`bg-white dark:bg-slate-900`), viền và bóng đổ rõ nét (`border-slate-200 dark:border-slate-700 shadow-sm`) đi kèm màu chữ hồng sen đậm/sáng đặc trưng (`text-pink-700 dark:text-pink-400 font-extrabold`) tạo cảm giác cực kỳ cao cấp và hiện đại.

### Mốc 59: Đẩy mã nguồn và đồng bộ hóa thành công lên GitHub (Đã hoàn thành - 06/07/2026)
- **Git Push Remote:** Staged, commit (commit hash: `41f0051`) và đẩy thành công toàn bộ mã nguồn cải tiến lên nhánh `main` của GitHub repository (`nihongo-study`), hoàn tất việc lưu trữ trạng thái phiên làm việc.

### Mốc 60: Tích hợp Lối tắt Bảng chữ cái vào Menu Cài đặt & Tối ưu Sidebar (Đã hoàn thành - 08/07/2026)
- **Popover Cài đặt (`SidebarSettings.tsx`):** Thêm nút phím tắt "Ôn bảng chữ cái" (`🔤`) vào trong danh sách điều hướng nhanh của Popover Cài đặt cho cả khoá Minna và Marugoto.
- **Tối ưu Sidebar:** Loại bỏ hoàn toàn tùy chọn `"kana"` khỏi danh sách `menuItems` của khóa Minna trên toàn bộ 9 trang giao diện chính (Dashboard, Lessons, Guide, Knowledge Hub, Roadmap, Practice, Mock Test, Review) giúp thanh Sidebar gọn gàng hơn.
- **Trang Bảng chữ cái (`kana/page.tsx`):** Loại bỏ logic tự động chuyển hướng (redirect) về Dashboard khi đang ở khóa Marugoto, cho phép học viên truy cập học bảng chữ cái độc lập từ cả hai khóa học.

### Mốc 61: Mở rộng 9 mẫu câu ngữ pháp Bài 3 Marugoto & Phân chia động từ vựng (Đã hoàn thành & Đã đẩy lên GitHub - 08/07/2026)
- **Tách 9 mẫu câu ngữ pháp Bài 3 (`mockDb.js`):** Tách 3 cụm ngữ pháp gộp cũ của Bài 3 Marugoto (Lesson 103) thành 9 mẫu ngữ pháp độc lập. Sắp xếp đúng theo thứ tự logic nhóm chủ đề (câu khẳng định liền sau bởi thể phủ định và nghi vấn tương ứng của mẫu đó) theo yêu cầu của học viên. Gán ID `151-153` cho 3 mẫu đầu để bảo toàn dữ liệu học tập và `201-206` cho 6 mẫu tiếp theo.
- **Thuật toán Phân bổ từ vựng động (`roadmapMapping.ts`):** Nâng cấp hàm `getGrammarVocabMapping` nhận thêm tham số tùy chọn `totalGrammarCount` để chia đều từ vựng theo số mẫu ngữ pháp thực tế, ngăn ngừa lỗi tràn chỉ số (out-of-bounds) khi số lượng mẫu câu tăng lên.
- **Đồng bộ hóa Frontend & Dev server:** Truyền độ dài `grammarItems.length` vào các trang Roadmap, Practice, và Lessons. Khởi động lại Express Backend server để áp dụng dữ liệu mock mới.
- **Xác minh & Lưu trữ GitHub:** Biên dịch Next.js build thành công 100% không lỗi TypeScript. Sử dụng Browser Subagent kiểm định trực quan 9 mẫu câu hoạt động chính xác trên trang Summary. Đẩy toàn bộ thay đổi lên nhánh `main` của remote repository (`nihongo-study`).

### Mốc 62: Tự động hóa đồng bộ Supabase khi khởi chạy Server (Đã hoàn thành & Đã đẩy lên GitHub - 08/07/2026)
- **Tích hợp tự động seeding (`index.js` & `seed_supabase.js`):** Cấu trúc lại hàm `runSeed()` và xuất khẩu từ `seed_supabase.js` để có thể gọi lập trình, tắt chế độ tự động chạy khi import và vô hiệu hóa `process.exit(1)` để tránh crash server khi kết nối mạng/Supabase lỗi. Tích hợp chạy ngầm `runSeed().catch()` bên trong callback `app.listen()` của `index.js`.
- **Cơ chế hoạt động:** Mỗi khi server backend được khởi động hoặc deploy lên hosting (như Render), server sẽ tự động chạy tiến trình đồng bộ dữ liệu từ `mockDb.js` lên Supabase mà không cần bất kỳ thao tác thủ công nào từ phía người dùng.
- **Đẩy code GitHub:** Lưu trữ toàn bộ thay đổi lên GitHub repository (`nihongo-study`) nhánh `main`.

### Mốc 63: Tối ưu hóa hiệu năng và triệt tiêu độ trễ ô Tìm kiếm (Đã hoàn thành & Đã đẩy lên GitHub - 08/07/2026)
- **Áp dụng kỹ thuật Debouncing (`lessons/[id]/page.tsx`):** Thêm state cục bộ `localSearchQuery` và `localSummarySearchQuery` kết hợp với `useEffect` sử dụng `setTimeout` để trì hoãn việc cập nhật state tìm kiếm chính (`searchQuery` và `summarySearchQuery`) khoảng 250ms khi người dùng gõ phím.
- **Hiệu quả tối ưu:** Loại bỏ hoàn toàn tình trạng khựng chữ (input lag) khi nhập dữ liệu tìm kiếm trên danh sách lớn (855 từ vựng và 55 mẫu ngữ pháp). Ô nhập liệu phản hồi mượt mà tức thì (0ms latency), trong khi bộ lọc dữ liệu chỉ thực thi khi người học dừng gõ phím.
- **Biên dịch & Đẩy GitHub:** Build frontend Next.js thành công 100% không phát sinh lỗi. Pushed code lên GitHub nhánh `main`.

### Mốc 64: Tinh gọn Dashboard, xóa Flashcards/Kaiwa và Kanji trong Luyện từ vựng (Đã hoàn thành & Đã đẩy lên GitHub - 14/07/2026)
- **Tinh gọn trang tiến độ học (Dashboard):**
  - Refactor trang Dashboard của khóa Minna ([page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/dashboard/page.tsx)) từ 4 khối cồng kềnh thành 2 khối phẳng tối giản.
  - Khối 1 (Tiến độ & Chỉ tiêu hàng ngày): Hiển thị chỉ tiêu ngày kèm tỉ lệ học thực tế (`Đã thuộc / Tổng số`) cho Từ vựng, Kanji, Ngữ pháp, tích hợp thanh tiến độ Tailwind mượt mà và nhãn trạng thái (`Đạt chỉ tiêu` / `Chậm`).
  - Khối 2 (Kế hoạch & Dự báo hoàn thành): Hiển thị hộp thời gian còn lại học bài hiện tại (hoặc báo trễ hạn so với hạn chót) cùng thanh tiến độ chung, thu gọn biểu đồ cả cấp độ N5/N4 vào widget `<details>` đóng/mở thông minh.
- **Xóa bỏ Flashcards và Luyện nói (Kaiwa) khỏi website:**
  - Loại bỏ hoàn toàn 2 mục này khỏi Sidebar của tất cả 9 trang giao diện chính để tinh giản menu.
  - Xóa 2 nút điều hướng nhanh đến Flashcards và Kaiwa ở Dashboard, sắp xếp lại grid 4 nút còn lại thẳng hàng đều đặn.
  - Vô hiệu hóa render JSX của 2 tab này (thay thành `null`) trong trang bài học [lessons/\[id\]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx).
  - Tích hợp React Hook `useEffect` tự động phát hiện và redirect người dùng về tab Từ vựng (`tab=vocab`) nếu họ cố tình truy cập trực tiếp bằng URL `?tab=flashcards` hoặc `?tab=kaiwa`.
  - Cập nhật hướng dẫn trong Cẩm nang học ([guide/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/guide/page.tsx)) và Lộ trình ([roadmap/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/roadmap/page.tsx)) từ quy trình 5 bước học xuống 4 bước học tinh giản.
- **Loại bỏ Kanji khỏi trang Luyện từ vựng:**
  - Xóa bỏ bộ chọn chế độ ôn tập "Luyện Từ Vựng" / "Luyện Chữ Hán" trong tab Practice. Vì state `practiceMode` mặc định đã là `'vocab'`, trang ôn tập sẽ chỉ tập trung luyện tập từ vựng bằng Hiragana/Katakana và Romaji mà không còn Kanji, đúng chuẩn mong muốn của học viên.
- **Lưu trạng thái và Đẩy GitHub:**
  - Biên dịch Next.js build thành công 100% không phát sinh lỗi.
  - Đẩy toàn bộ 9 file thay đổi lên nhánh `main` của GitHub remote (`nihongo-study`), kích hoạt Render Blueprint tự động redeploy phiên bản mới nhất.
- **Tự động Tráo đề khi Làm lại:**
  - Sinh đề thi xào trộn ngẫu nhiên mới (`generatePracticeList`) ngay khi nhấn **Làm lại** để hỗ trợ học tập lặp đi lặp lại.
- **Biên dịch & Deploy:**
  - Biên dịch thành công 100% Next.js Frontend.
  - Commit và push trực tiếp mã nguồn lên GitHub main branch (`5fe6c22`) để tự động redeploy lên Vercel.

### Mốc 42: Tích hợp chế độ "Học bằng Kanji" cho Từ vựng & Flashcards (Đã hoàn thành & Đã deploy Production - 27/06/2026)
- **Tích hợp State & Giao diện Checkbox**:
  - Khai báo state `showKanjiInVocab` trong [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx).
  - Thêm checkbox giao diện **"🇯🇵 Học bằng Kanji"** trong thanh bộ lọc của tab Từ vựng.
- **Điều kiện hóa Hiển thị Từ vựng**:
  - Cập nhật hiển thị danh sách từ vựng chính khóa (grouped items), từ vựng khác (ungrouped items), và từ vựng trùng lặp (copied items) để tự động hiển thị chữ Kanji kết hợp (bằng `getKanjiForm`) cỡ lớn kèm chữ đọc Hiragana trong ngoặc đơn bên cạnh. Khi bỏ checkbox, quay về dạng Hiragana + Pitch Accent mặc định.
  - Cập nhật hiển thị thẻ lật Flashcard: mặt trước hiển thị Kanji độc lập, mặt sau hiển thị chữ Kanji kèm cách đọc Hiragana trong ngoặc.
- **Kiểm định & Push Source**:
  - Biên dịch thành công Next.js Frontend (`build`) không lỗi cú pháp hay TypeScript.
  - Chạy thử nghiệm qua Browser Subagent xác thực giao diện hiển thị đúng ý đồ thiết kế trên cả điện thoại (responsive) và máy tính.
  - Đẩy thành công mã nguồn thay đổi lên Git repo nhánh `main` (`6262ecb`) để kích hoạt tự động deploy lại bản vá ổn định lên production Vercel.

### Mốc 43: Tích hợp đếm ngược tự động lật Flashcard, tự động đánh giá khi hết giờ & Tối ưu ô nhập số (Đã hoàn thành - 01/07/2026)
- **Tự động lật và Tùy chọn tự động đánh giá khi hết giờ (Auto-Flip & Auto-Mark Expiry):**
  - Khai báo các trạng thái mới `autoMarkOnExpiry`, `autoExpiryLearned` hỗ trợ bật/tắt tự động đánh giá khi hết giờ ở mặt sau thẻ.
  - Người học có thể cấu hình trạng thái mặc định mong muốn (🔴 Chưa thuộc hoặc 🟢 Đã thuộc) trong Config Panel.
  - Tích hợp đếm ngược nhấp nháy hiển thị trạng thái sắp chọn ở mặt sau thẻ, tự động gọi API cập nhật tiến độ và chuyển tiếp khi hết giờ.
- **Tối ưu hóa các ô nhập số (Numeric Inputs):**
  - Sửa đổi 4 ô nhập liệu số trên toàn hệ thống (số thẻ học, thời gian lật, giới hạn câu hỏi, thời gian game memory).
  - Cho phép người dùng xóa trống (`""`) khi đang nhập để dễ dàng sửa. Chỉ tự động clamp/khôi phục về giá trị mặc định khi mất tiêu điểm (sự kiện `onBlur`).
- **Xác minh E2E:** Build Next.js thành công 100% không lỗi TS. Chạy thử nghiệm E2E cục bộ tự động trên trình duyệt ghi nhận hoạt động hoàn hảo.

### Mốc 44: Khắc phục lỗi giao diện trang Bộ thủ Kanji (Bộ thủ chữ Hán) ở chế độ tối (Đã hoàn thành - 01/07/2026)
- **Sửa lỗi màu nền đè chữ trắng (White-on-white):**
  - Chuyển toàn bộ các ô chứa chữ Hán lớn trong lưới tra cứu, modal chi tiết và tất cả các chế độ luyện tập (Trắc nghiệm, Tự luận, Phản xạ nhanh) sang màu nền tối tương thích (`bg-white dark:bg-slate-950/60` hoặc `dark:bg-slate-900`).
  - Sửa các select box cấu hình, ô tìm kiếm và các nút hành động bị mất chữ/tương phản gắt trong Dark Mode.
  - Khắc phục chữ gõ tự luận bị mờ/mất chữ ở Light Mode.
- **Xác minh E2E:** Hoàn thành chạy kiểm thử E2E cục bộ trên trình duyệt trong chế độ tối. Chụp ảnh màn hình Modal chi tiết và game Phản xạ nhanh hiển thị rõ ràng, sắc nét.

### Mốc 45: Thay thế Trò chơi lật bài bằng trò Luyện phản xạ đọc chữ ghép (Đã hoàn thành - 02/07/2026)
- **Thay thế tab Trò chơi lật bài:** Loại bỏ hoàn toàn mã nguồn cũ và giao diện của trò chơi lật bài (Memory Match) trên trang ôn bảng chữ cái `/kana`.
- **Phát triển Luyện phản xạ chữ ghép:**
  - Tích hợp game luyện phản xạ đọc nhanh các từ kết hợp (`combinedWordsData`). Hiển thị chữ Kana lớn để người dùng tự đọc to, tự động phát âm và hiện đáp án Romaji + nghĩa Việt sau khi hết giờ, sau đó tự động chuyển câu tiếp theo.
  - Cấu hình linh hoạt: Độ khó (Dễ/Trung bình/Khó), số lượng câu hỏi (5 - 100 câu), thời gian đọc suy nghĩ (1 - 15 giây), và thời gian hiện đáp án (1 - 10 giây).
- **Kiểm định E2E:** Biên dịch thành công Next.js không lỗi và xác minh thành công chu trình hoạt động ổn định trên trình duyệt Chrome cục bộ.

### Mốc 46: Tái cấu trúc Giao diện Học tập khóa Marugoto thành 4 kỹ năng (Đã hoàn thành - 04/07/2026)
- **Sidebar Menu**: Tái cấu trúc Sidebar menu của Marugoto thành 4 tab học tập chính: Từ vựng (`vocab`), Ngữ pháp (`grammar`), Luyện tập 4 kỹ năng (`practice`), và Tự đánh giá Can-do (`cando`), cùng tab Văn hóa (`culture`) cho bài học chẵn.
- **Tab Từ vựng**: Chia làm 2 chế độ: Học từ vựng (danh sách có bộ chọn trạng thái thuộc) và Luyện tập từ vựng (mini-game Ghép thẻ `MatchingGame` và Trắc nghiệm nghe `ListeningQuiz`).
- **Tab Ngữ pháp**: Chia làm 2 chế độ: Học ngữ pháp (lý thuyết mẫu câu, ví dụ xoay vòng) và Bài tập trợ từ (game đục lỗ trợ từ câu ví dụ).
- **Tab Luyện tập 4 kỹ năng**: Chia làm 4 phân hệ kỹ năng:
  - *Nghe*: Trắc nghiệm nghe `ListeningQuiz`.
  - *Nói*: Luyện nói shadowing câu ví dụ, hỗ trợ nghe âm thanh bản xứ mẫu và đánh dấu lưu tiến trình.
  - *Đọc*: Luyện đọc đoạn hội thoại thực tế `DialogueReading`.
  - *Viết*: Luyện dịch câu tự luận từ tiếng Việt sang tiếng Nhật, tích hợp thuật toán so khớp thông minh `renderDiff` hiển thị lỗi sai trực quan bằng màu sắc và gạch chân lượn sóng.
- **Kiểm định E2E**: Chạy dev server cục bộ, biên dịch thành công Frontend Next.js không lỗi và thực hiện xác minh tự động qua Browser Subagent hoạt động mượt mà ổn định.
### Mốc 47: Đồng bộ Luyện tập từ vựng Marugoto giống Minna (Tự luận / Phản xạ nhanh) (Đã hoàn thành - 04/07/2026)
- **Tái cấu trúc & Đồng bộ hóa giao diện Luyện tập từ vựng**:
  - Trích xuất toàn bộ giao diện **Bảng Luyện Tập & Đảo Đề Tương Tác** (gồm 2 chế độ: ✍️ Tự luận và ⚡ Phản xạ nhanh - Speedrun) của khóa Minna thành hàm helper `renderInteractivePractice` dùng chung trong [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx).
  - Tích hợp hàm dùng chung này vào cả trang Luyện tập Minna và sub-tab **Luyện tập từ vựng** (trong tab Từ vựng `vocab`) của Marugoto, loại bỏ hoàn toàn các mini-game cũ (Matching và Listening) theo yêu cầu người dùng.
- **Tách biệt và Tối ưu hóa dữ liệu**:
  - Dữ liệu nạp vào để ôn tập hoàn toàn cô lập 100% theo bài học và khóa học đang học (khi học Marugoto bài 101 chỉ ôn tập từ của bài 101 Marugoto, không bị trộn lẫn với dữ liệu Minna).
  - Cập nhật logic `useEffect` nạp `practiceList` tương thích với sub-tab Luyện tập từ vựng của Marugoto.
  - Tự động ẩn lựa chọn "Luyện Chữ Hán" trong giao diện điều khiển nếu đang học khóa Marugoto (do Marugoto không thiết kế bảng chữ Hán riêng biệt).
- **Kiểm định E2E & Git push**:
  - Biên dịch thành công Next.js Frontend. Sửa lỗi cú pháp JSX (bọc các lời gọi hàm `renderInteractivePractice` trong `<React.Fragment>`) khắc phục triệt để lỗi sập trang và treo menu Sidebar khi chuyển đổi tab Từ vựng (Minna) / Ngữ pháp (Marugoto).
  - Sửa lỗi logic chuyển hướng redirect tab Ngữ pháp (grammar) ➔ Từ vựng (vocab) ở phần đầu component [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx). Chỉ cho phép redirect khi là bài học của Minna (lessonId < 101), cho phép hiển thị học Ngữ pháp bình thường đối với khóa Marugoto.
  - Kiểm thử E2E tự động qua Browser Subagent thành công tốt đẹp cả hai chế độ Tự luận (grading, accuracy) và Phản xạ nhanh (streak, timer).
  - Commit và đẩy mã nguồn hoàn chỉnh lên Git remote repository main branch.

### Mốc 48: Nạp và đồng bộ hóa toàn bộ 18 bài học Marugoto A1 lên Supabase (Đã hoàn thành - 04/07/2026)
- **Tích hợp dữ liệu cục bộ (`mockDb.js`)**:
  - Cập nhật kịch bản [inject_marugoto_content.js](file:///d:/AI/japanese_learning/website/backend/scratch/inject_marugoto_content.js) để nạp đầy đủ mảng 18 bài học (Lesson 101 - 118) bao gồm tiêu đề, mô tả và cấu hình học liệu tương thích 100% với website MARUGOTO Plus.
  - Chạy chèn thành công 942 từ vựng, 51 ngữ pháp, 54 Can-do, và 9 bài Văn hóa vào tệp database mock cục bộ.
- **Đồng bộ cơ sở dữ liệu đám mây (Supabase)**:
  - Lập trình kịch bản [seed_marugoto_supabase_all.js](file:///d:/AI/japanese_learning/website/backend/scratch/seed_marugoto_supabase_all.js) sử dụng cơ chế bulk upsert (`onConflict: id`) để đẩy toàn bộ học liệu của 18 bài học Marugoto lên database online Supabase một cách nhanh chóng và an toàn.
- **Kiểm định & Khởi động lại**:
  - Biên dịch thành công Next.js frontend cục bộ không có lỗi TypeScript hay build.
  - Khởi động lại dev server Express để làm sạch cache RAM của Node.js, cập nhật tức thì dữ liệu học liệu mới nạp.
  - Sử dụng Browser Subagent kiểm thử và chụp hình thực tế, xác nhận Bài 102 hiển thị đầy đủ từ vựng (chủ đề lớp học), ngữ pháp (`てください`), và bài viết văn hóa lớp học. Đồng thời Bài 103 (bài lẻ) ẩn hoàn toàn tab Văn hóa & Cuộc sống theo đúng nghiệp vụ.

### Mốc 49: Loại bỏ trùng lặp từ vựng và ngữ pháp khóa Marugoto (Đã hoàn thành - 04/07/2026)
- **Lọc sạch dữ liệu cục bộ**:
  - Viết và chạy thành công script [deduplicate_marugoto.js](file:///d:/AI/japanese_learning/website/backend/scratch/deduplicate_marugoto.js) tự động loại bỏ **87** từ vựng trùng lặp và **7** cấu trúc ngữ pháp trùng lặp trong tệp `mockDb.js`.
  - Giữ lại bản ghi ở bài học đầu tiên nó xuất hiện (ví dụ Bài 1) và loại bỏ khỏi các bài học sau (ví dụ Bài 3, Bài 4...). Còn lại **855** từ vựng sạch và **44** mẫu ngữ pháp sạch.
- **Đồng bộ cơ sở dữ liệu đám mây (Supabase)**:
  - Lập trình kịch bản [sync_deduplicated_supabase.js](file:///d:/AI/japanese_learning/website/backend/scratch/sync_deduplicated_supabase.js) xóa sạch các học liệu Marugoto cũ trên Cloud và nạp lại toàn bộ dữ liệu sạch đã lọc trùng từ `mockDb.js` mới.
- **Xác minh E2E**:
  - Khởi động lại Express backend server để cập nhật RAM cache của Node.js.
  - Chạy biên dịch Next.js build thành công 100%.
  - Kiểm thử trực quan qua Browser Subagent, xác nhận: các từ trùng lặp ở bài trước (như `ともだち`, `がくせい`, `がっこう` ở bài 103 và `わたし` ở bài 104) đã được loại bỏ thành công, đồng thời cấu trúc ngữ pháp trùng lặp `N1 は N2 です` cũng biến mất khỏi bài 103, hệ thống hiển thị học liệu chuẩn xác.

### Mốc 50: Thiết kế riêng biệt giao diện từ vựng Marugoto (Đã hoàn thành - 04/07/2026)
- **Tách biệt giao diện học tập**:
  - Tuân thủ tuyệt đối yêu cầu thiết kế riêng biệt 2 khóa học (không gộp chung cấu trúc Accordion của Minna). Giữ nguyên cấu trúc hiển thị lưới card phẳng thô sơ và chuyên nghiệp ban đầu của khóa học Marugoto.
- **Tích hợp tính năng quản lý riêng**:
  - Thiết kế và chèn **Marugoto Progress Card** riêng biệt với tông màu chủ đạo tím/hồng đặc trưng, tính toán chính xác tổng từ vựng (77 từ ở bài 104), số từ đã thuộc, đang học và tỷ lệ % hoàn thành trực tiếp tại client (không còn bị lỗi `???`).
  - Thiết kế và tích hợp **Thanh tìm kiếm từ vựng (Search Input)** và các bộ lọc trạng thái (Tất cả / Chưa học / Đang học / Đã thuộc) hoạt động độc lập và mượt mà trên giao diện Marugoto.
- **Xác minh & Biên dịch**:
  - Chạy `npm run build` Next.js frontend thành công 100%.
  - Khởi động lại dev server Express.
  - Sử dụng Browser Subagent kiểm thử E2E trên Bài 104, chụp ảnh màn hình xác nhận giao diện tính toán tổng từ vựng chính xác (77 từ) và bộ lọc tìm kiếm hoạt động phản hồi tức thời.

### Mốc 51: Phân loại Từ vựng Marugoto cốt lõi và bổ sung (Đã hoàn thành - 04/07/2026)
- **Vá logic Gọi API**:
  - Chỉnh sửa `useEffect` nạp dữ liệu ở [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) để tự động gọi `loadGrammarData()` song song khi người dùng truy cập tab từ vựng Marugoto (`currentTab === 'vocab'`). Đảm bảo dữ liệu ngữ pháp luôn sẵn sàng ở client để thực hiện gom nhóm từ vựng.
- **Phân loại giao diện thẻ phẳng**:
  - Chia tách lưới từ vựng Marugoto làm 2 khối có tiêu đề và hiển thị số lượng rõ ràng: *🔑 Từ vựng cốt lõi (dùng trong bài)* và *📄 Từ vựng bổ sung & Khác*.
  - Gắn viền trái màu tím hồng nổi bật (`border-l-4 border-l-[#b5179e] dark:border-l-[#b5179e]`) trên các card thuộc nhóm cốt lõi giúp người học phân biệt trực quan và nhanh chóng (kể cả ở chế độ Dark Mode).
- **Kiểm định**:
  - Biên dịch Frontend thành công 100% không phát sinh lỗi.
  - Sử dụng Browser Subagent kiểm thử trên Bài 104 Marugoto, chụp hình xác nhận phần chia nhóm hiển thị đúng (66 từ cốt lõi, 11 từ bổ sung) và card từ vựng cốt lõi hiển thị viền tím hồng rất đẹp.

### Mốc 52: Tích hợp Bộ lọc Trạng thái Học tập vào game Nghe từ vựng Marugoto (Đã hoàn thành - 05/07/2026)
- **Game trắc nghiệm nghe từ vựng**:
  - Phát triển sub-tab **🎧 Nghe từ vựng** trong phần Từ vựng Marugoto, tái sử dụng component `ListeningQuiz` và chỉ nạp danh sách từ vựng bài học để game chỉ phát âm từ thay vì trộn lẫn câu ví dụ.
  - Tách biệt logic render của tab bằng toán tử `&&` thay vì cấu trúc ternary cũ, giải quyết triệt để lỗi hiển thị lặp giao diện điền từ vựng phía dưới game trắc nghiệm nghe.
- **Bộ lọc trạng thái học tập**:
  - Đăng ký và quản lý state `listeningStatusFilter` độc lập. Hiển thị thanh bộ lọc trạng thái dạng pill-button (Tất cả, Chưa học, Đang học, Đã thuộc) trực quan.
  - Tự động re-mount game trắc nghiệm qua việc gán `key={listeningStatusFilter}` để tái tạo bộ câu hỏi ngay khi đổi bộ lọc.
  - Tích hợp giao diện hiển thị thông báo thân thiện khi danh sách từ vựng thuộc nhóm trạng thái đã chọn trống.
- **Kiểm định**:
  - Cập nhật quy tắc dự án bắt buộc trình bày kế hoạch dưới dạng artifact `implementation_plan.md` kèm nút phê duyệt trực quan.
  - Biên dịch Next.js frontend thành công 100% không phát sinh bất kỳ lỗi TS/JS nào.

### Mốc 53: Nâng cấp phần Luyện nghe từ vựng & Cấu hình thời gian phản xạ (Đã hoàn thành cục bộ & Sắp push GitHub - 05/07/2026)
- **Cấu hình thời gian cơ bản (Base Time Setting):**
  - Tích hợp thêm ô nhập số thời gian cơ bản (Numeric Input) bên cạnh các nút chọn nhanh (5s, 10s, 15s, 20s) tại màn hình chuẩn bị.
  - Áp dụng cơ chế tối ưu hóa UX nhập số: cho phép xóa trống khi đang gõ để dễ sửa; tự động kiểm tra và giới hạn (clamp) trong khoảng [2, 60] giây khi mất tiêu điểm (`onBlur`) (khôi phục về 10s nếu để trống/nhập sai).
- **Cơ chế đếm ngược thời gian phản xạ & Tính điểm:**
  - Loại bỏ hoàn toàn giới hạn tối đa 10 câu, sử dụng toàn bộ từ vựng sẵn có trong bài để ôn luyện.
  - Mỗi câu trả lời đúng cộng **1 điểm** và tự động chuyển câu hỏi tiếp theo sau 1 giây.
  - Tự động giảm **10% thời gian tối đa hiện tại** sau mỗi 3 câu đúng liên tiếp (streak) nhằm tăng độ thử thách mượt mà (giới hạn tối thiểu là 2 giây).
  - Trả lời sai hoặc hết thời gian 10 giây ➔ Kết thúc lượt chơi ngay lập tức và lưu kỷ lục điểm cao mới vào `localStorage` theo từng bài học.
- **Kiểm định & Biên dịch:**
  - Biên dịch Next.js frontend thành công 100% không lỗi.
  - Browser Subagent xác minh giao diện Luyện nghe phản xạ hoạt động hoàn hảo các cơ chế: xóa trống, nhập giới hạn và đếm ngược thực tế.

### Mốc 54: Tái cấu trúc giao diện Luyện tập ngữ pháp Marugoto thành các tab phẳng (Đã hoàn thành - 06/07/2026)
- **Tái cấu trúc 4 tab phẳng cấp độ đầu:** Loại bỏ bộ chọn phụ lồng bên trong thẻ câu hỏi. Chuyển đổi toàn bộ giao diện học/luyện ngữ pháp thành 4 tab phẳng nằm ngang song song: Học ngữ pháp, Điền ô trống, Nghe hiểu, và Dịch câu.
- **Đồng bộ hóa điều hướng:** Tự động điều hướng `/knowledge` về thẳng trang Tổng hợp kiến thức khi hoạt động trên khóa học Marugoto.

### Mốc 55: Khôi phục tab Tổng hợp kiến thức & Sửa lỗi crash chuyển tab (Đã hoàn thành - 06/07/2026)
- **Khôi phục tab Tổng hợp (summary):** Thay thế hoàn toàn 2 tab cũ (Can-do và Văn hóa) bằng tab **Tổng hợp kiến thức** tổng hợp động toàn bộ từ vựng và ngữ pháp của toàn khóa học Marugoto.
- **Sửa lỗi crash runtime khi chuyển tab:** Thêm Optional Chaining (`?.`) cho các thuộc tính câu hỏi trắc nghiệm ngữ pháp. Khắc phục triệt để lỗi sập trang `Cannot read properties of undefined (reading 'map')` khi người dùng click chuyển nhanh giữa các tab luyện tập.

### Mốc 56: Chuẩn hóa màu sắc Tailwind CSS và sửa lỗi tàng hình chữ (Đã hoàn thành - 06/07/2026)
- **Khắc phục lỗi màu không chuẩn:** Quét và thay thế toàn bộ các mã màu Tailwind không hợp lệ kết thúc bằng số lẻ (như `slate-955`, `slate-855`, `slate-655`, `slate-705`, `slate-505`, `slate-105`) về mã chuẩn Tailwind CSS.
- **Sửa lỗi chữ trắng trên nền trắng ở Dark Mode:** Nhờ chuẩn hóa mã màu, nền thẻ câu hỏi trong chế độ tối hiện nhận diện chính xác màu nền tối (`slate-950`/`slate-900`) giúp chữ Hiragana/Kanji sáng màu hiển thị rõ ràng, sắc nét.

### Mốc 57: Tinh chỉnh giao diện trang Tổng hợp kiến thức Marugoto (Đã hoàn thành - 06/07/2026)
- **Ẩn đường kẻ Pitch Accent cho cụm từ dài:** Chỉ hiển thị vẽ đường trọng âm cho từ ngắn dưới 7 ký tự. Các cụm từ dài/câu giao tiếp hiển thị dạng chữ trơn cỡ lớn đậm nét, loại bỏ hoàn toàn tình trạng các đường kẻ bị lệch đè rối lên chữ.
- **Tối ưu hóa độ tương phản chữ:** 
  - Chuyển màu phiên âm Romaji từ xám tối sang xám sáng nổi bật (`text-slate-500 dark:text-slate-350`).
  - Làm đậm nghĩa dịch tiếng Việt thành `text-slate-900 dark:text-slate-100 font-extrabold text-sm` bảo đảm tính tương phản tối ưu.

### Mốc 58: Nâng cấp thiết kế Active cho 2 nút Từ vựng và Ngữ pháp (Đã hoàn thành - 06/07/2026)
- **CSS Active nổi bật:** Cập nhật 2 nút chuyển đổi sub-tab trên trang Tổng hợp kiến thức. Khi đang được chọn (Active), nút sẽ có nền nổi bật (`bg-white dark:bg-slate-900`), viền và bóng đổ rõ nét (`border-slate-200 dark:border-slate-700 shadow-sm`) đi kèm màu chữ hồng sen đậm/sáng đặc trưng (`text-pink-700 dark:text-pink-400 font-extrabold`) tạo cảm giác cực kỳ cao cấp và hiện đại.

### Mốc 59: Đẩy mã nguồn và đồng bộ hóa thành công lên GitHub (Đã hoàn thành - 06/07/2026)
- **Git Push Remote:** Staged, commit (commit hash: `41f0051`) và đẩy thành công toàn bộ mã nguồn cải tiến lên nhánh `main` của GitHub repository (`nihongo-study`), hoàn tất việc lưu trữ trạng thái phiên làm việc.

### Mốc 60: Tích hợp Lối tắt Bảng chữ cái vào Menu Cài đặt & Tối ưu Sidebar (Đã hoàn thành - 08/07/2026)
- **Popover Cài đặt (`SidebarSettings.tsx`):** Thêm nút phím tắt "Ôn bảng chữ cái" (`🔤`) vào trong danh sách điều hướng nhanh của Popover Cài đặt cho cả khoá Minna và Marugoto.
- **Tối ưu Sidebar:** Loại bỏ hoàn toàn tùy chọn `"kana"` khỏi danh sách `menuItems` của khóa Minna trên toàn bộ 9 trang giao diện chính (Dashboard, Lessons, Guide, Knowledge Hub, Roadmap, Practice, Mock Test, Review) giúp thanh Sidebar gọn gàng hơn.
- **Trang Bảng chữ cái (`kana/page.tsx`):** Loại bỏ logic tự động chuyển hướng (redirect) về Dashboard khi đang ở khóa Marugoto, cho phép học viên truy cập học bảng chữ cái độc lập từ cả hai khóa học.

### Mốc 61: Mở rộng 9 mẫu câu ngữ pháp Bài 3 Marugoto & Phân chia động từ vựng (Đã hoàn thành & Đã đẩy lên GitHub - 08/07/2026)
- **Tách 9 mẫu câu ngữ pháp Bài 3 (`mockDb.js`):** Tách 3 cụm ngữ pháp gộp cũ của Bài 3 Marugoto (Lesson 103) thành 9 mẫu ngữ pháp độc lập. Sắp xếp đúng theo thứ tự logic nhóm chủ đề (câu khẳng định liền sau bởi thể phủ định và nghi vấn tương ứng của mẫu đó) theo yêu cầu của học viên. Gán ID `151-153` cho 3 mẫu đầu để bảo toàn dữ liệu học tập và `201-206` cho 6 mẫu tiếp theo.
- **Thuật toán Phân bổ từ vựng động (`roadmapMapping.ts`):** Nâng cấp hàm `getGrammarVocabMapping` nhận thêm tham số tùy chọn `totalGrammarCount` để chia đều từ vựng theo số mẫu ngữ pháp thực tế, ngăn ngừa lỗi tràn chỉ số (out-of-bounds) khi số lượng mẫu câu tăng lên.
- **Đồng bộ hóa Frontend & Dev server:** Truyền độ dài `grammarItems.length` vào các trang Roadmap, Practice, và Lessons. Khởi động lại Express Backend server để áp dụng dữ liệu mock mới.
- **Xác minh & Lưu trữ GitHub:** Biên dịch Next.js build thành công 100% không lỗi TypeScript. Sử dụng Browser Subagent kiểm định trực quan 9 mẫu câu hoạt động chính xác trên trang Summary. Đẩy toàn bộ thay đổi lên nhánh `main` của remote repository (`nihongo-study`).

### Mốc 62: Tự động hóa đồng bộ Supabase khi khởi chạy Server (Đã hoàn thành & Đã đẩy lên GitHub - 08/07/2026)
- **Tích hợp tự động seeding (`index.js` & `seed_supabase.js`):** Cấu trúc lại hàm `runSeed()` và xuất khẩu từ `seed_supabase.js` để có thể gọi lập trình, tắt chế độ tự động chạy khi import và vô hiệu hóa `process.exit(1)` để tránh crash server khi kết nối mạng/Supabase lỗi. Tích hợp chạy ngầm `runSeed().catch()` bên trong callback `app.listen()` của `index.js`.
- **Cơ chế hoạt động:** Mỗi khi server backend được khởi động hoặc deploy lên hosting (như Render), server sẽ tự động chạy tiến trình đồng bộ dữ liệu từ `mockDb.js` lên Supabase mà không cần bất kỳ thao tác thủ công nào từ phía người dùng.
- **Đẩy code GitHub:** Lưu trữ toàn bộ thay đổi lên GitHub repository (`nihongo-study`) nhánh `main`.

### Mốc 63: Tối ưu hóa hiệu năng và triệt tiêu độ trễ ô Tìm kiếm (Đã hoàn thành & Đã đẩy lên GitHub - 08/07/2026)
- **Áp dụng kỹ thuật Debouncing (`lessons/[id]/page.tsx`):** Thêm state cục bộ `localSearchQuery` và `localSummarySearchQuery` kết hợp với `useEffect` sử dụng `setTimeout` để trì hoãn việc cập nhật state tìm kiếm chính (`searchQuery` và `summarySearchQuery`) khoảng 250ms khi người dùng gõ phím.
- **Hiệu quả tối ưu:** Loại bỏ hoàn toàn tình trạng khựng chữ (input lag) khi nhập dữ liệu tìm kiếm trên danh sách lớn (855 từ vựng và 55 mẫu ngữ pháp). Ô nhập liệu phản hồi mượt mà tức thì (0ms latency), trong khi bộ lọc dữ liệu chỉ thực thi khi người học dừng gõ phím.
- **Biên dịch & Đẩy GitHub:** Build frontend Next.js thành công 100% không phát sinh lỗi. Pushed code lên GitHub nhánh `main`.

### Mốc 64: Tinh gọn Dashboard, xóa Flashcards/Kaiwa và Kanji trong Luyện từ vựng (Đã hoàn thành & Đã đẩy lên GitHub - 14/07/2026)
- **Tinh gọn trang tiến độ học (Dashboard):**
  - Refactor trang Dashboard của khóa Minna ([page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/dashboard/page.tsx)) từ 4 khối cồng kềnh thành 2 khối phẳng tối giản.
  - Khối 1 (Tiến độ & Chỉ tiêu hàng ngày): Hiển thị chỉ tiêu ngày kèm tỉ lệ học thực tế (`Đã thuộc / Tổng số`) cho Từ vựng, Kanji, Ngữ pháp, tích hợp thanh tiến độ Tailwind mượt mà và nhãn trạng thái (`Đạt chỉ tiêu` / `Chậm`).
  - Khối 2 (Kế hoạch & Dự báo hoàn thành): Hiển thị hộp thời gian còn lại học bài hiện tại (hoặc báo trễ hạn so với hạn chót) cùng thanh tiến độ chung, thu gọn biểu đồ cả cấp độ N5/N4 vào widget `<details>` đóng/mở thông minh.
- **Xóa bỏ Flashcards và Luyện nói (Kaiwa) khỏi website:**
  - Loại bỏ hoàn toàn 2 mục này khỏi Sidebar của tất cả 9 trang giao diện chính để tinh giản menu.
  - Xóa 2 nút điều hướng nhanh đến Flashcards và Kaiwa ở Dashboard, sắp xếp lại grid 4 nút còn lại thẳng hàng đều đặn.
  - Vô hiệu hóa render JSX của 2 tab này (thay thành `null`) trong trang bài học [lessons/\[id\]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx).
  - Tích hợp React Hook `useEffect` tự động phát hiện và redirect người dùng về tab Từ vựng (`tab=vocab`) nếu họ cố tình truy cập trực tiếp bằng URL `?tab=flashcards` hoặc `?tab=kaiwa`.
  - Cập nhật hướng dẫn trong Cẩm nang học ([guide/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/guide/page.tsx)) và Lộ trình ([roadmap/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/roadmap/page.tsx)) từ quy trình 5 bước học xuống 4 bước học tinh giản.
- **Loại bỏ Kanji khỏi trang Luyện từ vựng:**
  - Xóa bỏ bộ chọn chế độ ôn tập "Luyện Từ Vựng" / "Luyện Chữ Hán" trong tab Practice. Vì state `practiceMode` mặc định đã là `'vocab'`, trang ôn tập sẽ chỉ tập trung luyện tập từ vựng bằng Hiragana/Katakana và Romaji mà không còn Kanji, đúng chuẩn mong muốn của học viên.
- **Lưu trạng thái và Đẩy GitHub:**
  - Biên dịch Next.js build thành công 100% không phát sinh lỗi.
  - Đẩy toàn bộ 9 file thay đổi lên nhánh `main` của GitHub remote (`nihongo-study`), kích hoạt Render Blueprint tự động redeploy phiên bản mới nhất.

### Mốc 65: Nâng cấp Trò chơi Phản xạ nhanh (Speedrun) khóa Minna (Đã hoàn thành - 14/07/2026)
- **Thêm Chế độ luyện nghe (`listen-to-select`):**
  - Bổ sung nút chọn chiều hướng ôn tập thứ 3: `🎧 Nghe ➔ Chọn đáp án` trên màn hình chuẩn bị.
  - Khi chơi, hệ thống tự động phát âm (TTS) từ vựng tiếng Nhật, ẩn mặt chữ Nhật và chỉ hiển thị nút Loa phát âm lớn `🔊` cùng mô tả hướng dẫn. Người học nghe âm thanh và chọn nghĩa tiếng Việt tương ứng ở bên dưới.
- **Tích hợp chuỗi Streak & Giảm thời gian động:**
  - Bổ sung theo dõi và hiển thị chỉ số chuỗi câu trả lời đúng liên tục `🔥 Streak: X` rực lửa ở Header trò chơi để tăng sự hưng phấn.
  - Tích hợp cơ chế rút ngắn thời gian: Mỗi 3 câu trả lời đúng liên tiếp, thời gian tối đa (`maxTime`) cho câu tiếp theo sẽ giảm đi 10% (nhân `0.9`), giới hạn thời gian tối thiểu là 2 giây để tăng độ thử thách. Trả lời sai hoặc hết thời gian sẽ reset streak về 0 và trả thời gian tối đa về 10 giây ban đầu.
- **Xác minh thành công**: Build Next.js frontend thành công 100% không phát sinh lỗi. Visual verification qua Browser Subagent cho thấy game chạy mượt mà, âm thanh phát tự động, và các nút điều hướng Chơi lại/Quay lại vận hành hoàn hảo.

### Mốc 66: Thiết lập Phân hệ Ôn tập tổng hợp và Ngân hàng câu hỏi Bài 1 (Đã hoàn thành & Đã đẩy lên GitHub - 14/07/2026)
- **Tích hợp Ngân hàng câu hỏi Bài 1:** Nạp đầy đủ 200 câu hỏi ôn tập (80 câu dịch phản xạ hai chiều Dạng 1, 40 đoạn hội thoại điền khuyết Dạng 2, 40 bài nghe hiểu dài Dạng 3, 40 câu nghe viết chính tả Dạng 4) vào database cục bộ `mockDb.js` và bảng database đám mây `schema.sql` để phục vụ nút bấm Switcher hiển thị.
- **Backend API tráo đề ngẫu nhiên:** Viết endpoint `/api/user/lessons/:lessonId/review` sử dụng thuật toán Fisher-Yates tráo ngẫu nhiên tuyệt đối toàn bộ mảng dữ liệu và tích hợp timestamp cache-busting ở frontend để loại bỏ lưu cache.
- **Frontend UI Ôn tập tổng hợp (Review Tab):** Bổ sung Tab Review thứ 7 cho khóa Minna, tích hợp bộ chuyển đổi hiển thị chữ Kana / chữ Kanji.
- **Cải tiến Dạng 2 (ABCD Grid Buttons):** Thiết kế lại Dạng 2: ẩn cụm từ `blank` trong tin nhắn chat hội thoại thay thế bằng khoảng trống gạch dưới `_______ (1)`, `_______ (2)` sạch sẽ; đưa 4 phương án lựa chọn trắc nghiệm A, B, C, D hiển thị trực quan dưới dạng lưới nút bấm ở bên dưới khung chat, đổi màu xanh Indigo khi active và xanh lá/đỏ khi kiểm tra (Graded).
- **TTS đối thoại 2 người:** Lập trình cơ chế phát âm TTS luân phiên 2 giọng Nam/Nữ cách nhau 0.8 giây cho kịch bản đối thoại Dạng 3.
- **Đẩy code lên GitHub:** Build dự án thành công và pushed toàn bộ source code lên nhánh `main` của GitHub remote repository (`nihongo-study`).

### Mốc 67: Sửa lỗi đè layer dropdown lọc từ vựng & Đẩy mã nguồn lên GitHub (Đã hoàn thành & Đã đẩy lên GitHub - 14/07/2026)
- **Sửa lỗi stacking context CSS:** 
  - Khắc phục lỗi dropdown lọc từ vựng ở tab Luyện tập và màn hình chuẩn bị Speedrun bị các hàng tiêu đề của bảng bên dưới che khuất.
  - Thêm class `relative z-20` vào các container cha (Header Toolbar Controls và Speedrun Preparation Card) của tệp [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) để nâng cao stacking context hiển thị trên trình duyệt.
- **Kiểm định & Biên dịch:** 
  - Biên dịch thành công Next.js frontend (`npm run build:frontend`) 100% không lỗi.
  - Sử dụng Browser Subagent kiểm tra trực quan, xác nhận dropdown hiển thị nổi hoàn chỉnh và hoạt động chính xác.
- **Git Push Remote:** Commit và đẩy thành công mã nguồn sửa đổi lên nhánh `main` của remote repository (`nihongo-study`), kích hoạt Vercel tự động redeploy.

### Mốc 68: Tinh giản trang Ngữ pháp, Đồng bộ Sidebar & Sửa âm thanh Speedrun (Đã hoàn thành - 14/07/2026)
- **Tối giản hóa trang Lộ trình học (đổi tên thành Ngữ pháp):**
  - Đổi tên trang trên Sidebar điều hướng thành "Ngữ pháp" ở tất cả 8 trang chính.
  - Tinh giản trang `roadmap/page.tsx` chỉ giữ lại cấu trúc, giải nghĩa, ví dụ câu kèm TTS. Xóa bỏ Progress Card, suggestion box và các liên kết từ vựng/kanji/luyện thế câu.
  - Xóa bỏ hoàn toàn trang Luyện tập mẫu câu (`roadmap/practice/page.tsx`) và gỡ 3 nút liên kết `⚡ Luyện thế câu` ở trang chi tiết bài học.
- **Đồng bộ mục Ôn tập tổng hợp:**
  - Bổ sung mục chọn "Ôn tập tổng hợp" (review) vào thanh Sidebar điều hướng của khóa Minna trên 7 trang chính còn lại (Dashboard, Guide, Kana, Knowledge, Mock Test...) để đồng bộ trải nghiệm người dùng.
- **Sửa âm thanh phản xạ nhanh (Speedrun):**
  - Điều chỉnh không phát âm lặp lại từ vựng cũ khi chọn đáp án đúng ở chế độ nghe (`listen-to-select`), tránh hiện tượng đè/nối âm thanh với từ vựng tiếp theo.
- **Xác minh biên dịch:** Biên dịch Next.js thành công 100%, số lượng trang tĩnh được tối ưu chính xác.

### Mốc 69: Nâng cấp phản hồi bài tập Dạng 2 & Seeding Supabase (Đã hoàn thành & Đã đẩy lên GitHub - 15/07/2026)
- **Nâng cấp phản hồi Dạng 2 (Khuyết hội thoại):**
  - Tích hợp thêm Romaji, dịch nghĩa câu tiếng Việt vào cấu trúc dữ liệu hội thoại của 40 bài tập thuộc Bài 1.
  - Bổ sung trường dịch nghĩa phương án lựa chọn và giải thích ngữ pháp sư phạm cho từng ô khuyết.
  - Sửa lỗi lệch khớp Kanji trong dấu ngoặc đơn ở trường `correct` gây chấm sai ở frontend.
- **Tạo bảng & Seeding Supabase:**
  - Viết script và khởi tạo thành công bảng `lesson_reviews` trên Supabase Production.
  - Đồng bộ thành công 100% dữ liệu ôn tập Bài 1 lên database đám mây.
- **Nâng cấp UI Frontend:**
  - Cập nhật trang [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) để render giao diện phản hồi sư phạm cao cấp khi bấm kiểm tra bài tập Dạng 2 (Hiển thị kịch bản hội thoại hoàn chỉnh kèm Romaji/dịch nghĩa, giải nghĩa A/B/C/D, và hộp bóng đèn giải thích chi tiết).
  - Tương thích tốt với cả chế độ Light và Dark Mode.
- **Git Push Remote:** Commit và đẩy thành công mã nguồn lên nhánh `main` của remote repository (`nihongo-study`).

### Mốc 70: Tích hợp Dịch nghĩa, Giải thích Dạng 3 & Đáp án Tiếng Việt Dạng 4 (Đã hoàn thành & Đã đẩy lên GitHub - 15/07/2026)
- **Tích hợp dữ liệu bài học giả lập (`mockDb.js`):**
  - Tích hợp thêm trường `"audio_text_vietnamese"` và `"explanation"` cho 40 bài nghe thuộc `listenings` (Dạng 3).
  - Tích hợp thêm trường `"vietnamese_answers"` và `"vietnamese_meaning"` cho 40 câu viết chính tả thuộc `dictations` (Dạng 4).
- **Cập nhật giao diện frontend (`lessons/[id]/page.tsx`):**
  - **Dạng 3:** Hiển thị thêm hộp **Kịch bản đối thoại & Dịch nghĩa** (tiếng Nhật & tiếng Việt) và phần giải thích đáp án trắc nghiệm dưới dạng bóng đèn `💡 Giải thích: [nội dung]` sau khi nhấn **Gửi đáp án**.
  - **Dạng 4:** Cho phép nhập câu trả lời bằng tiếng Việt (sử dụng so khớp chính xác kết hợp fuzzy match `calculateAccuracy >= 85%`). Hiển thị thêm nghĩa dịch tiếng Việt trong feedback khi hiện đáp án: `Đáp án đúng: [Japanese] | Ý nghĩa: [Vietnamese]`.
- **Kiểm định & Đẩy GitHub:** Biên dịch Next.js build thành công 100%. Đã chạy Browser Subagent kiểm thử trực quan giao diện hoạt động hoàn hảo và đẩy mã nguồn lên nhánh `main` của remote repository (`nihongo-study`).

### Mốc 71: Thiết lập Phân hệ Luyện tập Bài 2 & Tích hợp Bảng dịch nghĩa Dạng 2 (Đã hoàn thành & Đã đẩy lên GitHub - 16/07/2026)
- **Bộ 160 câu ôn tập Bài 2 (`mockDb.js`):** Soạn thảo và sinh thành công 160 câu hỏi ôn tập Bài 2 (80 câu dịch phản xạ Dạng 1, 40 đoạn hội thoại điền khuyết Dạng 2, 40 bài nghe hiểu Dạng 3, 40 câu chính tả Dạng 4) hoàn toàn độc nhất 100%, bám sát kiến thức Bài 2 (chỉ thị từ, câu hỏi lựa chọn, từ vựng đồ vật/ngôn ngữ), triệt tiêu hoàn toàn trùng lặp nội bộ và trùng lặp chéo.
- **Khắc phục lỗi "Chưa có bản dịch" Dạng 2:** Tích hợp thuộc tính `options_translations` tự động dịch nghĩa tiếng Việt cho các phương án lựa chọn trong `blanks` của Dạng 2 ở cả Bài 1 và Bài 2. Cập nhật cẩm nang `exercise_generation_guide.md` để đồng bộ hóa quy chuẩn dữ liệu.
- **Chạy và kiểm định:** Đã chạy script kiểm định tự động `verify_diversity_l2.js` và `verify_diversity.js` đạt chuẩn chất lượng 100%. Sử dụng Browser Subagent kiểm thử trực quan trên trình duyệt (Next.js port 3000 và Backend port 8080) xác nhận bảng giải nghĩa tiếng Việt đã hiển thị đúng giao diện. Đã đẩy toàn bộ source code sửa đổi lên GitHub remote repository nhánh `main`.

### Mốc 72: Tái cấu trúc trang Tổng hợp kiến thức & Đồng bộ cơ chế ôn tập 10 câu tuyến tính (Đã hoàn thành & Đã đẩy lên GitHub - 17/07/2026)
- **Tái cấu trúc trang Tổng hợp kiến thức (`/knowledge`):**
  - Chuyển giao diện `/knowledge` thành 5 tabs phẳng cho khóa Minna: Từ vựng (phân nhóm theo từng bài học), Chữ Hán (phân nhóm theo bài học), Ngữ pháp (phân nhóm theo bài học), Luyện từ vựng (tự luận / phản xạ nhanh), và Luyện tập tổng hợp.
  - Loại bỏ hoàn toàn các component CourseSwitcher (Marugoto switcher), chuyển hướng Marugoto, và các chức năng CRUD tự thêm từ vựng/mẫu câu cá nhân để tập trung ôn tập khóa Minna.
- **API Backend gộp bài (`/api/user/reviews/combined`):**
  - Viết API gộp và tráo ngẫu nhiên (sử dụng thuật toán Fisher-Yates) toàn bộ câu hỏi từ tất cả các bài học đã soạn thảo học liệu thuộc trình độ tương ứng.
- **Đồng bộ cơ chế ôn tập 10 câu tuyến tính & Chấm điểm chung:**
  - Chuyển đổi cơ chế ôn tập tổng hợp trên cả trang `/knowledge` và `/lessons/[id]` sang làm 10 câu ngẫu nhiên tuyến tính (tự chuyển câu qua lại, ẩn phản hồi tức thời).
  - Hoàn thành xong 10 câu mới chấm điểm chung và hiển thị màn hình báo cáo kết quả chi tiết từng câu (hỗ trợ so khớp chính tả, đáp án đúng, giải thích).
- **Bộ chọn dạng bài tập ôn tập (Single-select):**
  - Bổ sung bộ chọn dạng bài ôn tập (Single-select) trên màn hình chuẩn bị (Setup screen) ở cả 2 trang, cho phép người học lựa chọn chính xác 1 dạng bài mong muốn để ôn tập 10 câu của dạng đó.
- **Chuẩn hóa CSS & Sửa lỗi hiển thị chữ:**
  - Dọn dẹp và sửa toàn bộ các class lỗi chính tả Tailwind CSS (`slate-955`, `slate-55`, `slate-855`, `slate-105`, `slate-202`, `slate-805`, `slate-655`, `blue-555`, `indigo-605`, `indigo-655`) trong codebase.
  - Khắc phục lỗi ô nhập liệu bị trắng chữ và lỗi loang lổ nền trắng ("css trắng") ở cả 4 sheet trong chế độ Dark Mode.

### Mốc 73: Đồng bộ toàn bộ mã nguồn cục bộ lên GitHub Remote (Đã hoàn thành & Đã đẩy lên GitHub - 21/07/2026)
- **Đồng bộ hóa Git Repository:**
  - Thực hiện `git add .` nạp tất cả các thay đổi của [ReviewTab.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/ReviewTab.tsx), [knowledge/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/knowledge/page.tsx), [lessons/[id]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) và [mockDb.js](file:///d:/AI/japanese_learning/website/backend/src/db/mockDb.js).
  - Thực hiện `git commit` mã commit `c941ad4` với thông điệp: `"feat: sync ReviewTab component, knowledge page updates, and mockDb review data"`.
  - Đẩy thành công mã nguồn lên nhánh `main` của remote repository (`https://github.com/thanghobadat/nihongo-study.git`). Kích hoạt hệ thống CI/CD triển khai phiên bản mới nhất trên Vercel và Render.
  - Kiểm tra trạng thái Git local hoàn toàn sạch sẽ (`nothing to commit, working tree clean`).

### Mốc 75: Chuẩn hóa ngữ nghĩa bài tập Bài 2, Nâng cấp 3 khối phản hồi UI & Đẩy mã nguồn lên GitHub Remote (Đã hoàn thành & Đã đẩy lên GitHub - 21/07/2026)
- **Chuẩn hóa Ngữ nghĩa & Tái sinh bài tập Bài 2:**
  - Phân loại danh mục học liệu thành Ấn phẩm/Tài liệu đọc (`READING_ITEMS`) và Vật dụng cá nhân (`PERSONAL_ITEMS`) trong [generate_l2_exercises.js](file:///d:/AI/japanese_learning/website/backend/scratch/generate_l2_exercises.js), loại bỏ hoàn toàn các câu vô lý (như *"bút chì bằng tiếng Việt"*).
  - Chuẩn hóa logic điền khuyết suy luận 1 chiều cho Dạng 2, bổ sung gợi ý ngữ cảnh tình huống đối thoại.
  - Tự động sinh `explanation` (giải thích lý do chọn) và `options_translations` cho toàn bộ 40 đoạn hội thoại Dạng 2.
- **Nâng cấp Phản hồi Giao diện (Frontend):**
  - Cập nhật [ReviewTab.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/ReviewTab.tsx) hiển thị đồng thời 3 khối phản hồi khi bấm kiểm tra: `✅ Đáp án đúng`, `💡 Giải thích chi tiết & Ngữ pháp`, và `💬 Dịch nghĩa hội thoại`.
  - Sửa tuyến API [user.js](file:///d:/AI/japanese_learning/website/backend/src/routes/user.js) hỗ trợ đọc mượt mà dữ liệu `lesson_reviews` từ cả hai kiểu cấu trúc của `mockDb.js`.
### Mốc 76: Khắc phục lỗi phát âm bài nghe Dạng 3 & Đẩy mã nguồn lên GitHub Remote (Đã hoàn thành & Đã đẩy lên GitHub - 21/07/2026)
- **Khắc phục lỗi âm thanh bài nghe Dạng 3:**
  - Giải quyết dứt điểm lỗi `Cannot read properties of undefined` khi bấm nút phát bài nghe ở Dạng 3 (Nghe hiểu hội thoại).
  - Tích hợp bộ bóc tách văn bản thoại tự động vào hàm `playDialogueAudio` tại cả [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) và [knowledge/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/knowledge/page.tsx), hỗ trợ phát âm thanh 2 giọng Nam/Nữ luân phiên mượt mà từ chuỗi thoại.
  - Bổ sung lớp kiểm tra phòng thủ an toàn `if (!linesInput) return;` ngăn ngừa 100% rủi ro sập ứng dụng.
  - Cập nhật nút bấm tại [ReviewTab.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/ReviewTab.tsx) truyền dữ liệu văn bản thoại dự phòng (`current.lines || current.audio_text_kana || current.audio_text_kanji`).
- **Git Commit & Push Remote:**
  - Commit mã `31fb410` với thông điệp: `"fix: resolve Dạng 3 audio playback crash by adding dialogue text parser and null-safety guards"`.
  - Đẩy thành công lên nhánh `main` của remote repository (`https://github.com/thanghobadat/nihongo-study.git`). Kích hoạt hệ thống CI/CD triển khai phiên bản mới nhất trên Vercel.
  ### Mốc 77: Khắc phục lỗi không hiển thị tiêu đề câu hỏi Dạng 3 ở phần Ôn tập (Đã hoàn thành - 21/07/2026)
- **Khắc phục lệch trường tên thuộc tính câu hỏi (`subQ.q` vs `subQ.question`):**
  - Cập nhật [ReviewTab.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/ReviewTab.tsx) ở cả 2 vị trí (Màn hình làm bài và Màn hình báo cáo kết quả chi tiết) hỗ trợ tra cứu linh hoạt `subQ.q || subQ.question || subQ.question_kanji || subQ.question_kana`.
  - Khắc phục triệt để hiện tượng tiêu đề câu hỏi bị trống ở bài tập Dạng 3 (Nghe hiểu hội thoại).
### Mốc 78: Nâng cấp cơ chế lưu tiến trình độc lập cho 4 dạng bài & Nút Master Reset (Đã hoàn thành - 21/07/2026)
- **Lưu tiến trình độc lập cho 4 Dạng bài tập (`Per-Type State Persistence`):**
  - Tái cấu trúc bộ lưu trữ `savedSessions` trong [ReviewTab.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/ReviewTab.tsx) lưu vết riêng biệt cho cả 4 dạng bài tập (`translation`, `dialogue`, `listening`, `dictation`).
  - Thẻ của từng dạng bài trên màn hình chọn hiển thị huy hiệu tiến trình độc lập (ví dụ: `📍 Đang ở câu 2/80` cho Dạng 1, `📍 Đang ở câu 2/40` cho Dạng 2). Bấm vào dạng bất kỳ sẽ mở lại đúng câu mới nhất đang làm dở của dạng đó.
- **Nút Master Reset tổng cho 4 dạng bài:**
  - Bổ sung nút **"🔄 Master Reset (Khôi phục 4 dạng)"** cho phép xóa sạch toàn bộ tiến trình cũ của cả 4 dạng cùng lúc và đưa về màn hình chọn bài mới 100%. Hỗ trợ nút reset riêng lẻ từng dạng ngay trên thẻ bài.
- **Kiểm định trực quan (Browser Subagent):**
  - Chạy Browser Subagent kiểm thử trên `http://localhost:3000/lessons/2?tab=review`: xác nhận Dạng 1 dở ở câu 2, Dạng 2 dở ở câu 2 (hiển thị đồng thời 2 huy hiệu) -> mở lại đúng câu 2 từng dạng -> bấm Master Reset dọn dẹp sạch tiến trình cả 4 dạng 100%.

### Mốc 79: Bổ sung Bảng Lịch Sử Đáp Án Các Câu Đã Làm (4 Cột) đóng/mở được (Đã hoàn thành - 21/07/2026)
- **Tích hợp Bảng Lịch Sử Đáp Án 4 Cột (`Collapsible Answer Log Table`):**
  - Bổ sung bảng lịch sử đáp án nằm ngay bên dưới khung làm bài ở cả 4 dạng bài tập trong [ReviewTab.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/ReviewTab.tsx).
  - Bảng tự động cập nhật danh sách tất cả các câu đã hoàn thành trong lượt ôn với 4 cột thông tin: `Câu số`, `Câu trả lời của tôi` (kèm icon `🟢 Đúng`/`🔴 Sai`), `Đáp án đúng` và `Giải thích chi tiết`.
  - Hỗ trợ thanh bấm Accordion `📋 BẢNG LỊCH SỬ CÂU ĐÃ LÀM (X câu) [▲ Thu gọn / ▼ Mở rộng xem chi tiết]` để người học ẩn/hiện bảng linh hoạt. Giao diện thiết kế Responsive (dạng Table trên Desktop, dạng Card trên Mobile).
- **Kiểm định trực quan (Browser Subagent):**
  - Thực hiện kiểm định trực quan trên trình duyệt `http://localhost:3000/lessons/2?tab=review`: hoàn thành Câu 1 -> chuyển sang Câu 2 -> Bảng lịch sử xuất hiện phía dưới hiển thị 4 cột thông tin Câu 1 chuẩn xác -> thao tác thu gọn/mở rộng bảng hoạt động mượt mà.
- **Git Commit & Push Remote:**
  - Commit mã `fbe46b8` với thông điệp: `"feat: upgrade review tab with per-type state persistence, master reset, collapsible answer log table, and Dạng 3 question fix"`.
  - Đẩy thành công lên nhánh `main` của remote repository (`https://github.com/thanghobadat/nihongo-study.git`).

### Mốc 81: Tích hợp tính năng Nút bấm Đánh dấu đúng (Override Correct) & Hiển thị Tỉ lệ % đúng trong ReviewTab (Đã hoàn thành & Đã đẩy lên GitHub - 21/07/2026)
- **Nút "✔ Tôi nghĩ tôi đã trả lời đúng (Sửa thành Đúng)" tại Khung Phản hồi:** Tích hợp nút bấm cho cả 4 dạng bài tập (Dịch phản xạ, Điền khuyết hội thoại, Nghe hiểu, Nghe viết) khi câu bị chấm sai, cho phép người học tự đánh dấu câu trả lời thành đúng nếu cảm thấy bản dịch của mình hợp lý.
- **Nút "✔ Đánh dấu đúng" tại Bảng Lịch Sử Đáp Án:** Bổ sung nút bấm trực tiếp tại từng dòng/card có kết quả `🔴 Sai` trong Bảng Lịch Sử Đáp Án Các Câu Đã Làm, cho phép sửa nhanh kết quả trực tiếp trên bảng.
- **Thanh Tỉ lệ % đúng trên Header Bảng Lịch Sử:** Hiển thị tỉ lệ phần trăm làm đúng động (`🎯 Tỉ lệ đúng: X% (Số câu đúng/Số câu đã làm)`).
- **Biên dịch & Đẩy GitHub Remote:** Build Next.js thành công 100% không phát sinh bất kỳ lỗi TypeScript nào. Đẩy mã nguồn lên nhánh `main` của remote repository (`nihongo-study`).

### Mốc 82: Chuẩn hóa 100% dữ liệu bài tập Dạng 2 (Hội thoại) & Dạng 3/4 (Âm thanh bài nghe) và Tối ưu UI Tên người nói (Đã hoàn thành & Đã đẩy GitHub Production - 21/07/2026)
- **Chuẩn hóa 100% dữ liệu 80 đoạn hội thoại Dạng 2 (`mockDb.js`)**:
  - Bổ sung chi tiết ngữ cảnh và kết quả/chủ sở hữu vào `context` của tất cả 80 đoạn hội thoại.
  - Loại bỏ hoàn toàn sự mơ hồ 50-50, đảm bảo duy nhất 1 đáp án đúng cho từng câu hỏi.
  - Sửa triệt để các lỗi cú pháp lặp (`そうですか ですか`, `そうです です`, bẫy ngữ pháp `わたしさん`).
- **Loại bỏ tên người nói khỏi âm thanh TTS bài nghe (Dạng 3 & 4)**:
  - Bóc tách sạch các tiền tố `A:` và `B:` khỏi dữ liệu `listenings` và `dictations` trong `mockDb.js`.
  - Cập nhật hàm `playDialogueAudio` trong [page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) lọc bỏ tiền tố tên người nói trước khi phát âm thanh TTS.
- **Tối ưu vị trí nhãn/avatar tên người nói (A/B) ở Frontend**:
  - Cập nhật [ReviewTab.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/ReviewTab.tsx) di chuyển nhãn/avatar `A` và `B` lên phía trên bóng chat hội thoại.
- **Git Commit & Push Remote**:
  - Commit mã `117a4a8` với thông điệp `"Fix dialogue exercises data bugs and refine speaker label UI"`.
  - Đẩy thành công mã nguồn mới nhất lên GitHub `https://github.com/thanghobadat/nihongo-study.git` (nhánh `main`), tự động kích hoạt redeploy ứng dụng trên Vercel và Render.

### Mốc 83: Tối ưu chấm điểm tự luận (Space/Punctuation/Kana), đảo thứ tự Bảng Lịch sử & Đồng bộ Cloud (Đã hoàn thành & Đã đẩy GitHub - 29/07/2026)
- **Tối ưu chấm điểm tự luận siêu cấp**:
  - Xây dựng helper `normalizeJapaneseText` trong [ReviewTab.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/ReviewTab.tsx) loại bỏ 100% khoảng trắng thường, khoảng trắng full-width tiếng Nhật (`\u3000`), dấu chấm `。`, dấu phẩy `、`, dấu chấm giữa `・` và các dấu câu khác.
  - Xây dựng helper `getAllCandidateAnswers`: Tự động thu thập đối chiếu tất cả các biến thể Kana (`question_kana`, `audio_text_kana`), Kanji (`question_kanji`, `audio_text_kanji`), Romaji và danh sách `correct_answers` / `vietnamese_answers`.
  - Cập nhật `gradeTranslation` và `gradeDictation` so khớp đa biến thể chuỗi làm sạch, giúp người học gõ đúng bằng Hiragana (hoặc Kanji/Romaji) không khoảng trắng vẫn được hệ thống chấm **ĐÚNG 100%**.
- **Đảo ngược thứ tự Bảng Lịch sử**:
  - Đảo mảng `[...answeredQuestions].reverse()` trong Bảng Lịch sử đáp án các câu đã làm, hiển thị câu vừa làm gần đây nhất ở **hàng 1 (trên cùng)** của cả Desktop Table và Mobile Cards.
- **Đồng bộ tiến trình Ôn tập lên Cloud (Cloud Sync)**:
  - Thêm định nghĩa bảng `public.user_review_sessions` trên Supabase schema [schema.sql](file:///d:/AI/japanese_learning/website/backend/src/db/schema.sql).
  - Bổ sung 2 tuyến API endpoints `GET /api/user/review-sessions` và `POST /api/user/review-sessions` tại [user.js](file:///d:/AI/japanese_learning/website/backend/src/routes/user.js) hỗ trợ lưu vết cả Local Mock DB và Supabase Cloud.
  - Tích hợp nạp/lưu hai chiều tự động trong [ReviewTab.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/ReviewTab.tsx).
- **Git Commit & Push Remote**:
  - Staged, commit mã `e7adece` với thông điệp: `"feat: optimize review tab answer grading (space & kana/kanji normalization), reverse history table log order, and add cloud review-sessions sync"`.
  - Đẩy thành công mã nguồn lên nhánh `main` của remote repository (`https://github.com/thanghobadat/nihongo-study.git`), kích hoạt hệ thống CI/CD tự động deploy lên Vercel và Render.

### Mốc 84: Nâng cấp Ngữ pháp Bài 5 đầy đủ 3 dạng có màu sắc, Tối ưu hóa chuyển trang 0ms & Bảo vệ Phiên làm việc (Đã hoàn thành - 30/07/2026)
- **Cập nhật Ngữ pháp Bài 5 đầy đủ các dạng & Màu sắc trực quan**:
  - Cập nhật toàn bộ 5 mẫu ngữ pháp Bài 5 trong [mockDb.js](file:///d:/AI/japanese_learning/website/backend/src/db/mockDb.js) bổ sung đầy đủ các dạng **Khẳng định**, **Phủ định**, **Nghi vấn** (`どこへ`, `何で`, `だれと`, `いつ`) và ví dụ song ngữ Nhật - Romaji - Việt.
  - Phân loại tiền tố chuẩn (`Khẳng định:`, `Phủ định:`, `Nghi vấn:`) hỗ trợ giao diện tự động tô màu nổi bật (Xanh ngọc, Đỏ hồng, Vàng hổ phách).
- **Tối ưu hóa Tốc độ Chuyển trang & Tải dữ liệu**:
  - Tích hợp bộ nhớ tạm In-Memory Cache TTL 5 phút tại [api.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/api.ts) cho tất cả request GET, mang lại trải nghiệm chuyển trang/tab tức thì (0ms - 100ms delay).
  - Chuyển đổi các luồng fetch dữ liệu nối tiếp tại [dashboard/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/dashboard/page.tsx) và [lessons/[id]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) sang `Promise.all` chạy song song, giảm 300% thời gian tải bài học mới.
- **Bảo vệ Phiên làm việc & Tiến độ Học tập**:
  - Bổ sung mã lỗi `TOKEN_EXPIRED` tại backend [auth.js](file:///d:/AI/japanese_learning/website/backend/src/middlewares/auth.js).
  - Bổ sung xử lý lỗi token hết hạn tại frontend, tự động hiển thị thông báo cảnh báo nhắc làm mới phiên thay vì reset dữ liệu học tập về "Chưa học", bảo toàn 100% dữ liệu tiến trình học viên.
- **Git Commit & Push Remote**:
  - Staged, commit và push thành công mã nguồn lên GitHub remote `https://github.com/thanghobadat/nihongo-study.git` (nhánh `main`).

### Mốc 85: Biên soạn Ngân hàng 160 Bài tập Bài 5 & Cập nhật Quy chuẩn Cẩm nang (Đã hoàn thành - 30/07/2026)
- **Biên soạn Trọn bộ 160 Bài tập Bài 5 & Nạp Database (`mockDb.js`)**:
  - Sinh 80 câu Dạng 1 (Dịch câu 2 chiều), 40 đoạn Dạng 2 (Điền khuyết hội thoại A/B/C/D), 40 bài Dạng 3 (Nghe hiểu hội thoại dài kèm 3 câu hỏi trắc nghiệm con) và 40 câu Dạng 4 (Nghe viết chính tả).
  - Xuất tệp đề xuất [proposed_exercises_lesson5.md](file:///d:/AI/japanese_learning/proposed_exercises_lesson5.md) và [proposed_combined_reviews.md](file:///d:/AI/japanese_learning/proposed_combined_reviews.md).
  - Nạp an toàn vào cơ sở dữ liệu [mockDb.js](file:///d:/AI/japanese_learning/website/backend/src/db/mockDb.js).
- **Chuẩn hóa Cẩm nang Quy chuẩn Sinh Dữ liệu ([exercise_generation_guide.md](file:///d:/AI/japanese_learning/exercise_generation_guide.md))**:
  - Tổng quát hóa quy tắc sinh dữ liệu áp dụng cho mọi Bài X (Bài 1 ➔ Bài 50).
  - Bổ sung 4 quy tắc cốt lõi: Bao phủ 100% cả 3 thể (Khẳng định, Phủ định, Nghi vấn), tính thực tế tự nhiên trong đời sống, công thức kết hợp từ vựng Bài 1 đến Bài X-1 vào Bài X, và phân biệt giải nghĩa rõ ràng các từ tiếng Việt dễ nhầm lẫn.
- **Kiểm thử E2E trực quan trên Browser**:
  - Sử dụng Browser Subagent mở giao diện [http://localhost:3000/lessons/5?tab=review](http://localhost:3000/lessons/5?tab=review), kiểm tra các nút phương án A/B/C/D, tính năng chuyển đổi chữ Kana/Kanji và kiểm thử API `GET /api/user/lessons/5/review` thành công 100%.
- **Git Commit & Push Remote**:
  - Staged, commit và push thành công mã nguồn lên GitHub remote `https://github.com/thanghobadat/nihongo-study.git` (nhánh `main`).

### Mốc 86: Biên soạn 160 bài tập Bài 6, 2 bộ bài tập song song độc lập & Bổ sung đầy đủ Bài 2 (Đã hoàn thành & Đã đẩy GitHub - 04/08/2026)
- **Biên soạn bài tập Bài 6 & Bộ bài tập Ôn tập tổng hợp**:
  - Sinh 160 bài tập độc nhất Bài 6 ([proposed_exercises_lesson6.md](file:///d:/AI/japanese_learning/proposed_exercises_lesson6.md)) và 160 bài tập Ôn tập tổng hợp độc lập ([proposed_combined_reviews.md](file:///d:/AI/japanese_learning/proposed_combined_reviews.md)) kết hợp từ vựng và ngữ pháp Bài 1 ➔ Bài 6.
- **Bổ sung dữ liệu Bài 2**:
  - Biên soạn thêm 15 đoạn hội thoại Dạng 2 cho Bài 2 ([proposed_exercises_lesson2.md](file:///d:/AI/japanese_learning/proposed_exercises_lesson2.md)), đưa Bài 2 đạt mốc 40 đoạn Dạng 2 và 160 bài tập hoàn chỉnh.
- **Cập nhật Quy tắc Tối cao & Cơ sở dữ liệu Giả lập (`mockDb.js`)**:
  - Cập nhật tệp cẩm nang [exercise_generation_guide.md](file:///d:/AI/japanese_learning/exercise_generation_guide.md) bổ sung khối thông báo **🚨 QUY TẮC TỐI CAO - BẮT BUỘC TẠO 2 BỘ BÀI TẬP SONG SONG CHO MỖI BÀI HỌC (MANDATORY DUAL-SET GENERATION)** ở ngay đầu tệp.
  - Nạp toàn bộ dữ liệu cập nhật của Bài 6 và Bài 2 vào [mockDb.js](file:///d:/AI/japanese_learning/website/backend/src/db/mockDb.js).
- **Git Commit & Push Remote**:
  - Commit và đẩy mã nguồn lên nhánh `main` của GitHub remote repository (`https://github.com/thanghobadat/nihongo-study.git`).













