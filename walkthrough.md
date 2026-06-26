# Kết quả Cải tiến: Trọng âm Cao độ (Pitch Accent) & Âm thanh Bản xứ (Native Audio)

Tôi đã hoàn thành việc tích hợp hiển thị trực quan Trọng âm cao độ tiếng Nhật (Pitch Accent) và nâng cấp hệ thống âm thanh bản xứ chất lượng cao từ LanguagePod101 kèm cơ chế fallback thông minh về TTS.

---

## 📸 Hình ảnh Minh họa & Video Xác minh

Dưới đây là hình ảnh và video quá trình chạy kiểm thử trực quan thông qua Browser Subagent:

### 1. Tab Từ vựng hiển thị đường cao độ (Pitch Accent Line)
Đường cao độ màu đỏ được vẽ liền mạch phía trên các ký tự Kana tương ứng với âm Cao (High) và có đường rơi đi xuống (border-right) tại vị trí Hạt nhân trọng âm ($N$).
Khi hover chuột vào từ vựng, một Tooltip xinh xắn sẽ hiển thị thông tin loại trọng âm (Heiban, Atamadaka, Nakadaka, Odaka) và mô tả tương ứng.

![Đường cao độ trên Tab Từ vựng](C:\Users\Admin\.gemini\antigravity-ide\brain\a7a75d4d-d388-4806-b6b2-9f7d7c2010f4\vocab_tab_accents_1782443604402.png)

### 2. Mặt sau thẻ nhớ Flashcards
Mặt sau thẻ nhớ Flashcards hiển thị rõ ràng đường cao độ kích thước lớn (size `lg`) kèm nút loa phát âm native. Nút loa này đã được cấu hình chống nổi bọt sự kiện (`e.stopPropagation()`) để tránh việc click vào loa làm lật thẻ ngược lại.

![Mặt sau Flashcard có trọng âm cao độ](C:\Users\Admin\.gemini\antigravity-ide\brain\a7a75d4d-d388-4806-b6b2-9f7d7c2010f4\flashcard_back_accent_1782443639755.png)

### 3. Video ghi lại quá trình kiểm thử tự động
Video ghi lại quá trình Browser Subagent truy cập trang bài học, kiểm tra hiển thị từ vựng và thao tác lật thẻ nhớ Flashcards:

![Video kiểm thử Pitch Accent và Audio](C:\Users\Admin\.gemini\antigravity-ide\brain\a7a75d4d-d388-4806-b6b2-9f7d7c2010f4\pitch_accent_verification_1782443584374.webp)

---

## 🛠️ Các thay đổi đã thực hiện

### 1. Phân hệ Backend (Cơ sở dữ liệu)
- **Tích hợp Pitch Accent vào mockDb**:
  - Sửa đổi [inject_marugoto_content.js](file:///d:/AI/japanese_learning/website/backend/scratch/inject_marugoto_content.js) để nạp cache trọng âm offline và tự động gán thuộc tính `pitch_accent` cho các từ vựng Marugoto khi chèn.
  - Chạy `generate_pitch_accent.js` để quét toàn bộ 931 từ vựng trong cơ sở dữ liệu `mockDb.js` (gồm 50 bài Minna và 18 bài Marugoto) và tra cứu tự động từ cơ sở dữ liệu Kanjium mở, tạo ra tệp cache [vocab_pitch_accent_cache.json](file:///d:/AI/japanese_learning/website/backend/src/db/vocab_pitch_accent_cache.json).
  - Khớp thành công 57.6% tổng số từ vựng (các từ còn lại không tìm thấy được mặc định là Heiban - 0).
  - Chạy seeding lại Marugoto để đồng bộ toàn bộ `mockDb.js`.

### 2. Phân hệ Frontend (Giao diện người dùng)
- **Thuật toán xử lý Morae**:
  - Tạo file helper [pitchAccentHelper.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/pitchAccentHelper.ts) chứa hàm `splitIntoMorae` sử dụng regex để bóc tách chính xác các Morae (bao gồm cả âm ghép như `きょ` là 1 mora).
  - Lập trình hàm `getPitchAccentStates` để xác định cao độ (High/Low) cho mỗi mora dựa vào chỉ số hạt nhân $N$.
- **Component Trực quan**:
  - Tạo component [PitchAccentDisplay.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/components/PitchAccentDisplay.tsx) chịu trách nhiệm render các ký tự Kana với đường border-top và border-right màu đỏ bắt mắt (`rose-500` / `rose-400` tương thích Dark Mode) kèm Tooltip chi tiết khi hover.
- **Phát âm thanh thông minh**:
  - Tạo file helper [audioHelper.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/audioHelper.ts) cung cấp hàm `playAudioWithFallback`. Hàm này tải file phát âm của người bản xứ từ LanguagePod101 qua URL HTTPS để đảm bảo bảo mật và tránh lỗi mixed content.
  - Nếu gặp lỗi tải (ví dụ từ vựng tùy chỉnh không có sẵn hoặc lỗi mạng), hàm tự động bắt sự kiện `error` hoặc kích hoạt chế độ dự phòng Web Speech API (TTS) sau 2 giây timeout.
- **Tích hợp giao diện bài học**:
  - Cập nhật [lessons/[id]/page.tsx](file:///d:/AI/japanese_learning/website/frontend/src/app/lessons/[id]/page.tsx) để thay thế hiển thị Hiragana bằng component `PitchAccentDisplay` trên:
    - **Tab Từ vựng** (các từ vựng mới, từ vựng bổ sung và từ vựng trùng lặp).
    - **Mặt sau thẻ nhớ Flashcards** (size lớn).
    - **Game phản xạ Speedrun** (câu hỏi tiếng Nhật).
  - Thay thế toàn bộ nút loa phát âm của từ vựng sang sử dụng `playAudioWithFallback`.

---

## 📈 Biên dịch & Xác minh
- Chạy biên dịch Next.js thành công (`npm run build`) và vượt qua toàn bộ kiểm tra kiểu tĩnh của TypeScript.
- Kiểm thử trực quan cho thấy đường vẽ trọng âm hiển thị sắc nét, tương phản tốt trên cả Light/Dark theme. Âm thanh bản xứ phát lập tức khi nhấn nút loa và tự động fallback mượt mà về giọng đọc TTS khi từ không có sẵn.
