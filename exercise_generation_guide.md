# Cẩm nang Hướng dẫn Quy chuẩn Sinh Dữ liệu Bài tập Ôn tập Tổng hợp (Minna no Nihongo)

Cẩm nang này hướng dẫn AI Agent cách tìm kiếm tài liệu chuẩn sư phạm từ giáo trình Minna no Nihongo I & II và sử dụng AI để tự động biên soạn ngân hàng bài tập ôn tập tổng hợp (Review) chất lượng cao cho các bài học từ Bài 1 đến Bài 50.

---

## 1. Nguyên tắc Biên soạn Dữ liệu bài tập

Để đảm bảo chất lượng sư phạm và trải nghiệm học tập tốt nhất, AI Agent phải tuân thủ các nguyên tắc sau:

1. **Bám sát và tập trung vào kiến thức của bài học hiện tại**:
   - Mục tiêu cốt lõi của bài tập là ôn tập từ vựng và ngữ pháp mới của **chính bài học đó**.
   - Mọi câu hỏi, đoạn hội thoại, bài nghe, câu chính tả **bắt buộc phải chứa và kiểm tra ít nhất một điểm kiến thức cốt lõi (từ vựng hoặc ngữ pháp mới) của bài học hiện tại**.
   - Cho phép sử dụng các kiến thức nền (như từ nhân xưng, trợ từ, từ nối, tên người) của các bài học trước đó để làm phong phú ngữ cảnh và câu thoại. Tuyệt đối không sinh ra các câu ôn tập thuần túy chỉ có kiến thức cũ của các bài trước mà không chứa bất cứ kiến thức mới nào của bài học hiện tại.
   - Tuyệt đối không dùng các từ vựng, ngữ pháp của các bài học sau (ngoại trừ các danh từ riêng chỉ tên người, quốc gia hoặc công ty công nghệ quen thuộc).
2. **Bao phủ toàn diện (Coverage)**:
   - Ngân hàng câu hỏi phải bao phủ **100% các mẫu ngữ pháp** của bài học hiện tại.
   - Tối thiểu **80% từ vựng mới** của bài phải xuất hiện trong các câu hỏi.
3. **Độ đa dạng (Anti-repeat)**:
   - Biên soạn **chính xác 40 câu/đoạn hội thoại/bài nghe hoàn toàn độc nhất** cho mỗi dạng bài tập (Tổng cộng 160 bài tập cho mỗi bài học).
   - Tuyệt đối không sử dụng cơ chế nhân bản lặp chu kỳ (ví dụ: soạn 10 câu chuẩn rồi copy-paste lặp lại 4 lần cho đủ 40 câu). Mọi câu hỏi/đoạn hội thoại/bài nghe đều phải khác biệt về từ vựng, thông tin hoặc ngữ cảnh.
   - Thiết kế câu hỏi với nhiều ngữ cảnh đa dạng: trường học, công ty, đời sống hàng ngày, ga tàu, siêu thị...
4. **Hỗ trợ chấm điểm thông minh (Fuzzy Matching)**:
   - Các câu dịch tự luận tiếng Việt phải chứa danh sách đáp án đồng nghĩa (ngăn cách bởi dấu gạch đứng `|`), ví dụ: `Tôi là sinh viên | Tớ là sinh viên | Mình là học sinh`.
   - Đáp án dịch tiếng Nhật phải chấp nhận cả chữ viết kana thô và Romaji không dấu gạch ngang (ví dụ gõ `miraa san` hay `mirā san` đều được chấp nhận).
5. **Lưu trữ phiên bản Kana và Kanji song song**:
   - Để tránh làm rối giao diện bằng các dấu ngoặc đơn `(Kanji)`, các câu hỏi và kịch bản tiếng Nhật phải được lưu trữ dưới 2 phiên bản song song:
     - Phiên bản chữ Hán (`question_kanji` hoặc `text_kanji`): Chứa chữ Kanji thông thường (Ví dụ: `私は 会社員 です。`).
     - Phiên bản thuần Kana (`question_kana` hoặc `text_kana`): Chuyển đổi toàn bộ chữ Hán thành Hiragana/Katakana (Ví dụ: `わたしは かいしゃいん です。`).
   - Giao diện Frontend sẽ thiết kế nút chuyển đổi chế độ hiển thị (Script Mode Toggle: "Hiển thị Chữ Hán" / "Hiển thị Chữ Kana") giúp người học dễ dàng ôn tập theo nhu cầu riêng.
