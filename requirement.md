# ĐẶC TẢ YÊU CẦU DỰ ÁN NIHONGO FLOW (REQUIREMENT.MD)

Tài liệu này đặc tả yêu cầu chức năng (Functional Requirements) và yêu cầu phi chức năng cho trang web học tiếng Nhật **Nihongo Flow**, chuyển đổi trực quan từ cấu trúc tệp Excel tương tác (`tao_bai_tap.md`) sang kiến trúc ứng dụng Web Monorepo (Next.js & Express).

---

## 1. YÊU CẦU PHÂN HỆ FRONTEND (FE)
Frontend được xây dựng bằng **Next.js (App Router, TypeScript, Tailwind CSS)**, thiết kế theo triết lý **Mobile-First** (tối ưu hoàn toàn cho di động trước, sau đó co giãn tốt trên Desktop) sử dụng bảng màu **Navy hiện đại** (`#1F4E78`).

### 1.1. Trang Dashboard (Bảng Điều Khiển)
- **Biểu đồ tiến độ**: Hiển thị tổng số từ vựng/Kanji, số lượng đã học (`🟢 Đã thuộc`), và phần trăm tiến độ bằng thanh tiến độ trực quan hoặc biểu đồ tròn.
- **Menu điều hướng nhanh**: Liên kết chuyển nhanh sang các phân hệ: Từ Vựng, Chữ Hán, Ngữ Pháp, Flashcards, Hội Thoại, Luyện Tập.
- **Thiết lập mục tiêu (Target Tracking)**:
  - Cho phép người dùng chọn Ngày bắt đầu và Ngày hoàn thành (mặc định lộ trình 7 ngày).
  - Tự động tính toán: Tổng số ngày, số ngày đã trôi qua, thời gian còn lại, mục tiêu học mỗi ngày cần đạt.
  - Tự động hiển thị trạng thái: `🟢 Đạt mục tiêu` hoặc `🔴 Chậm X từ` (so sánh thực tế đã thuộc với chỉ tiêu luỹ kế hôm nay).
- **Bảng tự đánh giá**: Bộ chọn mức độ hiểu bài sau buổi học (5 mức: *Chưa đạt, Cần cố gắng, Khá, Tốt, Xuất sắc*) có thay đổi màu sắc trực quan tương ứng.

### 1.2. Trang Học Liệu (Từ Vựng - Chữ Hán - Ngữ Pháp)
- **Từ Vựng**:
  - Bảng danh sách từ vựng gồm: Hiragana/Katakana, Romaji, Nghĩa Việt, Từ loại, Ví dụ tiếng Nhật, Dịch ví dụ, Mẹo nhớ.
  - Phát âm: Nút bấm🔊 kích hoạt giọng đọc tiếng Nhật (sử dụng Web Speech API hoặc tích hợp TTS).
  - Hình ảnh: Hiển thị hình ảnh minh họa ghi nhớ (Mnemonic Card) kích thước đồng bộ.
  - Cập nhật trạng thái trực tiếp: Thay đổi dropdown (`Chưa học`, `Đang học`, `Đã thuộc`) và lưu vào cơ sở dữ liệu.
- **Chữ Hán (Kanji)**:
  - Hiển thị Kanji kích thước lớn (size 22+), số nét, Onyomi, Kunyomi, Âm Hán Việt, Ý nghĩa Việt, mẹo nhớ, và từ ghép ví dụ.
  - Nút phát âm Kanji và bộ cập nhật trạng thái học tập.
- **Ngữ Pháp**:
  - Danh sách cấu trúc ngữ pháp kèm: Mẫu câu, Ý nghĩa / Cách dùng, Công thức kết hợp, Ví dụ tiếng Nhật, Dịch ví dụ, Ghi chú mở rộng.
  - Tích hợp giọng đọc 🔊 cho từng câu ví dụ.

### 1.3. Phân Hệ Flashcards (Thẻ Nhớ Ôn Tập)
- **Bộ lọc phạm vi**: Cho phép giới hạn phạm vi thẻ ôn tập (từ Từ vựng A đến Từ vựng B).
- **Tương tác lật thẻ (Flip Card)**:
  - Mặt trước: Hiển thị chữ Hiragana cỡ lớn, căn giữa.
  - Mặt sau (hiển thị khi click): Hiện toàn bộ chi tiết (Romaji, Nghĩa Việt, Từ loại, Mẹo nhớ, Câu ví dụ).
