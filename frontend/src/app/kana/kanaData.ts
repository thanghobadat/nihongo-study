export interface KanaItem {
  id: number;
  char: string;
  romaji: string;
  mnemonic: string;
  similar: string[];
}

export const hiraganaData: KanaItem[] = [
  { id: 1, char: "あ", romaji: "a", mnemonic: "Trông giống hình dáng cái an-ten (antenna).", similar: ["お"] },
  { id: 2, char: "い", romaji: "i", mnemonic: "Trông giống hai chiếc kim đứng song song.", similar: ["り", "こ"] },
  { id: 3, char: "う", romaji: "u", mnemonic: "Trông giống vành tai người đang uốn cong.", similar: ["ら", "ち"] },
  { id: 4, char: "え", romaji: "e", mnemonic: "Trông giống hình chú chim đang chạy nhảy.", similar: ["ん"] },
  { id: 5, char: "お", romaji: "o", mnemonic: "Trông giống quả bóng trên sân golf tròn xoe.", similar: ["あ"] },
  
  { id: 6, char: "か", romaji: "ka", mnemonic: "Trông giống mái chèo thuyền kayak (ka).", similar: ["が"] },
  { id: 7, char: "き", romaji: "ki", mnemonic: "Trông giống chiếc chìa khóa (key - ki).", similar: ["さ", "ち"] },
  { id: 8, char: "く", romaji: "ku", mnemonic: "Trông giống mỏ chim cu đang mở rộng.", similar: ["へ"] },
  { id: 9, char: "け", romaji: "ke", mnemonic: "Trông giống một thùng bia gỗ (keg - ke).", similar: ["は"] },
  { id: 10, char: "こ", romaji: "ko", mnemonic: "Trông giống hai khúc gỗ nhỏ xếp song song.", similar: ["い", "に"] },
  
  { id: 11, char: "さ", romaji: "sa", mnemonic: "Trông giống người đang nghiêng đầu chào.", similar: ["き", "ち"] },
  { id: 12, char: "し", romaji: "shi", mnemonic: "Trông giống chiếc cần câu cá cong vút.", similar: ["つ", "も"] },
  { id: 13, char: "す", romaji: "su", mnemonic: "Trông giống chiếc đu quay tròn lộn ngược.", similar: ["む"] },
  { id: 14, char: "せ", romaji: "se", mnemonic: "Trông giống ghế sofa sang trọng nằm dựa lưng.", similar: ["や"] },
  { id: 15, char: "そ", romaji: "so", mnemonic: "Trông giống một đường ziczac lượn sóng.", similar: ["て"] },
  
  { id: 16, char: "た", romaji: "ta", mnemonic: "Trông giống chữ 'ta' viết cách điệu.", similar: ["な", "だ"] },
  { id: 17, char: "ち", romaji: "chi", mnemonic: "Trông giống khuôn mặt người đang hắt xì.", similar: ["さ", "き", "ら"] },
  { id: 18, char: "つ", romaji: "tsu", mnemonic: "Trông giống ngọn sóng thần đang cuộn trào.", similar: ["し"] },
  { id: 19, char: "て", romaji: "te", mnemonic: "Trông giống bàn tay (hand - te) chìa ra.", similar: ["そ"] },
  { id: 20, char: "と", romaji: "to", mnemonic: "Trông giống ngón chân cái đang vấp phải đinh.", similar: ["ど"] },
  
  { id: 21, char: "な", romaji: "na", mnemonic: "Trông giống vị nữ tu đang quỳ cầu nguyện.", similar: ["た"] },
  { id: 22, char: "に", romaji: "ni", mnemonic: "Trông giống chiếc kim và khúc gỗ cạnh nhau.", similar: ["こ", "た"] },
  { id: 23, char: "ぬ", romaji: "nu", mnemonic: "Trông giống đĩa mì ramen rối tinh, có nút thắt.", similar: ["め", "ね"] },
  { id: 24, char: "ね", romaji: "ne", mnemonic: "Trông giống chú mèo ngủ cuộn đuôi ngoằn ngoèo.", similar: ["れ", "わ", "ぬ"] },
  { id: 25, char: "の", romaji: "no", mnemonic: "Trông giống biển cấm (No) tròn có gạch chéo.", similar: ["め"] },
  
  { id: 26, char: "は", romaji: "ha", mnemonic: "Trông giống một chiếc thang gỗ đứng thẳng.", similar: ["ほ", "け", "ま"] },
  { id: 27, char: "ひ", romaji: "hi", mnemonic: "Trông giống khuôn miệng đang cười híp mắt.", similar: ["へ"] },
  { id: 28, char: "ふ", romaji: "fu", mnemonic: "Trông giống núi Phú Sĩ phun trào khói trắng.", similar: ["ぷ"] },
  { id: 29, char: "へ", romaji: "he", mnemonic: "Trông giống sườn đồi thoai thoải đi lên.", similar: ["く", "ひ"] },
  { id: 30, char: "ほ", romaji: "ho", mnemonic: "Trông giống người đội mũ bảo hiểm đi xe máy.", similar: ["は", "ま"] },
  
  { id: 31, char: "ま", romaji: "ma", mnemonic: "Trông giống cột ăng-ten tivi có hai gạch.", similar: ["ほ", "は", "も"] },
  { id: 32, char: "み", romaji: "mi", mnemonic: "Trông giống nốt nhạc hay số 21 cách điệu.", similar: ["め"] },
  { id: 33, char: "む", romaji: "mu", mnemonic: "Trông giống chú bò tót có cặp sừng to.", similar: ["す"] },
  { id: 34, char: "め", romaji: "me", mnemonic: "Trông giống đĩa mì ramen không có thắt nút.", similar: ["ぬ", "の", "み"] },
  { id: 35, char: "も", romaji: "mo", mnemonic: "Trông giống lưỡi câu móc mồi giun.", similar: ["し", "ま"] },
  
  { id: 36, char: "や", romaji: "ya", mnemonic: "Trông giống sừng con bò Tây Tạng.", similar: ["せ"] },
  { id: 37, char: "ゆ", romaji: "yu", mnemonic: "Trông giống chú cá vàng bơi lội dưới nước.", similar: ["よ"] },
  { id: 38, char: "よ", romaji: "yo", mnemonic: "Trông giống chiếc yo-yo đang được giật lên.", similar: ["ゆ"] },
  
  { id: 39, char: "ら", romaji: "ra", mnemonic: "Trông giống người đang nằm gối đầu ngủ.", similar: ["う", "ち"] },
  { id: 40, char: "り", romaji: "ri", mnemonic: "Trông giống hai dải ruy băng buộc quà.", similar: ["い"] },
  { id: 41, char: "る", romaji: "ru", mnemonic: "Trông giống đường chạy ziczac có vòng xoáy đuôi.", similar: ["ろ"] },
  { id: 42, char: "れ", romaji: "re", mnemonic: "Trông giống người đang chạy uốn người thể thao.", similar: ["ね", "わ"] },
  { id: 43, char: "ろ", romaji: "ro", mnemonic: "Trông giống đường chạy ziczac không có xoáy.", similar: ["る"] },
  
  { id: 44, char: "わ", romaji: "wa", mnemonic: "Trông giống chiếc cốc tròn miệng đứng thẳng.", similar: ["れ", "ね"] },
  { id: 45, char: "を", romaji: "wo", mnemonic: "Trông giống người trượt nước kéo dây cáp.", similar: ["ち"] },
  { id: 46, char: "ん", romaji: "n", mnemonic: "Trông giống chữ 'n' viết thường mềm mại.", similar: ["え"] }
];

