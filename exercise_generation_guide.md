# Cẩm nang Hướng dẫn Quy chuẩn Sinh Dữ liệu Bài tập Ôn tập Tổng hợp (Minna no Nihongo)

Cẩm nang này hướng dẫn AI Agent cách tìm kiếm tài liệu chuẩn sư phạm từ giáo trình Minna no Nihongo I & II và sử dụng AI để tự động biên soạn ngân hàng bài tập ôn tập tổng hợp (Review) chất lượng cao cho các bài học từ Bài 1 đến Bài 50.

> [!IMPORTANT]
> 🚨 **QUY TẮC TỐI CAO - BẮT BUỘC TẠO 2 BỘ BÀI TẬP SONG SONG CHO MỖI BÀI HỌC (MANDATORY DUAL-SET GENERATION)**:
> Mỗi khi người dùng yêu cầu: *"Đọc file và tạo bài tập cho Bài XXX"* (từ Bài 1 đến Bài 50), AI Agent **BẮT BUỘC VÀ TỰ ĐỘNG PHẢI TẠO 2 BỘ BÀI TẬP SONG SONG ĐỘC LẬP** (Cả 2 bộ đều có giao diện render và cách xây dựng kết hợp từ vựng/ngữ pháp Bài 1 ➔ Bài XXX **GIỐNG HỆT NHAU**, chỉ khác nhau là 2 bộ câu hỏi hoàn toàn độc lập, khác biệt dùng cho 2 vị trí khác nhau):
>
> 1. **BỘ 1 (Bài tập theo Bài XXX)**:
>    - **Mục đích**: Dùng riêng cho màn hình học & ôn tập chi tiết của Bài XXX (`/lessons/XXX?tab=review`).
>    - **Số lượng**: 160 bài tập độc nhất kết hợp Bài 1 ➔ Bài XXX (80 câu Dịch, 40 đoạn Điền khuyết, 40 bài Nghe hiểu dài, 40 câu Chính tả).
>    - **Xuất tệp đề xuất**: `proposed_exercises_lessonXXX.md`
>    - **Nạp Database**: Nạp vào `mockDb.lessonReviews[XXX]` và `mockDb.lesson_reviews["XXX"]`.
>
> 2. **BỘ 2 (Bài tập Ôn tập tổng hợp liên bài)**:
>    - **Mục đích**: Dùng riêng cho trang Tổng hợp kiến thức (`/knowledge?tab=review`). Đây là bộ bài tập **ĐỘC LẬP CHUYÊN BIỆT KHÔNG TRÙNG LẶP CÂU HỎI VỚI BỘ 1**.
>    - **Số lượng**: 160 bài tập độc nhất kết hợp Bài 1 ➔ Bài XXX (80 câu Dịch, 40 đoạn Điền khuyết, 40 bài Nghe hiểu dài, 40 câu Chính tả).
>    - **Xuất tệp đề xuất**: `proposed_combined_reviews.md`
>    - **Nạp Database**: Nạp vào `mockDb.combinedReviews`.
>
> 📌 **Tóm tắt quy trình tự động**: Mỗi khi nghe lệnh tạo bài tập cho Bài XXX ➔ AI Agent tự động đọc cẩm nang này, biên soạn cả 2 bộ bài tập trên, xuất tệp `proposed_exercises_lessonXXX.md` và `proposed_combined_reviews.md`, nạp sạch vào `mockDb.js`, kiểm thử nạp module và báo cáo hoàn thành.

---

## 1. Nguyên tắc Biên soạn Dữ liệu bài tập

Để đảm bảo chất lượng sư phạm và trải nghiệm học tập tốt nhất, AI Agent phải tuân thủ các nguyên tắc sau:

1. **Bám sát và tập trung vào kiến thức của bài học hiện tại (Có kết hợp các bài học trước)**:
   - Mục tiêu cốt lõi của bài tập là ôn tập từ vựng và ngữ pháp mới của **chính bài học X đang biên soạn**.
   - Mọi câu hỏi, đoạn hội thoại, bài nghe, câu chính tả **bắt buộc phải chứa và kiểm tra ít nhất một điểm kiến thức cốt lõi (từ vựng hoặc ngữ pháp mới) của bài học X**.
   - **Tích cực kết hợp các từ vựng và ngữ pháp đã học từ các bài học trước đó (từ Bài 1 đến Bài X - 1)** để làm phong phú ngữ cảnh (ví dụ: khi biên soạn Bài X, có thể kết hợp linh hoạt kiến thức mốc thời gian, địa điểm, đồ vật hay danh xưng của các bài từ Bài 1 đến Bài X - 1). Tuyệt đối không sinh ra các câu ôn tập thuần túy chỉ có kiến thức cũ mà không chứa bất cứ kiến thức mới nào của bài học X.
   - Tuyệt đối không dùng các từ vựng, ngữ pháp của các bài học sau (ngoại trừ các danh từ riêng chỉ tên người, quốc gia hoặc công ty công nghệ quen thuộc).
