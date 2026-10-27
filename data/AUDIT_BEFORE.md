# Báo Cáo Kiểm Toán Dữ Liệu (13:57:02 27/10/2026)

- **Nguồn dữ liệu**: `D:\AI\japanese_learning\website\backend\src\db\mockDb.js`
- **Tổng số từ vựng**: 2087
- **Tổng số chữ Hán**: 405
- **Tổng số mẫu ngữ pháp**: 204
- **Tổng số lỗi phát hiện**: **2516** lỗi

## 1. Phân Loại Lỗi Theo Tiêu Chí

| Quy tắc kiểm toán | Số lượng lỗi | Mô tả |
|---|---:|---|
| `VOCAB_EXAMPLE_MISSING_WORD` | 1549 | VOCAB_EXAMPLE_MISSING_WORD |
| `DUPLICATE_VOCAB_HIRAGANA_MEANING` | 12 | DUPLICATE_VOCAB_HIRAGANA_MEANING |
| `FORBIDDEN_JP_PATTERN` | 2 | FORBIDDEN_JP_PATTERN |
| `KANJI_MISSING_JLPT_LEVEL` | 405 | KANJI_MISSING_JLPT_LEVEL |
| `KANJI_COMPOUND_MISSING_CHAR` | 4 | KANJI_COMPOUND_MISSING_CHAR |
| `DUPLICATE_KANJI_CHARACTER` | 27 | DUPLICATE_KANJI_CHARACTER |
| `KANJI_COMPOUND_FORMAT` | 3 | KANJI_COMPOUND_FORMAT |
| `KANJI_N5_MISSING_FROM_TABLE` | 38 | KANJI_N5_MISSING_FROM_TABLE |
| `KANJI_N4_MISSING_FROM_TABLE` | 144 | KANJI_N4_MISSING_FROM_TABLE |
| `GRAMMAR_FORBIDDEN_LATIN` | 328 | GRAMMAR_FORBIDDEN_LATIN |
| `GRAMMAR_EXAMPLE_TOO_SHORT` | 4 | GRAMMAR_EXAMPLE_TOO_SHORT |

## 2. Bảng Thống Kê Theo Bài Học

| Bài | Từ vựng | Chữ Hán | Ngữ pháp | Lỗi phát hiện |
|---:|---:|---:|---:|---:|
| Bài 1 | 47 | 11 | 5 | 45 |
| Bài 2 | 45 | 15 | 6 | 48 |
| Bài 3 | 45 | 10 | 7 | 45 |
| Bài 4 | 61 | 10 | 6 | 71 |
| Bài 5 | 55 | 10 | 5 | 53 |
| Bài 6 | 59 | 10 | 6 | 64 |
| Bài 7 | 52 | 10 | 5 | 46 |
| Bài 8 | 64 | 10 | 5 | 70 |
| Bài 9 | 46 | 10 | 5 | 47 |
| Bài 10 | 50 | 10 | 4 | 57 |
| Bài 11 | 62 | 10 | 5 | 58 |
| Bài 12 | 46 | 10 | 5 | 56 |
| Bài 13 | 41 | 10 | 4 | 45 |
| Bài 14 | 41 | 10 | 3 | 43 |
| Bài 15 | 27 | 10 | 3 | 39 |
| Bài 16 | 43 | 10 | 3 | 52 |
| Bài 17 | 37 | 10 | 3 | 47 |
| Bài 18 | 27 | 2 | 3 | 31 |
| Bài 19 | 29 | 2 | 3 | 26 |
| Bài 20 | 31 | 5 | 3 | 30 |
| Bài 21 | 36 | 4 | 3 | 34 |
| Bài 22 | 29 | 4 | 3 | 29 |
| Bài 23 | 29 | 4 | 4 | 39 |
| Bài 24 | 20 | 4 | 3 | 28 |
| Bài 25 | 18 | 4 | 4 | 27 |
| Bài 26 | 41 | 8 | 5 | 47 |
| Bài 27 | 49 | 8 | 5 | 56 |
| Bài 28 | 45 | 8 | 4 | 48 |
| Bài 29 | 45 | 8 | 4 | 52 |
| Bài 30 | 48 | 8 | 4 | 53 |
| Bài 31 | 37 | 8 | 4 | 49 |
| Bài 32 | 52 | 8 | 4 | 50 |
| Bài 33 | 49 | 8 | 4 | 56 |
| Bài 34 | 45 | 8 | 3 | 48 |
| Bài 35 | 40 | 8 | 4 | 49 |
| Bài 36 | 43 | 8 | 4 | 55 |
| Bài 37 | 42 | 8 | 4 | 52 |
| Bài 38 | 33 | 8 | 4 | 44 |
| Bài 39 | 38 | 8 | 4 | 48 |
| Bài 40 | 52 | 8 | 4 | 60 |
| Bài 41 | 52 | 8 | 4 | 50 |
| Bài 42 | 48 | 8 | 4 | 46 |
| Bài 43 | 27 | 8 | 4 | 34 |
| Bài 44 | 41 | 8 | 4 | 44 |
| Bài 45 | 34 | 8 | 3 | 39 |
| Bài 46 | 35 | 8 | 3 | 40 |
| Bài 47 | 39 | 8 | 3 | 44 |
| Bài 48 | 31 | 8 | 4 | 41 |
| Bài 49 | 40 | 8 | 4 | 49 |
| Bài 50 | 41 | 8 | 4 | 48 |

