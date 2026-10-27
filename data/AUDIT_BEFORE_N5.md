# BÁO CÁO KIỂM TOÁN DỮ LIỆU JLPT N5 BAN ĐẦU (AUDIT BEFORE)

> **Thời điểm kiểm toán**: 27/10/2026 15:54:00 (GMT+7)  
> **Cơ sở dữ liệu kiểm tra**: Supabase Production (`https://bwkpcxpidtjqfyztvcly.supabase.co`)  
> **API Server Production**: Render (`https://nihongo-flow-backend.onrender.com`)  
> **Phạm vi kiểm tra**: Bài 0 đến Bài 25 (Khung kiến thức trọng tâm JLPT N5)  
> **Công cụ thực hiện**: `npm run validate:n5` ([scripts/validate-n5.js](file:///d:/AI/japanese_learning/scripts/validate-n5.js))

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM TOÁN BAN ĐẦU

| Hạng mục | Hiện trạng Production | Tiêu chuẩn JLPT N5 yêu cầu | Đánh giá |
| :--- | :---: | :---: | :---: |
| **Tổng số lỗi phát hiện** | **1,243 lỗi** | **0 lỗi** | ❌ KHÔNG ĐẠT |
| **Trạng thái API `course-summary`** | Phụ thuộc biến chưa gán | HTTP 200, trả đủ dòng 50 bài | ❌ CẦN SỬA |
| **Trạng thái API `study-overview`** | Đọc `mockDb.js` (560/2030/216) | Đếm trực tiếp từ Supabase DB | ❌ SAI NGUỒN |
| **Tổng số chữ Hán (Bài 1–25)** | 205 chữ | Đủ 80 chữ N5 chuẩn, 0 trùng | ❌ THIẾU & TRÙNG |
| **Chữ Hán N5 đạt chuẩn** | 0 chữ | 80/80 chữ (100%) | ❌ THIẾU 38 CHỮ |
| **Chữ Hán trùng lặp** | 25 chữ (52 lượt) | 0 chữ | ❌ CẦN KHỬ TRÙNG |
| **Chữ Hán có Onyomi Katakana** | 188 / 205 (17 chữ Romaji) | 100% Katakana | ❌ SAI ĐỊNH DẠNG |
| **Tổng từ vựng (Bài 1–25)** | 1,046 từ | $\ge 650$ từ N5 | ❌ CHƯA GẮN NHÃN |
| **Từ vựng có `kanji_word`** | 11.9% (124/1046) | $\ge 70\%$ | ❌ MẤT DẠNG KANJI |
| **Từ vựng trùng lặp (Bài 1–25)** | 7 cặp trùng | 0 | ❌ CÓ TRÙNG LẶP |
| **Ngữ pháp Bài 1–25** | 108 mẫu (0 có `jlpt_level`) | 100% gắn N5, sạch Romaji | ❌ LỖI CHÍNH TẢ & ROMAJI |

---

## 2. CHI TIẾT CÁC LỖI KANJI (BÀI 1–25)

### 2.1. 25 Chữ Hán Trùng Lặp (52 Lượt Trùng Cần Khử Trùng)
- **`会`** (3 lần: ID 6 - Bài 1, ID 33 - Bài 3, ID 65 - Bài 6)
- **`時`** (3 lần: ID 20 - Bài 2, ID 37 - Bài 4, ID 194 - Bài 23)
- **`社`** (2 lần: ID 7 - Bài 1, ID 66 - Bài 6)
- **`本`** (2 lần: ID 10 - Bài 1, ID 12 - Bài 2)
- **`国`** (2 lần: ID 11 - Bài 1, ID 32 - Bài 3)
- **`書`** (2 lần: ID 14 - Bài 2, ID 62 - Bài 6)
- **`新`** (2 lần: ID 17 - Bài 2, ID 85 - Bài 8)
- **`聞`** (2 lần: ID 18 - Bài 2, ID 60 - Bài 6)
- **`車`** (2 lần: ID 23 - Bài 2, ID 54 - Bài 5)
- **`室`** (2 lần: ID 27 - Bài 3, ID 156 - Bài 15)
- **`食`** (2 lần: ID 28 - Bài 3, ID 57 - Bài 6)
- **`所`** (2 lần: ID 30 - Bài 3, ID 148 - Bài 15)
- **`屋`** (2 lần: ID 31 - Bài 3, ID 103 - Bài 10)
- **`電`** (2 lần: ID 36 - Bài 3, ID 141 - Bài 14)
- **`見`** (2 lần: ID 59 - Bài 6, ID 187 - Bài 21)
- **`物`** (2 lần: ID 64 - Bài 6, ID 178 - Bài 18)
- **`送`** (2 lần: ID 68 - Bài 7, ID 198 - Bài 24)
- **`借`** (2 lần: ID 70 - Bài 7, ID 200 - Bài 24)
- **`教`** (2 lần: ID 71 - Bài 7, ID 201 - Bài 24)
- **`紙`** (2 lần: ID 74 - Bài 7, ID 189 - Bài 21)
- **`度`** (2 lần: ID 136 - Bài 13, ID 176 - Bài 17)
- **`急`** (2 lần: ID 143 - Bài 14, ID 204 - Bài 25)
- **`服`** (2 lần: ID 154 - Bài 15, ID 190 - Bài 22)
- **`着`** (2 lần: ID 155 - Bài 15, ID 191 - Bài 22)
- **`考`** (2 lần: ID 182 - Bài 20, ID 202 - Bài 25)

### 2.2. 38 Chữ Hán N5 Còn Thiếu Trong Cơ Sở Dữ Liệu
Danh sách 38 chữ N5 chuẩn bị thiếu:
`口, 一, 十, 二, 中, 出, 三, 月, 五, 上, 東, 四, 金, 九, 入, 円, 外, 八, 六, 下, 七, 山, 北, 百, 川, 千, 水, 西, 土, 木, 南, 万, 毎, 白, 火, 右, 左, 休`

### 2.3. Chữ Hán Có Onyomi Thuần Romaji Cần Đổi Sang Katakana
17 chữ: `計:kei, 本:hon, 辞:ji, 書:sho, 雑:zatsu, 誌:shi, 新:shin, 聞:bun/mon, 鍵:ken, 傘:san, 車:sha, 語:go, 時:ji, 何:ka, 机:ki...`

---

## 3. CHI TIẾT CÁC LỖI TỪ VỰNG (BÀI 1–25)

1. **Thiếu trường `jlpt_level`**: 1,046 / 1,046 từ vựng chưa có giá trị nhãn JLPT (`null` hoặc thiếu cột).
2. **Thiếu trường `kanji_word`**: Tỷ lệ có chữ Hán chỉ đạt **11.9%** (chủ yếu là các từ katakana thuần), khiến 88.1% từ vựng trên giao diện bị mất dạng chữ Hán.
3. **Từ vựng trùng lặp trong Bài 1–25**:
   - `あいさつ [をします]` (Bài 1 & Bài 25)
   - `おっと` (Bài 2 & Bài 10)
   - `つま` (Bài 2 & Bài 10)
   - `しんぶん` (Bài 2 & Bài 6)
   - `てがみ` (Bài 7 & Bài 21)
   - `きっぷ` (Bài 5 & Bài 14)
   - `しゃしん` (Bài 7 & Bài 16)
4. **Thiếu từ vựng chuẩn N5**: Cần bổ sung các từ N5 phổ biến ngoài Minna vào Bài 0.

---

## 4. CHI TIẾT CÁC LỖI NGỮ PHÁP (BÀI 1–25)

1. **Lỗi chính tả tiếng Nhật**:
   - Mẫu ngữ pháp Bài 9 chứa `わかりますせん` thay vì `わかりません`.
2. **Cấu trúc chứa Romaji cấm**:
   - Các ký hiệu `V-ru`, `V-nai`, `V-te`, `A-i`, `N-da` xuất hiện trong hơn 30 mẫu ngữ pháp Bài 1–25.
3. **Thiếu giải thích và câu ví dụ chuẩn**:
   - Mẫu Bài 14 (`V-て + ください` phủ định chưa chính xác).
   - Mẫu Bài 18 (`V［dict-form］こと が できます` giải thích khả năng chưa rõ ràng).
   - Thiếu 3 bảng chia động từ nền tảng tại Bài 14 (thể て/た), Bài 17 (thể ない), Bài 18 (thể từ điển).

---

## 5. KẾT LUẬN & MỤC TIÊU BƯỚC TIẾP THEO

Toàn bộ 1,243 lỗi này đã được ghi nhận chi tiết làm thước đo mốc chuẩn (baseline).  
Mục tiêu sau khi hoàn thành các Bước 0, 1, 2, 3, 4: **0 LỖI (100% PASS)** trên toàn bộ Bài 0–25.