export const katakanaData: KanaItem[] = [
  { id: 1, char: "ア", romaji: "a", mnemonic: "Trông giống sườn núi dựng đứng hiểm trở.", similar: ["マ", "フ"] },
  { id: 2, char: "イ", romaji: "i", mnemonic: "Trông giống một người đứng tựa lưng đứng thẳng.", similar: ["ト", "ハ"] },
  { id: 3, char: "ウ", romaji: "u", mnemonic: "Trông giống chữ u viết đứng, có mũ ở trên.", similar: ["ワ", "ラ"] },
  { id: 4, char: "エ", romaji: "e", mnemonic: "Trông giống chiếc thang ngang bằng gỗ.", similar: ["工", "コ"] },
  { id: 5, char: "オ", romaji: "o", mnemonic: "Trông giống người đang chạy dang rộng tay.", similar: ["ホ", "才"] },
  
  { id: 6, char: "カ", romaji: "ka", mnemonic: "Trông giống chữ Hiragana か nhưng nét sắc nhọn.", similar: ["力", "ガ"] },
  { id: 7, char: "キ", romaji: "ki", mnemonic: "Trông giống chiếc chìa khóa sắc cạnh.", similar: ["チ", "テ"] },
  { id: 8, char: "ク", romaji: "ku", mnemonic: "Trông giống mái lều che nắng xiên góc.", similar: ["ケ", "タ", "ワ"] },
  { id: 9, char: "ケ", romaji: "ke", mnemonic: "Trông giống chiếc cổng gỗ đứng một bên.", similar: ["ク", "タ", "フ"] },
  { id: 10, char: "コ", romaji: "ko", mnemonic: "Trông giống chiếc hộp mở nắp một bên.", similar: ["ユ", "ヨ", "エ"] },
  
  { id: 11, char: "サ", romaji: "sa", mnemonic: "Trông giống giá treo quần áo có 3 móc.", similar: ["せ", "サ"] },
  { id: 12, char: "シ", romaji: "shi", mnemonic: "Nét xiên chéo vẽ từ DƯỚI lên (giống mỉm cười).", similar: ["ツ", "ソ", "ン"] },
  { id: 13, char: "ス", romaji: "su", mnemonic: "Trông giống chiếc xích đu đang đung đưa góc nhọn.", similar: ["ヌ"] },
  { id: 14, char: "セ", romaji: "se", mnemonic: "Trông tương tự như chữ Hiragana せ.", similar: ["セ", "ヤ"] },
  { id: 15, char: "ソ", romaji: "so", mnemonic: "Nét xiên chéo vẽ từ TRÊN xuống góc nhọn.", similar: ["ン", "シ", "ツ"] },
  
  { id: 16, char: "タ", romaji: "ta", mnemonic: "Trông giống chiếc ô có gạch chéo ở giữa.", similar: ["ク", "ヌ", "夕"] },
  { id: 17, char: "チ", romaji: "chi", mnemonic: "Trông giống số 1000 trong tiếng Hán.", similar: ["テ", "キ"] },
  { id: 18, char: "ツ", romaji: "tsu", mnemonic: "Hai nét xiên vẽ từ TRÊN xuống xiên dọc.", similar: ["シ", "ソ", "ン"] },
  { id: 19, char: "テ", romaji: "te", mnemonic: "Trông giống cột ăng-ten tivi thẳng đứng.", similar: ["チ", "キ", "ラ"] },
  { id: 20, char: "ト", romaji: "to", mnemonic: "Trông giống nhánh cây chìa ngang nâng quả.", similar: ["イ", "ハ"] },
  
  { id: 21, char: "ナ", romaji: "na", mnemonic: "Trông giống chiếc kiếm gỗ treo ngang phòng.", similar: ["メ"] },
  { id: 22, char: "ニ", romaji: "ni", mnemonic: "Hai gạch ngang đại diện cho số 2.", similar: ["ニ", "三"] },
  { id: 23, char: "ヌ", romaji: "nu", mnemonic: "Trông giống đũa đâm qua miếng sushi tròn.", similar: ["ス", "タ", "マ"] },
  { id: 24, char: "ネ", romaji: "ne", mnemonic: "Trông giống giá để nến cúng lễ.", similar: ["ホ", "テ"] },
  { id: 25, char: "ノ", romaji: "no", mnemonic: "Một nét gạch xiên dài duy nhất.", similar: ["ソ", "ン"] },
  
  { id: 26, char: "ハ", romaji: "ha", mnemonic: "Trông giống đôi chân người đang đi lại.", similar: ["八", "ソ", "ト"] },
  { id: 27, char: "ヒ", romaji: "hi", mnemonic: "Trông giống chiếc thìa múc súp tròn.", similar: ["七", "匕"] },
  { id: 28, char: "フ", romaji: "fu", mnemonic: "Trông giống chiếc cờ hiệu cắm xiên góc.", similar: ["ヲ", "ワ", "ヌ"] },
  { id: 29, char: "ヘ", romaji: "he", mnemonic: "Hoàn toàn giống chữ Hiragana へ nhưng sắc nhọn.", similar: ["へ"] },
  { id: 30, char: "ホ", romaji: "ho", mnemonic: "Trông giống cây thông Noel đứng thẳng.", similar: ["オ", "木"] },
  
  { id: 31, char: "マ", romaji: "ma", mnemonic: "Trông giống chiếc mỏ chim nhọn hướng ra.", similar: ["ア", "ヌ"] },
  { id: 32, char: "ミ", romaji: "mi", mnemonic: "Ba vạch gạch chéo song song (mi - ba).", similar: ["シ", "ツ"] },
  { id: 33, char: "ム", romaji: "mu", mnemonic: "Trông giống một hình tam giác vuông mở cạnh.", similar: ["マ"] },
  { id: 34, char: "メ", romaji: "me", mnemonic: "Trông giống biển báo hiệu nguy hiểm gạch chéo.", similar: ["ナ", "ヌ"] },
  { id: 35, char: "モ", romaji: "mo", mnemonic: "Tương đương như chữ Hiragana も nhưng nét thẳng.", similar: ["モ", "も"] },
  
  { id: 36, char: "ヤ", romaji: "ya", mnemonic: "Phiên bản Katakana góc cạnh của や.", similar: ["ヤ", "セ"] },
  { id: 37, char: "ユ", romaji: "yu", mnemonic: "Trông giống chiếc móc xích nằm mở miệng.", similar: ["コ", "ヨ"] },
  { id: 38, char: "ヨ", romaji: "yo", mnemonic: "Trông giống chiếc chổi gỗ quét nhà.", similar: ["ユ", "コ", "E"] },
  
  { id: 39, char: "ラ", romaji: "ra", mnemonic: "Trông giống ngọn đèn bàn đang chiếu sáng.", similar: ["ヲ", "フ", "テ"] },
  { id: 40, char: "リ", romaji: "ri", mnemonic: "Giống chữ Hiragana り nhưng nét sắc thẳng.", similar: ["リ", "い"] },
  { id: 41, char: "ル", romaji: "ru", mnemonic: "Trông giống hai chiếc sừng bò tót uốn cong.", similar: ["レ", "ハ"] },
  { id: 42, char: "レ", romaji: "re", mnemonic: "Trông giống dải ruy băng cuộn tròn hướng lên.", similar: ["ル", "フ"] },
  { id: 43, char: "ロ", romaji: "ro", mnemonic: "Trông giống một chiếc hộp đóng kín hình vuông.", similar: ["口", "コ"] },
  
  { id: 44, char: "ワ", romaji: "wa", mnemonic: "Trông giống chiếc mũ bảo hiểm úp xuống.", similar: ["ウ", "ラ", "ク"] },
  { id: 45, char: "ヲ", romaji: "wo", mnemonic: "Trông giống người giơ tay kéo ròng rọc.", similar: ["ラ", "フ", "ヲ"] },
  { id: 46, char: "ン", romaji: "n", mnemonic: "Nét xiên chéo vẽ từ DƯỚI lên xiên ngang ngắn.", similar: ["ソ", "シ", "ツ"] }
];