6. **Khử trùng lặp tuyệt đối (Zero Cross-Type Duplication)**:
   - Một câu tiếng Nhật cụ thể (ví dụ: `わたしは ミラー です。`) nếu đã dùng làm bài tập Dịch câu (Dạng 1) thì **không** được xuất hiện lại trong dạng Chính tả (Dạng 4), Điền khuyết (Dạng 2), hay Nghe hiểu (Dạng 3) của cùng bài học.
   - Nếu muốn sử dụng cùng một cấu trúc ngữ pháp (e.g. `N1 は N2 です`), bắt buộc phải hoán đổi các từ vựng khác nhau vào để tạo ra các câu khác biệt (ví dụ: thay đổi tên nhân vật, quốc tịch, tuổi, nghề nghiệp, công ty).
7. **Đúng đắn về ngữ pháp và ngữ nghĩa (Grammatical and Semantic Correctness)**:
   - Các câu tiếng Nhật và bản dịch tiếng Việt tương ứng phải hoàn toàn chính xác về mặt ngữ pháp sư phạm, tự nhiên và đúng cả về ngữ nghĩa trong đời sống thực tế.
   - Tuyệt đối tránh sinh ra các câu dịch cơ học, tối nghĩa, ngô nghê hoặc vô lý về mặt logic ngữ nghĩa (ví dụ: các thông tin tuổi tác, nghề nghiệp hay mối quan hệ phi thực tế trong bối cảnh cụ thể).

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
    - `audio_text_kana`: Kịch bản thuần Kana để phát âm TTS (nếu máy tính không đọc được Hán tự).
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

## 3. Định dạng Tệp đầu ra đề xuất

Khi sinh dữ liệu cho một bài học mới (ví dụ Bài X), AI Agent phải lưu trữ kết quả đề xuất vào tệp `proposed_exercises_lessonX.md` dưới cấu trúc Markdown chuẩn kèm mã code JSON để người học dễ dàng phê duyệt và lập trình viên dễ dàng tích hợp vào cơ sở dữ liệu.


---

## 4. Phân biệt Thư viện Ôn tập theo Bài & Ôn tập Tổng hợp và Quy định Sinh Dữ liệu Song song Bắt buộc

Để đảm bảo chất lượng giảng dạy và trải nghiệm luyện tập:
1. **Phần 1: Ôn tập theo bài (Per-Lesson Review - `lessonReviews` / `proposed_exercises_lessonX.md`)**:
   - Dùng riêng cho giao diện học từng bài (`/lessons/:id?tab=review`).
   - Bài tập kiểm tra sâu từ vựng và ngữ pháp của chính bài học đó.
2. **Phần 2: Ôn tập tổng hợp (Combined Review - `combinedReviews` / `proposed_combined_reviews.md`)**:
   - Dùng riêng cho giao diện Luyện tập tổng hợp trên toàn khoá học (`/knowledge?tab=review`).
   - Thư viện đề độc lập chuyên biệt giúp rèn luyện phản xạ liên bài học, tráo ngẫu nhiên độc lập hoàn toàn với bài tập của từng bài học.

### ⚠️ QUY ĐỊNH BẮT BUỘC KHI SINH BÀI TẬP (MANDATORY DUAL-PART GENERATION):
Mỗi khi người dùng yêu cầu sinh bài tập cho bất kỳ bài học mới nào (từ Bài 1 đến Bài 50), AI Agent **BẮT BUỘC PHẢI TẠO BÀI TẬP SONG SONG CHO CẢ 2 PHẦN**:
- **Tạo Phần 1 (Ôn tập theo bài)**: Biên soạn 160 bài tập độc nhất cho chính bài học đó, xuất tệp `proposed_exercises_lessonX.md` và nạp vào `mockDb.lessonReviews[X]`.
- **Tạo/Cập nhật Phần 2 (Ôn tập tổng hợp)**: Đồng thời biên soạn/bổ sung bộ bài tập ôn tập tổng hợp liên bài học mới tích hợp kiến thức của bài vừa tạo, xuất tệp `proposed_combined_reviews.md` và nạp vào `mockDb.combinedReviews`.