- **Bộ điều hướng**: Nút bấm chuyển sang từ tiếp theo ngẫu nhiên (hoặc theo thứ tự) và nút phát âm âm thanh.

### 1.4. Phân Hệ Kaiwa (Luyện Hội Thoại Động)
- **Thiết lập nhân vật**: Người dùng chọn Tên Katakana, Quốc tịch, Nghề nghiệp, Tổ chức từ các menu dropdown HTML5 gọn gàng, được thiết kế responsive tối ưu hóa cho hiển thị trên màn hình di động.
- **Giao diện bong bóng thoại hai bên (Chat Bubble Layout)**: Bong bóng thoại được hiển thị hai bên (học viên đóng vai nằm ở phía bên phải với nền xanh-tím gradient, đối tác hội thoại nằm ở phía bên trái với nền xám slate) giúp việc theo dõi trực quan giống như các ứng dụng nhắn tin hiện đại.
- **Kịch bản động**: Nội dung hội thoại tự động thay đổi từ ngữ xưng hô, giới thiệu bản thân theo thông tin nhân vật đã chọn (áp dụng masking để tránh xung đột đè chuỗi tên quốc gia).
- **Phân tách & Thu gọn chủ đề (Accordions)**:
  - Các đoạn hội thoại được phân nhóm theo Chủ đề bài học (Ví dụ từ Bài 1 đến Bài 25).
  - Tiêu đề mỗi chủ đề hiển thị dưới dạng thanh Accordion có thể bấm để đóng/mở (thu gọn hoặc mở rộng) danh sách tin nhắn chat, hiển thị rõ ràng mũi tên trạng thái (`▲`/`▼`) để người dùng dễ theo dõi và tiết kiệm diện tích kéo trang.
- **Tương tác hiển thị**: 
  - Nút chuyển đổi ẩn/hiện phiên âm Romaji của toàn bài hội thoại.
  - Cột dịch nghĩa tiếng Việt hiển thị song song giúp đối chiếu.
  - Nút âm thanh 🔊 cho phép phát âm riêng biệt từng câu thoại chuẩn tiếng Nhật.


### 1.5. Phân Hệ Luyện Tập (Quiz - Tráo Đề)
- **Luyện từ vựng thông minh**:
  - Nút tráo đề: Ngẫu nhiên hóa thứ tự câu hỏi (không đổi thứ tự gốc của học liệu).
  - Ô nhập liệu câu trả lời (Hiragana/Katakana) màu vàng nhạt.
  - Chức năng tự động kiểm tra Đúng/Sai tức thì (Green cho Đúng, Red cho Sai) ngay khi người dùng gõ xong.
  - Cơ chế ẩn đáp án: Cột đáp án chính xác chỉ được hiển thị khi ô nhập liệu có dữ liệu (không hiển thị trước).
  - Tích hợp nút phát âm giọng đọc câu hỏi.

### 1.6. Phân Hệ Ôn Bảng Chữ Cái (Kana Review)
Trang ôn bảng chữ cái (`/kana`) giúp người học làm quen và rèn luyện phản xạ nhanh với bảng Hiragana & Katakana:
- **Bảng chữ cái tương tác (Kana Charts)**: Lưới chữ cái Hiragana/Katakana tương tác, hỗ trợ nghe phát âm, xem Mnemonics nhớ nhanh và đánh dấu từ đã thuộc đồng bộ lên đám mây.
- **Trắc nghiệm phản xạ (Speedrun)**: Trắc nghiệm phản xạ 10 giây chọn Romaji đúng, độ khó tăng dần khi giảm thời gian suy nghĩ sau mỗi 2 câu đúng liên tiếp, lưu và đồng bộ High Score lên cơ sở dữ liệu đám mây Supabase.
- **Trò chơi lật bài (Memory Match)**: Ghép cặp chữ Kana và phiên âm Romaji tương ứng, giao diện Glassmorphism Neon dễ thương với biểu tượng hoa anh đào `🌸` mặt sau thẻ, thẻ ghép đúng sẽ ẩn chữ cái và đổi màu xanh dương nhạt. Thêm tùy chọn giới hạn thời gian (dạng thanh trượt) và giảm 10% giờ bắt đầu của vòng chơi sau nếu chiến thắng.
- **Tập viết nét (Canvas Writing)**: Khung canvas cảm ứng đồ nét vẽ tay theo stroke order của chữ mẫu mờ. Chấm điểm % độ tương đồng dựa trên thuật toán lưới pixel `60x60` có bán kính lân cận Precision R=2, Recall R=3 và penalty chống vẽ bừa (1.8x).
- **Ôn chữ kết hợp (Combined Review)**:
  - Sử dụng kho dữ liệu **500 từ Kana kết hợp** phân chia theo 3 độ khó: Dễ (3 ~ 5 ký tự), Trung bình (6 ~ 9 ký tự), Khó (10 ~ 15 ký tự).
  - Người học nhìn từ tiếng Nhật (dạng Kana) kèm nghĩa tiếng Việt làm gợi ý và điền phiên âm Romaji để chấm điểm. So khớp tự động loại bỏ khoảng trắng (space) và chuyển về chữ thường để tránh chấm sai oan.
  - **Tô màu chi tiết lỗi sai**: Sau khi chấm điểm, hiển thị chi tiết các ký tự viết sai của từ chưa đúng 100%: Ký tự viết đúng tô màu xanh lá, ký tự viết sai tô màu đỏ kèm gạch dưới lượn sóng (hover hiện tooltip chữ đúng), ký tự viết thiếu hiển thị màu đỏ mờ kèm gạch ngang (hover báo thiếu chữ cái).