2. **Bao phủ toàn diện (Coverage)**:
   - Ngân hàng câu hỏi phải bao phủ **100% các mẫu ngữ pháp** của bài học X hiện tại.
   - Tối thiểu **80% từ vựng mới** của bài X phải xuất hiện trong các câu hỏi.
3. **Độ đa dạng (Anti-repeat)**:
   - Biên soạn **chính xác 40 câu/đoạn hội thoại/bài nghe hoàn toàn độc nhất** cho mỗi dạng bài tập (Tổng cộng 160 bài tập cho mỗi bài học X).
   - Tuyệt đối không sử dụng cơ chế nhân bản lặp chu kỳ (ví dụ: soạn 10 câu chuẩn rồi copy-paste lặp lại 4 lần cho đủ 40 câu). Mọi câu hỏi/đoạn hội thoại/bài nghe đều phải khác biệt về từ vựng, thông tin hoặc ngữ cảnh.
   - Thiết kế câu hỏi với nhiều ngữ cảnh đa dạng: trường học, công ty, đời sống hàng ngày, ga tàu, siêu thị...
4. **Hỗ trợ chấm điểm thông minh & Phân biệt từ tiếng Việt dễ nhầm lẫn**:
   - Các câu dịch tự luận tiếng Việt phải chứa danh sách đáp án đồng nghĩa (ngăn cách bởi dấu gạch đứng `|`), ví dụ: `Tôi là sinh viên | Tớ là sinh viên | Mình là học sinh`.
   - **Phân biệt từ tiếng Việt dễ gây nhầm lẫn**: Với các từ tiếng Việt dễ bị nhầm lẫn nghĩa (ví dụ: *"Hôm kia"* là `おととい - ngày trước hôm qua` với *"Ngày kia"* là `あさって - ngày sau ngày mai`), đề bài tiếng Việt phải ghi rõ ngữ cảnh hoặc chú thích cụ thể (ví dụ: `Hôm kia (ngày trước hôm qua)`) để người học không bị nhầm lẫn khi làm bài dịch Việt ➔ Nhật.
   - Đáp án dịch tiếng Nhật phải chấp nhận cả chữ viết kana thô và Romaji không dấu gạch ngang (ví dụ gõ `miraa san` hay `mirā san` đều được chấp nhận).
5. **Lưu trữ phiên bản Kana và Kanji song song**:
   - Để tránh làm rối giao diện bằng các dấu ngoặc đơn `(Kanji)`, các câu hỏi và kịch bản tiếng Nhật phải được lưu trữ dưới 2 phiên bản song song:
     - Phiên bản chữ Hán (`question_kanji` hoặc `text_kanji`): Chứa chữ Kanji thông thường (Ví dụ: `私は 会社員 です。`).
     - Phiên bản thuần Kana (`question_kana` hoặc `text_kana`): Chuyển đổi toàn bộ chữ Hán thành Hiragana/Katakana (Ví dụ: `わたしは かいしゃいん です。`).
   - Giao diện Frontend sẽ thiết kế nút chuyển đổi chế độ hiển thị (Script Mode Toggle: "Hiển thị Chữ Hán" / "Hiển thị Chữ Kana") giúp người học dễ dàng ôn tập theo nhu cầu riêng.
6. **Khử trùng lặp tuyệt đối (Zero Cross-Type Duplication)**:
   - Một câu tiếng Nhật cụ thể (ví dụ: `わたしは ミラー です。`) nếu đã dùng làm bài tập Dịch câu (Dạng 1) thì **không** được xuất hiện lại trong dạng Chính tả (Dạng 4), Điền khuyết (Dạng 2), hay Nghe hiểu (Dạng 3) của cùng bài học.
   - Nếu muốn sử dụng cùng một cấu trúc ngữ pháp (e.g. `N1 は N2 です`), bắt buộc phải hoán đổi các từ vựng khác nhau vào để tạo ra các câu khác biệt (ví dụ: thay đổi tên nhân vật, quốc tịch, tuổi, nghề nghiệp, công ty).
