# NHẬT KÝ XÁC THỰC VÀ ĐỒNG BỘ PRODUCTION (VERIFY LOG)

## 1. Thông Tin Cấu Hình Cơ Sở Dữ Liệu Production
- **SUPABASE_URL**: `https://bwkpcxpidtjqfyztvcly.supabase.co`
- **SUPABASE_SERVICE_ROLE_KEY**: `sb_secret_CyH-bI...sPz6owEw` *(Đã che phần thân mật khẩu/key an toàn)*
- **RENDER_BACKEND_URL**: `https://nihongo-flow-backend.onrender.com`
- **VERCEL_FRONTEND_URL**: `https://nihongo-study-frontend.vercel.app`

---

## 2. Báo Cáo Bước 0d: Vị Trí Dữ Liệu Của Lần Chạy Trước
- **Kết quả điều tra trong repo**:
  - Dữ liệu chuẩn hóa lần trước nằm trong:
    - [mockDb.js](file:///d:/AI/japanese_learning/website/backend/src/db/mockDb.js) (560 kanji, 2,030 vocab, 216 grammar)
    - [backup/](file:///d:/AI/japanese_learning/backup/) (các file json local)
    - [website/backend/src/db/migrations/001_add_jlpt_level_and_kanji_word.sql](file:///d:/AI/japanese_learning/website/backend/src/db/migrations/001_add_jlpt_level_and_kanji_word.sql)
  - **Lý do dữ liệu chưa xuất hiện trên Production**:
    - Lần chạy trước chỉ thực hiện `git push` mã nguồn lên nhánh `main`. Quá trình auto-seed trên Render gặp cảnh báo do các bảng Supabase production chưa chạy migration thêm cột `jlpt_level`.
    - Do đó, cơ sở dữ liệu Supabase Production vẫn giữ nguyên dữ liệu gốc (405 kanji với 27 trùng, 2,149 từ vựng với cột `kanji_word` rỗng, 206 mẫu ngữ pháp có lỗi chính tả).
  - **Cam kết tuân thủ**: Tuyệt đối không copy đè nguyên khối từ local lên production. Mọi thay đổi sẽ được thực hiện tuần tự, có kiểm tra API và validate sau từng bước.

---

## 3. Nhật Ký Thực Hiện Bước 0 (Sửa Lỗi Production)
- **0a. Fix `course-summary` 500 error**:
  - Tệp sửa: [website/backend/src/routes/user.js](file:///d:/AI/japanese_learning/website/backend/src/routes/user.js) dòng 472.
  - Sửa `grammarRes.data.map` $\rightarrow$ `grammarData.map` (lấy từ kết quả phân trang `fetchAllRows`).
- **0b. Fix `study-overview` đếm sai nguồn**:
  - Tệp sửa: [website/backend/src/routes/user.js](file:///d:/AI/japanese_learning/website/backend/src/routes/user.js) dòng 3052 & 3196.
  - Chuyển `totalVocab`, `totalKanji`, `totalGrammar` sang đếm trực tiếp từ Supabase Production Database (`vocabulary`, `kanji`, `grammar` thuộc Minna bài 0–50) khi `!req.user.isMock`.
- **0c. Khôi phục hiển thị Kanji ở Frontend**:
  - Tệp sửa: [website/frontend/src/app/utils/kanjiFormLookup.ts](file:///d:/AI/japanese_learning/website/frontend/src/app/utils/kanjiFormLookup.ts).
  - Khôi phục bảng tra `HIRAGANA_TO_KANJI` từ git history (commit `0a0bfce~1`) làm phương án fallback thứ 3 (sau `kanji_word` và `compounds`).
  - Đảm bảo từ vựng hiển thị chữ Hán đầy đủ cho người học trong khi chờ cập nhật DB.
- **Xác thực mã nguồn**:
  - Backend syntax check: `node --check website/backend/src/routes/user.js` $\rightarrow$ PASS.
  - Frontend Next.js build: `npm run build -w frontend` $\rightarrow$ PASS 17/17 routes.