---

## 2. YÊU CẦU PHÂN HỆ BACKEND (BE) & DATABASE
Backend được xây dựng bằng **Express.js (Node.js)**, đảm bảo bảo mật và cung cấp dữ liệu cho Frontend qua API.

### 2.1. Quản Lý Dữ Liệu (Database - Supabase)
- **Bảng `lessons`**: Lưu thông tin bài học (ID, tiêu đề, mô tả).
- **Bảng `vocabulary`**: Lưu từ vựng (Hiragana, Romaji, nghĩa tiếng Việt, từ loại, ví dụ, dịch ví dụ, mẹo nhớ, hình ảnh).
- **Bảng `kanji`**: Lưu thông tin chữ Hán (chữ Hán, nét vẽ, Onyomi, Kunyomi, Hán Việt, ý nghĩa, mẹo nhớ, từ ghép).
- **Bảng `grammar`**: Lưu ngữ pháp (cấu trúc, ý nghĩa, cách dùng, ví dụ, dịch ví dụ, lưu ý).
- **Bảng `user_progress`**: Lưu trạng thái học tập cá nhân (mức độ thuộc từ, tiến độ học tập, cấu hình mục tiêu target trên Dashboard).

### 2.2. API Endpoints (Express Server)
- **GET `/api/lessons`**: Lấy danh sách bài học.
- **GET `/api/lessons/:id/vocabulary`**: Lấy danh sách từ vựng kèm hình ảnh minh họa và trạng thái học tập của user.
- **GET `/api/lessons/:id/kanji`**: Lấy danh sách chữ Hán của bài học.
- **GET `/api/lessons/:id/grammar`**: Lấy danh sách ngữ pháp của bài học.
- **POST/PUT `/api/user/progress`**: Lưu trữ/Cập nhật tiến độ học tập (trạng thái thuộc từ vựng/Kanji, đánh giá bài học, kế hoạch mục tiêu).

### 2.3. Bảo Mật & Tối Ưu Hóa (Security)
- **Bảo vệ API**: Sử dụng `helmet` để bảo vệ tiêu đề HTTP, `cors` cấu hình giới hạn chỉ cho phép tên miền Frontend được kết nối.
- **Giới Hạn Tần Suất (Rate Limiting)**: Áp dụng `express-rate-limit` (tối đa 100 requests/15 phút cho mỗi IP) để ngăn chặn tấn công DDoS/Brute-force và bảo vệ tài nguyên miễn phí.
- **Mã hóa mã nguồn (Chống Clone)**:
  - Cấu hình biến môi trường (`.env`) bảo mật cho API Keys của Supabase.
  - Sử dụng các API Endpoint trung gian của Express để truy vấn Database thay vì gọi trực tiếp từ client.
  - Không expose các thông tin nhạy cảm của bảng cơ sở dữ liệu ra client.

---

## 3. YÊU CẦU DEPLOY & HOÀN THIỆN
- **Frontend**: Triển khai lên Vercel (kết nối tự động qua GitHub để CD).
- **Backend**: Triển khai lên Render hoặc Supabase Edge Functions (Cơ chế miễn phí).
- **Database**: Sử dụng Cloud Database của Supabase (PostgreSQL free tier).