## 3. Chi Tiết Danh Sách Lỗi (Mẫu 50 lỗi đầu tiên)

1. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=1 (わたし, bài 1) không chứa hiragana ("わたし") lẫn kanji_word (""): "私は ミラー です。"
2. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=3 (あのひと, bài 1) không chứa hiragana ("あのひと") lẫn kanji_word (""): "あの人は だれ ですか。"
3. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=4 (あのかた, bài 1) không chứa hiragana ("あのかた") lẫn kanji_word (""): "あの方は どなた ですか。"
4. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=5 (せんせい, bài 1) không chứa hiragana ("せんせい") lẫn kanji_word (""): "ワットさんは 先生 です。"
5. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=6 (きょうし, bài 1) không chứa hiragana ("きょうし") lẫn kanji_word (""): "私は 教師 です。"
6. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=7 (がくせい, bài 1) không chứa hiragana ("がくせい") lẫn kanji_word (""): "サントスさんは 学生 です。"
7. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=8 (かいしゃいん, bài 1) không chứa hiragana ("かいしゃいん") lẫn kanji_word (""): "ミラーさんは 会社員 です。"
8. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=9 (しゃいん, bài 1) không chứa hiragana ("しゃいん") lẫn kanji_word (""): "私は IMCの 社員 です。"
9. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=10 (ぎんこういん, bài 1) không chứa hiragana ("ぎんこういん") lẫn kanji_word (""): "山川さんは 銀行員 です。"
10. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=11 (いしゃ, bài 1) không chứa hiragana ("いしゃ") lẫn kanji_word (""): "あの人は 医者 です。"
11. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=12 (けんきゅうしゃ, bài 1) không chứa hiragana ("けんきゅうしゃ") lẫn kanji_word (""): "イーさんは 研究者 です。"
12. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=14 (だいがく, bài 1) không chứa hiragana ("だいがく") lẫn kanji_word (""): "ここは さくら 大学 です。"
13. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=15 (びょういん, bài 1) không chứa hiragana ("びょういん") lẫn kanji_word (""): "あそこは 神戸 病院 です。"
14. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=16 (でんき, bài 1) không chứa hiragana ("でんき") lẫn kanji_word (""): "パワー 電気の 社員 です。"
15. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=17 (だれ, bài 1) không chứa hiragana ("だれ") lẫn kanji_word (""): "あの人は 誰 ですか。"
16. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=19 (さい, bài 1) không chứa hiragana ("さい") lẫn kanji_word (""): "私は 28 歳 です。"
17. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=20 (なんさい, bài 1) không chứa hiragana ("なんさい") lẫn kanji_word (""): "お子さんは 何歳 ですか。"
18. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=23 (はじめまして, bài 1) không chứa hiragana ("はじめまして") lẫn kanji_word (""): "初めまして、ミラー です。"
19. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=24 (からきました, bài 1) không chứa hiragana ("からきました") lẫn kanji_word (""): "ベトナム から来ました。"
20. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=26 (しつれいですが, bài 1) không chứa hiragana ("しつれいですが") lẫn kanji_word (""): "失礼ですが、お名前は？"
21. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=27 (おなまえは, bài 1) không chứa hiragana ("おなまえは") lẫn kanji_word (""): "お名前は 何ですか。"
22. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=33 (かんこく, bài 1) không chứa hiragana ("かんこく") lẫn kanji_word (""): "韓国 から来ました。"
23. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=35 (ちゅうごく, bài 1) không chứa hiragana ("ちゅうごく") lẫn kanji_word (""): "中国 から来ました。"
24. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=37 (にほん, bài 1) không chứa hiragana ("にほん") lẫn kanji_word (""): "日本 から来ました。"
25. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=41 (～さん, bài 1) không chứa hiragana ("～さん") lẫn kanji_word (""): "ミラーさん"
26. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=42 (～ちゃん, bài 1) không chứa hiragana ("～ちゃん") lẫn kanji_word (""): "タインちゃん"
27. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=43 (～くん, bài 1) không chứa hiragana ("～くん") lẫn kanji_word (""): "ナムくん"
28. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=44 (～じん, bài 1) không chứa hiragana ("～じん") lẫn kanji_word (""): "ベトナムじん"
29. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=54 (ほん, bài 2) không chứa hiragana ("ほん") lẫn kanji_word (""): "これは日本語の本です。"
30. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=55 (じしょ, bài 2) không chứa hiragana ("じしょ") lẫn kanji_word (""): "これは辞書です。"
31. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=56 (ざっし, bài 2) không chứa hiragana ("ざっし") lẫn kanji_word (""): "その雑誌は面白いです。"
32. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=57 (しんぶん, bài 2) không chứa hiragana ("しんぶん") lẫn kanji_word (""): "毎日新聞を読みます。"
33. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=59 (てちょう, bài 2) không chứa hiragana ("てちょう") lẫn kanji_word (""): "手帳に予定を書きます。"
34. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=60 (めいし, bài 2) không chứa hiragana ("めいし") lẫn kanji_word (""): "名刺を交換します。"
35. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=62 (えんぴつ, bài 2) không chứa hiragana ("えんぴつ") lẫn kanji_word (""): "鉛筆で名前を書きます。"
36. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=65 (かぎ, bài 2) không chứa hiragana ("かぎ") lẫn kanji_word (""): "車の鍵をなくしました。"
37. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=66 (とけい, bài 2) không chứa hiragana ("とけい") lẫn kanji_word (""): "あの時計は高いです。"
38. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=67 (かさ, bài 2) không chứa hiragana ("かさ") lẫn kanji_word (""): "雨ですから、傘を貸します。"
39. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=68 (かばん, bài 2) không chứa hiragana ("かばん") lẫn kanji_word (""): "新しい鞄を買いました。"
40. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=69 (シーディー, bài 2) không chứa hiragana ("シーディー") lẫn kanji_word (""): "CDを聴きます。"
41. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=73 (コンピューター, bài 2) không chứa hiragana ("コンピューター") lẫn kanji_word (""): "コンピュータは新しいです。"
42. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=74 (じどうしゃ, bài 2) không chứa hiragana ("じどうしゃ") lẫn kanji_word (""): "自動車を運転します。"
43. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=75 (つくえ, bài 2) không chứa hiragana ("つくえ") lẫn kanji_word (""): "机の上に本があります。"
44. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=76 (いす, bài 2) không chứa hiragana ("いす") lẫn kanji_word (""): "椅子に座ります。"
45. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=79 (おみやげ, bài 2) không chứa hiragana ("おみやげ") lẫn kanji_word (""): "これは日本のお土産です。"
46. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=80 (えいご, bài 2) không chứa hiragana ("えいご") lẫn kanji_word (""): "英語が văn ります。"
47. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=81 (にほんご, bài 2) không chứa hiragana ("にほんご") lẫn kanji_word (""): "日本語の勉強をします。"
48. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=82 (なん, bài 2) không chứa hiragana ("なん") lẫn kanji_word (""): "これは何ですか。"
49. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=84 (ちがいます, bài 2) không chứa hiragana ("ちがいます") lẫn kanji_word (""): "いいえ, ちgいます。"
50. **[VOCAB_EXAMPLE_MISSING_WORD]**: Câu ví dụ của từ vựng id=89 (どうも, bài 2) không chứa hiragana ("どうも") lẫn kanji_word (""): "どうmo。"

*(Còn 2466 lỗi khác...)*
