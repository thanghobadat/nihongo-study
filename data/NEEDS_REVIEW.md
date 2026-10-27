# DANH SÁCH MỤC CẦN DUYỆT TAY (NEEDS REVIEW)

Tệp này ghi nhận các trường hợp từ ngữ, ngữ pháp hoặc chữ Hán đặc thù trong quá trình chuẩn hóa dữ liệu JLPT N5 & N4.

---

## 1. Trạng Thái Tổng Quát
- **Tổng số lỗi kiểm toán còn lại**: **0 lỗi** (Tất cả 10 quy tắc kiểm toán đều đạt 100%).
- **Chữ Hán thiếu âm Hán Việt**: **0 chữ** (Toàn bộ 182 chữ Hán N5 và N4 bổ sung đều có âm Hán Việt chuẩn xác).
- **Từ vựng thiếu câu ví dụ**: **0 từ** (100% từ vựng đều có `japanese_example` và `example_meaning`).

---

## 2. Các Mục Lưu Ý Khi Sử Dụng Thực Tế

### 2.1 Chữ Kokuji (Chữ Hán do người Nhật sáng tạo): `畑` (Hatake)
- **Ký tự**: `畑` (Ruộng hoa màu, vườn rau).
- **Âm Hán Việt**: Chữ này là Quốc tự (Kokuji) do người Nhật ghép từ bộ Hỏa (火) và bộ Điền (田) để chỉ ruộng cạn (đối lập với ruộng lúa nước `田`). Trong từ điển Hán Việt thường mượn âm đọc là **ĐIỀN** hoặc **BÌNH/VƯỜN**. Hệ thống đang gán âm Hán Việt là `ĐIỀN`.

### 2.2 Các Cặp Từ Đồng Âm Khác Nghĩa (Được Giữ Lại Để Phân Biệt):
Hệ thống đã giữ lại và phân biệt rõ ràng bằng `kanji_word` cho các trường hợp:
1. `おきます`:
   - Bài 4 (id=139): `起きます` (Thức dậy - Chữ Khởi 起).
   - Bài 15 (id=722): `置きます` (Đặt, để đồ vật - Chữ Trí 置).
2. `とります`:
   - Bài 6 (id=263): `撮ります` (Chụp ảnh - Chữ Toát 撮).
   - Bài 14 (id=685): `取ります` (Lấy đồ vật - Chữ Thủ 取).
   - Bài 25 (id=1039): `取ります` (Thêm tuổi: 年を取ります - Chữ Thủ 取).
3. `かみ`:
   - Bài 7 (id=347): `紙` (Giấy - Chữ Chỉ 紙).
   - Bài 16 (id=765): `髪` (Tóc - Chữ Phát 髪).
4. `やすい`:
   - Bài 8 (id=391): `安い` (Rẻ - Chữ An 安).
   - Bài 44 (id=1839): `〜易い` (Dễ làm gì - Chữ Dịch 易).
5. `ところ`:
   - Bài 8 (id=407): `所` (Nơi chốn, địa điểm - Chữ Sở 所).
   - Bài 46 (id=1914): `所` (Đúng lúc, thời điểm diễn ra hành động).
6. `おく`:
   - Bài 10 (id=523): `奥` (Phía sâu bên trong - Chữ Áo 奥).
   - Bài 25 (id=1042): `億` (Một trăm triệu - Chữ Ức 億).
7. `ふきます`:
   - Bài 29 (id=1195): `拭きます` (Lau chùi - Chữ Thức 拭).
   - Bài 32 (id=1325): `吹きます` (Thổi gió - Chữ Xuy 吹).
8. `へん`:
   - Bài 29 (id=1214): `辺` (Vùng, khu vực lân cận - Chữ Biên 辺).
   - Bài 43 (id=1819): `変` (Kỳ lạ, bất thường - Chữ Biến 変).
9. `さします`:
   - Bài 29 (id=1222): `指します` (Chỉ giờ - Chữ Chỉ 指).
   - Bài 47 (id=1959): `差します` (Che ô, giương dù - Chữ Sai 差).
10. `しろ`:
    - Bài 34 (id=1434): `白` (Màu trắng - Chữ Bạch 白).
    - Bài 50 (id=2097): `城` (Lâu đài, thành trì - Chữ Thành 城).
11. `おりる / おります`:
    - Bài 16 (id=749): `降ります` (Xuống tàu xe - Chữ Hàng/Giáng 降).
    - Bài 34 (id=1419): `折ります` (Gấp, bẻ gãy - Chữ Chiết 折).
    - Bài 50 (id=2060): `おります` (Ở, có - Khiêm nhường ngữ của います).
12. `だします`:
    - Bài 13 (id=655): `出します` (Gửi thư).
    - Bài 16 (id=753): `出します` (Lấy ra, nộp báo cáo).
    - Bài 49 (id=2041): `出します` (Phát sốt: 熱を出します).
13. `でます`:
    - Bài 13 (id=657): `出ます` (Rời khỏi quán).
    - Bài 16 (id=755): `出ます` (Tốt nghiệp đại học).
    - Bài 23 (id=985): `出ます` (Ra tiền thừa).
    - Bài 46 (id=1921): `出ます` (Xuất phát xe).
14. `はいります`:
    - Bài 13 (id=656): `入ります` (Vào quán).
    - Bài 16 (id=754): `入ります` (Vào đại học).
    - Bài 17 (id=813): `入ります` (Tắm bồn: お風呂に入ります).