7. **Đúng đắn về ngữ pháp, ngữ nghĩa và Tự nhiên trong thực tế (Grammatical and Semantic Naturalness)**:
   - Các câu tiếng Nhật và bản dịch tiếng Việt tương ứng phải hoàn toàn chính xác về mặt ngữ pháp sư phạm, tự nhiên, có ý nghĩa thực tế trong đời sống hàng ngày.
   - Tuyệt đối tránh sinh ra các câu dịch cơ học, tối nghĩa, ngô nghê, gượng ép hoặc không có ý nghĩa thực tế (ví dụ: thông tin tuổi tác hay mối quan hệ phi thực tế, hành động vô lý trong ngữ cảnh).
8. **Bao phủ đầy đủ các thể của tất cả mẫu câu (Mandatory Sentence Forms Coverage)**:
   - Khi biên soạn ngân hàng bài tập cho bất kỳ bài học nào, **bắt buộc phải bao phủ đầy đủ tất cả các thể (dạng câu) của tất cả mẫu câu ngữ pháp**:
     - **Thể Khẳng định (Affirmative)**
     - **Thể Phủ định (Negative)**
     - **Thể Nghi vấn / Câu hỏi (Interrogative)**
   - Tuyệt đối không được bỏ sót thể phủ định hay thể nghi vấn. Mọi dạng bài tập (Dịch câu, Điền khuyết hội thoại, Nghe hiểu, Chính tả) phải thiết kế phân bổ đồng đều cả 3 thể để học viên rèn luyện phản xạ toàn diện.

---

## 2. Đặc tả Chi tiết 4 Dạng Bài tập

### 📝 Dạng 1: Dịch câu hai chiều (80 câu)
*   **Cấu trúc**: Gồm **40 câu dịch Nhật ➔ Việt** và **40 câu dịch Việt ➔ Nhật** (Tổng cộng 80 câu).
*   **Yêu cầu dữ liệu**:
    - `direction`: `'ja-to-vi'` hoặc `'vi-to-ja'`.
    - `question`: Câu hỏi bằng tiếng Việt hoặc tiếng Nhật.
    - `answers`: Mảng chứa các đáp án đồng nghĩa được chấp nhận.
*   **Mẫu dữ liệu đề xuất**:
    ```json
    {
      "id": 1,
      "direction": "ja-to-vi",
      "question_kana": "わたしは FPT の しゃいん です。",
      "question_kanji": "私は FPT の 社員 です。",
      "answers": [
        "Tôi là nhân viên công ty FPT",
        "Tôi là nhân viên của FPT",
        "Tớ là nhân viên FPT"
      ]
    }
    ```

### 🧩 Dạng 2: Hoàn thiện đoạn hội thoại (40 đoạn)
*   **Cấu trúc**: Mỗi đoạn hội thoại gồm 2-4 lượt thoại giữa các nhân vật (A và B). Có tối thiểu 1 và tối đa 3 ô trống ký hiệu là `[blank1]`, `[blank2]`.
*   **Yêu cầu dữ liệu**:
    - `context`: Ngữ cảnh của cuộc đối thoại.
    - `lines`: Mảng các câu thoại, mỗi câu chứa song song bản Kana và bản Kanji.
    - `blanks`: Đối tượng chứa đáp án đúng và 3 phương án nhiễu cho từng ô trống.
*   **Mẫu dữ liệu đề xuất**:
    ```json
    {
      "id": 1,
      "context": "Hỏi thăm quốc tịch",
      "lines": [
        { 
          "speaker": "A", 
          "text_kana": "ミラーさんは アメリカ[blank1]きましたか。",
          "text_kanji": "ミラーさんは アメリカ[blank1]来ましたか。" 
        },
        { 
          "speaker": "B", 
          "text_kana": "はい、アメリカから[blank2]。",
          "text_kanji": "はい、アメリカから[blank2]。" 
        }
      ],
      "blanks": {
        "blank1": { 
          "correct": "から", 
          "options": ["から", "の", "は", "も"],
          "options_translations": {
            "から": "từ (địa điểm/thời gian)",
            "の": "của / thuộc về (sở hữu/quan hệ)",
            "は": "là (trợ từ chủ ngữ)",
            "も": "cũng (trợ từ tương đồng)"
          }
        },
        "blank2": { 
          "correct": "きました", 
          "options": ["きました", "です", "でした", "じゃありません"],
          "options_translations": {
            "きました": "đã đến (quá khứ của 来ます)",
            "です": "là (thì hiện tại lịch sự)",
            "でした": "đã là (quá khứ của です)",
            "じゃありません": "không phải là (phủ định hiện tại)"
          }
        }
      }
    }
    ```

