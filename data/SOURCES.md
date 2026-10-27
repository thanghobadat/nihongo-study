# NGUỒN DỮ LIỆU CHUẨN (DATA SOURCES)

Dự án Nihongo Flow tuân thủ nghiêm ngặt nguyên tắc **"Không bịa dữ liệu tiếng Nhật"**, toàn bộ cách đọc, nét viết, chữ Hán và dạng Kanji của từ vựng được tra cứu và đối chiếu từ các nguồn dữ liệu từ điển mã nguồn mở chuẩn quốc tế:

---

## 1. Dữ Liệu Chữ Hán (Kanji)
- **KANJIDIC2 & KanjiAPI**:
  - API endpoint: `https://kanjiapi.dev/v1/kanji/{character}`
  - Cung cấp: Số nét (`stroke_count`), âm đọc Onyomi (`on_readings`), Kunyomi (`kun_readings`), nghĩa gốc tiếng Anh (`meanings`), cấp độ JLPT chính thức.
  - Định dạng chuẩn hóa: `コク (koku)`, `たべ(る) (tabe(ru))`.
- **Âm Hán Việt (Sino-Vietnamese)**:
  - Tra cứu từ kho dữ liệu âm Hán Việt chuẩn Wiktionary tiếng Việt và Từ điển Thiều Chửu.
- **Danh sách phân định chuẩn JLPT N5 & N4**:
  - **N5 (80 chữ)**: `分口目手足耳日一国会人年大十二本中長出三時行見月後前生五間上東四今金九入学高円子外八六下来気小七山話女北午百書先名川千水半男西電校語土木聞食車何南万毎白天母火右読友左休父雨`
  - **N4 (287 chữ)**: `悪安暗医意育員院飲運泳駅央横屋温化荷界開階寒感漢館岸起期客究急級宮球去橋業曲局銀区苦具君係軽血決研県庫湖向幸港号根祭皿仕死使始指歯詩次事持式実写者主守取酒受州拾終習集住重宿所暑助昭消商章勝乗植申身神真深進世整昔全相送想息速族他打対待代第題炭短談着注柱丁帳調追定庭笛鉄転都度投豆島湯登等動童農波配倍箱畑発反板悲皮美鼻筆氷表秒病品負部服福物平返勉放味命面問役薬由油有遊予羊洋葉陽様落流旅両緑礼列練路和言切明計室広通帰引数試験弱変信教強近週多少早遠買売古新好私兄姉弟妹家春夏秋冬朝昼夜犬猫魚肉茶牛花鳥町村森林空海道紙文字英知思考答作働歩走止立閉貸借洗降泊頭顔体心声用台風雪晴色歌音楽理料特別同自社地合市内方回場員`
  - **Trường hợp đặc biệt**: Hai chữ `業` (Bài 31) và `回` (Bài 35) thuộc phạm vi từ vựng N4 trong Minna nhưng được giữ nhãn `N5` theo quy định tại mục 1.2e.

---

## 2. Dữ Liệu Từ Vựng (Vocabulary)
- **JMdict & Jisho API**:
  - API endpoint: `https://jisho.org/api/v1/search/words?keyword={hiragana}`
  - Cung cấp dạng chữ Hán (`kanji_word`) phổ biến nhất (`is_common: true`).
  - Từ thuần Katakana hoặc không có Kanji được để trống (`""`) chuẩn xác.
  - Các tiền tố/hậu tố (`～`, `［ ］`, `（ ）`) được bóc tách trước khi tra và ghép lại sau khi hoàn tất.
- **Phân định cấp độ JLPT cho Từ vựng**:
  - Bài 1 – 25: Gán nhãn `N5`.
  - Bài 26 – 50: Gán nhãn `N4`.

---

## 3. Dữ Liệu Ngữ Pháp (Grammar)
- Giáo trình chuẩn **Minna no Nihongo Shokyu I & II** (Bản dịch và Giải thích Ngữ pháp tiếng Việt).
- Bổ sung 4 bảng chia động từ chuẩn mực (Thể て/た, Thể ない, Thể từ điển V-る, Thể thông thường 普通形).
- Bổ sung 8 mẫu ngữ pháp N4 trọng tâm thường xuất hiện trong đề thi JLPT N4:
  1. `V-る / V-ない + ことにします` (Bài 31)
  2. `V-る / V-ない + ことになりました` (Bài 31)
  3. `V-て + ほしいです` (Bài 41)
  4. `〜らしい` (Bài 47)
  5. `〜みたい` (Bài 47)
  6. `V (bỏ ます) + なさい` (Bài 33)
  7. `V-ないで / V-ずに` (Bài 34)
  8. `Thể sai khiến bị động (V-させられる)` (Bài 48)
- **Phân định cấp độ JLPT cho Ngữ pháp**:
  - Bài 1 – 25: Gán nhãn `N5`.
  - Bài 26 – 50: Gán nhãn `N4`.