### 🎧 Dạng 3: Nghe hiểu đoạn văn/đối thoại dài (40 bài nghe)
*   **Cấu trúc**: Một đoạn văn tự giới thiệu hoặc một cuộc đối thoại dài 3-5 câu tiếng Nhật (TTS phát âm 2 giọng đối thoại Nam/Nữ cách nhau 0.8s). Kèm theo **3 câu hỏi trắc nghiệm con** bằng tiếng Việt.
*   **Yêu cầu dữ liệu**:
    - `audio_text_kana`: Kịch bản thuần Kana để phát âm TTS.
    - `audio_text_kanji`: Kịch bản chữ Hán hiển thị đối chiếu.
    - `questions`: Mảng 3 câu hỏi trắc nghiệm con, mỗi câu gồm câu hỏi `q`, mảng 4 phương án `options` và đáp án đúng `correct`.
*   **Mẫu dữ liệu đề xuất**:
    ```json
    {
      "id": 1,
      "audio_text_kana": "A: はじめまして。ナムです。ベトナムから きました。どうぞよろしく。 B: はじめまして。ミラーです。わたしは アメリカの がくせいです。よろしくおねがいします。",
      "audio_text_kanji": "A: 初めまして。ナムです。ベトナムから来ました。どうぞよろしく。 B: 初めまして。ミラーです。私はアメリカの学生です。よろしくおねがいします。",
      "questions": [
        {
          "q": "Nam là người nước nào?",
          "options": ["Việt Nam", "Mỹ", "Nhật Bản", "Hàn Quốc"],
          "correct": "Việt Nam"
        }
      ]
    }
    ```

### ✍️ Dạng 4: Nghe viết chính tả (40 câu)
*   **Cấu trúc**: 40 câu tiếng Nhật hoàn chỉnh từ ngắn đến dài (có phát âm TTS).
*   **Yêu cầu dữ liệu**:
    - `question_audio`: Câu tiếng Nhật thô để TTS phát âm.
    - `correct_answers`: Mảng chứa các câu gõ lại đúng (bằng Hiragana thô hoặc Romaji sạch).
*   **Mẫu dữ liệu đề xuất**:
    ```json
    {
      "id": 1,
      "question_audio": "あの人はだれですか",
      "correct_answers": [
        "あのひとはだれですか",
        "ano hito wa dare desu ka"
      ]
    }
    ```

---

## 3. Phân biệt Thư viện Ôn tập theo Bài & Ôn tập Tổng hợp và Quy định Sinh Dữ liệu Song song Bắt buộc

1. **Phần 1: Ôn tập theo bài (Per-Lesson Review - `lessonReviews` / `proposed_exercises_lessonX.md`)**:
   - Dùng riêng cho giao diện học từng bài (`/lessons/:id?tab=review`).
   - Bài tập kiểm tra sâu từ vựng và ngữ pháp của chính bài học đó.
2. **Phần 2: Ôn tập tổng hợp (Combined Review - `combinedReviews` / `proposed_combined_reviews.md`)**:
   - Dùng riêng cho giao diện Luyện tập tổng hợp trên toàn khoá học (`/knowledge?tab=review`).
   - Thư viện đề độc lập chuyên biệt giúp rèn luyện phản xạ liên bài học.

### ⚠️ QUY ĐỊNH BẮT BUỘC KHI SINH BÀI TẬP (MANDATORY DUAL-PART GENERATION):
Mỗi khi người dùng yêu cầu sinh bài tập cho bất kỳ bài học mới nào (từ Bài 1 đến Bài 50), AI Agent **BẮT BUỘC PHẢI TẠO BÀI TẬP SONG SONG CHO CẢ 2 PHẦN**:
- **Tạo Phần 1 (Ôn tập theo bài)**: Biên soạn 160 bài tập độc nhất cho chính bài học đó (bao phủ 100% Khẳng định, Phủ định, Nghi vấn), xuất tệp `proposed_exercises_lessonX.md` và nạp vào `mockDb.lessonReviews[X]`.
- **Tạo/Cập nhật Phần 2 (Ôn tập tổng hợp)**: Đồng thời biên soạn/bổ sung bộ bài tập ôn tập tổng hợp liên bài học mới tích hợp kiến thức của bài vừa tạo, xuất tệp `proposed_combined_reviews.md` và nạp vào `mockDb.combinedReviews`.
