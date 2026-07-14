'use client';

import { useState, useEffect, useCallback, use, useMemo, useRef } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { api } from '../../utils/api';

import { getGrammarVocabMapping, getGrammarKanjiMapping } from '../../utils/roadmapMapping';

import { getKanjiForm } from '../../utils/kanjiFormLookup';

import CourseSwitcher from '../../components/CourseSwitcher';

import SidebarSettings from '../../components/SidebarSettings';

import { getRadicalsString } from '../../utils/kanjiRadicals';

import PitchAccentDisplay from '../../components/PitchAccentDisplay';

import { playAudioWithFallback } from '../../utils/audioHelper';

import ListeningQuiz from './components/ListeningQuiz';

import MatchingGame from './components/MatchingGame';

import FillInBlanks from './components/FillInBlanks';

import DialogueReading from './components/DialogueReading';

// Defined types

interface Lesson {

  id: number;

  title: string;

  description: string;

  roleplay_options?: {

    names: string[];

    countries: string[];

    occupations: string[];

    organizations: string[];

  };

}

interface VocabItem {

  id: number;

  lesson_id: number;

  hiragana: string;

  romaji: string;

  kanji_word?: string;

  vietnamese_meaning: string;

  word_type: string;

  japanese_example: string;

  example_meaning: string;

  mnemonic_tip: string;

  image_url: string;

  status: 'not_learned' | 'learning' | 'mastered';

  pitch_accent?: number;

}

interface KanjiItem {

  id: number;

  lesson_id: number;

  character: string;

  stroke_count: string;

  onyomi: string;

  kunyomi: string;

  sino_vietnamese: string;

  vietnamese_meaning: string;

  mnemonic_tip: string;

  compounds: string;

  status: 'not_learned' | 'learning' | 'mastered';

}

interface GrammarExample {

  japanese: string;

  romaji: string;

  vietnamese: string;

}

interface GrammarItem {

  id: number;

  lesson_id: number;

  title: string;

  meaning: string;

  structure: string;

  vietnamese_explanation: string;

  japanese_example: string;

  example_meaning: string;

  romaji_example?: string;

  examples_json?: any;

  notes: string;

  status: 'not_learned' | 'learning' | 'mastered';

}

interface DialogueItem {

  id: number;

  lesson_id: number;

  speaker: string;

  japanese: string;

  romaji: string;

  vietnamese: string;

  topic?: string;

}

// Inline SVG helper to output consistent cute animal avatars

function getAvatarSvg(userId: string) {

  let hash = 0;

  for (let i = 0; i < userId.length; i++) {

    hash = userId.charCodeAt(i) + ((hash << 5) - hash);

  }

  const index = Math.abs(hash) % 5;

  const svgs = [

    // Panda

    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#334155" stroke-width="3"/><circle cx="30" cy="30" r="10" fill="#1e293b"/><circle cx="70" cy="30" r="10" fill="#1e293b"/><ellipse cx="32" cy="52" rx="7" ry="9" fill="#1e293b"/><ellipse cx="68" cy="52" rx="7" ry="9" fill="#1e293b"/><circle cx="32" cy="50" r="2" fill="#ffffff"/><circle cx="68" cy="50" r="2" fill="#ffffff"/><ellipse cx="50" cy="65" rx="5" ry="3" fill="#1e293b"/><circle cx="28" cy="58" r="4" fill="#fecdd3"/><circle cx="72" cy="58" r="4" fill="#fecdd3"/></svg>`,

    // Bear

    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#d97706" stroke="#b45309" stroke-width="3"/><circle cx="25" cy="25" r="12" fill="#b45309"/><circle cx="75" cy="25" r="12" fill="#b45309"/><circle cx="25" cy="25" r="6" fill="#fef3c7"/><circle cx="75" cy="25" r="6" fill="#fef3c7"/><circle cx="35" cy="48" r="3" fill="#000000"/><circle cx="65" cy="48" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="12" ry="9" fill="#fef3c7"/><polygon points="50,58 45,54 55,54" fill="#000000"/></svg>`,

    // Cat

    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#94a3b8" stroke="#64748b" stroke-width="3"/><polygon points="20,25 35,5 45,28" fill="#64748b"/><polygon points="80,25 65,5 55,28" fill="#64748b"/><polygon points="23,23 33,9 41,25" fill="#fecdd3"/><polygon points="77,23 67,9 59,25" fill="#fecdd3"/><circle cx="35" cy="50" r="3" fill="#000000"/><circle cx="65" cy="50" r="3" fill="#000000"/><polygon points="50,60 46,55 54,55" fill="#fecdd3"/><path d="M46,65 Q50,68 54,65" fill="none" stroke="#000000" stroke-width="2"/></svg>`,

    // Fox

    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#ea580c" stroke="#c2410c" stroke-width="3"/><polygon points="15,25 32,5 42,30" fill="#c2410c"/><polygon points="85,25 68,5 58,30" fill="#c2410c"/><ellipse cx="30" cy="55" rx="14" ry="18" fill="#ffffff"/><ellipse cx="70" cy="55" rx="14" ry="18" fill="#ffffff"/><circle cx="32" cy="52" r="3.5" fill="#000000"/><circle cx="68" cy="52" r="3.5" fill="#000000"/><ellipse cx="50" cy="68" rx="6" ry="4" fill="#000000"/></svg>`,

    // Rabbit

    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="55" r="40" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="65" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="5" ry="16" fill="#f1f5f9"/><ellipse cx="65" cy="25" rx="5" ry="16" fill="#f1f5f9"/><circle cx="35" cy="52" r="3" fill="#000000"/><circle cx="65" cy="52" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#fecdd3"/><circle cx="28" cy="60" r="4" fill="#fecdd3"/><circle cx="72" cy="60" r="4" fill="#fecdd3"/></svg>`

  ];

  return svgs[index];

}

const lesson1Romaji: Record<number, string> = {

  1: "Hajimemashite. Watashi wa Namu desu. Betonamu kara kimashita. Douzo yoroshiku.",

  2: "Hajimemashite. Mira- desu. Kochira koso douzo yoroshiku.",

  3: "Shitsurei desu ga, Mira- san wa oikutsu (nansai) desu ka.",

  4: "Watashi wa 30-sai desu. Namu-san wa gakusei desu ka.",

  5: "Iie, watashi wa gakusei ja arimasen. Enjinia desu.",

  6: "Ano hito wa donata desu ka.",

  7: "Ano hito wa Santosu-san desu. Burajiru-jin desu."

};

const jaToVnDict: Record<string, string> = {

  // Names

  'ナム': 'Nam',

  'タイン': 'Thanh',

  'アン': 'An',

  'リン': 'Linh',

  'クオン': 'Cường',

  

  // Countries

  'ベトナム': 'Việt Nam',

  'アメリカ': 'Mỹ',

  '日本': 'Nhật Bản',

  'イギリス': 'Anh',

  'フランス': 'Pháp',

  'ブラジル': 'Brasil',

  'インド': 'Ấn Độ',

  'インドネシア': 'Indonesia',

  '韓国': 'Hàn Quốc',

  '中国': 'Trung Quốc',

  'ドイツ': 'Đức',

  'タイ': 'Thái Lan',

  

  // Occupations

  'エンジニア': 'kỹ sư',

  '学生': 'học sinh',

  '教師': 'giáo viên',

  '会社員': 'nhân viên công ty',

  '医者': 'bác sĩ',

  '研究者': 'nhà nghiên cứu',

  '銀行員': 'nhân viên ngân hàng',

  '公務員': 'công chức',

  

  // Organizations

  'さくら大学': 'Đại học Sakura',

  'さくら病院': 'Bệnh viện Sakura',

  '富士大学': 'Đại học Fuji',

  '富士病院': 'Bệnh viện Fuji',

  '神戸病院': 'Bệnh viện Kobe',

  'パワー電気': 'Điện lực Power',

  'ブラジルエアー': 'Hàng không Brazil',

  'トヨタ': 'Toyota',

  'マック': 'Mac',

  'FPT': 'FPT',

  'IMC': 'IMC',

  'AKC': 'AKC',

  'Kobe Hospital': 'Bệnh viện Kobe'

};

const jaToRomajiDict: Record<string, string> = {

  // Names

  'ナム': 'Namu',

  'タイン': 'Tain',

  'アン': 'An',

  'リン': 'Rin',

  'クオン': 'Kuon',

  

  // Countries

  'ベトナム': 'Betonamu',

  'アメリカ': 'Amerika',

  '日本': 'Nihon',

  'イギリス': 'Igirisu',

  'フランス': 'Furansu',

  'ブラジル': 'Burajiru',

  'インド': 'Indo',

  'インドネシア': 'Indoneshia',

  '韓国': 'Kankoku',

  '中国': 'Chuugoku',

  'ドイツ': 'Doitsu',

  'タイ': 'Tai',

  

  // Occupations

  'エンジニア': 'enjinia',

  '学生': 'gakusei',

  '教師': 'kyoushi',

  '会社員': 'kaishain',

  '医者': 'isha',

  '研究者': 'kenkyuusha',

  '銀行員': 'ginkouin',

  '公務員': 'koumuin',

  

  // Organizations

  'さくら大学': 'Sakura daigaku',

  'さくら病院': 'Sakura byouin',

  '富士大学': 'Fuji daigaku',

  '富士病院': 'Fuji byouin',

  '神戸病院': 'Kobe byouin',

  'パワー電気': 'Pawaa denki',

  'ブラジルエアー': 'Burajiru eaa',

  'トヨタ': 'Toyota',

  'マック': 'Makku',

  'FPT': 'FPT',

  'IMC': 'IMC',

  'AKC': 'AKC',

  'Kobe Hospital': 'Kobe Hospital'

};

const MARUGOTO_TOPIC_KEYWORDS: Record<number, string[]> = {

  101: ['tôi', 'bản thân', 'chào', 'tên', 'nước', 'quốc tịch', 'nghề nghiệp', 'người', 'nhật', 'việt'],

  102: ['bàn', 'ghế', 'bút', 'sách', 'vở', 'thước', 'tẩy', 'lớp', 'học', 'phòng', 'bảng', 'giáo viên', 'học sinh'],

  103: ['ăn', 'uống', 'ngon', 'thích', 'ghét', 'món', 'cơm', 'nước', 'trà', 'sữa', 'thịt', 'cá', 'rau', 'quả', 'bánh'],

  104: ['bố', 'mẹ', 'anh', 'chị', 'em', 'gia đình', 'người', 'nhà', 'vợ', 'chồng', 'con', 'ông', 'bà', 'ba mẹ'],

  105: ['giờ', 'phút', 'ngày', 'tháng', 'năm', 'thứ', 'sáng', 'chiều', 'tối', 'trưa', 'lúc', 'khi', 'mấy'],

  106: ['nhà', 'phòng', 'bếp', 'tắm', 'vườn', 'nhà vệ sinh', 'cửa', 'cửa sổ', 'ở', 'đâu', 'trong', 'ngoài', 'trên', 'dưới'],

  107: ['dậy', 'ngủ', 'làm', 'chơi', 'học', 'nghỉ', 'đi', 'đến', 'về', 'gặp', 'mua', 'bán', 'viết', 'đọc', 'nghe', 'nói'],

  108: ['thích', 'sở thích', 'chơi', 'xem', 'nghe', 'nhạc', 'phim', 'sách', 'thể thao', 'bóng', 'đá', 'bơi', 'đàn', 'hát'],

  109: ['đi', 'đến', 'về', 'tàu', 'xe', 'máy', 'bay', 'bộ', 'ga', 'sân bay', 'đường', 'giao thông'],

  110: ['mua', 'bán', 'tiền', 'giá', 'bao nhiêu', 'đắt', 'rẻ', 'cửa hàng', 'siêu thị', 'chợ', 'áo', 'quần', 'giày', 'dép'],

  111: ['mệt', 'khỏe', 'vui', 'buồn', 'nóng', 'lạnh', 'ấm', 'mát', 'đau', 'ốm', 'bệnh', 'thuốc'],

  112: ['việc', 'công ty', 'văn phòng', 'báo cáo', 'họp', 'gặp', 'khách', 'điện thoại', 'máy tính'],

  113: ['thời tiết', 'mưa', 'nắng', 'gió', 'tuyết', 'mây', 'mùa', 'xuân', 'hạ', 'thu', 'đông', 'trời'],

  114: ['du lịch', 'đi', 'chơi', 'đền', 'chùa', 'núi', 'biển', 'sông', 'hồ', 'khách sạn', 'phong cảnh'],

  115: ['cao', 'thấp', 'to', 'nhỏ', 'dài', 'ngắn', 'đẹp', 'xấu', 'mới', 'cũ', 'trẻ', 'già'],

  116: ['xin lỗi', 'cảm ơn', 'chúc mừng', 'hẹn', 'gặp', 'nói', 'chuyện', 'bạn', 'thầy', 'cô'],

  117: ['biết', 'hiểu', 'thể', 'được', 'làm', 'nói', 'viết', 'đọc', 'tiếng', 'nhật', 'anh'],

  118: ['học', 'tập', 'thi', 'kiểm tra', 'kết quả', 'tốt', 'kém', 'hiểu', 'nhớ']

};


// ==================== DYNAMIC MARUGOTO PRACTICE GENERATOR ====================
const getDynamicVocabPool = (vocabItems: any[]) => {
  const names = ['キムさん', 'ヴィさん', 'ホセさん', 'マリアさん', 'ジョンさん', 'たなかさん', 'さくらさん'];
  const jobs: any[] = [];
  const countries: any[] = [];
  const languages: any[] = [];
  
  if (vocabItems && vocabItems.length > 0) {
    vocabItems.forEach(v => {
      const mean = v.vietnamese_meaning.toLowerCase();
      const hira = v.hiragana;
      if (mean.includes('tiếng') || hira.endsWith('ご') || hira.endsWith('ゴ')) {
        languages.push({ hira: v.hiragana, romaji: v.romaji, vn: v.vietnamese_meaning });
      } else if (mean.includes('người nước') || mean.includes('nước ') || mean.includes('nhật bản') || mean.includes('hàn quốc') || mean.includes('việt nam') || mean.includes('mỹ') || mean.includes('philippines')) {
        countries.push({ hira: v.hiragana, romaji: v.romaji, vn: v.vietnamese_meaning });
      } else if (mean.includes('học sinh') || mean.includes('giáo viên') || mean.includes('kỹ sư') || mean.includes('nhân viên') || mean.includes('khách du lịch') || mean.includes('nghề')) {
        jobs.push({ hira: v.hiragana, romaji: v.romaji, vn: v.vietnamese_meaning });
      }
    });
  }
  
  // Đảm bảo luôn có ít nhất 2 jobs để sinh câu hỏi an toàn
  const defaultJobs = [
    { hira: 'がくせい', romaji: 'gakusei', vn: 'học sinh' },
    { hira: 'エンジニア', romaji: 'enjinia', vn: 'kỹ sư' },
    { hira: 'きょうし', romaji: 'kyoushi', vn: 'giáo viên' },
    { hira: 'りょこうしゃ', romaji: 'ryokousha', vn: 'khách du lịch' }
  ];
  while (jobs.length < 2) {
    const nextJob = defaultJobs.find(dj => !jobs.some(j => j.hira === dj.hira)) || defaultJobs[0];
    jobs.push(nextJob);
  }

  // Đảm bảo luôn có ít nhất 2 countries
  const defaultCountries = [
    { hira: 'ベトナム', romaji: 'Betonamu', vn: 'Việt Nam' },
    { hira: 'かんこく', romaji: 'Kankoku', vn: 'Hàn Quốc' },
    { hira: 'にほん', romaji: 'Nihon', vn: 'Nhật Bản' }
  ];
  while (countries.length < 2) {
    const nextCountry = defaultCountries.find(dc => !countries.some(c => c.hira === dc.hira)) || defaultCountries[0];
    countries.push(nextCountry);
  }

  // Đảm bảo luôn có ít nhất 2 languages
  const defaultLanguages = [
    { hira: 'にほんご', romaji: 'Nihongo', vn: 'tiếng Nhật' },
    { hira: 'えいご', romaji: 'Eigo', vn: 'tiếng Anh' },
    { hira: 'ベトナムご', romaji: 'Betonamugo', vn: 'tiếng Việt' }
  ];
  while (languages.length < 2) {
    const nextLang = defaultLanguages.find(dl => !languages.some(l => l.hira === dl.hira)) || defaultLanguages[0];
    languages.push(nextLang);
  }
  
  return { names, jobs, countries, languages };
};

const generateDynamicSentence = (vocabItems: any[], direction = 'vi-to-ja', lessonId = 103) => {
  const pool = getDynamicVocabPool(vocabItems);
  const sentences: any[] = [];
  
  for (let i = 0; i < 15; i++) {
    const n1 = pool.names[Math.floor(Math.random() * pool.names.length)];
    const job = pool.jobs[Math.floor(Math.random() * pool.jobs.length)];
    const lang = pool.languages[Math.floor(Math.random() * pool.languages.length)];
    const n2 = pool.names.filter(n => n !== n1)[0] || 'わたし';
    
    if (lessonId === 104) {
      // Bài 4: dare desuka, oikutsu desuka, oishigoto wa, to, ni sunde imasu, no
      const type = i % 6;
      if (type === 0) {
        sentences.push({
          japanese: 'あの方はだれですか。',
          romaji: 'Ano kata wa dare desu ka.',
          vietnamese: 'Người kia là ai thế?',
          originalSentence: 'あの方はだれですか。'
        });
      } else if (type === 1) {
        sentences.push({
          japanese: `${n1}はおいくつですか。`,
          romaji: `${n1.replace('さん', '-san')} wa oikutsu desu ka.`,
          vietnamese: `${n1.replace('さん', '')} bao nhiêu tuổi?`,
          originalSentence: `${n1}はおいくつですか。`
        });
      } else if (type === 2) {
        sentences.push({
          japanese: 'お仕事は何ですか。',
          romaji: 'Oishigoto wa nan desu ka.',
          vietnamese: 'Công việc của bạn là gì?',
          originalSentence: 'お仕事は何ですか。'
        });
      } else if (type === 3) {
        sentences.push({
          japanese: `${n1}と${n2}です。`,
          romaji: `${n1.replace('さん', '-san')} to ${n2.replace('さん', '-san')} desu.`,
          vietnamese: `Là ${n1.replace('さん', '')} và ${n2.replace('さん', '')}.`,
          originalSentence: `${n1}と${n2}です。`
        });
      } else if (type === 4) {
        sentences.push({
          japanese: `${n1}は東京に住んでいます。`,
          romaji: `${n1.replace('さん', '-san')} wa Toukyou ni sunde imasu.`,
          vietnamese: `${n1.replace('さん', '')} sống ở Tokyo.`,
          originalSentence: `${n1}は東京に住んでいます。`
        });
      } else {
        sentences.push({
          japanese: `これは${n1}の本です。`,
          romaji: `Kore wa ${n1.replace('さん', '-san')} no hon desu.`,
          vietnamese: `Đây là sách của ${n1.replace('さん', '')}.`,
          originalSentence: `これは${n1}の本です。`
        });
      }
    } else if (lessonId === 105) {
      // Bài 5: ga suki desu, o masu, yoku/amari
      const type = i % 3;
      if (type === 0) {
        sentences.push({
          japanese: `${n1}はお寿司が好きです。`,
          romaji: `${n1.replace('さん', '-san')} wa osushi ga suki desu.`,
          vietnamese: `${n1.replace('さん', '')} thích sushi.`,
          originalSentence: `${n1}はお寿司が好きです。`
        });
      } else if (type === 1) {
        sentences.push({
          japanese: '朝ごはんを食べます。',
          romaji: 'Asagohan o tabemasu.',
          vietnamese: 'Tôi ăn sáng.',
          originalSentence: '朝ごはんを食べます。'
        });
      } else {
        sentences.push({
          japanese: 'よくお茶を飲みます。',
          romaji: 'Yoku ocha o nomimasu.',
          vietnamese: 'Tôi thường uống trà.',
          originalSentence: 'よくお茶を飲みます。'
        });
      }
    } else {
      // Bài 3
      if (i % 3 === 0) {
        if (Math.random() > 0.5) {
          sentences.push({
            japanese: `${n1}は${job.hira}です。`,
            romaji: `${n1.replace('さん', '-san')} wa ${job.romaji} desu.`,
            vietnamese: `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}.`,
            originalSentence: `${n1}は${job.hira}です。`
          });
        } else {
          sentences.push({
            japanese: `${n1}は${job.hira} じゃないです。`,
            romaji: `${n1.replace('さん', '-san')} wa ${job.romaji} janai desu.`,
            vietnamese: `${n1.replace('さん', '')} không phải là ${job.vn.toLowerCase()}.`,
            originalSentence: `${n1}は${job.hira} じゃないです。`
          });
        }
      } else if (i % 3 === 1) {
        if (Math.random() > 0.5) {
          sentences.push({
            japanese: `${n1}は${lang.hira}ができます。`,
            romaji: `${n1.replace('さん', '-san')} wa ${lang.romaji} ga dekimasu.`,
            vietnamese: `${n1.replace('さん', '')} có thể nói ${lang.vn.toLowerCase()}.`,
            originalSentence: `${n1}は${lang.hira}ができます。`
          });
        } else {
          sentences.push({
            japanese: `${n1}は${lang.hira}ができません。`,
            romaji: `${n1.replace('さん', '-san')} wa ${lang.romaji} ga dekimasen.`,
            vietnamese: `${n1.replace('さん', '')} không thể nói ${lang.vn.toLowerCase()}.`,
            originalSentence: `${n1}は${lang.hira}ができません。`
          });
        }
      } else {
        sentences.push({
          japanese: `${n1}は${job.hira}です。${n2}も${job.hira}です。`,
          romaji: `${n1.replace('さん', '-san')} wa ${job.romaji} desu. ${n2.replace('さん', '-san')} mo ${job.romaji} desu.`,
          vietnamese: `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}. ${n2.replace('さん', '')} cũng là ${job.vn.toLowerCase()}.`,
          originalSentence: `${n1}は${job.hira}es`.replace(/es/g, 'đúng').replace('đúng', 'です')
        });
      }
    }
  }
  
  const shuffled = sentences.sort(() => Math.random() - 0.5).slice(0, 10);
  return shuffled.map(s => ({
    questionText: direction === 'vi-to-ja' ? s.vietnamese : s.japanese,
    correctAnswer: direction === 'vi-to-ja' ? s.japanese : s.vietnamese,
    displayAnswer: direction === 'vi-to-ja' ? s.japanese : s.vietnamese,
    romaji: s.romaji,
    direction,
    japanese: s.japanese,
    vietnamese: s.vietnamese,
    originalSentence: s.originalSentence
  }));
};

const generateSingleDynamicSentence = (vocabItems: any[], direction = 'vi-to-ja', lessonId = 103) => {
  const pool = getDynamicVocabPool(vocabItems);
  const n1 = pool.names[Math.floor(Math.random() * pool.names.length)];
  const job = pool.jobs[Math.floor(Math.random() * pool.jobs.length)];
  const lang = pool.languages[Math.floor(Math.random() * pool.languages.length)];
  const n2 = pool.names.filter(n => n !== n1)[0] || 'わたし';
  
  if (lessonId === 104) {
    const type = Math.floor(Math.random() * 6);
    if (type === 0) {
      return {
        questionText: direction === 'vi-to-ja' ? 'Người kia là ai thế?' : 'あの方はだれですか。',
        correctAnswer: direction === 'vi-to-ja' ? 'あの方はだれですか。' : 'Người kia là ai thế?',
        displayAnswer: direction === 'vi-to-ja' ? 'あの方はだれですか。' : 'Người kia là ai thế?',
        romaji: 'Ano kata wa dare desu ka.',
        direction,
        japanese: 'あの方はだれですか。',
        vietnamese: 'Người kia là ai thế?',
        originalSentence: 'あの方はだれですか。'
      };
    } else if (type === 1) {
      return {
        questionText: direction === 'vi-to-ja' ? `${n1.replace('さん', '')} bao nhiêu tuổi?` : `${n1}はおいくつですか。`,
        correctAnswer: direction === 'vi-to-ja' ? `${n1}はおいくつですか。` : `${n1.replace('さん', '')} bao nhiêu tuổi?`,
        displayAnswer: direction === 'vi-to-ja' ? `${n1}はおいくつですか。` : `${n1.replace('さん', '')} bao nhiêu tuổi?`,
        romaji: `${n1.replace('さん', '-san')} wa oikutsu desu ka.`,
        direction,
        japanese: `${n1}はおいくつですか。`,
        vietnamese: `${n1.replace('さん', '')} bao nhiêu tuổi?`,
        originalSentence: `${n1}はおいくつですか。`
      };
    } else if (type === 2) {
      return {
        questionText: direction === 'vi-to-ja' ? 'Công việc của bạn là gì?' : 'お仕事は何ですか。',
        correctAnswer: direction === 'vi-to-ja' ? 'お仕事は何ですか。' : 'Công việc của bạn là gì?',
        displayAnswer: direction === 'vi-to-ja' ? 'お仕事は何ですか。' : 'Công việc của bạn là gì?',
        romaji: 'Oishigoto wa nan desu ka.',
        direction,
        japanese: 'お仕事は何ですか。',
        vietnamese: 'Công việc của bạn là gì?',
        originalSentence: 'お仕事は何ですか。'
      };
    } else if (type === 3) {
      return {
        questionText: direction === 'vi-to-ja' ? `Là ${n1.replace('さん', '')} và dots ${n2.replace('さん', '')}.`.replace(/\\dots\s*/g, '') : `${n1}と${n2}です。`,
        correctAnswer: direction === 'vi-to-ja' ? `${n1}と${n2}です。` : `Là ${n1.replace('さん', '')} và ${n2.replace('さん', '')}.`,
        displayAnswer: direction === 'vi-to-ja' ? `${n1}と${n2}es`.replace('es', 'đúng').replace('đúng', 'です') : `Là ${n1.replace('さん', '')} và ${n2.replace('さん', '')}.`,
        romaji: `${n1.replace('さん', '-san')} to ${n2.replace('さん', '-san')} desu.`,
        direction,
        japanese: `${n1}と${n2}です。`,
        vietnamese: `Là ${n1.replace('さん', '')} và ${n2.replace('さん', '')}.`,
        originalSentence: `${n1}と${n2}です。`
      };
    } else if (type === 4) {
      return {
        questionText: direction === 'vi-to-ja' ? `${n1.replace('さん', '')} sống ở Tokyo.` : `${n1}は東京に住んでいます。`,
        correctAnswer: direction === 'vi-to-ja' ? `${n1}は東京に住んでいます。` : `${n1.replace('さん', '')} sống ở Tokyo.`,
        displayAnswer: direction === 'vi-to-ja' ? `${n1}は東京に住んでいます。` : `${n1.replace('さん', '')} sống ở Tokyo.`,
        romaji: `${n1.replace('さん', '-san')} wa Toukyou ni sunde imasu.`,
        direction,
        japanese: `${n1}は東京に住んでいます。`,
        vietnamese: `${n1.replace('さん', '')} sống ở Tokyo.`,
        originalSentence: `${n1}は東京に住んでいます。`
      };
    } else {
      return {
        questionText: direction === 'vi-to-ja' ? `Đây là sách của ${n1.replace('さん', '')}.` : `これは${n1}の本です。`,
        correctAnswer: direction === 'vi-to-ja' ? `これは${n1}の本です。` : `Đây là sách của ${n1.replace('さん', '')}.`,
        displayAnswer: direction === 'vi-to-ja' ? `これは${n1}の本です。` : `Đây là sách của ${n1.replace('さん', '')}.`,
        romaji: `Kore wa ${n1.replace('さん', '-san')} no hon desu.`,
        direction,
        japanese: `これは${n1}の本です。`,
        vietnamese: `Đây là sách của ${n1.replace('さん', '')}.`,
        originalSentence: `これは${n1}の本です。`
      };
    }
  } else if (lessonId === 105) {
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      return {
        questionText: direction === 'vi-to-ja' ? `${n1.replace('さん', '')} thích sushi.` : `${n1}はお寿司が好きです。`,
        correctAnswer: direction === 'vi-to-ja' ? `${n1}はお寿司が好きです。` : `${n1.replace('さん', '')} thích sushi.`,
        displayAnswer: direction === 'vi-to-ja' ? `${n1}はお寿司が好きです。` : `${n1.replace('さん', '')} thích sushi.`,
        romaji: `${n1.replace('さん', '-san')} wa osushi ga suki desu.`,
        direction,
        japanese: `${n1}はお寿司が好きです。`,
        vietnamese: `${n1.replace('さん', '')} thích sushi.`,
        originalSentence: `${n1}はお寿司が好きです。`
      };
    } else if (type === 1) {
      return {
        questionText: direction === 'vi-to-ja' ? 'Tôi ăn sáng.' : '朝ごはんを食べます。',
        correctAnswer: direction === 'vi-to-ja' ? '朝ごはんを食べます。' : 'Tôi ăn sáng.',
        displayAnswer: direction === 'vi-to-ja' ? '朝ごはんを食べます。' : 'Tôi ăn sáng.',
        romaji: 'Asagohan o tabemasu.',
        direction,
        japanese: '朝ごはんを食べます。',
        vietnamese: 'Tôi ăn sáng.',
        originalSentence: '朝ごはんを食べます。'
      };
    } else {
      return {
        questionText: direction === 'vi-to-ja' ? 'Tôi thường uống trà.' : 'よくお茶を飲みます。',
        correctAnswer: direction === 'vi-to-ja' ? 'よくお茶を飲みます。' : 'Tôi thường uống trà.',
        displayAnswer: direction === 'vi-to-ja' ? 'よくお茶を飲みます。' : 'Tôi thường uống trà.',
        romaji: 'Yoku ocha o nomimasu.',
        direction,
        japanese: 'よくお茶を飲みます。',
        vietnamese: 'Tôi thường uống trà.',
        originalSentence: 'よくお茶を飲みます。'
      };
    }
  } else {
    // Bài 3
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      if (Math.random() > 0.5) {
        return {
          questionText: direction === 'vi-to-ja' ? `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}.` : `${n1}は${job.hira}es`.replace('es', 'đúng').replace('đúng', 'です'),
          correctAnswer: direction === 'vi-to-ja' ? `${n1}は${job.hira}です。` : `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}.`,
          displayAnswer: direction === 'vi-to-ja' ? `${n1}は${job.hira}です。` : `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}.`,
          romaji: `${n1.replace('さん', '-san')} wa ${job.romaji} desu.`,
          direction,
          japanese: `${n1}は${job.hira}です。`,
          vietnamese: `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}.`,
          originalSentence: `${n1}は${job.hira}です。`
        };
      } else {
        return {
          questionText: direction === 'vi-to-ja' ? `${n1.replace('さん', '')} không phải là ${job.vn.toLowerCase()}.` : `${n1}は${job.hira} じゃないです。`,
          correctAnswer: direction === 'vi-to-ja' ? `${n1}は${job.hira} じゃないです。` : `${n1.replace('さん', '')} không phải là ${job.vn.toLowerCase()}.`,
          displayAnswer: direction === 'vi-to-ja' ? `${n1}は${job.hira} じゃないです。` : `${n1.replace('さん', '')} không phải là ${job.vn.toLowerCase()}.`,
          romaji: `${n1.replace('さん', '-san')} wa ${job.romaji} janai desu.`,
          direction,
          japanese: `${n1}は${job.hira} じゃないです。`,
          vietnamese: `${n1.replace('さん', '')} không phải là ${job.vn.toLowerCase()}.`,
          originalSentence: `${n1}は${job.hira} じゃないです。`
        };
      }
    } else if (type === 1) {
      if (Math.random() > 0.5) {
        return {
          questionText: direction === 'vi-to-ja' ? `${n1.replace('さん', '')} có thể nói ${lang.vn.toLowerCase()}.` : `${n1}は${lang.hira} ができます。`,
          correctAnswer: direction === 'vi-to-ja' ? `${n1}は${lang.hira} ができます。` : `${n1.replace('さん', '')} có thể nói ${lang.vn.toLowerCase()}.`,
          displayAnswer: direction === 'vi-to-ja' ? `${n1}は${lang.hira} ができます。` : `${n1.replace('さん', '')} có thể nói ${lang.vn.toLowerCase()}.`,
          romaji: `${n1.replace('さん', '-san')} wa ${lang.romaji} ga dekimasu.`,
          direction,
          japanese: `${n1}は${lang.hira} ができます。`,
          vietnamese: `${n1.replace('さん', '')} có thể nói ${lang.vn.toLowerCase()}.`,
          originalSentence: `${n1}は${lang.hira} ができます。`
        };
      } else {
        return {
          questionText: direction === 'vi-to-ja' ? `${n1.replace('さん', '')} không thể nói ${lang.vn.toLowerCase()}.` : `${n1}は${lang.hira} ができません。`,
          correctAnswer: direction === 'vi-to-ja' ? `${n1}は${lang.hira} ができません。` : `${n1.replace('さん', '')} không thể nói ${lang.vn.toLowerCase()}.`,
          displayAnswer: direction === 'vi-to-ja' ? `${n1}は${lang.hira} ができません。` : `${n1.replace('さん', '')} không thể nói ${lang.vn.toLowerCase()}.`,
          romaji: `${n1.replace('さん', '-san')} wa ${lang.romaji} ga dekimasen.`,
          direction,
          japanese: `${n1}は${lang.hira} ができません。`,
          vietnamese: `${n1.replace('さん', '')} không thể nói ${lang.vn.toLowerCase()}.`,
          originalSentence: `${n1}は${lang.hira} ができません。`
        };
      }
    } else {
      return {
        questionText: direction === 'vi-to-ja' ? `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}. ${n2.replace('さん', '')} cũng là ${job.vn.toLowerCase()}.` : `${n1}は${job.hira}です。${n2}も${job.hira}です。`,
        correctAnswer: direction === 'vi-to-ja' ? `${n1}は${job.hira}es${n2}mo${job.hira}es`.replace(/es/g, 'đúng').replace(/đúng/g, 'es').replace('es', 'です') : `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}. ${n2.replace('さん', '')} cũng là ${job.vn.toLowerCase()}.`,
        displayAnswer: direction === 'vi-to-ja' ? `${n1}は${job.hira}es${n2}mo${job.hira}es`.replace(/es/g, 'đúng').replace(/đúng/g, 'es').replace('es', 'です') : `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}. ${n2.replace('さん', '')} cũng là ${job.vn.toLowerCase()}.`,
        romaji: `${n1.replace('さん', '-san')} wa ${job.romaji} desu. ${n2.replace('さん', '-san')} mo ${job.romaji} desu.`,
        direction,
        japanese: `${n1}は${job.hira}です。${n2}も${job.hira}です。`,
        vietnamese: `${n1.replace('さん', '')} là ${job.vn.toLowerCase()}. ${n2.replace('さん', '')} cũng là ${job.vn.toLowerCase()}.`,
        originalSentence: `${n1}は${job.hira}です。${n2}も${job.hira}es`.replace('es', 'đúng').replace('đúng', 'です')
      };
    }
  }
};

export default function LessonDetailsPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = use(params);

  const selectedLessonId = parseInt(id);

  const router = useRouter();

  const searchParams = useSearchParams();

  let currentTab = searchParams.get('tab') || 'vocab';
  if (currentTab === 'grammar' && selectedLessonId < 101) {
    currentTab = 'vocab';
  }
  if (selectedLessonId >= 101 && (currentTab === 'cando' || currentTab === 'culture')) {
    currentTab = 'vocab';
  }
  if (selectedLessonId < 101 && currentTab === 'summary') {
    currentTab = 'vocab';
  }
  const grammarIndexParam = searchParams.get('grammarIndex');
  const grammarIndex = grammarIndexParam !== null ? parseInt(grammarIndexParam) : null;
  const user = api.getUser();

  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');

  useEffect(() => {
    const isMarugoto = selectedLessonId >= 101;
    setActiveCourse(isMarugoto ? 'marugoto' : 'minna');
    localStorage.setItem('activeCourse', isMarugoto ? 'marugoto' : 'minna');
  }, [selectedLessonId]);

  // Navigation Items corresponding to the 9 Sheets / Areas
  const isMarugoto = selectedLessonId >= 101;
  const isEvenMarugoto = isMarugoto && selectedLessonId % 2 === 0;

  const menuItems = [
    ...(isMarugoto ? [
      { name: 'Từ vựng', id: 'vocab', icon: '📚', active: currentTab === 'vocab' },
      { name: 'Ngữ pháp', id: 'grammar', icon: '📖', active: currentTab === 'grammar' },
      { name: 'Luyện tập 4 kỹ năng', id: 'practice', icon: '⚡', active: currentTab === 'practice' },
      { name: 'Tổng hợp kiến thức', id: 'summary', icon: '📝', active: currentTab === 'summary' }
    ] : [

      { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },

      { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },

      { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: false },

      { name: 'Từ vựng', id: 'vocab', icon: '📚', active: currentTab === 'vocab' },

      { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: currentTab === 'kanji' },

      { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: currentTab === 'practice' }

    ])

  ];

  useEffect(() => {
    if (currentTab === 'flashcards' || currentTab === 'kaiwa') {
      router.push(`/lessons/${selectedLessonId}?tab=vocab`);
    }
  }, [currentTab, selectedLessonId, router]);

  const level = selectedLessonId <= 25 ? 'N5' : 'N4';

  // Save selectedLessonId to localStorage to persist state across navigations

  useEffect(() => {

    if (selectedLessonId && !isNaN(selectedLessonId)) {

      localStorage.setItem('selectedLessonId', selectedLessonId.toString());

    }

  }, [selectedLessonId]);

  // UI States

  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);

  const [kanjiItems, setKanjiItems] = useState<KanjiItem[]>([]);

  const [grammarItems, setGrammarItems] = useState<GrammarItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [message, setMessage] = useState<string | null>(null);

  const [activeGame, setActiveGame] = useState<'listening' | 'matching' | 'fill' | 'dialogue'>('listening');

  const [activeExampleIndices, setActiveExampleIndices] = useState<Record<number, number>>({});

  const [activeSentenceForms, setActiveSentenceForms] = useState<Record<number, 'affirmative' | 'negative' | 'interrogative'>>({});

  const [grammarPracticeMode, setGrammarPracticeMode] = useState<'particles' | 'transformation' | 'translation' | 'listening'>('particles');
  // New states for Marugoto grammar practice (Endless mode & Listening translation)
  const [translationQuestions, setTranslationQuestions] = useState<any[]>([]);
  const [activeTranslationQuestion, setActiveTranslationQuestion] = useState<any>(null);
  const [translationIndex, setTranslationIndex] = useState<number>(1);
  const [translationInput, setTranslationInput] = useState<string>('');
  const [translationIsAnswered, setTranslationIsAnswered] = useState<boolean>(false);
  const [translationShowAnswer, setTranslationShowAnswer] = useState<boolean>(false);
  const [translationDirection, setTranslationDirection] = useState<'vi-to-ja' | 'ja-to-vi'>('vi-to-ja');
  const [translationScore, setTranslationScore] = useState<number>(0);
  const [isListeningTranslationMode, setIsListeningTranslationMode] = useState<boolean>(false);

  // Sinh câu hỏi dịch đơn lẻ (Endless Mode) theo lessonId của bài hiện tại
  const handleStartTranslation = (dir = translationDirection) => {
    if (vocabItems && vocabItems.length > 0) {
      const currentLessonId = Number(id) || 103;
      const q = generateSingleDynamicSentence(vocabItems, dir, currentLessonId);
      setActiveTranslationQuestion(q);
      
      // Đồng thời sinh mảng câu hỏi làm database giả lập cho tab trắc nghiệm nghe hiểu
      const mockQuestions = generateDynamicSentence(vocabItems, dir, currentLessonId);
      setTranslationQuestions(mockQuestions);

      setTranslationIndex(1);
      setTranslationInput('');
      setTranslationIsAnswered(false);
      setTranslationShowAnswer(false);
      setTranslationScore(0);
      
      // Tự động phát âm nếu ở chế độ nghe dịch
      if (dir === 'ja-to-vi' && isListeningTranslationMode) {
        setTimeout(() => {
          playAudioWithFallback(q.japanese, q.japanese);
        }, 300);
      }
    }
  };

  const handleNextTranslation = () => {
    if (vocabItems && vocabItems.length > 0) {
      const currentLessonId = Number(id) || 103;
      const q = generateSingleDynamicSentence(vocabItems, translationDirection, currentLessonId);
      setActiveTranslationQuestion(q);
      setTranslationIndex(prev => prev + 1);
      setTranslationInput('');
      setTranslationIsAnswered(false);
      setTranslationShowAnswer(false);
      
      // Tự động phát âm nếu ở chế độ nghe dịch
      if (translationDirection === 'ja-to-vi' && isListeningTranslationMode) {
        setTimeout(() => {
          playAudioWithFallback(q.japanese, q.japanese);
        }, 300);
      }
    }
  };

  // Tự động chuyển đổi chế độ khi click vào tab grammar của Marugoto
  useEffect(() => {
    if (isMarugoto && currentTab === 'grammar') {
      setGrammarPracticeMode('translation');
    }
  }, [currentTab, isMarugoto]);

  // Sinh câu hỏi ban đầu khi có từ vựng
  useEffect(() => {
    if (isMarugoto && vocabItems && vocabItems.length > 0) {
      if (!activeTranslationQuestion) {
        handleStartTranslation(translationDirection);
      }
    }
  }, [vocabItems, isMarugoto]);
  

  const [transformQuestions, setTransformQuestions] = useState<any[]>([]);

  const [transformIndex, setTransformIndex] = useState<number>(0);

  const [transformScore, setTransformScore] = useState<number>(0);

  const [transformSelectedOption, setTransformSelectedOption] = useState<string | null>(null);

  const [transformIsAnswered, setTransformIsAnswered] = useState<boolean>(false);

  const [transformFinished, setTransformFinished] = useState<boolean>(false);

  const [expandedGrammarId, setExpandedGrammarId] = useState<number | null>(null);

  const [grammarDetailTab, setGrammarDetailTab] = useState<Record<number, 'structure' | 'examples'>>({});

  // Active Lesson Title & Details

  const activeLesson = lessons.find(l => l.id === selectedLessonId);

  const lessonTitle = activeLesson ? activeLesson.title : `Bài ${selectedLessonId}`;

  // Search and Filter States

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const [statusFilter, setStatusFilter] = useState<'all' | 'not_learned' | 'learning' | 'mastered'>('all');

  const [showRadicals, setShowRadicals] = useState<boolean>(false);

  const [showKanjiInVocab, setShowKanjiInVocab] = useState<boolean>(false);

  // Flashcards States

  const [flashcardType, setFlashcardType] = useState<'vocab' | 'kanji'>('vocab');

  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);

  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  // Auto Flashcard Mode States

  const [isAutoMode, setIsAutoMode] = useState<boolean>(false);

  const [isAutoActive, setIsAutoActive] = useState<boolean>(false);

  const [autoCardCount, setAutoCardCount] = useState<number | ''>(10);

  const [autoDelaySeconds, setAutoDelaySeconds] = useState<number | ''>(5);

  const [autoSessionList, setAutoSessionList] = useState<any[]>([]);

  const [autoCurrentIndex, setAutoCurrentIndex] = useState<number>(0);

  const [autoSecondsLeft, setAutoSecondsLeft] = useState<number>(5);

  const [isAutoPaused, setIsAutoPaused] = useState<boolean>(false);

  const [autoResults, setAutoResults] = useState<{ item: any; learned: boolean }[]>([]);

  const [showAutoSummary, setShowAutoSummary] = useState<boolean>(false);

  const [autoMarkOnExpiry, setAutoMarkOnExpiry] = useState<boolean>(false);

  const [autoExpiryLearned, setAutoExpiryLearned] = useState<boolean>(false);

  // Mobile navigation drawer toggle

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Kaiwa States

  const [dialogueItems, setDialogueItems] = useState<DialogueItem[]>([]);

  const [charName, setCharName] = useState<string>('ナム');

  const [charCountry, setCharCountry] = useState<string>('ベトナム');

  const [charOccupation, setCharOccupation] = useState<string>('エンジニア');

  const [charOrganization, setCharOrganization] = useState<string>('FPT');

  const [showRomaji, setShowRomaji] = useState<boolean>(false);

  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);

  const [scriptMode, setScriptMode] = useState<'kanji' | 'hiragana'>('kanji');

  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  // Cando & Culture States
  const [candoChecks, setCandoChecks] = useState<any[]>([]);
  const [cultureData, setCultureData] = useState<any[]>([]);

  // Marugoto Summary States
  const [summaryVocab, setSummaryVocab] = useState<any[]>([]);
  const [summaryGrammar, setSummaryGrammar] = useState<any[]>([]);
  const [summaryLessons, setSummaryLessons] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summarySubTab, setSummarySubTab] = useState<'vocab' | 'grammar'>('vocab');
  const [summaryFilterLesson, setSummaryFilterLesson] = useState<string>('all');
  const [summaryFilterStatus, setSummaryFilterStatus] = useState<string>('all');
  const [summarySearchQuery, setSummarySearchQuery] = useState<string>('');
  const [localSummarySearchQuery, setLocalSummarySearchQuery] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSummarySearchQuery(localSummarySearchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [localSummarySearchQuery]);

  useEffect(() => {
    setLocalSummarySearchQuery(summarySearchQuery);
  }, [summarySearchQuery]);

  // Derived state maps for summary tab
  const computedLessonStatus = useMemo(() => {
    const map: Record<number, 'not_learned' | 'learning' | 'mastered'> = {};
    summaryLessons.forEach(l => {
      const lessonVocab = summaryVocab.filter(v => v.lesson_id === l.id);
      if (lessonVocab.length === 0) {
        map[l.id] = 'not_learned';
        return;
      }
      const allMastered = lessonVocab.every(v => v.status === 'mastered');
      if (allMastered) {
        map[l.id] = 'mastered';
        return;
      }
      const anyLearningOrMastered = lessonVocab.some(v => v.status === 'learning' || v.status === 'mastered');
      if (anyLearningOrMastered) {
        map[l.id] = 'learning';
        return;
      }
      map[l.id] = 'not_learned';
    });
    return map;
  }, [summaryLessons, summaryVocab]);

  const filteredSummaryVocab = useMemo(() => {
    let list = [...summaryVocab];
    if (summaryFilterLesson !== 'all') {
      const lId = parseInt(summaryFilterLesson);
      list = list.filter(v => v.lesson_id === lId);
    }
    if (summaryFilterStatus !== 'all') {
      list = list.filter(v => v.status === summaryFilterStatus);
    }
    if (summarySearchQuery.trim()) {
      const q = summarySearchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.hiragana.toLowerCase().includes(q) ||
        v.romaji.toLowerCase().includes(q) ||
        v.vietnamese_meaning.toLowerCase().includes(q) ||
        (v.kanji_word && v.kanji_word.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      if (a.lesson_id !== b.lesson_id) return a.lesson_id - b.lesson_id;
      return a.id - b.id;
    });
  }, [summaryVocab, summaryFilterLesson, summaryFilterStatus, summarySearchQuery]);

  const filteredSummaryGrammar = useMemo(() => {
    let list = [...summaryGrammar];
    if (summaryFilterLesson !== 'all') {
      const lId = parseInt(summaryFilterLesson);
      list = list.filter(g => g.lesson_id === lId);
    }
    if (summaryFilterStatus !== 'all') {
      list = list.filter(g => {
        const lessonStatus = computedLessonStatus[g.lesson_id] || 'not_learned';
        return lessonStatus === summaryFilterStatus;
      });
    }
    if (summarySearchQuery.trim()) {
      const q = summarySearchQuery.toLowerCase().trim();
      list = list.filter(g => 
        g.title.toLowerCase().includes(q) ||
        g.meaning.toLowerCase().includes(q) ||
        (g.vietnamese_explanation && g.vietnamese_explanation.toLowerCase().includes(q)) ||
        (g.japanese_example && g.japanese_example.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      if (a.lesson_id !== b.lesson_id) return a.lesson_id - b.lesson_id;
      return a.id - b.id;
    });
  }, [summaryGrammar, summaryFilterLesson, summaryFilterStatus, summarySearchQuery, computedLessonStatus]);

  const groupedSummaryVocab = useMemo(() => {
    const groups: Record<number, any[]> = {};
    filteredSummaryVocab.forEach(item => {
      if (!groups[item.lesson_id]) {
        groups[item.lesson_id] = [];
      }
      groups[item.lesson_id].push(item);
    });
    return groups;
  }, [filteredSummaryVocab]);

  const groupedSummaryGrammar = useMemo(() => {
    const groups: Record<number, any[]> = {};
    filteredSummaryGrammar.forEach(item => {
      if (!groups[item.lesson_id]) {
        groups[item.lesson_id] = [];
      }
      groups[item.lesson_id].push(item);
    });
    return groups;
  }, [filteredSummaryGrammar]);

  // Flashcards Status Filter

  const [flashcardFilterStatuses, setFlashcardFilterStatuses] = useState<Record<string, boolean>>({

    not_learned: false,

    learning: false,

    mastered: false

  });

  const [flashcardDropdownOpen, setFlashcardDropdownOpen] = useState<boolean>(false);

  // Luyện tập (Practice) States

  const [practiceMode, setPracticeMode] = useState<'vocab' | 'kanji'>('vocab');

  const [practiceLimit, setPracticeLimit] = useState<number | ''>(10);

  const [practiceType, setPracticeType] = useState<'write' | 'speedrun'>('write');

  const [useRomaji, setUseRomaji] = useState<boolean>(false);

  const [baseShuffledList, setBaseShuffledList] = useState<any[]>([]);

  const [practiceList, setPracticeList] = useState<any[]>([]);

  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});

  const [isGraded, setIsGraded] = useState<boolean>(false);

  const [visibleAnswers, setVisibleAnswers] = useState<Record<string, boolean>>({});

  const [practiceDirection, setPracticeDirection] = useState<'vi-to-ja' | 'ja-to-vi'>('vi-to-ja');

  const [practiceScriptMode, setPracticeScriptMode] = useState<'hiragana' | 'kanji'>('hiragana');

  const practiceResultsRef = useRef<HTMLDivElement | null>(null);

  const practiceTopRef = useRef<HTMLDivElement | null>(null);

  // Marugoto Custom states

  const [vocabSubTab, setVocabSubTab] = useState<'learn' | 'practice' | 'listening'>('learn');

  const [vocabActiveGame, setVocabActiveGame] = useState<'matching' | 'listening'>('matching');

  const [listeningStatusFilter, setListeningStatusFilter] = useState<'all' | 'not_learned' | 'learning' | 'mastered'>('all');

  const [grammarSubTab, setGrammarSubTab] = useState<'learn' | 'practice'>('learn');

  const [practiceSkill, setPracticeSkill] = useState<'listening' | 'speaking' | 'reading' | 'writing'>('listening');

  const [spokenSentences, setSpokenSentences] = useState<Record<string, boolean>>({});

  const [selectedPopupGrammar, setSelectedPopupGrammar] = useState<{ grammar: any, selectedFormType: 'affirmative' | 'negative' | 'interrogative' } | null>(null);

  // Helper chuyển đổi Kanji ví dụ sang Hiragana và sửa lỗi font hiển thị quả trám 

  const cleanAndHiraganizeExample = (text: string, romaji: string) => {

    if (!text) return '';

    let s = text;

    

    // Sửa lỗi font quả trám đôi 

    s = s.replace(/\uFFFD\uFFFD/g, '\u3072\u308d'); 

    s = s.replace(/\uFFFD/g, '\u3072\u308d');

    const map = {

      "\u90e8\u5c4b": "\u3078\u3084", // 部屋 -> へや

      "\u6559\u5ba4": "\u304d\u3087\u3046\u3057\u3064", // 教室 -> きょうしつ

      "\u5b66\u751f": "\u304c\u304f\u305b\u3044", // 学生 -> がくせい

      "\u79c1": "\u305f\u3057", // 私 -> わたし

      "\u592b": "\u304a\u3063\u3068", // 夫 -> おっと

      "\u5bb6\u65cf": "\u304b\u305e\u304f", // 家族 -> かぞく (hoặc かぞく)

      "\u4e00\u4eba": "\u3072\u3068\u308a", // 一人 -> ひとり

      "\u672c": "\u307b\u3093", // 本 -> ほん

      "\u68da": "\u305f\u306a", // 棚 -> taな

      "\u4e0a": "\u3046\u3048", // 上 -> うえ

      "\u304a\u98a8\u5442": "\u304a\u3075\u308d", // お風呂 -> おふろ

      "\u524d": "\u307e\u3048", // 前 -> まえ

      "\u8a66\u9a13": "\u3057\u3051\u3093", // 試験 -> しけん

      "\u91d1\u66dc\u65e5": "\u304d\u3093\u3088\u3046\u3073", // 金曜日 -> きんようび

      "\u65e5\u66dc\u65e5": "\u306b\u3061\u3088\u3046\u3073", // 日曜日 -> にちようび

      "\u4f55\u6642": "\u306a\u3093\u3058", // 何時 -> なんじ

      "\u671d": "\u3042\u3055", // 朝 -> あas

      "\u4eca": "\u3044\u307e", // 今 -> いま

      "\u592b\u5a66": "\u3075\u3046\u3075", // 夫婦 -> ふうふ

      "\u592b\u5a66\u3067": "\u3075\u3046\u3075\u3067", // 夫婦で

      "\u592b\u3068": "\u304a\u3063\u3068\u3068", // 夫と

      "\u5bb6\u65cf\u3068": "\u304b\u305e\u304f\u3068", // 家族と

      "\u4e00\u4eba\u3067": "\u3072\u3068\u308a\u3067", // 一人で

      "\u75c5\u9662": "\u3073\u3087\u3046\u3044\u3093", // 病院 -> びょういん

      "\u85ac": "\u304f\u3059\u308a", // 薬 -> くすり

      "\u8eca": "\u304f\u308b\u307e", // 車 -> くるま

      "\u81ea\u8ee2\u8eca": "\u3058\u3066\u3093\u3057\u3083", // 自転車 -> じてんしゃ

      "\u51b7\u8535\u5eab": "\u308c\u3044\u305e\u3046\u3053", // 冷蔵庫 -> れいぞうこ

      "\u5375": "\u305f\u307e\u3054", // 卵 -> たまご

      "\u5ead": "\u306b\u308f", // 庭 -> にわ

      "\u4f4f\u3093\u3067": "\u3059\u3093\u3067", // 住んで -> すんで

      "広い": "ひろい", // 広い

      "広くない": "ひろくない" // 広くない

    };

    for (const [kanji, hira] of Object.entries(map)) {

      s = s.split(kanji).join(hira);

    }

    s = s.replace(/\u5b66/g, '\u304c\u304f'); // 学 -> がく

    s = s.replace(/\u751f/g, '\u305b\u3044'); // 生 -> せい

    s = s.replace(/\u5ba5/g, '\u3057\u3064'); // 室 -> しつ

    s = s.replace(/\u8a9e/g, '\u3054'); // 語 -> ご

    s = s.replace(/\u4f4f/g, '\u3059'); // 住 -> す

    s = s.replace(/\u66dc\u65e5/g, '\u3088\u3046\u3073'); // 曜日 -> ようび

    s = s.replace(/\u4f55/g, '\u306a\u3093'); // 何 -> なん

    s = s.replace(/\u6642/g, '\u3058'); // 時 -> じ

    s = s.replace(/\u5206/g, '\u3075\u3093'); // 分 -> fuん

    s = s.replace(/\u5e83/g, '\u3072\u308d'); // 広 -> ひろ

    s = s.replace(/\u5925/g, '\u304a\u304a'); // 大 -> おお

    s = s.replace(/\u5c0f/g, '\u3061\u3044'); // 小 -> ちい

    s = s.replace(/\u65b0/g, '\u3042\u305f\u3089'); // 新 -> あたら

    s = s.replace(/\u53e4/g, '\u3075\u308b'); // 古 -> ふる

    s = s.replace(/\u9ad8/g, '\u305f\u304b'); // 高 -> たか

    s = s.replace(/\u5b89/g, '\u3085'); // 安 -> やす

    return s;

  };

  

  // Marugoto Writing Game states

  const [writingQuestions, setWritingQuestions] = useState<{ japanese: string; romaji: string; vietnamese: string }[]>([]);

  const [writingIndex, setWritingIndex] = useState<number>(0);

  const [writingAnswer, setWritingAnswer] = useState<string>('');

  const [writingIsGraded, setWritingIsGraded] = useState<boolean>(false);

  const [writingScore, setWritingScore] = useState<number | null>(null);

  // Marugoto Grammar Particle Game states

  const [particleQuestions, setParticleQuestions] = useState<{

    sentenceWithBlank: string;

    originalSentence: string;

    romaji: string;

    meaning: string;

    correctAnswer: string;

    options: string[];

  }[]>([]);

  const [particleIndex, setParticleIndex] = useState<number>(0);

  const [selectedParticleOption, setSelectedParticleOption] = useState<string | null>(null);

  const [particleIsAnswered, setParticleIsAnswered] = useState<boolean>(false);

  const [particleScore, setParticleScore] = useState<number>(0);

  const [particleFinished, setParticleFinished] = useState<boolean>(false);

  useEffect(() => {

    setPracticeScriptMode('hiragana');

  }, [selectedLessonId]);

  // Practice Status Filter

  const [practiceFilterStatuses, setPracticeFilterStatuses] = useState<Record<string, boolean>>({

    not_learned: false,

    learning: false,

    mastered: false

  });

  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState<boolean>(false);

  // Speedrun Practice States

  const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);

  const [speedrunGameOver, setSpeedrunGameOver] = useState<boolean>(false);

  const [speedrunScore, setSpeedrunScore] = useState<number>(0);

  const [speedrunHighScore, setSpeedrunHighScore] = useState<number>(0);

  const [speedrunQuestion, setSpeedrunQuestion] = useState<VocabItem | null>(null);

  const [speedrunOptions, setSpeedrunOptions] = useState<string[]>([]);

  const [speedrunTimeLeft, setSpeedrunTimeLeft] = useState<number>(10);

  const [speedrunMaxTime, setSpeedrunMaxTime] = useState<number>(10);

  const [speedrunDirection, setSpeedrunDirection] = useState<'ja-to-vi' | 'vi-to-ja'>('ja-to-vi');

  

  // Speedrun Status Filter

  const [speedrunFilterStatuses, setSpeedrunFilterStatuses] = useState<Record<string, boolean>>({

    not_learned: false,

    learning: false,

    mastered: false

  });

  const [speedrunDropdownOpen, setSpeedrunDropdownOpen] = useState<boolean>(false);

  

  const speedrunTimerRef = useRef<any>(null);

  const speedrunScoreRef = useRef<number>(0);

  const practiceResultRef = useRef<HTMLDivElement>(null);

  // Click outside listener for dropdowns

  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      const practiceEl = document.getElementById('practice-dropdown-container');

      if (practiceEl && !practiceEl.contains(event.target as Node)) {

        setPracticeDropdownOpen(false);

      }

      const flashcardsEl = document.getElementById('flashcards-dropdown-container');

      if (flashcardsEl && !flashcardsEl.contains(event.target as Node)) {

        setFlashcardDropdownOpen(false);

      }

      const speedrunEl = document.getElementById('speedrun-dropdown-container');

      if (speedrunEl && !speedrunEl.contains(event.target as Node)) {

        setSpeedrunDropdownOpen(false);

      }

    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {

      document.removeEventListener('mousedown', handleClickOutside);

    };

  }, []);

  // Memoized filtered source list based on selection

  const currentSourceList = useMemo(() => {

    const list = practiceMode === 'vocab' ? vocabItems : kanjiItems;

    const activeStatuses = Object.keys(practiceFilterStatuses).filter(key => practiceFilterStatuses[key]);

    if (activeStatuses.length === 0) {

      return list;

    }

    return list.filter(item => practiceFilterStatuses[item.status]);

  }, [practiceMode, vocabItems, kanjiItems, practiceFilterStatuses]);

  useEffect(() => {

    setPracticeAnswers({});

    setIsGraded(false);

    setVisibleAnswers({});

  }, [practiceDirection]);

  // Accordion Collapse States for Vocab & Kanji

  const [collapsedVocabSections, setCollapsedVocabSections] = useState<Record<string, boolean>>({});

  const [collapsedKanjiSections, setCollapsedKanjiSections] = useState<Record<string, boolean>>({});

  useEffect(() => {

    if (grammarItems.length === 0) return;

    const initialVocabCollapse: Record<string, boolean> = {};

    const initialKanjiCollapse: Record<string, boolean> = {};

    if (grammarIndex !== null) {

      // Collapse all sections except the one corresponding to grammarIndex

      grammarItems.forEach((_, idx) => {

        initialVocabCollapse[idx.toString()] = idx !== grammarIndex;

        initialKanjiCollapse[idx.toString()] = idx !== grammarIndex;

      });

      initialVocabCollapse['supplemental'] = true;

      initialKanjiCollapse['supplemental'] = true;

    } else {

      // If grammarIndex is null, expand all sections by default

      grammarItems.forEach((_, idx) => {

        initialVocabCollapse[idx.toString()] = false;

        initialKanjiCollapse[idx.toString()] = false;

      });

      initialVocabCollapse['supplemental'] = false;

      initialKanjiCollapse['supplemental'] = false;

    }

    setCollapsedVocabSections(initialVocabCollapse);

    setCollapsedKanjiSections(initialKanjiCollapse);

  }, [grammarIndex, grammarItems]);

  const toggleVocabSection = (key: string) => {

    setCollapsedVocabSections(prev => ({

      ...prev,

      [key]: !prev[key]

    }));

  };

  const toggleKanjiSection = (key: string) => {

    setCollapsedKanjiSections(prev => ({

      ...prev,

      [key]: !prev[key]

    }));

  };

  // Play audio voice

  const playAudio = (text: string) => {

    if (typeof window !== 'undefined' && window.speechSynthesis) {

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 

        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (isIOS) {

        showNotification('Lưu ý: Hãy tắt chế độ Im lặng (gạt nút sườn) để nghe thấy tiếng phát âm.');

      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = 'ja-JP';

      

      const voices = window.speechSynthesis.getVoices();

      const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));

      if (jaVoice) {

        utterance.voice = jaVoice;

      }

      

      // GC protection for iOS

      (window as any)._activeUtterances = (window as any)._activeUtterances || [];

      (window as any)._activeUtterances.push(utterance);

      utterance.onend = () => {

        const idx = (window as any)._activeUtterances.indexOf(utterance);

        if (idx > -1) (window as any)._activeUtterances.splice(idx, 1);

      };

      utterance.onerror = () => {

        const idx = (window as any)._activeUtterances.indexOf(utterance);

        if (idx > -1) (window as any)._activeUtterances.splice(idx, 1);

      };

      if (window.speechSynthesis.paused) {

        window.speechSynthesis.resume();

      }

      

      window.speechSynthesis.speak(utterance);

    }

  };

  // Fetch initial lessons

  useEffect(() => {

    async function loadLessons() {

      try {

        const course = selectedLessonId >= 101 ? 'marugoto' : 'minna';

        const lessonData = await api.get(`/api/user/lessons?course=${course}`);

        if (Array.isArray(lessonData)) {

          setLessons(lessonData);

        }

      } catch (error) {

        console.error('Failed to load lessons:', error);

      }

    }

    loadLessons();

  }, [selectedLessonId]);

  // Fetch vocabulary data when lesson updates

  const loadVocabData = useCallback(async () => {

    setLoading(true);

    try {

      const vocabData = await api.get(`/api/user/lessons/${selectedLessonId}/vocabulary`);

      if (Array.isArray(vocabData)) {

        setVocabItems(vocabData);

      }

    } catch (error) {

      console.error('Failed to load vocabulary:', error);

    } finally {

      setLoading(false);

    }

  }, [selectedLessonId]);

  // Fetch kanji data when lesson updates

  const loadKanjiData = useCallback(async () => {

    setLoading(true);

    try {

      const kanjiData = await api.get(`/api/user/lessons/${selectedLessonId}/kanji`);

      if (Array.isArray(kanjiData)) {

        setKanjiItems(kanjiData);

      }

    } catch (error) {

      console.error('Failed to load kanji:', error);

    } finally {

      setLoading(false);

    }

  }, [selectedLessonId]);

  // Fetch grammar data when lesson updates

  const loadGrammarData = useCallback(async () => {

    setLoading(true);

    try {

      const grammarData = await api.get(`/api/user/lessons/${selectedLessonId}/grammar`);

      if (Array.isArray(grammarData)) {

        setGrammarItems(grammarData);

      }

    } catch (error) {

      console.error('Failed to load grammar:', error);

    } finally {

      setLoading(false);

    }

  }, [selectedLessonId]);

  // Fetch summary data for entire Marugoto course
  const loadSummaryData = useCallback(async () => {
    setLoading(true);
    setSummaryLoading(true);
    try {
      const res = await api.get('/api/user/course-summary?course=marugoto');
      setSummaryLessons(res.lessons || []);
      
      const syllabusVocab = res.vocabulary || [];
      const customVocab = (res.customVocabulary || []).map((v: any) => ({ ...v, isCustom: true }));
      setSummaryVocab([...customVocab, ...syllabusVocab]);

      const syllabusGrammar = res.grammar || [];
      const customGrammar = (res.customGrammar || []).map((g: any) => ({ ...g, isCustom: true }));
      setSummaryGrammar([...customGrammar, ...syllabusGrammar]);
    } catch (error) {
      console.error('Failed to load course summary:', error);
    } finally {
      setSummaryLoading(false);
      setLoading(false);
    }
  }, []);

  // Fetch dialogue data when lesson updates

  const loadDialogueData = useCallback(async () => {

    setLoading(true);

    try {

      const data = await api.get(`/api/user/lessons/${selectedLessonId}/kaiwa`);

      if (Array.isArray(data)) {

        setDialogueItems(data);

      }

    } catch (error) {

      console.error('Failed to load dialogue:', error);

    } finally {

      setLoading(false);

    }

  }, [selectedLessonId]);

  // Fetch cando data when lesson updates

  const loadCandoData = useCallback(async () => {

    setLoading(true);

    try {

      const data = await api.get(`/api/user/lessons/${selectedLessonId}/cando`);

      if (Array.isArray(data)) {

        setCandoChecks(data);

      }

    } catch (error) {

      console.error('Failed to load cando checks:', error);

    } finally {

      setLoading(false);

    }

  }, [selectedLessonId]);

  // Fetch culture data when lesson updates

  const loadCultureData = useCallback(async () => {

    setLoading(true);

    try {

      const data = await api.get(`/api/user/lessons/${selectedLessonId}/culture`);

      if (Array.isArray(data)) {

        setCultureData(data);

      }

    } catch (error) {

      console.error('Failed to load culture content:', error);

    } finally {

      setLoading(false);

    }

  }, [selectedLessonId]);

  // Sinh câu hỏi điền trợ từ cho ngữ pháp Marugoto

  const generateParticleQuestions = useCallback(() => {

    const list: any[] = [];

    const sentences: { japanese: string; romaji: string; vietnamese: string }[] = [];

    

    grammarItems.forEach(g => {

      let examples: any[] = [];

      if (g.examples_json) {

        try {

          examples = typeof g.examples_json === 'string'

            ? JSON.parse(g.examples_json)

            : g.examples_json;

        } catch (e) {

          examples = [];

        }

      }

      

      if (examples.length > 0) {

        sentences.push(...examples);

      } else if (g.japanese_example) {

        sentences.push({

          japanese: g.japanese_example,

          romaji: g.romaji_example || '',

          vietnamese: g.example_meaning

        });

      }

    });

    if (sentences.length === 0) return;

    const particles = ['は', 'が', 'に', 'を', 'de', 'で', 'と', 'も', 'へ', 'の', 'か'];

    sentences.forEach(s => {

      let foundParticle = '';

      let particleIndexInSentence = -1;

      

      for (const p of particles) {

        const idx = s.japanese.indexOf(p);

        if (idx !== -1 && idx > 0 && idx < s.japanese.length - 1) {

          foundParticle = p;

          particleIndexInSentence = idx;

          break;

        }

      }

      if (foundParticle) {

        const sentenceWithBlank = s.japanese.substring(0, particleIndexInSentence) + " 【 ___ 】 " + s.japanese.substring(particleIndexInSentence + 1);

        const otherParticles = particles.filter(p => p !== foundParticle);

        const shuffledOthers = [...otherParticles].sort(() => Math.random() - 0.5).slice(0, 3);

        const options = [...shuffledOthers, foundParticle].sort(() => Math.random() - 0.5);

        list.push({

          sentenceWithBlank,

          originalSentence: s.japanese,

          romaji: s.romaji,

          meaning: s.vietnamese,

          correctAnswer: foundParticle,

          options

        });

      } else {

        const mid = Math.floor(s.japanese.length / 2);

        const char = s.japanese[mid];

        if (char && char !== '。' && char !== '、' && char !== '?' && char !== '？' && char !== ' ' && char !== '　') {

          const sentenceWithBlank = s.japanese.substring(0, mid) + " 【 ___ 】 " + s.japanese.substring(mid + 1);

          const options = [char, 'は', 'が', 'に'].sort(() => Math.random() - 0.5);

          list.push({

            sentenceWithBlank,

            originalSentence: s.japanese,

            romaji: s.romaji,

            meaning: s.vietnamese,

            correctAnswer: char,

            options

          });

        }

      }

    });

    if (list.length === 0) return;

    const shuffled = list.sort(() => Math.random() - 0.5).slice(0, Math.min(10, list.length));

    setParticleQuestions(shuffled);

    setParticleIndex(0);

    setSelectedParticleOption(null);

    setParticleIsAnswered(false);

    setParticleScore(0);

    setParticleFinished(false);

  }, [grammarItems]);

  // Sinh câu hỏi dịch câu viết cho Marugoto Writing

  const generateWritingQuestions = useCallback(() => {

    const list: any[] = [];

    

    grammarItems.forEach(g => {

      let examples: any[] = [];

      if (g.examples_json) {

        try {

          examples = typeof g.examples_json === 'string'

            ? JSON.parse(g.examples_json)

            : g.examples_json;

        } catch (e) {

          examples = [];

        }

      }

      

      if (examples.length > 0) {

        list.push(...examples);

      } else if (g.japanese_example) {

        list.push({

          japanese: g.japanese_example,

          romaji: g.romaji_example || '',

          vietnamese: g.example_meaning

        });

      }

    });

    if (list.length === 0) return;

    const shuffled = list.sort(() => Math.random() - 0.5).slice(0, Math.min(5, list.length));

    setWritingQuestions(shuffled);

    setWritingIndex(0);

    setWritingAnswer('');

    setWritingIsGraded(false);

    setWritingScore(null);

  }, [grammarItems]);

  const generateTransformQuestions = useCallback(() => {

    const questions: any[] = [];

    

    grammarItems.forEach(g => {

      let examples: any[] = [];

      try {

        examples = typeof g.examples_json === 'string'

          ? JSON.parse(g.examples_json)

          : (g.examples_json || []);

      } catch (e) {

        examples = [];

      }

      if (examples.length === 0) return;

      const affEx = examples.find(e => (e.type || 'affirmative') === 'affirmative');

      if (!affEx) return;

      const negEx = examples.find(e => e.type === 'negative');

      const intEx = examples.find(e => e.type === 'interrogative');

      if (negEx) {

        const wrongOption1 = intEx ? intEx.japanese : 'いいえ、ちがいます。';

        const wrongOption2 = affEx.japanese;

        const wrongOption3 = 'わたしは　...です。';

        const options = [negEx.japanese, wrongOption1, wrongOption2, wrongOption3]

          .filter((v, i, a) => a.indexOf(v) === i)

          .sort(() => Math.random() - 0.5);

        questions.push({

          originalSentence: affEx.japanese,

          originalRomaji: affEx.romaji,

          originalMeaning: affEx.vietnamese,

          targetForm: 'negative',

          targetFormVi: 'Phủ định',

          correctAnswer: negEx.japanese,

          correctRomaji: negEx.romaji,

          correctMeaning: negEx.vietnamese,

          options

        });

      }

      if (intEx) {

        const wrongOption1 = negEx ? negEx.japanese : 'いいえ、ちがいます。';

        const wrongOption2 = affEx.japanese;

        const wrongOption3 = 'わたしは　...です。';

        const options = [intEx.japanese, wrongOption1, wrongOption2, wrongOption3]

          .filter((v, i, a) => a.indexOf(v) === i)

          .sort(() => Math.random() - 0.5);

        questions.push({

          originalSentence: affEx.japanese,

          originalRomaji: affEx.romaji,

          originalMeaning: affEx.vietnamese,

          targetForm: 'interrogative',

          targetFormVi: 'Nghi vấn',

          correctAnswer: intEx.japanese,

          correctRomaji: intEx.romaji,

          correctMeaning: intEx.vietnamese,

          options

        });

      }

    });

    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 8);

    setTransformQuestions(shuffled);

    setTransformIndex(0);

    setTransformScore(0);

    setTransformSelectedOption(null);

    setTransformIsAnswered(false);

    setTransformFinished(false);

  }, [grammarItems]);

    useEffect(() => {

    if (isMarugoto && grammarItems.length > 0) {

      generateParticleQuestions();

      generateWritingQuestions();

      generateTransformQuestions();

    }

  }, [isMarugoto, grammarItems, generateParticleQuestions, generateWritingQuestions, generateTransformQuestions]);

  // Handle Can-do status changes

  const handleCandoStatusChange = async (itemId: number, newStatus: 'not_learned' | 'learning' | 'mastered') => {

    try {

      await api.post('/api/user/progress', {

        item_type: 'cando',

        item_id: itemId,

        status: newStatus

      });

      setCandoChecks(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));

      showNotification('Đã lưu đánh giá Can-do! 🎯');

    } catch (error) {

      console.error('Failed to update cando status:', error);

      showNotification('Lỗi lưu trạng thái đánh giá.');

    }

  };

  // Dynamic Dialogue Substitution Helper

  const hasRoleplay = useMemo(() => {

    return !!(

      activeLesson?.roleplay_options &&

      (

        (activeLesson.roleplay_options.names && activeLesson.roleplay_options.names.length > 0) ||

        (activeLesson.roleplay_options.countries && activeLesson.roleplay_options.countries.length > 0) ||

        (activeLesson.roleplay_options.occupations && activeLesson.roleplay_options.occupations.length > 0) ||

        (activeLesson.roleplay_options.organizations && activeLesson.roleplay_options.organizations.length > 0)

      )

    );

  }, [activeLesson]);

  const substituteText = (text: string) => {

    if (!text) return '';

    if (!hasRoleplay) return text;

    let result = text;

    const opts = activeLesson?.roleplay_options;

    // 1. Substitute Country

    if (opts?.countries && opts.countries.length > 0) {

      result = result.replace(/ベトナム/g, '__MASK_COUNTRY_JA__');

      result = result.replace(/nước Việt Nam/g, '__MASK_COUNTRY_VN_FULL__');

      result = result.replace(/Việt Nam/g, '__MASK_COUNTRY_VN__');

      result = result.replace(/Betonamu/g, '__MASK_COUNTRY_ROM__');

    }

    // 2. Substitute Name

    if (opts?.names && opts.names.length > 0) {

      result = result.replace(/ナム/g, charName);

      const romName = jaToRomajiDict[charName] || charName;

      result = result.replace(/Namu/g, romName);

      const vnName = jaToVnDict[charName] || charName;

      result = result.replace(/Nam/g, vnName);

    }

    // 3. Substitute Occupation

    if (opts?.occupations && opts.occupations.length > 0) {

      result = result.replace(/エンジニア/g, charOccupation);

      const vnOcc = jaToVnDict[charOccupation] || charOccupation;

      result = result.replace(/kỹ sư/g, vnOcc);

      const romOcc = jaToRomajiDict[charOccupation] || charOccupation;

      result = result.replace(/Enjinia/g, romOcc.charAt(0).toUpperCase() + romOcc.slice(1));

      result = result.replace(/enjinia/g, romOcc);

    }

    // 4. Substitute Organization

    if (opts?.organizations && opts.organizations.length > 0) {

      const romOrg = jaToRomajiDict[charOrganization] || charOrganization;

      result = result.replace(/FPT/g, romOrg);

    }

    // 5. Unmask Country/Nationality with selected values

    if (opts?.countries && opts.countries.length > 0) {

      result = result.replace(/__MASK_COUNTRY_JA__/g, charCountry);

      const vnCountry = jaToVnDict[charCountry] || charCountry;

      const vnCountryFull = jaToVnDict[charCountry] ? 'nước ' + jaToVnDict[charCountry] : charCountry;

      result = result.replace(/__MASK_COUNTRY_VN_FULL__/g, vnCountryFull);

      result = result.replace(/__MASK_COUNTRY_VN__/g, vnCountry);

      const romCountry = jaToRomajiDict[charCountry] || charCountry;

      result = result.replace(/__MASK_COUNTRY_ROM__/g, romCountry);

    }

    return result;

  };

  // Toggle Topic Collapse/Expand Helper

  const toggleTopic = (topicName: string) => {

    setCollapsedTopics((prev) => ({

      ...prev,

      [topicName]: !prev[topicName],

    }));

  };

  // Group Dialogue Items by Topic

  const groupedDialogues = useMemo(() => {

    const groups: { topic: string; items: DialogueItem[] }[] = [];

    dialogueItems.forEach((item) => {

      const topicName = item.topic || 'Chủ đề chung';

      let group = groups.find((g) => g.topic === topicName);

      if (!group) {

        group = { topic: topicName, items: [] };

        groups.push(group);

      }

      group.items.push(item);

    });

    return groups;

  }, [dialogueItems]);

  // Convert Kanji to Hiragana Helper for Dialogue Script Mode

  const convertKanjiToHira = (text: string) => {

    if (!text) return '';

    let result = text;

    const kanjiMap: Record<string, string> = {

      '私は': 'わたしは',

      '私': 'わたし',

      '学生': 'がくせい',

      '教師': 'きょうし',

      '何歳': 'なんさい',

      'おいくつ（何歳）': 'おいくつ（なんさい）',

      '歳': 'さい',

      'あの人': 'あのひと',

      'ブラジル人': 'ブラジルじん',

      'アメリカ人': 'アメリカじん',

      '日本人': 'にほんじん',

      'ベトナム人': 'ベトナムじん',

      'イギリス人': 'イギリスじん',

      'フランス人': 'フランスじん',

      '失礼': 'しつれい',

      '名前': 'なまえ'

    };

    for (const [key, val] of Object.entries(kanjiMap)) {

      const regex = new RegExp(key, 'g');

      result = result.replace(regex, val);

    }

    return result;

  };

  // Việt hóa Từ loại

  const getWordTypeVietnamese = (type: string) => {

    switch (type?.toLowerCase()) {

      case 'noun': return 'Danh từ';

      case 'verb': return 'Động từ';

      case 'adjective': return 'Tính từ';

      case 'adverb': return 'Trạng từ';

      case 'pronoun': return 'Đại từ';

      case 'particle': return 'Trợ từ';

      case 'conjunction': return 'Liên từ';

      case 'expression': return 'Thành ngữ';

      default: return type || 'Từ loại';

    }

  };

  // Tính % Đúng (Accuracy)

  const calculateAccuracy = (input: string, correct: string) => {

    const cleanInput = (input || '').trim().toLowerCase();

    const cleanCorrect = (correct || '').trim().toLowerCase();

    if (!cleanInput) return 0;

    if (cleanInput === cleanCorrect) return 100;

    

    // Handle parentheses options like "techou (techō)"

    if (cleanCorrect.includes('(')) {

      const mainOption = cleanCorrect.split('(')[0].trim();

      const parenOption = cleanCorrect.substring(cleanCorrect.indexOf('(') + 1, cleanCorrect.indexOf(')')).trim();

      

      if (cleanInput === mainOption || cleanInput === parenOption) {

        return 100;

      }

      

      // Calculate matching accuracy against the primary option

      let matches = 0;

      const minLen = Math.min(cleanInput.length, mainOption.length);

      for (let i = 0; i < minLen; i++) {

        if (cleanInput[i] === mainOption[i]) {

          matches++;

        }

      }

      const maxLen = Math.max(cleanInput.length, mainOption.length);

      return Math.round((matches / maxLen) * 100);

    }

    

    let matches = 0;

    const minLen = Math.min(cleanInput.length, cleanCorrect.length);

    for (let i = 0; i < minLen; i++) {

      if (cleanInput[i] === cleanCorrect[i]) {

        matches++;

      }

    }

    const maxLen = Math.max(cleanInput.length, cleanCorrect.length);

    return Math.round((matches / maxLen) * 100);

  };

  const renderDiff = (input: string, correct: string) => {

    const cleanInput = (input || '').trim().toLowerCase().replace(/\s+/g, '');

    const cleanCorrect = (correct || '').trim().toLowerCase().replace(/\s+/g, '');

    

    if (!cleanInput) {

      return <span className="text-red-600 dark:text-red-400 font-bold">{cleanCorrect}</span>;

    }

    

    const result: React.ReactNode[] = [];

    const maxLen = Math.max(cleanInput.length, cleanCorrect.length);

    

    for (let i = 0; i < maxLen; i++) {

      const userChar = cleanInput[i];

      const correctChar = cleanCorrect[i];

      

      if (userChar === correctChar) {

        result.push(

          <span key={i} className="text-emerald-600 dark:text-emerald-400 font-bold">

            {userChar}

          </span>

        );

      } else {

        if (userChar !== undefined) {

          result.push(

            <span key={i} className="text-red-600 dark:text-red-400 font-bold underline decoration-wavy" title={`Đúng ra là: ${correctChar || 'khoảng trống'}`}>

              {userChar}

            </span>

          );

        } else {

          result.push(

            <span key={i} className="text-red-500/60 font-bold line-through" title={`Thiếu ký tự: ${correctChar}`}>

              {correctChar}

            </span>

          );

        }

      }

    }

    return <span className="inline-flex items-center gap-0.5">{result}</span>;

  };

  // Text khích lệ

  const getEncouragementText = (pct: number) => {

    if (pct === 100) return 'Xuất sắc! 🎉';

    if (pct >= 80) return 'Tuyệt vời! 🌟';

    if (pct >= 50) return 'Cố lên một chút nữa! 💪';

    if (pct > 0) return 'Hãy cố gắng nhé! 👍';

    return 'Chưa đúng, hãy thử lại! ✏️';

  };

  // Sinh đề thi lặp lại ngẫu nhiên các từ cho đủ giới hạn câu hỏi

  const generatePracticeList = (sourceList: any[], limit: number) => {

    if (sourceList.length === 0) return [];

    

    let repeatedList: any[] = [];

    while (repeatedList.length < limit) {

      // Tráo ngẫu nhiên mỗi lượt lặp để phân phối từ đều đặn hơn

      const batch = [...sourceList].sort(() => Math.random() - 0.5);

      repeatedList = [...repeatedList, ...batch];

    }

    

    const selection = repeatedList.slice(0, limit);

    return selection.map((item, idx) => ({

      ...item,

      uniqueId: `${item.id}-${idx}-${Math.random().toString(36).substr(2, 9)}`

    }));

  };

  // Tráo đề (Shuffle)

  const handleShufflePractice = () => {

    if (currentSourceList.length === 0) return;

    const newList = generatePracticeList(currentSourceList, practiceLimit === '' ? 10 : practiceLimit);

    setBaseShuffledList(newList);

    setPracticeList(newList);

    setPracticeAnswers({});

    setIsGraded(false);

    setVisibleAnswers({});

    setMessage('Đã xáo trộn danh sách câu hỏi! 🔀');

    setTimeout(() => setMessage(null), 3000);

  };

  // Tính số câu đúng

  const correctCount = useMemo(() => {

    let count = 0;

    practiceList.forEach((item) => {

      const isVocab = practiceMode === 'vocab';

      const isViToJa = practiceDirection === 'vi-to-ja';

      let correctAnswer = '';

      if (isVocab) {

        correctAnswer = isViToJa 

          ? (useRomaji ? item.romaji : item.hiragana) 

          : item.vietnamese_meaning;

      } else {

        correctAnswer = isViToJa ? item.character : item.sino_vietnamese;

      }

      const userAnswer = practiceAnswers[item.uniqueId] || '';

      if (calculateAccuracy(userAnswer, correctAnswer) === 100) {

        count++;

      }

    });

    return count;

  }, [practiceList, practiceMode, practiceDirection, useRomaji, practiceAnswers]);

  // Tự động cuộn xuống phần kết quả khi nhấn Chấm điểm

  useEffect(() => {

    if (isGraded && practiceResultsRef.current) {

      practiceResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    }

  }, [isGraded]);

  // Thay đổi giới hạn câu hỏi

  const handleLimitChange = (val: string) => {

    if (val === '') {

      setPracticeLimit('');

      return;

    }

    const num = parseInt(val);

    if (isNaN(num)) {

      setPracticeLimit('');

      return;

    }

    const maxVal = practiceMode === 'vocab' ? vocabItems.length : kanjiItems.length;

    setPracticeLimit(num);

    if (num >= 1 && num <= maxVal && currentSourceList.length > 0) {

      const newList = generatePracticeList(currentSourceList, num);

      setBaseShuffledList(newList);

      setPracticeList(newList);

      setPracticeAnswers({});

      setIsGraded(false);

      setVisibleAnswers({});

    }

  };

  const handleLimitBlur = () => {

    const maxVal = practiceMode === 'vocab' ? vocabItems.length : kanjiItems.length;

    let cleanNum = 10; // default fallback

    if (practiceLimit !== '') {

      const num = typeof practiceLimit === 'number' ? practiceLimit : parseInt(practiceLimit);

      if (!isNaN(num)) {

        cleanNum = Math.max(1, Math.min(num, maxVal));

      }

    } else {

      cleanNum = 1;

    }

    setPracticeLimit(cleanNum);

    if (currentSourceList.length > 0) {

      const newList = generatePracticeList(currentSourceList, cleanNum);

      setBaseShuffledList(newList);

      setPracticeList(newList);

      setPracticeAnswers({});

      setIsGraded(false);

      setVisibleAnswers({});

    }

  };

  useEffect(() => {
    if (isMarugoto) {
      if (currentTab === 'vocab') {
        loadVocabData();
      } else if (currentTab === 'grammar') {
        loadGrammarData();
        loadVocabData(); // Tải từ vựng để hỗ trợ các tab luyện tập ngữ pháp động của Marugoto
      } else if (currentTab === 'practice') {
        loadVocabData();
        loadGrammarData();
        loadDialogueData();
      } else if (currentTab === 'cando') {
        loadCandoData();
      } else if (currentTab === 'culture') {
        loadCultureData();
      } else if (currentTab === 'summary') {
        loadSummaryData();
      }
    } else {
      if (currentTab === 'vocab') {
        loadVocabData();
        loadGrammarData();
      } else if (currentTab === 'kanji') {
        loadKanjiData();
        loadGrammarData();
      } else if (currentTab === 'grammar') {
        loadGrammarData();
      } else if (currentTab === 'flashcards') {
        loadVocabData();
        loadKanjiData();
      } else if (currentTab === 'kaiwa') {
        loadDialogueData();
      } else if (currentTab === 'practice') {
        loadVocabData();
        loadKanjiData();
      } else if (currentTab === 'cando') {
        loadCandoData();
      } else if (currentTab === 'culture') {
        loadCultureData();
      }
    }
  }, [currentTab, isMarugoto, loadVocabData, loadKanjiData, loadGrammarData, loadDialogueData, loadCandoData, loadCultureData, loadSummaryData]);

  // Load initial practice list once vocabulary or kanji is available

  useEffect(() => {

    const isPracticeActive = currentTab === 'practice' || (isMarugoto && currentTab === 'vocab' && vocabSubTab === 'practice');

    if (isPracticeActive) {

      if (currentSourceList.length > 0 && baseShuffledList.length === 0) {

        const newList = generatePracticeList(currentSourceList, practiceLimit === '' ? 10 : practiceLimit);

        setBaseShuffledList(newList);

        setPracticeList(newList);

      }

    }

  }, [currentTab, vocabSubTab, isMarugoto, currentSourceList, practiceLimit, baseShuffledList.length]);

  // Reset practice state when practice mode or status filter changes

  useEffect(() => {

    setBaseShuffledList([]);

    setPracticeList([]);

    setPracticeAnswers({});

    setIsGraded(false);

    setVisibleAnswers({});

    setUseRomaji(false);

  }, [practiceMode, practiceFilterStatuses]);

  const activeList = useMemo(() => {

    const list = flashcardType === 'vocab' ? vocabItems : kanjiItems;

    const activeStatuses = Object.keys(flashcardFilterStatuses).filter(key => flashcardFilterStatuses[key]);

    if (activeStatuses.length === 0) {

      return list;

    }

    return list.filter(item => flashcardFilterStatuses[item.status]);

  }, [flashcardType, vocabItems, kanjiItems, flashcardFilterStatuses]);

  const totalItemsCount = activeList.length;

  const rangedList = activeList;

  useEffect(() => {

    if (currentTab === 'flashcards') {

      setCurrentCardIndex(0);

      setIsFlipped(false);

      setIsShuffle(false);

      setShuffledIndices([]);

    }

  }, [flashcardType, totalItemsCount, currentTab]);

  const toggleShuffle = () => {

    const nextShuffle = !isShuffle;

    setIsShuffle(nextShuffle);

    if (nextShuffle && rangedList.length > 0) {

      const indices = Array.from({ length: rangedList.length }, (_, i) => i);

      for (let i = indices.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [indices[i], indices[j]] = [indices[j], indices[i]];

      }

      setShuffledIndices(indices);

      setCurrentCardIndex(0);

    } else {

      setCurrentCardIndex(0);

    }

    setIsFlipped(false);

  };

  const getActiveCard = () => {

    if (isAutoActive) {

      if (autoSessionList.length === 0) return null;

      return autoSessionList[autoCurrentIndex];

    }

    if (rangedList.length === 0) return null;

    const index = isShuffle && shuffledIndices.length === rangedList.length

      ? shuffledIndices[currentCardIndex]

      : currentCardIndex;

    const safeIndex = Math.min(Math.max(0, index), rangedList.length - 1);

    return rangedList[safeIndex];

  };

  const activeCard = getActiveCard();

  const handleNextCard = () => {

    if (rangedList.length === 0) return;

    const nextFn = () => {

      setCurrentCardIndex((prev) => (prev + 1) % rangedList.length);

    };

    if (isFlipped) {

      setIsFlipped(false);

      setTimeout(nextFn, 150);

    } else {

      nextFn();

    }

  };

  const handlePrevCard = () => {

    if (rangedList.length === 0) return;

    const prevFn = () => {

      setCurrentCardIndex((prev) => (prev - 1 + rangedList.length) % rangedList.length);

    };

    if (isFlipped) {

      setIsFlipped(false);

      setTimeout(prevFn, 150);

    } else {

      prevFn();

    }

  };

  // Update study status

  const handleStatusChange = async (itemId: number, newStatus: 'not_learned' | 'learning' | 'mastered') => {

    try {

      await api.post('/api/user/progress', {

        item_type: 'vocabulary',

        item_id: itemId,

        status: newStatus

      });

      setVocabItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));

      showNotification('Đã cập nhật trạng thái học tập!');

    } catch (error) {

      console.error('Failed to update status:', error);

      showNotification('Lỗi cập nhật trạng thái học tập.');

    }

  };

  // Update kanji study status

  const handleKanjiStatusChange = async (itemId: number, newStatus: 'not_learned' | 'learning' | 'mastered') => {

    try {

      await api.post('/api/user/progress', {

        item_type: 'kanji',

        item_id: itemId,

        status: newStatus

      });

      setKanjiItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));

      showNotification('Đã cập nhật trạng thái học tập chữ Hán!');

    } catch (error) {

      console.error('Failed to update kanji status:', error);

      showNotification('Lỗi cập nhật trạng thái học tập.');

    }

  };

  // Update grammar study status

  const handleGrammarStatusChange = async (itemId: number, newStatus: 'not_learned' | 'learning' | 'mastered') => {

    try {

      await api.post('/api/user/progress', {

        item_type: 'grammar',

        item_id: itemId,

        status: newStatus

      });

      setGrammarItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));

      showNotification('Đã cập nhật trạng thái học tập ngữ pháp!');

    } catch (error) {

      console.error('Failed to update grammar status:', error);

      showNotification('Lỗi cập nhật trạng thái học tập.');

    }

  };

  const showNotification = (msg: string) => {

    setMessage(msg);

    setTimeout(() => {

      setMessage(null);

    }, 2500);

  };

  // Khi lật thẻ (thủ công hoặc tự động), reset bộ đếm ngược

  useEffect(() => {

    if (isAutoActive) {

      setAutoSecondsLeft(autoDelaySeconds === '' ? 5 : autoDelaySeconds);

    }

  }, [isFlipped, isAutoActive, autoDelaySeconds]);

  // Auto Flashcard Mode Timer Effect

  useEffect(() => {

    let timer: NodeJS.Timeout;

    if (isAutoActive && !isAutoPaused && !showAutoSummary) {

      if (!isFlipped || autoMarkOnExpiry) {

        timer = setInterval(() => {

          setAutoSecondsLeft((prev) => {

            if (prev <= 1) {

              clearInterval(timer);

              if (!isFlipped) {

                setIsFlipped(true); // Lật thẻ khi đếm ngược về 0 ở mặt trước

                return 0;

              } else {

                // Đã ở mặt sau và hết giờ -> Tự động đánh giá trạng thái tuỳ chọn của người dùng

                handleAutoCheck(autoExpiryLearned);

                return 0;

              }

            }

            return prev - 1;

          });

        }, 1000);

      }

    }

    return () => {

      if (timer) clearInterval(timer);

    };

  }, [isAutoActive, isAutoPaused, isFlipped, showAutoSummary, autoMarkOnExpiry, autoExpiryLearned, autoDelaySeconds]);

  // Reset auto flashcard state when changing tab or leaving flashcards

  useEffect(() => {

    if (currentTab !== 'flashcards') {

      setIsAutoActive(false);

      setIsAutoMode(false);

      setShowAutoSummary(false);

    }

  }, [currentTab]);

  const startAutoSession = () => {

    if (rangedList.length === 0) {

      showNotification('Không có thẻ nào phù hợp với bộ lọc hiện tại để học.');

      return;

    }

    

    // Construct session list with repeats if needed

    const newList = [];

    const limit = autoCardCount === '' ? 10 : autoCardCount;

    for (let i = 0; i < limit; i++) {

      newList.push(rangedList[i % rangedList.length]);

    }

    

    // If shuffle is active, shuffle the list

    if (isShuffle) {

      for (let i = newList.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [newList[i], newList[j]] = [newList[j], newList[i]];

      }

    }

    

    setAutoSessionList(newList);

    setAutoCurrentIndex(0);

    setAutoSecondsLeft(autoDelaySeconds === '' ? 5 : autoDelaySeconds);

    setIsAutoPaused(false);

    setAutoResults([]);

    setIsFlipped(false);

    setShowAutoSummary(false);

    setIsAutoActive(true);

  };

  const handleAutoCheck = async (learned: boolean) => {

    const currentItem = autoSessionList[autoCurrentIndex];

    if (!currentItem) return;

    // Save result to track in summary

    setAutoResults((prev) => [...prev, { item: currentItem, learned }]);

    // Update study status in database/mock database

    try {

      const newStatus = learned ? 'mastered' : 'learning';

      if (flashcardType === 'vocab') {

        await handleStatusChange(currentItem.id, newStatus);

      } else {

        await handleKanjiStatusChange(currentItem.id, newStatus);

      }

    } catch (err) {

      console.error('Failed to update status in auto flashcard check:', err);

    }

    // Go to next card or show summary

    if (autoCurrentIndex < autoSessionList.length - 1) {

      setIsFlipped(false);

      setTimeout(() => {

        setAutoCurrentIndex((prev) => prev + 1);

        setAutoSecondsLeft(autoDelaySeconds === '' ? 5 : autoDelaySeconds);

      }, 150);

    } else {

      setShowAutoSummary(true);

    }

  };

  const exitAutoMode = () => {

    setIsAutoActive(false);

    setIsAutoMode(false);

    setShowAutoSummary(false);

    setIsFlipped(false);

  };

  const handleLevelChange = (selectedLevel: 'N5' | 'N4') => {

    const targetId = selectedLevel === 'N5' ? 1 : 26;

    router.push(`/lessons/${targetId}?tab=${currentTab}`);

  };

  const handleLessonChange = (newId: number) => {

    router.push(`/lessons/${newId}?tab=${currentTab}`);

  };

  // Speedrun Source List with filter

  const speedrunSourceList = useMemo(() => {

    const active = Object.keys(speedrunFilterStatuses).filter(k => speedrunFilterStatuses[k]);

    if (active.length === 0) return vocabItems;

    return vocabItems.filter(item => speedrunFilterStatuses[item.status]);

  }, [vocabItems, speedrunFilterStatuses]);

  // Speedrun Practice Game Logic

  useEffect(() => {

    if (typeof window !== 'undefined') {

      const saved = localStorage.getItem(`vocab_speedrun_high_score_${selectedLessonId}_${speedrunDirection}`);

      if (saved) {

        setSpeedrunHighScore(parseInt(saved) || 0);

      } else {

        setSpeedrunHighScore(0);

      }

    }

  }, [selectedLessonId, speedrunDirection]);

  const nextSpeedrunQuestion = useCallback((currentScore: number) => {

    const randomQuestion = speedrunSourceList[Math.floor(Math.random() * speedrunSourceList.length)];

    setSpeedrunQuestion(randomQuestion);

    const distractors = speedrunSourceList

      .filter(item => item.id !== randomQuestion.id)

      .map(item => speedrunDirection === 'ja-to-vi' ? item.vietnamese_meaning : item.hiragana);

    const shuffledDist = [...distractors].sort(() => Math.random() - 0.5).slice(0, 3);

    const correctOption = speedrunDirection === 'ja-to-vi' ? randomQuestion.vietnamese_meaning : randomQuestion.hiragana;

    const choices = [...shuffledDist, correctOption].sort(() => Math.random() - 0.5);

    setSpeedrunOptions(choices);

    const maxTime = Math.max(3, 10 - Math.floor(currentScore / 2) * 0.5);

    setSpeedrunMaxTime(maxTime);

    setSpeedrunTimeLeft(maxTime);

    if (speedrunTimerRef.current) {

      clearInterval(speedrunTimerRef.current);

    }

    const startTime = Date.now();

    speedrunTimerRef.current = setInterval(() => {

      const elapsed = (Date.now() - startTime) / 1000;

      const remaining = Math.max(0, maxTime - elapsed);

      setSpeedrunTimeLeft(remaining);

      if (remaining <= 0) {

        clearInterval(speedrunTimerRef.current);

        setSpeedrunGameOver(true);

        setSpeedrunActive(false);

        // Save high score

        const finalScore = speedrunScoreRef.current;

        const key = `vocab_speedrun_high_score_${selectedLessonId}_${speedrunDirection}`;

        const savedHigh = localStorage.getItem(key);

        const currentHigh = savedHigh ? parseInt(savedHigh) || 0 : 0;

        if (finalScore > currentHigh) {

          setSpeedrunHighScore(finalScore);

          localStorage.setItem(key, finalScore.toString());

          setMessage(`Kỷ lục mới: ${finalScore} điểm! 🎉`);

          setTimeout(() => setMessage(null), 2500);

        }

      }

    }, 50);

  }, [speedrunSourceList, selectedLessonId, speedrunDirection]);

  const startSpeedrun = () => {

    if (speedrunSourceList.length < 4) {

      showNotification('Không đủ từ vựng để chơi phản xạ.');

      return;

    }

    setSpeedrunActive(true);

    setSpeedrunGameOver(false);

    setSpeedrunScore(0);

    speedrunScoreRef.current = 0;

    setSpeedrunTimeLeft(10);

    setSpeedrunMaxTime(10);

    nextSpeedrunQuestion(0);

  };

  const stopSpeedrun = useCallback(() => {

    setSpeedrunActive(false);

    setSpeedrunGameOver(false);

    if (speedrunTimerRef.current) {

      clearInterval(speedrunTimerRef.current);

    }

  }, []);

  // Stop speedrun when status filter changes

  useEffect(() => {

    stopSpeedrun();

  }, [speedrunFilterStatuses, stopSpeedrun]);

  const checkSpeedrunAnswer = (selected: string) => {

    if (!speedrunQuestion) return;

    

    if (speedrunTimerRef.current) {

      clearInterval(speedrunTimerRef.current);

    }

    const isCorrect = speedrunDirection === 'ja-to-vi'

      ? calculateAccuracy(selected, speedrunQuestion.vietnamese_meaning) === 100

      : selected === speedrunQuestion.hiragana;

      

    if (isCorrect) {

      const nextScore = speedrunScoreRef.current + 1;

      speedrunScoreRef.current = nextScore;

      setSpeedrunScore(nextScore);

      playAudioWithFallback(getKanjiForm(speedrunQuestion.hiragana, kanjiItems), speedrunQuestion.hiragana);

      nextSpeedrunQuestion(nextScore);

    } else {

      setSpeedrunGameOver(true);

      setSpeedrunActive(false);

      // Save high score

      const finalScore = speedrunScoreRef.current;

      const key = `vocab_speedrun_high_score_${selectedLessonId}_${speedrunDirection}`;

      const savedHigh = localStorage.getItem(key);

      const currentHigh = savedHigh ? parseInt(savedHigh) || 0 : 0;

      if (finalScore > currentHigh) {

        setSpeedrunHighScore(finalScore);

        localStorage.setItem(key, finalScore.toString());

        setMessage(`Kỷ lục mới: ${finalScore} điểm! 🎉`);

        setTimeout(() => setMessage(null), 2500);

      }

    }

  };

  // Clean up speedrun timer on unmount

  useEffect(() => {

    return () => {

      if (speedrunTimerRef.current) {

        clearInterval(speedrunTimerRef.current);

      }

    };

  }, []);

  // Filtered lists matching current level

  const filteredLessons = lessons.filter(l => {

    if (isMarugoto) return true;

    if (level === 'N5') return l.id >= 1 && l.id <= 25;

    return l.id >= 26 && l.id <= 50;

  });

  // Set default roleplay options when lesson changes

  useEffect(() => {

    if (activeLesson && activeLesson.roleplay_options) {

      const opts = activeLesson.roleplay_options;

      setCharName(opts.names && opts.names.length > 0 ? opts.names[0] : 'ナム');

      setCharCountry(opts.countries && opts.countries.length > 0 ? opts.countries[0] : 'ベトナム');

      setCharOccupation(opts.occupations && opts.occupations.length > 0 ? opts.occupations[0] : 'エンジニア');

      setCharOrganization(opts.organizations && opts.organizations.length > 0 ? opts.organizations[0] : 'FPT');

    } else {

      // Defaults if not defined

      setCharName('ナム');

      setCharCountry('ベトナム');

      setCharOccupation('エンジニア');

      setCharOrganization('FPT');

    }

  }, [selectedLessonId, lessons, activeLesson]);

  // Group vocabulary by grammar pattern

  const groupedVocab = useMemo(() => {

    if (vocabItems.length === 0) return { groups: [], supplementalItems: [] };

    

    const groups = grammarItems.map((grammar, idx) => {
      const mapping = getGrammarVocabMapping(selectedLessonId, idx, vocabItems, grammarItems.length);
      return {

        grammarIndex: idx,

        grammarTitle: grammar.title,

        grammarMeaning: grammar.meaning,

        newItems: mapping.newItems,

        copiedItems: mapping.copiedItems,

        associatedItems: mapping.associatedItems,

      };

    });

    const associatedIds = new Set<number>();

    groups.forEach(g => {

      g.associatedItems.forEach(item => {

        associatedIds.add(item.id);

      });

    });

    const supplementalItems = vocabItems.filter(item => !associatedIds.has(item.id));

    return { groups, supplementalItems };

  }, [selectedLessonId, grammarItems, vocabItems]);

  // Group Kanji by grammar pattern

  const groupedKanji = useMemo(() => {

    if (kanjiItems.length === 0) return { groups: [], supplementalItems: [] };

    

    const groups = grammarItems.map((grammar, idx) => {

      const mapping = getGrammarKanjiMapping(selectedLessonId, idx, kanjiItems);

      return {

        grammarIndex: idx,

        grammarTitle: grammar.title,

        grammarMeaning: grammar.meaning,

        newItems: mapping.newItems,

        copiedItems: mapping.copiedItems,

        associatedItems: mapping.associatedItems,

      };

    });

    const associatedIds = new Set<number>();

    groups.forEach(g => {

      g.associatedItems.forEach(item => {

        associatedIds.add(item.id);

      });

    });

    const supplementalItems = kanjiItems.filter(item => !associatedIds.has(item.id));

    return { groups, supplementalItems };

  }, [selectedLessonId, grammarItems, kanjiItems]);

  // Filtered grouped vocabulary items

  const processedVocabGroups = useMemo(() => {

    const filterVocab = (item: VocabItem) => {

      const matchesSearch = 

        item.hiragana.toLowerCase().includes(searchQuery.toLowerCase()) ||

        item.romaji.toLowerCase().includes(searchQuery.toLowerCase()) ||

        item.vietnamese_meaning.toLowerCase().includes(searchQuery.toLowerCase());

      

      const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;

    };

    const filteredGroups = groupedVocab.groups.map(g => ({

      ...g,

      newItems: g.newItems.filter(filterVocab),

      copiedItems: g.copiedItems.filter(filterVocab),

    }));

    const filteredSupplemental = groupedVocab.supplementalItems.filter(filterVocab);

    const totalVisible = filteredGroups.reduce((acc, g) => acc + g.newItems.length + g.copiedItems.length, 0) + filteredSupplemental.length;

    return {

      groups: filteredGroups,

      supplemental: filteredSupplemental,

      totalVisible

    };

  }, [groupedVocab, searchQuery, statusFilter]);

  // Filtered grouped Kanji items

  const processedKanjiGroups = useMemo(() => {

    const filterKanji = (item: KanjiItem) => {

      const matchesSearch = 

        item.character.toLowerCase().includes(searchQuery.toLowerCase()) ||

        item.sino_vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||

        item.vietnamese_meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||

        item.onyomi.toLowerCase().includes(searchQuery.toLowerCase()) ||

        item.kunyomi.toLowerCase().includes(searchQuery.toLowerCase());

      

      const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;

    };

    const filteredGroups = groupedKanji.groups.map(g => ({

      ...g,

      newItems: g.newItems.filter(filterKanji),

      copiedItems: g.copiedItems.filter(filterKanji),

    }));

    const filteredSupplemental = groupedKanji.supplementalItems.filter(filterKanji);

    const totalVisible = filteredGroups.reduce((acc, g) => acc + g.newItems.length + g.copiedItems.length, 0) + filteredSupplemental.length;

    return {

      groups: filteredGroups,

      supplemental: filteredSupplemental,

      totalVisible

    };

  }, [groupedKanji, searchQuery, statusFilter]);

  // Vocab progress calculated dynamically

  const vocabTotalCount = vocabItems.length;

  const vocabMasteredCount = vocabItems.filter(v => v.status === 'mastered').length;

  const vocabLearningCount = vocabItems.filter(v => v.status === 'learning').length;

  const progressPercent = vocabTotalCount ? Math.round((vocabMasteredCount / vocabTotalCount) * 100) : 0;

  // Filter vocabulary for listening quiz by status

  const filteredListeningVocab = useMemo(() => {

    if (listeningStatusFilter === 'all') return vocabItems;

    return vocabItems.filter(item => item.status === listeningStatusFilter);

  }, [vocabItems, listeningStatusFilter]);

  // Kanji progress calculated dynamically

  const kanjiTotalCount = kanjiItems.length;

  const kanjiMasteredCount = kanjiItems.filter(k => k.status === 'mastered').length;

  const kanjiLearningCount = kanjiItems.filter(k => k.status === 'learning').length;

  const kanjiProgressPercent = kanjiTotalCount ? Math.round((kanjiMasteredCount / kanjiTotalCount) * 100) : 0;

  // Filtered Grammar items

  const processedGrammar = grammarItems.filter(item => {

    const matchesSearch = 

      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||

      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||

      item.structure.toLowerCase().includes(searchQuery.toLowerCase()) ||

      item.vietnamese_explanation.toLowerCase().includes(searchQuery.toLowerCase());

    

    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;

  });

  // Grammar progress calculated dynamically

  const grammarTotalCount = grammarItems.length;

  const grammarMasteredCount = grammarItems.filter(g => g.status === 'mastered').length;

  const grammarLearningCount = grammarItems.filter(g => g.status === 'learning').length;

  const grammarProgressPercent = grammarTotalCount ? Math.round((grammarMasteredCount / grammarTotalCount) * 100) : 0;

    const getVisualStructureForForm = (baseStructure: string, formType: 'affirmative' | 'negative' | 'interrogative', grammarId?: number) => {
    if (grammarId === 151) {
      if (formType === 'affirmative') return 'N1 + は + N2 + です';
      if (formType === 'negative') return 'N1 + は + N2 + じゃないesです'.replace(/es/g, '');
      if (formType === 'interrogative') return 'N1 + は + N2 + ですか | N1 + は + なん + ですか';
    }
    if (grammarId === 152) {
      if (formType === 'affirmative') return 'N1 (Người) + は + N2 (Ngôn ngữ) + が + できます';
      if (formType === 'negative') return 'N1 (Người) + は + N2 (Ngôn ngữ) + が + できません';
      if (formType === 'interrogative') return 'N1 (Người) + は + N2 (Ngôn ngữ) + が + できますか';
    }
    if (grammarId === 153) {
      if (formType === 'affirmative') return 'N1 + も + N2 + です | N1 + は + N2 (Ngôn ngữ) + も + できます';
      if (formType === 'negative') return 'N1 + も + N2 + じゃないです | N1 + は + N2 (Ngôn ngữ) + も + できません';
      if (formType === 'interrogative') return 'N1 + も + N2 + ですか | N1 + は + N2 (Ngôn ngữ) + も + できますか';
    }
    if (grammarId === 157) {
      if (formType === 'affirmative') return 'N (Đồ ăn/Thức uống) + が + すきです';
      if (formType === 'negative') return 'N (Đồ ăn/Thức uống) + は + すき + じゃないです';
      if (formType === 'interrogative') return 'N (Đồ ăn/Thức uống) + が + すきですか | なに + が + すきですか';
    }
    if (grammarId === 158) {
      if (formType === 'affirmative') return 'N (Object) + を + V + ます';
      if (formType === 'negative') return 'N (Object) + を + V + ません';
      if (formType === 'interrogative') return 'N (Object) + を + V + ますか | なに + を + V + ますか';
    }
    if (grammarId === 159) {
      if (formType === 'affirmative') return 'よく + V + ます';
      if (formType === 'negative') return 'amuり + V + ません'.replace(/amu/g, 'あま');
      if (formType === 'interrogative') return 'よく + V + ますか';
    }
    if (grammarId === 197) {
      if (formType === 'affirmative') return 'Noun + は + N2 + です';
      if (formType === 'negative') return 'Noun + は + N2 + じゃない/じゃありません';
      if (formType === 'interrogative') return 'Noun + は + だれですか | Noun + は + どなたですか';
    }
    if (grammarId === 198) {
      if (formType === 'affirmative') return 'Noun + は + [Số tuổi] + さいです';
      if (formType === 'negative') return 'Noun + は + [Số tuổi] + さい + じゃない/じゃありません';
      if (formType === 'interrogative') return 'Noun + は + おいくつですか | Noun + は + なんさいですか';
    }
    if (grammarId === 199) {
      if (formType === 'affirmative') return 'Noun + は + [Tên nghề] + です';
      if (formType === 'negative') return 'Noun + は + [Tên nghề] + じゃない/じゃありません';
      if (formType === 'interrogative') return 'お仕事は + なんですか | お仕事は';
    }

    if (!baseStructure) return '';

    const getNegativeOf = (word: string) => {

      const w = word.toLowerCase();

      if (w.includes('です') || w.includes('es') || w.includes('us') || w.includes('đúng') || w.includes('đây')) {

        return 'じゃないです';

      }

      if (w.includes('ます')) return word.replace('ます', 'ません');

      if (w.includes('できます')) return word.replace('できます', 'できません');

      if (w.includes('います')) return word.replace('います', 'いません');

      if (w.includes('あります')) return word.replace('あります', 'ありません');

      return word + ' + じゃないです';

    };

    const subStructures = baseStructure.split('|').map(s => s.trim());

    const resultStructures = [];

    for (const sub of subStructures) {

      const cleanSub = sub.replace(/。$/, '').trim();

      const parts = cleanSub.split('+').map(p => p.trim());

      if (parts.length === 0) continue;

      const hasNegativePart = parts.some(p => p.includes('ない') || p.includes('ません') || p.includes('じゃない'));

      const hasInterrogativePart = parts.some(p => p.includes('か') || p.includes('ka') || p.includes('なん'));

      if (formType === 'negative') {

        if (hasNegativePart) {

          const negativeParts = [];

          for (const p of parts) {

            if (p.includes('か') || p.includes('ka') || p.includes('なん')) {

              continue;

            }

            if ((p.includes('es') || p.includes('です')) && !p.includes('ない') && !p.includes('じゃない')) {

              continue;

            }

            negativeParts.push(p);

          }

          resultStructures.push(negativeParts.join(' + '));

        } else {

          const lastIndex = parts.length - 1;

          const lastPart = parts[lastIndex];

          const negativeLastPart = getNegativeOf(lastPart);

          const newParts = [...parts.slice(0, -1), negativeLastPart];

          resultStructures.push(newParts.join(' + '));

        }

      } else if (formType === 'interrogative') {

        if (hasInterrogativePart) {

          const interrogativeParts = [];

          for (const p of parts) {

            if (p.includes('ない') || p.includes('ません') || p.includes('じゃない')) {

              continue;

            }

            if ((p.includes('es') || p.includes('です')) && !p.includes('か') && parts.some(x => x.includes('か'))) {

              continue;

            }

            interrogativeParts.push(p);

          }

          resultStructures.push(interrogativeParts.join(' + '));

        } else {

          const lastIndex = parts.length - 1;

          const lastPart = parts[lastIndex];

          let interrogativeLastPart = lastPart;

          if (lastPart.includes('đáp') || lastPart.includes('đâu') || lastPart.includes('どこ') || lastPart.includes('だれ')) {

            interrogativeLastPart = lastPart;

          } else if (lastPart.includes('です') || lastPart.includes('es') || lastPart.includes('us')) {

            interrogativeLastPart = lastPart.replace(/です|es|us/g, 'ですか');

          } else if (lastPart.includes('ます')) {

            interrogativeLastPart = lastPart.replace('ます', 'ますか');

          } else {

            interrogativeLastPart = lastPart + ' + か';

          }

          const newParts = [...parts.slice(0, -1), interrogativeLastPart];

          resultStructures.push(newParts.join(' + '));

        }

      } else {

        // Thể Khẳng định: loại bỏ vế phủ định và nghi vấn, ngắt khi câu kết thúc bằng dấu chấm

        const affirmativeParts = [];

        for (const p of parts) {

          if (p.includes('ない') || p.includes('ません') || p.includes('じゃない')) {

            continue;

          }

          if (p.includes('か') || p.includes('ka') || p.includes('なん')) {

            continue;

          }

          affirmativeParts.push(p.replace(/。$/, ''));

          // Ngắt ngay lập tức khi vế kết thúc bằng dấu chấm tròn câu khẳng định

          if (p.includes('。') || p.includes('.')) {

            break;

          }

        }

        resultStructures.push(affirmativeParts.join(' + '));

      }

    }

    let finalStr = resultStructures.join(' | ');

    // Chuẩn hóa hiển thị đuôi câu

    finalStr = finalStr.replace(/じゃない\s*es/gi, 'じゃないです');

    finalStr = finalStr.replace(/じゃないes/gi, 'base'); 

    finalStr = finalStr.replace(/じゃないđây/gi, 'base');

    finalStr = finalStr.replace(/じゃないđó/gi, 'base');

    finalStr = finalStr.replace(/じゃないđúng/gi, 'base');

    finalStr = finalStr.replace(/じゃないes/gi, 'じゃないです');

    finalStr = finalStr.replace(/じゃないes/gi, 'じゃないes');

    finalStr = finalStr.replace(/じゃないです/gi, 'じゃないです');

    finalStr = finalStr.replace(/ない\s*es/gi, 'ないes'); 

    finalStr = finalStr.replace(/ないes/gi, 'ないes'); 

    finalStr = finalStr.replace(/ないes/gi, 'ないです');

    finalStr = finalStr.replace(/\bes\b/gi, 'es'); 

    finalStr = finalStr.replace(/\bus\b/gi, 'es');

    finalStr = finalStr.replace(/\bđây\b/gi, 'es'); 

    finalStr = finalStr.replace(/\bđó\b/gi, 'es'); 

    finalStr = finalStr.replace(/\bđúng\b/gi, 'es');

    finalStr = finalStr.replace(/es。/gi, 'es');

    finalStr = finalStr.replace(/es/gi, 'es');

    finalStr = finalStr.replace(/us/gi, 'es');

    finalStr = finalStr.replace(/đúng/gi, 'es');

    finalStr = finalStr.replace(/đây/gi, 'es');

    finalStr = finalStr.replace(/đó/gi, 'es');

    finalStr = finalStr.replace(/es/gi, 'đúng'); // Telex fix

    finalStr = finalStr.replace(/es/gi, 'です');

    finalStr = finalStr.replace(/us/gi, 'です');

    finalStr = finalStr.replace(/base/gi, 'じゃないes');

    finalStr = finalStr.replace(/じゃないes/gi, 'じゃないes');

    finalStr = finalStr.replace(/じゃないes/gi, 'じゃないです');

    return finalStr;

  };

  const translateSymbolToVi = (symbol: string) => {

    let s = symbol;

    // Chuẩn hóa hiển thị đuôi câu Nhật Bản (es, us, じゃないes...)

    s = s.replace(/じゃない\s*es/g, 'じゃないes'); 

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないđây/g, 'じゃないes');

    s = s.replace(/じゃないđó/g, 'base'); 

    s = s.replace(/じゃないđúng/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/ない\s*es/g, 'ないです');

    s = s.replace(/ないes/g, 'ないes'); 

    s = s.replace(/ないes/g, 'ないes'); 

    s = s.replace(/ないes/g, 'ないes'); 

    s = s.replace(/ないes/g, 'ないです');

    s = s.replace(/\bes\b/g, 'es'); 

    s = s.replace(/\bus\b/g, 'es');

    s = s.replace(/\bđây\b/g, 'es');

    s = s.replace(/\bđó\b/g, 'es');

    s = s.replace(/\bđúng\b/g, 'es');

    s = s.replace(/es。/g, 'es');

    s = s.replace(/es/g, 'es');

    s = s.replace(/us/g, 'es');

    s = s.replace(/đúng/g, 'es');

    s = s.replace(/đây/g, 'es');

    s = s.replace(/đó/g, 'es');

    s = s.replace(/es/g, 'です');

    s = s.replace(/んじゃないです/g, 'んじゃないです');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes'); 

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないです');

    s = s.replace(/base/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'base');

    s = s.replace(/base/g, 'じゃないes');

    s = s.replace(/base/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないです');

    // Dịch chuẩn hóa ký hiệu tính từ Marugoto (イA, ナA)

    s = s.replace(/イ\s*A\s*－\s*い/gi, 'T\u00ednh từ đuôi い'); // Tính từ đuôi い

    s = s.replace(/イ\s*A\s*－?\s*い?/gi, 'T\u00ednh từ đuôi い');

    s = s.replace(/ナ\s*A\s*－\s*な/gi, 'T\u00ednh từ đuôi な'); // Tính từ đuôi な

    s = s.replace(/ナ\s*A\s*－?\s*na?/gi, 'T\u00ednh từ đuôi な');

    s = s.replace(/ナ\s*A\s*－?\s*な?/gi, 'T\u00ednh từ đuôi な');

    

    // Một số từ rác khác

    s = s.replace(/T\u00ednh t\u1eeb\s*\u0111u\u00f4i\s*\u3044\s*\u304f/gi, 'T\u00ednh từ đuôi い'); // Sửa 'Tính từ đuôi いく' thành 'Tính từ đuôi い'

    s = s.replace(/\u304f$/g, ''); 

    return s;

  };

  const renderVisualStructure = (structure: string) => {

    if (!structure) return null;

    

    // Split by '|' to render multiple rows/tables if there are alternative formats or question parts

    const lines = structure.split('|').map(l => l.trim());

    

    return (

      <div className="space-y-4 mt-1">

        {lines.map((line, lineIdx) => {

          const parts = line.split('+').map(p => p.trim());

          if (parts.length <= 1) {

            return (

              <div 

                key={lineIdx} 

                className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl"

              >

                {translateSymbolToVi(line)}

              </div>

            );

          }

          return (

            <div key={lineIdx} className="overflow-x-auto pb-1">

              <div className="inline-flex items-stretch border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden min-w-[280px]">

                {parts.map((part, index) => {

                  const isParticle = ['は', 'g', 'に', 'を', 'も', 'と', 'de', 'で', 'へ', 'の', 'k'].includes(part) || part.length <= 2;

                  const isEnding = ['es', 'es。', 'じゃないes', 'じゃないes。', 'đúng', 'đúng。', 'じゃないđúng', 'じゃないđúng。', 'ですか', 'ですか。', 'います', 'あります', 'ありません', 'です', 'じゃないです', 'じゃないです。'].some(end => part.includes(end));

                  

                  let borderClass = "";

                  if (index > 0) {

                    if (isParticle || isEnding) {

                      borderClass = "border-l border-dashed border-slate-200 dark:border-slate-700/80";

                    } else {

                      borderClass = "border-l border-slate-200 dark:border-slate-800";

                    }

                  }

                  const options = part.split('/').map(opt => opt.trim());

                  return (

                    <div 

                      key={index}

                      className={"px-4 py-3 flex flex-col justify-center items-center text-center " + borderClass + " bg-slate-50/20 dark:bg-slate-900/10 min-w-[60px]"}

                    >

                      {options.length > 1 ? (

                        <div className="flex flex-col space-y-1 items-center justify-center">

                          {options.map((opt: string, oIdx: number) => (

                            <span 

                              key={oIdx}

                              className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5"

                            >

                              {translateSymbolToVi(opt)}

                            </span>

                          ))}

                        </div>

                      ) : (

                        <span className="text-xs sm:text-sm font-black text-slate-850 dark:text-slate-100">

                          {translateSymbolToVi(part)}

                        </span>

                      )}

                    </div>

                  );

                })}

              </div>

            </div>

          );

        })}

      </div>

    );

  };

const renderInteractivePractice = () => {

    return (

      <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

                {/* 1. Header Toolbar Controls */}

                <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-4">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 pb-3">

                    <h2 className="text-md font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2">

                      <span>✏️</span>

                      <span>Bảng Luyện Tập & Đảo Đề Tương Tác</span>

                    </h2>

                    <p className="text-xs text-slate-400 dark:text-slate-500">

                      Kiểm tra kiến thức từ vựng bằng cách nhập câu trả lời

                    </p>

                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    {/* Control settings */}

                    <div className="flex flex-wrap items-center gap-4">

                      {/* Select practiceType: Tự luận / Phản xạ nhanh */}

                      <div className="bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">

                        <button

                          onClick={() => setPracticeType('write')}

                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${

                            practiceType === 'write'

                              ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'

                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                          }`}

                        >

                          ✍️ Tự luận

                        </button>

                        <button

                          onClick={() => {

                            setPracticeType('speedrun');

                            stopSpeedrun();

                          }}

                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${

                            practiceType === 'speedrun'

                              ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'

                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                          }`}

                        >

                          ⚡ Phản xạ nhanh

                        </button>

                      </div>

                      {practiceType === 'write' && (

                        <>


                          {/* Select direction: Việt-Nhật / Nhật-Việt */}

                          <div className="bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">

                            <button

                              onClick={() => setPracticeDirection('vi-to-ja')}

                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${

                                practiceDirection === 'vi-to-ja'

                                  ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'

                                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                              }`}

                            >

                              🇻🇳 ➔ 🇯🇵

                            </button>

                            <button

                              onClick={() => setPracticeDirection('ja-to-vi')}

                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${

                                practiceDirection === 'ja-to-vi'

                                  ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'

                                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                              }`}

                            >

                              🇯🇵 ➔ 🇻🇳

                            </button>

                          </div>

                        </>

                      )}

                      {practiceType !== 'speedrun' && (

                        <>

                          {/* Dropdown: Lọc trạng thái ôn tập */}

                          <div id="practice-dropdown-container" className="relative">

                            <button

                              onClick={() => setPracticeDropdownOpen(!practiceDropdownOpen)}

                              className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors"

                            >

                              <span>🔍 Lọc:</span>

                              <span className="text-blue-600 dark:text-blue-400">

                                {Object.values(practiceFilterStatuses).filter(Boolean).length === 0

                                  ? 'Học hết'

                                  : Object.keys(practiceFilterStatuses)

                                      .filter((k) => practiceFilterStatuses[k])

                                      .map((k) =>

                                        k === 'not_learned'

                                          ? 'Chưa học'

                                          : k === 'learning'

                                          ? 'Đang học'

                                          : 'Đã thuộc'

                                      )

                                      .join(', ')}

                              </span>

                              <span className="text-[10px]">▼</span>

                            </button>

                            {practiceDropdownOpen && (

                              <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md rounded-xl shadow-xl z-50 p-2 space-y-1">

                                <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/60 rounded-lg cursor-pointer text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors">

                                  <input

                                    type="checkbox"

                                    checked={practiceFilterStatuses.not_learned}

                                    onChange={(e) =>

                                      setPracticeFilterStatuses((prev) => ({

                                        ...prev,

                                        not_learned: e.target.checked,

                                      }))

                                    }

                                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white text-blue-600 dark:text-blue-400 focus:ring-blue-500"

                                  />

                                  <span>Chưa học</span>

                                </label>

                                <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/60 rounded-lg cursor-pointer text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors">

                                  <input

                                    type="checkbox"

                                    checked={practiceFilterStatuses.learning}

                                    onChange={(e) =>

                                      setPracticeFilterStatuses((prev) => ({

                                        ...prev,

                                        learning: e.target.checked,

                                      }))

                                    }

                                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white text-blue-600 dark:text-blue-400 focus:ring-blue-500"

                                  />

                                  <span>Đang học</span>

                                </label>

                                <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/60 rounded-lg cursor-pointer text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors">

                                  <input

                                    type="checkbox"

                                    checked={practiceFilterStatuses.mastered}

                                    onChange={(e) =>

                                      setPracticeFilterStatuses((prev) => ({

                                        ...prev,

                                        mastered: e.target.checked,

                                      }))

                                    }

                                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white text-blue-600 dark:text-blue-400 focus:ring-blue-500"

                                  />

                                  <span>Đã thuộc</span>

                                </label>

                              </div>

                            )}

                          </div>

                          {/* Number of questions input */}

                          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl">

                            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">Số câu:</span>

                            <input

                              type="number"

                              value={practiceLimit}

                              onChange={(e) => handleLimitChange(e.target.value)}

                              onBlur={handleLimitBlur}

                              className="w-12 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-center text-base md:text-xs font-extrabold text-slate-900 dark:text-white py-1 focus:outline-none focus:border-blue-500"

                            />

                            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">

                              / {currentSourceList.length}

                            </span>

                          </div>

                        </>

                      )}

                      {/* Romaji Checkbox (Việt-Nhật Vocab only) */}

                      {practiceType === 'write' && practiceMode === 'vocab' && practiceDirection === 'vi-to-ja' && (

                        <label className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors">

                          <input

                            type="checkbox"

                            checked={useRomaji}

                            onChange={(e) => setUseRomaji(e.target.checked)}

                            className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-blue-600 dark:text-blue-400 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"

                          />

                          <span>Trả lời bằng Romaji</span>

                        </label>

                      )}

                      {/* Kanji/Hiragana Toggle (Nhật-Việt Vocab only) */}

                      {practiceType === 'write' && practiceMode === 'vocab' && practiceDirection === 'ja-to-vi' && (

                        <div className="bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">

                          <button

                            onClick={() => setPracticeScriptMode('hiragana')}

                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${

                              practiceScriptMode === 'hiragana'

                                ? 'bg-indigo-600 text-slate-900 dark:text-white shadow-lg'

                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                            }`}

                          >

                            📖 Hira/Kata

                          </button>

                          <button

                            onClick={() => setPracticeScriptMode('kanji')}

                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${

                              practiceScriptMode === 'kanji'

                                ? 'bg-indigo-600 text-slate-900 dark:text-white shadow-lg'

                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                            }`}

                          >

                            🉐 Kanji

                          </button>

                        </div>

                      )}

                    </div>

                    {/* Shuffle button */}

                    {practiceType === 'write' && (

                      <div className="flex items-center space-x-3 w-full lg:w-auto justify-end">

                        <button

                          onClick={handleShufflePractice}

                          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white transition-all text-xs font-bold flex items-center space-x-2 shadow-md cursor-pointer active:scale-95"

                          title="Xáo trộn thứ tự câu hỏi"

                        >

                          <span>🔀</span>

                          <span>Tráo đề</span>

                        </button>

                      </div>

                    )}

                  </div>

                </div>

                {/* 2. Practice Modes Conditional Content */}

                {practiceType === 'write' && (

                  <>

                    {practiceList.length === 0 ? (

                      <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-100/20 dark:bg-slate-900/20">

                        📭 Đang tải học liệu hoặc không tìm thấy dữ liệu luyện tập.

                      </div>

                    ) : (

                      <div ref={practiceTopRef} className="space-y-6">

                        {/* Desktop View Table */}

                        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 backdrop-blur-md shadow-xl">

                          <table className="w-full text-left border-collapse">

                            <thead>

                              <tr className="bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80">

                                <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-12">STT</th>

                                <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-12">Nghe</th>

                                <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Câu hỏi</th>

                                {practiceMode === 'vocab' && (

                                  <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-28">Từ loại</th>

                                )}

                                <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-64">Câu trả lời của bạn</th>

                                <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-28">Kết quả</th>

                                <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-36">% Đúng</th>

                                <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-48">Đáp án đúng</th>

                              </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-900">

                              {practiceList.map((item, idx) => {

                                const isVocab = practiceMode === 'vocab';

                                const isViToJa = practiceDirection === 'vi-to-ja';

                                // Define question text and placeholder

                                let questionText = '';

                                let placeholderText = '';

                                let correctAnswer = '';

                                

                                if (isVocab) {

                                  questionText = isViToJa ? item.vietnamese_meaning : (practiceScriptMode === 'kanji' ? (item.kanji_word || item.hiragana) : item.hiragana);

                                  placeholderText = isViToJa 

                                    ? (useRomaji ? 'Nhập Romaji...' : 'Nhập Hiragana...') 

                                    : 'Nhập nghĩa tiếng Việt...';

                                  correctAnswer = isViToJa 

                                    ? (useRomaji ? item.romaji : item.hiragana) 

                                    : item.vietnamese_meaning;

                                } else {

                                  questionText = isViToJa ? `${item.sino_vietnamese} (${item.vietnamese_meaning})` : item.character;

                                  placeholderText = isViToJa ? 'Nhập chữ Hán...' : 'Nhập âm Hán Việt...';

                                  correctAnswer = isViToJa ? item.character : item.sino_vietnamese;

                                }

                                const userAnswer = practiceAnswers[item.uniqueId] || '';

                                const pct = calculateAccuracy(userAnswer, correctAnswer);

                                const isVisible = visibleAnswers[item.uniqueId] || false;

                                return (

                                  <tr key={item.uniqueId} className="hover:bg-slate-100 dark:hover:bg-slate-900/20 dark:bg-slate-900/20 transition-colors">

                                    <td className="py-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 text-center">{idx + 1}</td>

                                    <td className="py-4 px-4 text-center">

                                      <button

                                        onClick={() => playAudio(isVocab ? item.hiragana : item.character)}

                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:text-blue-400 transition-all cursor-pointer"

                                        title="Nghe câu hỏi"

                                      >

                                        🔊

                                      </button>

                                    </td>

                                    <td className="py-4 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 font-sans">

                                      {questionText}

                                    </td>

                                    {isVocab && (

                                      <td className="py-4 px-4 text-center">

                                        <span className="inline-block px-2 py-0.5 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-blue-600 dark:text-blue-400 rounded-md">

                                          {getWordTypeVietnamese(item.word_type)}

                                        </span>

                                      </td>

                                    )}

                                    <td className="py-4 px-4">

                                      <input

                                        type="text"

                                        placeholder={placeholderText}

                                        value={userAnswer}

                                        disabled={isGraded}

                                        onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [item.uniqueId]: e.target.value }))}

                                        className={`w-full bg-[#FCF3CF] dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold text-base md:text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 dark:text-slate-500 ${isGraded ? 'opacity-80' : ''}`}

                                      />

                                    </td>

                                    <td className="py-4 px-4 text-center">

                                      {isGraded && (

                                        pct === 100 ? (

                                          <span className="inline-block px-2.5 py-0.5 bg-emerald-950/40 border border-emerald-900/60 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 rounded-md">

                                            🟢 Đúng

                                          </span>

                                        ) : (

                                          <span className="inline-block px-2.5 py-0.5 bg-red-950/40 border border-red-900/60 text-[10px] font-bold text-red-600 dark:text-red-400 rounded-md">

                                            🔴 Sai

                                          </span>

                                        )

                                      )}

                                    </td>

                                    <td className="py-4 px-4 text-center">

                                      {isGraded && (

                                        <div className="space-y-0.5">

                                          <span className={`text-xs font-black ${pct === 100 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-600 dark:text-red-400'}`}>

                                            {pct}%

                                          </span>

                                          <span className="block text-[9px] text-slate-400 dark:text-slate-500 leading-none">{getEncouragementText(pct)}</span>

                                        </div>

                                      )}

                                    </td>

                                    <td className="py-4 px-4">

                                      <div className="flex items-center space-x-2">

                                        <button

                                          onClick={() => setVisibleAnswers(prev => ({ ...prev, [item.uniqueId]: !isVisible }))}

                                          className="p-1 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 cursor-pointer"

                                          title={isVisible ? 'Ẩn đáp án' : 'Hiện đáp án'}

                                        >

                                          {isVisible ? '👁' : '🙈'}

                                        </button>

                                        <span className={`text-xs break-all ${isVisible ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-700 dark:text-slate-200 font-mono select-none blur-[4px]'}`}>

                                          {isVisible ? correctAnswer : '••••••••'}

                                        </span>

                                      </div>

                                    </td>

                                  </tr>

                                );

                              })}

                            </tbody>

                          </table>

                        </div>

                        {/* Mobile View Cards */}

                        <div className="lg:hidden space-y-4">

                          {practiceList.map((item, idx) => {

                            const isVocab = practiceMode === 'vocab';

                            const isViToJa = practiceDirection === 'vi-to-ja';

                            let questionText = '';

                            let placeholderText = '';

                            let correctAnswer = '';

                            

                            if (isVocab) {

                              questionText = isViToJa ? item.vietnamese_meaning : (practiceScriptMode === 'kanji' ? (item.kanji_word || item.hiragana) : item.hiragana);

                              placeholderText = isViToJa 

                                ? (useRomaji ? 'Nhập Romaji...' : 'Nhập Hiragana...') 

                                : 'Nhập nghĩa tiếng Việt...';

                              correctAnswer = isViToJa 

                                ? (useRomaji ? item.romaji : item.hiragana) 

                                : item.vietnamese_meaning;

                            } else {

                              questionText = isViToJa ? `${item.sino_vietnamese} (${item.vietnamese_meaning})` : item.character;

                              placeholderText = isViToJa ? 'Nhập chữ Hán...' : 'Nhập âm Hán Việt...';

                              correctAnswer = isViToJa ? item.character : item.sino_vietnamese;

                            }

                            const userAnswer = practiceAnswers[item.uniqueId] || '';

                            const pct = calculateAccuracy(userAnswer, correctAnswer);

                            const isVisible = visibleAnswers[item.uniqueId] || false;

                            return (

                              <div key={item.uniqueId} className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl space-y-3.5 backdrop-blur-sm">

                                {/* Card Header */}

                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40 pb-2">

                                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Câu {idx + 1}</span>

                                  <div className="flex items-center space-x-2">

                                    {isVocab && (

                                      <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[9px] font-bold uppercase rounded-md text-blue-600 dark:text-blue-400">

                                        {getWordTypeVietnamese(item.word_type)}

                                      </span>

                                    )}

                                    <button

                                      onClick={() => playAudio(isVocab ? item.hiragana : item.character)}

                                      className="p-1 rounded-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:text-blue-400 cursor-pointer"

                                    >

                                      🔊 Nghe

                                    </button>

                                  </div>

                                </div>

                                {/* Question */}

                                <div className="space-y-1">

                                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Câu hỏi</span>

                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-sans">{questionText}</p>

                                </div>

                                {/* User Answer Input */}

                                <div className="space-y-1">

                                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Câu trả lời</span>

                                  <input

                                    type="text"

                                    placeholder={placeholderText}

                                    value={userAnswer}

                                    disabled={isGraded}

                                    onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [item.uniqueId]: e.target.value }))}

                                    className={`w-full bg-[#FCF3CF] dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold text-base md:text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 dark:text-slate-500 ${isGraded ? 'opacity-80' : ''}`}

                                  />

                                </div>

                                {/* Results under Grading */}

                                {isGraded && (

                                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50">

                                    <div>

                                      <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Kết quả</span>

                                      {pct === 100 ? (

                                        <span className="inline-block px-2 py-0.5 bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 rounded-md">

                                          🟢 Đúng

                                        </span>

                                      ) : (

                                        <span className="inline-block px-2 py-0.5 bg-red-950/30 border border-red-200 dark:border-red-800 text-[9px] font-bold text-red-600 dark:text-red-400 rounded-md">

                                          🔴 Sai

                                        </span>

                                      )}

                                    </div>

                                    <div className="text-right">

                                      <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5">% Đúng</span>

                                      <span className={`text-xs font-black ${pct === 100 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-600 dark:text-red-400'}`}>

                                        {pct}%

                                      </span>

                                      <span className="block text-[8px] text-slate-400 dark:text-slate-500 mt-0.5">{getEncouragementText(pct)}</span>

                                    </div>

                                  </div>

                                )}

                                {/* Correct Answer reveal */}

                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40 space-y-2">

                                  <div className="flex items-center justify-between">

                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đáp án đúng</span>

                                    <button

                                      onClick={() => setVisibleAnswers(prev => ({ ...prev, [item.uniqueId]: !isVisible }))}

                                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 cursor-pointer flex items-center space-x-1"

                                    >

                                      <span>{isVisible ? '👁️' : '🙈'}</span>

                                      <span>{isVisible ? 'Ẩn' : 'Hiện'}</span>

                                    </button>

                                  </div>

                                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 p-2.5 rounded-xl">

                                    <p className={`font-serif text-xs sm:text-sm tracking-wide break-all break-words transition-all leading-relaxed ${isVisible ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-650 select-none blur-[4px] font-mono'}`}>

                                      {isVisible ? correctAnswer : '••••••••'}

                                    </p>

                                  </div>

                                </div>

                              </div>

                            );

                          })}

                        </div>

                        {/* 3. Action Buttons & Grading Summary */}

                        <div ref={practiceResultsRef} className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">

                          <div>

                            {isGraded && (

                              <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">

                                🎉 Bạn đã hoàn thành chấm điểm! Kết quả: {correctCount}/{practiceList.length} câu đúng. Hãy rà soát lại các câu sai để ôn tập nhé.

                              </p>

                            )}

                          </div>

                          

                          <div className="flex items-center space-x-4 self-end sm:self-auto">

                            <button

                              onClick={() => {

                                if (currentSourceList.length > 0) {

                                  const newList = generatePracticeList(currentSourceList, practiceLimit === '' ? 10 : practiceLimit);

                                  setBaseShuffledList(newList);

                                  setPracticeList(newList);

                                }

                                setPracticeAnswers({});

                                setIsGraded(false);

                                setVisibleAnswers({});

                                setTimeout(() => {

                                  practiceTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

                                }, 50);

                              }}

                              className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/60 hover:text-slate-800 dark:hover:text-slate-200 dark:text-slate-100 text-xs font-bold text-slate-400 dark:text-slate-500 transition-all duration-300 cursor-pointer active:scale-95"

                            >

                              Làm lại

                            </button>

                            <button

                              onClick={() => setIsGraded(true)}

                              disabled={isGraded}

                              className={`px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white text-xs font-black transition-all duration-300 shadow-md active:scale-95 cursor-pointer flex items-center space-x-2 ${isGraded ? 'opacity-50 cursor-not-allowed' : ''}`}

                            >

                              <span>📋</span>

                              <span>Chấm điểm</span>

                            </button>

                          </div>

                        </div>

                      </div>

                    )}

                  </>

                )}

                {practiceType === 'speedrun' && (

                  <div className="space-y-6">

                    {/* 1. Preparation Screen */}

                    {!speedrunActive && !speedrunGameOver && (

                      <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center space-y-6 max-w-lg mx-auto backdrop-blur-md shadow-2xl animate-fade-in">

                        <div className="space-y-2">

                          <span className="text-5xl block animate-bounce">⚡</span>

                          <h3 className="text-xl font-black text-slate-700 dark:text-slate-200">Trò chơi Phản Xạ Nhanh</h3>

                          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">

                            Trắc nghiệm phản xạ từ vựng giới hạn thời gian (10 giây). Mỗi 2 câu đúng liên tục sẽ rút ngắn thời gian suy nghĩ của các câu tiếp theo!

                          </p>

                        </div>

                        {/* Status Filter Selection */}

                        <div className="space-y-2">

                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Bộ lọc từ vựng ({speedrunSourceList.length} từ sẵn sàng)</span>

                          <div id="speedrun-dropdown-container" className="relative flex justify-center">

                            <button

                              onClick={() => setSpeedrunDropdownOpen(!speedrunDropdownOpen)}

                              className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors max-w-xs w-full justify-between"

                            >

                              <div className="flex items-center space-x-2">

                                <span>🎯 Lọc:</span>

                                <span className="text-blue-600 dark:text-blue-400">

                                  {Object.values(speedrunFilterStatuses).filter(Boolean).length === 0

                                    ? 'Học hết'

                                    : Object.keys(speedrunFilterStatuses)

                                        .filter((k) => speedrunFilterStatuses[k])

                                        .map((k) =>

                                          k === 'not_learned'

                                            ? 'Chưa học'

                                            : k === 'learning'

                                            ? 'Đang học'

                                            : 'Đã thuộc'

                                        )

                                        .join(', ')}

                                </span>

                              </div>

                              <span className="text-[10px]">▼</span>

                            </button>

                            {speedrunDropdownOpen && (

                              <div className="absolute top-full mt-2 w-48 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md rounded-xl shadow-xl z-50 p-2 space-y-1 text-left">

                                <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/60 rounded-lg cursor-pointer text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors">

                                  <input

                                    type="checkbox"

                                    checked={speedrunFilterStatuses.not_learned}

                                    onChange={(e) =>

                                      setSpeedrunFilterStatuses((prev) => ({

                                        ...prev,

                                        not_learned: e.target.checked,

                                      }))

                                    }

                                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 focus:ring-blue-500 cursor-pointer"

                                  />

                                  <span>Chưa học</span>

                                </label>

                                <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/60 rounded-lg cursor-pointer text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors">

                                  <input

                                    type="checkbox"

                                    checked={speedrunFilterStatuses.learning}

                                    onChange={(e) =>

                                      setSpeedrunFilterStatuses((prev) => ({

                                        ...prev,

                                        learning: e.target.checked,

                                      }))

                                    }

                                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 focus:ring-blue-500 cursor-pointer"

                                  />

                                  <span>Đang học</span>

                                </label>

                                <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/60 rounded-lg cursor-pointer text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors">

                                  <input

                                    type="checkbox"

                                    checked={speedrunFilterStatuses.mastered}

                                    onChange={(e) =>

                                      setSpeedrunFilterStatuses((prev) => ({

                                        ...prev,

                                        mastered: e.target.checked,

                                      }))

                                    }

                                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 focus:ring-blue-500 cursor-pointer"

                                  />

                                  <span>Đã thuộc</span>

                                </label>

                              </div>

                            )}

                          </div>

                        </div>

                        {/* Direction Selection */}

                        <div className="space-y-2">

                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Chọn hướng dịch câu hỏi</span>

                          <div className="bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex max-w-xs mx-auto">

                            <button

                              onClick={() => setSpeedrunDirection('ja-to-vi')}

                              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${

                                speedrunDirection === 'ja-to-vi'

                                  ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'

                                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                              }`}

                            >

                              🇯🇵 Nhật ➔ 🇻🇳 Việt

                            </button>

                            <button

                              onClick={() => setSpeedrunDirection('vi-to-ja')}

                              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${

                                speedrunDirection === 'vi-to-ja'

                                  ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'

                                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                              }`}

                            >

                              🇻🇳 Việt ➔ 🇯🇵 Nhật

                            </button>

                          </div>

                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 p-4 rounded-2xl space-y-1 inline-block min-w-[200px]">

                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Kỷ lục hiện tại</span>

                          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{speedrunHighScore} điểm</span>

                        </div>

                        <div>

                          <button

                            onClick={startSpeedrun}

                            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white font-black text-sm transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 cursor-pointer"

                          >

                            Bắt đầu chơi ngay 🚀

                          </button>

                        </div>

                      </div>

                    )}

                    {/* 2. Playing Screen */}

                    {speedrunActive && speedrunQuestion && (

                      <div className="max-w-xl mx-auto bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 rounded-3xl backdrop-blur-md space-y-6 shadow-2xl animate-fade-in">

                        {/* Game Header */}

                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">

                          <div className="flex flex-col">

                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Điểm số</span>

                            <span className="text-xl font-black text-blue-600 dark:text-blue-400">{speedrunScore}</span>

                          </div>

                          <div className="flex flex-col text-right">

                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kỷ lục</span>

                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{speedrunHighScore} điểm</span>

                          </div>

                        </div>

                        {/* Timer Progress Bar */}

                        <div className="space-y-1.5">

                          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">

                            <span>Thời gian còn lại</span>

                            <span className={speedrunTimeLeft <= 3 ? 'text-red-600 dark:text-red-400 font-black animate-pulse' : ''}>

                              {speedrunTimeLeft.toFixed(1)}s

                            </span>

                          </div>

                          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">

                            <div

                              className={`h-full transition-all duration-100 ${

                                speedrunTimeLeft <= 3

                                  ? 'bg-gradient-to-r from-red-500 to-rose-600'

                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'

                              }`}

                              style={{ width: `${(speedrunTimeLeft / speedrunMaxTime) * 100}%` }}

                            />

                          </div>

                        </div>

                        {/* Question Panel */}

                        <div className="py-10 text-center bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 rounded-2xl shadow-inner space-y-2">

                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Câu hỏi</span>

                          {speedrunDirection === 'ja-to-vi' ? (

                            <div className="space-y-1 flex flex-col items-center justify-center">

                              <PitchAccentDisplay

                                kana={speedrunQuestion.hiragana}

                                accent={speedrunQuestion.pitch_accent || 0}

                                size="lg"

                              />

                            </div>

                          ) : (

                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-relaxed px-4 select-none">

                              {speedrunQuestion.vietnamese_meaning}

                            </h3>

                          )}

                        </div>

                        {/* Options Buttons */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          {speedrunOptions.map((option, idx) => (

                            <button

                              key={idx}

                              onClick={() => checkSpeedrunAnswer(option)}

                              className="w-full py-4 px-4 bg-slate-50 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-800/80 dark:bg-slate-900/90 shadow-md border border-slate-200 dark:border-slate-800 hover:border-blue-600 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white dark:text-white rounded-2xl text-xs font-bold text-center transition-all duration-200 cursor-pointer active:scale-98 shadow-md"

                            >

                              {option}

                            </button>

                          ))}

                        </div>

                        {/* Cancel Button */}

                        <div className="text-center pt-2">

                          <button

                            onClick={stopSpeedrun}

                            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"

                          >

                            Dừng trò chơi

                          </button>

                        </div>

                      </div>

                    )}

                    {/* 3. Game Over Screen */}

                    {!speedrunActive && speedrunGameOver && (

                      <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center space-y-6 max-w-lg mx-auto backdrop-blur-md shadow-2xl animate-fade-in">

                        <div className="space-y-2">

                          <span className="text-5xl block animate-bounce">🏁</span>

                          <h3 className="text-xl font-black text-red-600 dark:text-red-400">Trò chơi kết thúc!</h3>

                          <p className="text-xs text-slate-400 dark:text-slate-500">

                            Bạn đã trả lời chưa chính xác hoặc hết thời gian. Hãy thử lại để vượt qua kỷ lục của chính mình!

                          </p>

                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60">

                          <div>

                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">Điểm đạt được</span>

                            <span className="text-2xl font-black text-slate-900 dark:text-white">{speedrunScore}</span>

                          </div>

                          <div>

                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">Kỷ lục hiện tại</span>

                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{speedrunHighScore}</span>

                          </div>

                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">

                          <button

                            onClick={() => {

                              setSpeedrunGameOver(false);

                            }}

                            className="px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/60 hover:text-slate-900 dark:hover:text-white dark:text-white text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"

                          >

                            Quay lại màn hình chuẩn bị

                          </button>

                          <button

                            onClick={startSpeedrun}

                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white font-black text-xs transition-all duration-300 shadow-md active:scale-95 cursor-pointer"

                          >

                            Chơi lại ngay ⚡

                          </button>

                        </div>

                      </div>

                    )}

                  </div>

                )}

              </div>

    );

  };

  return (

    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] text-slate-800 dark:text-slate-100 font-sans relative">

      

      {/* Mobile Hamburger toggle button */}

      <button

        onClick={() => setIsSidebarOpen(true)}

        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"

      >

        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">

          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />

        </svg>

      </button>

      {/* Mobile Sidebar backdrop overlay */}

      {isSidebarOpen && (

        <div

          onClick={() => setIsSidebarOpen(false)}

          className="lg:hidden fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm transition-opacity duration-300"

        />

      )}

      {/* 1. Left Sidebar Navigation Menu */}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-950/95 shadow-lg shadow-slate-200/40 border-r border-slate-200 dark:border-slate-800 dark:border-r-slate-900/50 flex flex-col justify-between p-6 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${

        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'

      }`}>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

          {/* Logo Title & Mobile Close button */}

          <div className="flex items-center justify-between mb-8 px-2 shrink-0">

            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">

              {activeCourse === 'marugoto' ? 'Marugoto A1' : 'Minna Nihongo'}

            </span>

            <button

              onClick={() => setIsSidebarOpen(false)}

              className="lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 text-xl p-1 font-bold cursor-pointer"

            >

              ✕

            </button>

          </div>

          {/* Course Switcher */}

          <CourseSwitcher

            activeCourse={activeCourse}

            onSwitch={(course) => {

              localStorage.setItem('activeCourse', course);

              const nextLessonId = course === 'minna' ? 1 : 101;

              router.push(`/lessons/${nextLessonId}?tab=${currentTab}`);

            }}

          />

          {/* Navigation Menu */}

          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-100 hover:[&::-webkit-scrollbar-thumb]:bg-slate-450 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">

            {menuItems.map((item) => (

              <button

                key={item.id}

                onClick={() => {

                  setIsSidebarOpen(false);

                  if (item.id === 'guide') {

                    router.push('/guide');

                  } else if (item.id === 'dashboard') {

                    router.push('/dashboard');

                  } else if (item.id === 'roadmap') {

                    router.push('/roadmap');

                  } else if (item.id === 'kana') {

                    router.push('/kana');

                  } else if (item.id === 'mock-test') {

                    router.push('/mock-test');

                  } else if (item.id === 'knowledge') {

                    router.push('/knowledge');

                  } else {

                    router.push(`/lessons/${selectedLessonId}?tab=${item.id}`);

                  }

                }}

                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium ${

                  item.active

                    ? 'bg-indigo-50/80 dark:bg-gradient-to-r dark:from-blue-950/40 dark:to-slate-900 border border-indigo-100/50 dark:border-blue-900/40 text-indigo-600 dark:text-blue-400 shadow-sm dark:shadow-[0_0_15px_rgba(29,78,216,0.15)]'

                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none'

                }`}

              >

                <span className="text-lg">{item.icon}</span>

                <span className="text-sm">{item.name}</span>

              </button>

            ))}

          </nav>

        </div>

        <SidebarSettings />

      </aside>

      {/* 2. Main Content Area */}

      <main className="flex-1 overflow-y-auto p-6 pt-20 lg:p-10 space-y-6 md:space-y-8">

        

        {/* Toast Notification message */}

        {message && (

          <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in flex items-center space-x-2">

            <span>ℹ️</span>

            <span>{message}</span>

          </div>

        )}

        {/* Header Title with level selections */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">

          <div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              {currentTab === 'vocab' && 'TỪ VỰNG'}
              {currentTab === 'kanji' && 'CHỮ HÁN'}
              {currentTab === 'grammar' && 'NGỮ PHÁP'}
              {currentTab === 'flashcards' && 'THẺ NHỚ'}
              {currentTab === 'kaiwa' && 'LUYỆN NÓI'}
              {currentTab === 'practice' && 'LUYỆN TẬP'}
              {currentTab === 'cando' && 'TỰ ĐÁNH GIÁ (CAN-DO)'}
              {currentTab === 'culture' && 'VĂN HÓA & CUỘC SỐNG'}
              {currentTab === 'summary' && 'TỔNG HỢP KIẾN THỨC'}
              <span className="text-blue-600 dark:text-blue-400 ml-2">{lessonTitle}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">

              Học liệu chi tiết bài học và cập nhật tiến độ học tập cá nhân

            </p>

          </div>

          

          {/* Level Switcher N5/N4 & Lesson Dropdown Selector */}

          <div className="flex items-center space-x-3 self-start sm:self-auto">

            {!isMarugoto && (

              <div className="bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">

                <button

                  onClick={() => handleLevelChange('N5')}

                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${

                    level === 'N5'

                      ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'

                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                  }`}

                >

                  N5

                </button>

                <button

                  onClick={() => handleLevelChange('N4')}

                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${

                    level === 'N4'

                      ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'

                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                  }`}

                >

                  N4

                </button>

              </div>

            )}

            <select

              value={selectedLessonId}

              onChange={(e) => handleLessonChange(parseInt(e.target.value))}

              className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-700/60 cursor-pointer min-w-[130px]"

            >

              {filteredLessons.map((l) => (

                <option key={l.id} value={l.id} className="bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200">

                  {l.title}

                </option>

              ))}

            </select>

          </div>

        </div>

        {/* Tab content area */}

        {loading ? (

          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 space-y-3">

            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

            <p className="text-xs">Đang tải dữ liệu học tập...</p>

          </div>

        ) : (

          <div>

            {currentTab === 'vocab' && (

              isMarugoto ? (

                /* ==================== GIAO DIỆN LÝ THUYẾT MARUGOTO ==================== */

                <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">

                  {/* 1. Header Progress Card */}

                  <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div className="space-y-1">

                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">

                        <span>📚</span>

                        <span>{lessonTitle} - TỪ VỰNG</span>

                      </h2>

                      <p className="text-sm text-slate-500 dark:text-slate-400">

                        Học từ vựng bài học, xem mẹo nhớ và chơi game ghép thẻ phản xạ.

                      </p>

                    </div>

                    <div className="flex items-center gap-4 shrink-0">

                      <div className="text-right">

                        <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Học liệu</span>

                        <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">

                          {vocabItems.length} Từ vựng

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* 2. Sub-tab Switcher cho Từ vựng */}

                  <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/60 max-w-lg">

                    <button

                      onClick={() => setVocabSubTab('learn')}

                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${

                        vocabSubTab === 'learn'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'

                      }`}

                    >

                      📖 Học từ vựng

                    </button>

                    <button

                      onClick={() => setVocabSubTab('listening')}

                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${

                        vocabSubTab === 'listening'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'

                      }`}

                    >

                      🎧 Nghe từ vựng

                    </button>

                    <button

                      onClick={() => setVocabSubTab('practice')}

                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${

                        vocabSubTab === 'practice'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'

                      }`}

                    >

                      ✍️ Luyện tập

                    </button>

                  </div>

                  {vocabSubTab === 'listening' && (

                    /* CHẾ ĐỘ NGHE TỪ VỰNG */

                    <div className="space-y-6 max-w-xl mx-auto animate-fade-in">

                      {/* Thanh bộ lọc trạng thái học tập */}

                      <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">

                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Chọn từ vựng để ôn tập nghe:</span>

                        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/60 overflow-x-auto justify-between sm:justify-start w-full sm:w-auto shrink-0">

                          <button

                            onClick={() => setListeningStatusFilter('all')}

                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                              listeningStatusFilter === 'all'

                                ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'

                            }`}

                          >

                            Tất cả ({vocabItems.length})

                          </button>

                          <button

                            onClick={() => setListeningStatusFilter('not_learned')}

                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                              listeningStatusFilter === 'not_learned'

                                ? 'bg-white dark:bg-slate-900 text-red-500 shadow-sm'

                                : 'text-slate-500 dark:text-slate-400 hover:text-red-500'

                            }`}

                          >

                            Chưa học ({vocabItems.filter(v => v.status === 'not_learned').length})

                          </button>

                          <button

                            onClick={() => setListeningStatusFilter('learning')}

                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                              listeningStatusFilter === 'learning'

                                ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm'

                                : 'text-slate-500 dark:text-slate-400 hover:text-amber-500'

                            }`}

                          >

                            Đang học ({vocabItems.filter(v => v.status === 'learning').length})

                          </button>

                          <button

                            onClick={() => setListeningStatusFilter('mastered')}

                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                              listeningStatusFilter === 'mastered'

                                ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm'

                                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'

                            }`}

                          >

                            Đã thuộc ({vocabItems.filter(v => v.status === 'mastered').length})

                          </button>

                        </div>

                      </div>

                      {/* Hiển thị game quiz hoặc thông báo nếu không có từ vựng nào */}

                      {filteredListeningVocab.length === 0 ? (

                        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md rounded-3xl text-center">

                          <p className="text-slate-500 dark:text-slate-400">Không có từ vựng nào thuộc trạng thái này để ôn luyện nghe.</p>

                          <span className="text-xs text-slate-400 mt-2">Vui lòng thay đổi bộ lọc ở trên hoặc bắt đầu học từ mới!</span>

                        </div>

                      ) : (

                        <ListeningQuiz key={listeningStatusFilter} vocabItems={filteredListeningVocab} grammarItems={[]} />

                      )}

                    </div>

                  )}

                  {vocabSubTab === 'learn' && (

                    /* CHẾ ĐỘ HỌC TỪ VỰNG */

                    <div className="space-y-4">

                      {/* Search & Filters cho Marugoto */}

                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-sm">

                        {/* Search box */}

                        <div className="relative w-full md:max-w-xs lg:max-w-md">

                          <input

                            type="text"

                            placeholder="Tìm từ vựng, Romaji, Nghĩa Việt..."

                            value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}

                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#b5179e]/60 focus:ring-1 focus:ring-[#b5179e]/60 transition-all"

                          />

                          <span className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500 text-sm">🔍</span>

                        </div>

                        {/* Status filters */}

                        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/60 w-full sm:w-auto shrink-0 overflow-x-auto justify-between sm:justify-start">

                          <button

                            onClick={() => setStatusFilter('all')}

                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                              statusFilter === 'all'

                                ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'

                            }`}

                          >

                            Tất cả ({vocabItems.length})

                          </button>

                          <button

                            onClick={() => setStatusFilter('not_learned')}

                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                              statusFilter === 'not_learned'

                                ? 'bg-white dark:bg-slate-900 text-red-500 shadow-sm'

                                : 'text-slate-500 dark:text-slate-400 hover:text-red-500'

                            }`}

                          >

                            Chưa học ({vocabItems.filter(v => v.status === 'not_learned').length})

                          </button>

                          <button

                            onClick={() => setStatusFilter('learning')}

                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                              statusFilter === 'learning'

                                ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm'

                                : 'text-slate-500 dark:text-slate-400 hover:text-amber-500'

                            }`}

                          >

                            Đang học ({vocabItems.filter(v => v.status === 'learning').length})

                          </button>

                          <button

                            onClick={() => setStatusFilter('mastered')}

                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                              statusFilter === 'mastered'

                                ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm'

                                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'

                            }`}

                          >

                            Đã thuộc ({vocabItems.filter(v => v.status === 'mastered').length})

                          </button>

                        </div>

                      </div>

                      {/* Danh sách từ vựng đã được lọc */}

                      {(() => {

                        const filtered = vocabItems.filter(item => {

                          if (statusFilter !== 'all' && item.status !== statusFilter) return false;

                          if (searchQuery.trim()) {

                            const q = searchQuery.toLowerCase().trim();

                            return (item.kanji_word && item.kanji_word.toLowerCase().includes(q)) ||

                                   (item.hiragana && item.hiragana.toLowerCase().includes(q)) ||

                                   (item.romaji && item.romaji.toLowerCase().includes(q)) ||

                                   (item.vietnamese_meaning && item.vietnamese_meaning.toLowerCase().includes(q));

                          }

                          return true;

                        });

                        if (filtered.length === 0) {

                          return (

                            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">

                              📭 Không tìm thấy từ vựng nào khớp với bộ lọc.

                            </div>

                          );

                        }

                        return (

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {filtered.map(item => (

                              <div 

                                key={item.id}

                                className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md p-5 rounded-2xl flex items-start justify-between hover:shadow-sm transition-all"

                              >

                                <div className="space-y-2 flex-1">

                                  <div className="flex items-baseline gap-2">

                                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">

                                      {item.kanji_word || item.hiragana}

                                    </span>

                                    {item.kanji_word && (

                                      <span className="text-xs text-slate-400 dark:text-slate-500">

                                        ({item.hiragana})

                                      </span>

                                    )}

                                  </div>

                                  <p className="text-xs font-bold text-pink-700 dark:text-pink-400 font-extrabold tracking-wider select-all">{item.romaji}</p>

                                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.vietnamese_meaning}</p>

                                  

                                  {item.mnemonic_tip && (

                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-1">

                                      💡 {item.mnemonic_tip}

                                    </p>

                                  )}

                                </div>

                                <div className="flex flex-col items-end gap-3 justify-between h-full">

                                  <button

                                    onClick={() => playAudioWithFallback(item.kanji_word || item.hiragana, item.hiragana)}

                                    className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-707 dark:text-slate-400 dark:hover:text-slate-200 text-xs transition-all active:scale-90"

                                    title="Nghe phát âm"

                                  >

                                    🔊

                                  </button>

                                  {/* Status Selector */}

                                  <select

                                    value={item.status}

                                    onChange={(e) => {

                                      const newStatus = e.target.value as 'not_learned' | 'learning' | 'mastered';

                                      handleStatusChange(item.id, newStatus);

                                    }}

                                    className={getStatusSelectClass(item.status)}

                                  >

                                    <option value="not_learned">Chưa học</option>

                                    <option value="learning">Đang học</option>

                                    <option value="mastered">Đã thuộc</option>

                                  </select>

                                </div>

                              </div>

                            ))}

                          </div>

                        );

                      })()}

                    </div>

                  )}

                  {vocabSubTab === 'practice' && (

                    <>{renderInteractivePractice()}</>

                  )}

                </div>

              ) : (

                <div className="space-y-6">

                

                {/* 1. Vocabulary Progress Card */}

                <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-5 rounded-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                  <div className="md:col-span-4 space-y-2">

                    <h2 className="text-md font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2">

                      <span>📊</span>

                      <span>Tiến độ từ vựng bài học</span>

                    </h2>

                    <p className="text-xs text-slate-400 dark:text-slate-500">

                      Thuộc từ vựng giúp bạn tăng cường từ vựng và tự tin Kaiwa

                    </p>

                  </div>

                  {/* Progress values */}

                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 rounded-xl flex items-center justify-between">

                      <span className="text-xs text-slate-400 dark:text-slate-500">Tổng từ vựng</span>

                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{vocabTotalCount} từ</span>

                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 rounded-xl flex items-center justify-between">

                      <span className="text-xs text-slate-400 dark:text-slate-500">Đã thuộc</span>

                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{vocabMasteredCount} từ</span>

                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 rounded-xl flex items-center justify-between">

                      <span className="text-xs text-slate-400 dark:text-slate-500">Đang học</span>

                      <span className="text-sm font-black text-amber-400">{vocabLearningCount} từ</span>

                    </div>

                    {/* Progress Bar overall */}

                    <div className="sm:col-span-3 pt-2">

                      <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5">

                        <span className="text-slate-400 dark:text-slate-500 uppercase">Tỷ lệ hoàn thành</span>

                        <span className="text-blue-600 dark:text-blue-400">{progressPercent}%</span>

                      </div>

                      <div className="w-full bg-white dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40">

                        <div

                          className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500"

                          style={{ width: `${progressPercent}%` }}

                        />

                      </div>

                    </div>

                  </div>

                </div>

                {/* 2. Search & Filters */}

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                  {/* Search box */}

                  <div className="relative w-full md:max-w-xs lg:max-w-md">

                    <input

                      type="text"

                      placeholder="Tìm từ vựng, Romaji, Nghĩa Việt..."

                      value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}

                      className="w-full bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-base md:text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-600/60"

                    />

                    <span className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 text-sm">🔍</span>

                  </div>

                  {/* Filters & Actions row */}

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">

                    {/* Kanji Mode Checkbox */}

                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none py-1.5 px-3 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-200/40 dark:hover:bg-slate-800/60 transition-colors">

                      <input

                        type="checkbox"

                        checked={showKanjiInVocab}

                        onChange={(e) => setShowKanjiInVocab(e.target.checked)}

                        className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"

                      />

                      <span>🇯🇵 Học bằng Kanji</span>

                    </label>

                    {/* Status filters */}

                    <div className="flex bg-slate-50 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto shrink-0 overflow-x-auto max-w-full justify-between sm:justify-start">

                      <button

                        onClick={() => setStatusFilter('all')}

                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                          statusFilter === 'all'

                            ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'

                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                        }`}

                      >

                        Tất cả ({vocabTotalCount})

                      </button>

                      <button

                        onClick={() => setStatusFilter('not_learned')}

                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                          statusFilter === 'not_learned'

                            ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'

                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                        }`}

                      >

                        Chưa học ({vocabItems.filter(v => v.status === 'not_learned').length})

                      </button>

                      <button

                        onClick={() => setStatusFilter('learning')}

                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                          statusFilter === 'learning'

                            ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'

                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                        }`}

                      >

                        Đang học ({vocabItems.filter(v => v.status === 'learning').length})

                      </button>

                      <button

                        onClick={() => setStatusFilter('mastered')}

                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                          statusFilter === 'mastered'

                            ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'

                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                        }`}

                      >

                        Đã thuộc ({vocabItems.filter(v => v.status === 'mastered').length})

                      </button>

                    </div>

                  </div>

                </div>

                {/* 3. Vocabulary Cards Grouped by Grammar (Collapsible Accordions) */}

                {processedVocabGroups.totalVisible === 0 ? (

                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-100/20 dark:bg-slate-900/20">

                    📭 Không tìm thấy từ vựng nào phù hợp với điều kiện tìm kiếm.

                  </div>

                ) : (

                  <div className="space-y-6">

                    {processedVocabGroups.groups.map((group) => {

                      const idx = group.grammarIndex;

                      const isCollapsedBool = collapsedVocabSections[idx.toString()] === true;

                      

                      // Skip rendering this accordion if total items inside is 0 and we are searching/filtering

                      if (group.newItems.length === 0 && group.copiedItems.length === 0 && (searchQuery || statusFilter !== 'all')) {

                        return null;

                      }

                      return (

                        <div key={idx} className="space-y-4 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 rounded-2xl p-4 bg-slate-100/20 dark:bg-slate-900/20 backdrop-blur-md">

                          {/* Accordion Header */}

                          <div 

                            onClick={() => toggleVocabSection(idx.toString())}

                            className="flex flex-col md:flex-row md:items-center justify-between py-3.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 dark:bg-slate-900/60 hover:border-slate-200 dark:border-slate-800 transition-all select-none gap-3 group/header active:scale-[0.995]"

                          >

                            <div className="flex items-center gap-3 flex-1 min-w-0">

                              <span className="text-lg shrink-0 text-blue-600 dark:text-blue-400 group-hover/header:scale-110 transition-transform">

                                {isCollapsedBool ? '📁' : '📂'}

                              </span>

                              <div className="min-w-0">

                                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex flex-wrap items-center gap-2">

                                  <span className="text-blue-500 text-xs uppercase tracking-wider">Mẫu {idx + 1}:</span>

                                  <span className="text-slate-700 dark:text-slate-200 truncate">{group.grammarTitle}</span>

                                  <div className="flex items-center gap-1.5 ml-1 sm:ml-2">

                                    <span className="px-1.5 py-0.2 bg-emerald-950/80 border border-emerald-900/40 text-[9px] font-black text-emerald-600 dark:text-emerald-400 rounded-md">

                                      {group.newItems.length} mới

                                    </span>

                                    {group.copiedItems.length > 0 && (

                                      <span className="px-1.5 py-0.2 bg-blue-950/80 border border-blue-900/40 text-[9px] font-black text-blue-600 dark:text-blue-400 rounded-md">

                                        {group.copiedItems.length} trùng lặp

                                      </span>

                                    )}

                                  </div>

                                </h3>

                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate italic">

                                  {group.grammarMeaning || 'Không có dịch nghĩa'}

                                </p>

                              </div>

                            </div>

                            <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">

                              {/* Luyện tập button */}

                              <button

                                onClick={(e) => {

                                  e.stopPropagation();

                                  router.push(`/roadmap/practice?lessonId=${selectedLessonId}&grammarIndex=${idx}&from=lessons`);

                                }}

                                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white text-xs font-black rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"

                              >

                                <span>⚡</span> Luyện thế câu

                              </button>

                              <div className="flex items-center gap-2">

                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">

                                  {isCollapsedBool ? 'Mở rộng' : 'Thu gọn'}

                                </span>

                                <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-black text-blue-600 dark:text-blue-400">

                                  {isCollapsedBool ? '▼' : '▲'}

                                </span>

                              </div>

                            </div>

                          </div>

                          {/* Accordion Content */}

                          {!isCollapsedBool && (

                            <div className="space-y-4 pt-2">

                              {/* Warning overlaps / Copied Items */}

                              {group.copiedItems.length > 0 && (

                                <div className="p-3 bg-blue-950/20 border border-blue-100 rounded-xl space-y-1.5">

                                  <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">

                                    Các từ vựng đã được học ở phần trước nhưng được dùng ở mẫu này:

                                  </span>

                                  <div className="flex flex-wrap gap-1.5">

                                    {group.copiedItems.map((c) => (

                                      <span 

                                        key={c.id} 

                                        onClick={() => playAudioWithFallback(getKanjiForm(c.hiragana, kanjiItems), c.hiragana)}

                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-800 text-xs rounded-lg text-slate-400 dark:text-slate-500 cursor-pointer active:scale-95 transition-all" 

                                        title={`${c.vietnamese_meaning} - Nhấp để nghe`}

                                      >

                                        {showKanjiInVocab ? (

                                          <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">

                                            {getKanjiForm(c.hiragana, kanjiItems)}

                                          </span>

                                        ) : (

                                          <PitchAccentDisplay kana={c.hiragana} accent={c.pitch_accent || 0} size="sm" />

                                        )}

                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">({c.romaji})</span>

                                        <span className="text-[10px] text-blue-450">🔊</span>

                                      </span>

                                    ))}

                                  </div>

                                </div>

                              )}

                              {/* Cards Grid for new items */}

                              {group.newItems.length === 0 ? (

                                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100/5">

                                  📝 Không có từ vựng mới nào trong mẫu ngữ pháp này.

                                </div>

                              ) : (

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                  {group.newItems.map((item) => {

                                    let borderClass = 'border-slate-200 dark:border-slate-800';

                                    let statusBg = 'bg-slate-50 dark:bg-slate-950/40';

                                    let shadowClass = '';

                                    if (item.status === 'mastered') {

                                      borderClass = 'border-emerald-800/30 hover:border-emerald-600/50';

                                      statusBg = 'bg-emerald-950/5';

                                      shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.02)]';

                                    } else if (item.status === 'learning') {

                                      borderClass = 'border-amber-800/30 hover:border-amber-600/50';

                                      statusBg = 'bg-amber-950/5';

                                      shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.02)]';

                                    }

                                    return (

                                      <div

                                        key={item.id}

                                        className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/20 ${borderClass} ${statusBg} ${shadowClass}`}

                                      >

                                        <div>

                                          {/* Card Top Row */}

                                          <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">

                                            <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-600 dark:text-blue-400">

                                              {item.word_type === 'noun' && 'Danh từ'}

                                              {item.word_type === 'pronoun' && 'Đại từ'}

                                              {item.word_type === 'verb' && 'Động từ'}

                                              {item.word_type === 'adjective' && 'Tính từ'}

                                              {item.word_type === 'greeting' && 'Chào hỏi'}

                                              {!['noun','pronoun','verb','adjective','greeting'].includes(item.word_type) && (item.word_type || 'Từ vựng')}

                                            </span>

                                            <select

                                              value={item.status}

                                              onChange={(e) => handleStatusChange(item.id, e.target.value as any)}

                                              className={`bg-white dark:bg-slate-900/60 border rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${

                                                item.status === 'mastered'

                                                  ? 'border-emerald-900 text-emerald-600 dark:text-emerald-400 bg-emerald-950/20'

                                                  : item.status === 'learning'

                                                  ? 'border-amber-900 text-amber-400 bg-amber-950/20'

                                                  : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900/60'

                                              }`}

                                            >

                                              <option value="not_learned" className="bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500">⚪ Chưa học</option>

                                              <option value="learning" className="bg-white dark:bg-slate-950 text-amber-400">🟡 Đang học</option>

                                              <option value="mastered" className="bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400">🟢 Đã thuộc</option>

                                            </select>

                                          </div>

                                          {/* Card Japanese Word */}

                                          <div className="flex items-baseline flex-wrap gap-2 mb-3">

                                            {showKanjiInVocab ? (

                                              <>

                                                <span className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-wide">

                                                  {getKanjiForm(item.hiragana, kanjiItems)}

                                                </span>

                                                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">

                                                  ({item.hiragana})

                                                </span>

                                              </>

                                            ) : (

                                              <PitchAccentDisplay

                                                kana={item.hiragana}

                                                accent={item.pitch_accent || 0}

                                                size="md"

                                              />

                                            )}

                                            <button

                                              onClick={() => playAudioWithFallback(getKanjiForm(item.hiragana, kanjiItems), item.hiragana)}

                                              className="p-1 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:text-blue-400 hover:border-blue-200 dark:border-blue-800/50 dark:border-blue-800/40 transition-colors cursor-pointer active:scale-90 self-center"

                                              title="Nghe phát âm"

                                            >

                                              🔊

                                            </button>

                                          </div>

                                          {/* Card translations */}

                                          <div className="space-y-0.5 mb-3 text-[11px] sm:text-xs">

                                            <p className="text-slate-400 dark:text-slate-500 font-semibold tracking-wide">

                                              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase mr-1">Romaji:</span>

                                              {item.romaji}

                                            </p>

                                            <p className="text-slate-700 dark:text-slate-200 font-bold">

                                              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase mr-1">Nghĩa:</span>

                                              {item.vietnamese_meaning}

                                            </p>

                                          </div>

                                          {/* Mnemonic card */}

                                          {item.mnemonic_tip && (

                                            <div className="mb-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 flex items-start space-x-2">

                                              <span className="text-xs shrink-0">💡</span>

                                              <div className="space-y-0.5">

                                                <span className="block text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>

                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{item.mnemonic_tip}</p>

                                              </div>

                                            </div>

                                          )}

                                          {/* Sentence example section */}

                                          {item.japanese_example && (

                                            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 space-y-1">

                                              <div className="flex items-center space-x-1.5">

                                                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-1.5 py-0.2 rounded uppercase tracking-wider">Ví dụ</span>

                                                <button

                                                  onClick={() => playAudio(item.japanese_example)}

                                                  className="text-[9px] text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:text-blue-400 cursor-pointer"

                                                  title="Nghe câu ví dụ"

                                                >

                                                  🔊 Nghe

                                                </button>

                                              </div>

                                              <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">

                                                {item.japanese_example}

                                              </p>

                                              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic leading-relaxed">

                                                {item.example_meaning}

                                              </p>

                                            </div>

                                          )}

                                        </div>

                                      </div>

                                    );

                                  })}

                                </div>

                              )}

                            </div>

                          )}

                        </div>

                      );

                    })}

                    {/* Supplemental Words Accordion */}

                    {processedVocabGroups.supplemental.length > 0 && (() => {

                      const isCollapsedBool = collapsedVocabSections['supplemental'] === true;

                      return (

                        <div className="space-y-4 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 rounded-2xl p-4 bg-slate-100/20 dark:bg-slate-900/20 backdrop-blur-md">

                          {/* Accordion Header */}

                          <div 

                            onClick={() => toggleVocabSection('supplemental')}

                            className="flex items-center justify-between py-3.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 dark:bg-slate-900/60 hover:border-slate-200 dark:border-slate-800 transition-all select-none group/header active:scale-[0.995]"

                          >

                            <div className="flex items-center gap-3">

                              <span className="text-lg shrink-0 text-blue-600 dark:text-blue-400 group-hover/header:scale-110 transition-transform">

                                {isCollapsedBool ? '📁' : '📂'}

                              </span>

                              <div>

                                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">

                                  <span className="text-slate-700 dark:text-slate-200">Từ vựng bổ sung / Khác</span>

                                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-400 dark:text-slate-500 rounded-md">

                                    {processedVocabGroups.supplemental.length} từ

                                  </span>

                                </h3>

                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">

                                  Các từ vựng bổ sung bổ trợ thêm cho bài học

                                </p>

                              </div>

                            </div>

                            

                            <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">

                              <button

                                onClick={(e) => {

                                  e.stopPropagation();

                                  router.push(`/roadmap/practice?lessonId=${selectedLessonId}&grammarIndex=${grammarItems.length}&from=lessons`);

                                }}

                                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white text-xs font-black rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"

                              >

                                <span>⚡</span> Luyện thế câu

                              </button>

                              <div className="flex items-center gap-2">

                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">

                                  {isCollapsedBool ? 'Mở rộng' : 'Thu gọn'}

                                </span>

                                <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-black text-blue-600 dark:text-blue-400">

                                  {isCollapsedBool ? '▼' : '▲'}

                                </span>

                              </div>

                            </div>

                          </div>

                          {/* Accordion Content */}

                          {!isCollapsedBool && (

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

                              {processedVocabGroups.supplemental.map((item) => {

                                let borderClass = 'border-slate-200 dark:border-slate-800';

                                let statusBg = 'bg-slate-50 dark:bg-slate-950/40';

                                let shadowClass = '';

                                if (item.status === 'mastered') {

                                  borderClass = 'border-emerald-800/30 hover:border-emerald-600/50';

                                  statusBg = 'bg-emerald-950/5';

                                  shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.02)]';

                                } else if (item.status === 'learning') {

                                  borderClass = 'border-amber-800/30 hover:border-amber-600/50';

                                  statusBg = 'bg-amber-950/5';

                                  shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.02)]';

                                }

                                return (

                                  <div

                                    key={item.id}

                                    className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/20 ${borderClass} ${statusBg} ${shadowClass}`}

                                  >

                                    <div>

                                      {/* Card Top Row */}

                                      <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">

                                        <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-600 dark:text-blue-400">

                                          {item.word_type === 'noun' && 'Danh từ'}

                                          {item.word_type === 'pronoun' && 'Đại từ'}

                                          {item.word_type === 'verb' && 'Động từ'}

                                          {item.word_type === 'adjective' && 'Tính từ'}

                                          {item.word_type === 'greeting' && 'Chào hỏi'}

                                          {!['noun','pronoun','verb','adjective','greeting'].includes(item.word_type) && (item.word_type || 'Từ vựng')}

                                        </span>

                                        <select

                                          value={item.status}

                                          onChange={(e) => handleStatusChange(item.id, e.target.value as any)}

                                          className={`bg-white dark:bg-slate-900/60 border rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${

                                            item.status === 'mastered'

                                              ? 'border-emerald-900 text-emerald-600 dark:text-emerald-400 bg-emerald-950/20'

                                              : item.status === 'learning'

                                              ? 'border-amber-900 text-amber-400 bg-amber-950/20'

                                              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900/60'

                                          }`}

                                        >

                                          <option value="not_learned" className="bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500">⚪ Chưa học</option>

                                          <option value="learning" className="bg-white dark:bg-slate-950 text-amber-400">🟡 Đang học</option>

                                          <option value="mastered" className="bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400">🟢 Đã thuộc</option>

                                        </select>

                                      </div>

                                      {/* Card Japanese Word */}

                                      <div className="flex items-baseline flex-wrap gap-2 mb-3">

                                        {showKanjiInVocab ? (

                                          <>

                                            <span className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-wide">

                                              {getKanjiForm(item.hiragana, kanjiItems)}

                                            </span>

                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">

                                              ({item.hiragana})

                                            </span>

                                          </>

                                        ) : (

                                          <PitchAccentDisplay

                                            kana={item.hiragana}

                                            accent={item.pitch_accent || 0}

                                            size="md"

                                          />

                                        )}

                                        <button

                                          onClick={() => playAudioWithFallback(getKanjiForm(item.hiragana, kanjiItems), item.hiragana)}

                                          className="p-1 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:text-blue-400 hover:border-blue-200 dark:border-blue-800/50 dark:border-blue-800/40 transition-colors cursor-pointer active:scale-90 self-center"

                                          title="Nghe phát âm"

                                        >

                                          🔊

                                        </button>

                                      </div>

                                      {/* Card translations */}

                                      <div className="space-y-0.5 mb-3 text-[11px] sm:text-xs">

                                        <p className="text-slate-400 dark:text-slate-500 font-semibold tracking-wide">

                                          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase mr-1">Romaji:</span>

                                          {item.romaji}

                                        </p>

                                        <p className="text-slate-700 dark:text-slate-200 font-bold">

                                          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase mr-1">Nghĩa:</span>

                                          {item.vietnamese_meaning}

                                        </p>

                                      </div>

                                      {/* Mnemonic card */}

                                      {item.mnemonic_tip && (

                                        <div className="mb-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 flex items-start space-x-2">

                                          <span className="text-xs shrink-0">💡</span>

                                          <div className="space-y-0.5">

                                            <span className="block text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>

                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{item.mnemonic_tip}</p>

                                          </div>

                                        </div>

                                      )}

                                      {/* Sentence example section */}

                                      {item.japanese_example && (

                                        <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 space-y-1">

                                          <div className="flex items-center space-x-1.5">

                                            <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-1.5 py-0.2 rounded uppercase tracking-wider">Ví dụ</span>

                                            <button

                                              onClick={() => playAudio(item.japanese_example)}

                                              className="text-[9px] text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:text-blue-400 cursor-pointer"

                                              title="Nghe câu ví dụ"

                                            >

                                              🔊 Nghe

                                            </button>

                                          </div>

                                          <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">

                                            {item.japanese_example}

                                          </p>

                                          <p className="text-[10px] text-slate-405 italic leading-relaxed">

                                            {item.example_meaning}

                                          </p>

                                        </div>

                                      )}

                                    </div>

                                  </div>

                                );

                              })}

                            </div>

                          )}

                        </div>

                      );

                    })()}

                  </div>

                )}

              </div>

            )

          )}

            {currentTab === 'grammar' && (

              isMarugoto ? (

                /* ==================== GIAO DIỆN NGỮ PHÁP MARUGOTO RÚT GỌN CHUẨN ==================== */

                <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">

                  {/* 1. Header Progress Card */}

                  <div className="bg-white border border-slate-200 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:shadow-none p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div className="space-y-1">

                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">

                        <span>📖</span>

                        <span>{lessonTitle} - NGỮ PHÁP</span>

                      </h2>

                      <p className="text-sm text-slate-600 dark:text-slate-200">

                        Học cấu trúc và luyện tập phản xạ chuyển đổi 3 thể câu trực quan. Click vào từng mẫu để xem chi tiết.

                      </p>

                    </div>

                    <div className="flex items-center gap-4 shrink-0">

                      <div className="text-right">

                        <span className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">Học liệu</span>

                        <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">

                          {grammarItems.length} Mẫu câu

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* 2. Sub-tab Switcher cho Ngữ pháp */}

                  <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/60 max-w-sm">

                    <button

                      onClick={() => setGrammarSubTab('learn')}

                      className={"flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer " + (

                        grammarSubTab === 'learn'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                          : 'text-slate-600 dark:text-slate-200 hover:text-slate-700'

                      )}

                    >

                      📖 Học ngữ pháp

                    </button>

                    <button

                      onClick={() => setGrammarSubTab('practice')}

                      className={"flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer " + (

                        grammarSubTab === 'practice'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                          : 'text-slate-600 dark:text-slate-200 hover:text-slate-755'

                      )}

                    >

                      ⚡ Luyện tập ngữ pháp

                    </button>

                  </div>

                  {grammarSubTab === 'learn' ? (

                    /* CHẾ ĐỘ HỌC NGỮ PHÁP ACCORDION */

                    <div className="space-y-4">

                      {grammarItems.map((g) => {

                        const isExpanded = expandedGrammarId === g.id;

                        let structureExplain: any = {};

                        if (g.notes && g.notes.startsWith('{')) {

                          try {

                            structureExplain = JSON.parse(g.notes);

                          } catch (e) {

                            structureExplain = {};

                          }

                        }

                        const activeTab = grammarDetailTab[g.id] || 'structure';

                        let examples: any[] = [];

                        if (g.examples_json) {

                          try {

                            examples = typeof g.examples_json === 'string'

                              ? JSON.parse(g.examples_json)

                              : g.examples_json;

                          } catch (e) {

                            examples = [];

                          }

                        }

                        // Filter examples into categories

                        const affExs = examples.filter(ex => (ex.type || 'affirmative') === 'affirmative');

                        const negExs = examples.filter(ex => ex.type === 'negative');

                        const intExs = examples.filter(ex => ex.type === 'interrogative');

                        const toggleExpand = () => {

                          setExpandedGrammarId(isExpanded ? null : g.id);

                        };

                        const setDetailTab = (tab: 'structure' | 'examples') => {

                          setGrammarDetailTab(prev => ({

                            ...prev,

                            [g.id]: tab

                          }));

                        };

                        const highlightEnding = (text: string, type: 'affirmative' | 'negative' | 'interrogative' = 'affirmative') => {

                          if (!text) return '';

                          const replaced = text

                            .replace(/(じゃないです|じゃありません|ではないです|いません|ありません|しません)/g, '<span class="text-rose-500 font-extrabold">$1</span>')

                            .replace(/(ですか|ますか|でしょうか)/g, '<span class="text-amber-500 font-extrabold">$1</span>')

                            .replace(/(es|です|ます|ています|あります|います|します)/g, '<span class="text-pink-700 dark:text-pink-400 font-extrabold font-extrabold">$1</span>');

                          return <span dangerouslySetInnerHTML={{ __html: replaced }} />;

                        };

                        return (

                          <div 

                            key={g.id}

                            className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"

                          >

                            {/* Title Bar (Click to Expand) */}

                            <button

                              onClick={toggleExpand}

                              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/55 dark:hover:bg-slate-800/20 transition-all cursor-pointer"

                            >

                              <div className="space-y-1">

                                <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-50 dark:bg-pink-955/30 text-pink-700 dark:text-pink-400 font-extrabold dark:text-pink-400 border border-pink-100/50 dark:border-pink-900/40 uppercase tracking-wider">

                                  Mẫu #{isMarugoto ? (g.id === 197 ? 7 : g.id === 198 ? 8 : g.id === 199 ? 9 : g.id - 150) : g.id}

                                </span>

                                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                                  {g.title === 'は です wa desu' ? 'N1 は N2 です (N1 wa N2 desu)' :
                                   g.title === 'が できます ga dekimasu' ? 'N1 は N2 が できます (ga dekimasu)' :
                                   g.title === 'も mo' ? 'N も desu / N mo dekimasu (mo)' :
                                   g.title === 'が すきedit ga suki desu' || g.title === 'が すきです ga suki desu' ? 'N が すきです (ga suki desu)' :
                                   g.title === 'よく ます yoku masu' ? 'よく V ます / あまり V ません (yoku/amari)' :
                                   g.title === 'だれですか dare desuka' ? 'だれですか (dare desu ka) / どなたですか' :
                                   g.title === 'おいくつですか oikutsu desuka' ? 'おいくつですか (oikutsu desu ka) / なんさいですか' :
                                   g.title === 'お仕事は oishigoto wa' ? 'お仕事は (oishigoto wa)' :
                                   g.title}
                                </h3>

                                <p className="text-xs font-bold text-pink-700 dark:text-pink-400 font-extrabold dark:text-pink-300">

                                  {g.meaning}

                                </p>

                              </div>

                              <span className="text-slate-500 dark:text-slate-300 text-lg transition-transform duration-200">

                                {isExpanded ? '▲' : '▼'}

                              </span>

                            </button>

                            {/* Detail Panel */}

                            {isExpanded && (

                              <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/20 dark:bg-slate-900/10 space-y-6">

                                {/* Tab Selector */}

                                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/60 max-w-xs">

                                  <button

                                    onClick={() => setDetailTab('structure')}

                                    className={"flex-1 py-1.5 text-center text-xs font-extrabold rounded-lg transition-all cursor-pointer " + (

                                      activeTab === 'structure'

                                        ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                                        : 'text-slate-600 dark:text-slate-200'

                                    )}

                                  >

                                    📋 Bảng cấu trúc

                                  </button>

                                  <button

                                    onClick={() => setDetailTab('examples')}

                                    className={"flex-1 py-1.5 text-center text-xs font-extrabold rounded-lg transition-all cursor-pointer " + (

                                      activeTab === 'examples'

                                        ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                                        : 'text-slate-600 dark:text-slate-200'

                                    )}

                                  >

                                    💬 Câu ví dụ

                                  </button>

                                </div>

                                {activeTab === 'structure' ? (

                                  /* TAB MẪU CÂU (BẢNG MẪU CÂU) */

                                  <div className="space-y-6">

                                    {/* 1. Khẳng định Structure */}

                                    {affExs.length > 0 && (

                                      <div className="space-y-2">

                                        <div className="flex items-center justify-between">

                                          <div className="flex items-center gap-1.5">

                                            <span className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">

                                              🟢 Khẳng định

                                            </span>

                                            {structureExplain.affirmative && (

                                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic">

                                                ({structureExplain.affirmative})

                                              </span>

                                            )}

                                          </div>

                                          <button

                                            onClick={() => setSelectedPopupGrammar({ grammar: g, selectedFormType: 'affirmative' })}

                                            className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold hover:bg-[#b5179e]/10 hover:text-pink-700 dark:text-pink-400 font-extrabold cursor-pointer transition-all active:scale-95 flex items-center gap-1"

                                          >

                                            <span>Chi tiết</span>

                                            <span>🔍</span>

                                          </button>

                                        </div>

                                        {renderVisualStructure(getVisualStructureForForm(g.structure, 'affirmative', g.id))}

                                      </div>

                                    )}

                                    {/* 2. Phủ định Structure */}

                                    {negExs.length > 0 && (

                                      <div className="space-y-2">

                                        <div className="flex items-center justify-between">

                                          <div className="flex items-center gap-1.5">

                                            <span className="text-xs font-extrabold text-rose-500 uppercase tracking-wider">

                                              🔴 Phủ định

                                            </span>

                                            {structureExplain.negative && (

                                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic">

                                                ({structureExplain.negative})

                                              </span>

                                            )}

                                          </div>

                                          <button

                                            onClick={() => setSelectedPopupGrammar({ grammar: g, selectedFormType: 'negative' })}

                                            className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold hover:bg-[#b5179e]/10 hover:text-pink-700 dark:text-pink-400 font-extrabold cursor-pointer transition-all active:scale-95 flex items-center gap-1"

                                          >

                                            <span>Chi tiết</span>

                                            <span>🔍</span>

                                          </button>

                                        </div>

                                        {renderVisualStructure(getVisualStructureForForm(g.structure, 'negative', g.id))}

                                      </div>

                                    )}

                                    {/* 3. Nghi vấn Structure */}

                                    {intExs.length > 0 && (

                                      <div className="space-y-2">

                                        <div className="flex items-center justify-between">

                                          <div className="flex items-center gap-1.5">

                                            <span className="text-xs font-extrabold text-amber-500 uppercase tracking-wider">

                                              🟡 Nghi vấn

                                            </span>

                                            {structureExplain.interrogative && (

                                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic">

                                                ({structureExplain.interrogative})

                                              </span>

                                            )}

                                          </div>

                                          <button

                                            onClick={() => setSelectedPopupGrammar({ grammar: g, selectedFormType: 'interrogative' })}

                                            className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold hover:bg-[#b5179e]/10 hover:text-pink-700 dark:text-pink-400 font-extrabold cursor-pointer transition-all active:scale-95 flex items-center gap-1"

                                          >

                                            <span>Chi tiết</span>

                                            <span>🔍</span>

                                          </button>

                                        </div>

                                        {renderVisualStructure(getVisualStructureForForm(g.structure, 'interrogative', g.id))}

                                      </div>

                                    )}

                                    </div>) : (

                                  /* TAB VÍ DỤ */

                                  <div className="space-y-6">

                                    {/* 1. Khẳng định Examples */}

                                    {affExs.length > 0 && (

                                      <div className="space-y-3">

                                        <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1.5 uppercase tracking-wider">

                                          🟢 Khẳng định ({affExs.length} ví dụ)

                                        </span>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                          {affExs.map((ex: any, exIdx: number) => (

                                            <div 

                                              key={exIdx}

                                              className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2 relative hover:border-[#b5179e]/30 transition-all"

                                            >

                                              <div className="flex items-center justify-between">

                                                <span className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-wider bg-emerald-505/10 px-1.5 py-0.5 rounded border border-emerald-505/20">

                                                  Ví dụ #{exIdx + 1}

                                                </span>

                                                <button

                                                  onClick={() => playAudioWithFallback(ex.japanese, ex.japanese)}

                                                  className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 text-pink-700 dark:text-pink-400 font-extrabold dark:text-pink-300 hover:text-slate-707 dark:hover:text-slate-200 text-xs transition-all active:scale-90"

                                                  title="Phát âm"

                                                >

                                                  🔊

                                                </button>

                                              </div>

                                              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">

                                                {highlightEnding(cleanAndHiraganizeExample(ex.japanese, ex.romaji), 'affirmative')}

                                              </p>

                                              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-200 tracking-wider">

                                                {ex.romaji}

                                              </p>

                                              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium border-t border-slate-100/60 dark:border-slate-800/40 pt-1.5">

                                                {ex.vietnamese}

                                              </p>

                                            </div>

                                          ))}

                                        </div>

                                      </div>

                                    )}

                                    {/* 2. Phủ định Examples */}

                                    {negExs.length > 0 && (

                                      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">

                                        <span className="text-xs font-extrabold text-rose-500 flex items-center gap-1.5 uppercase tracking-wider">

                                          🔴 Phủ định ({negExs.length} ví dụ)

                                        </span>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                          {negExs.map((ex: any, exIdx: number) => (

                                            <div 

                                              key={exIdx}

                                              className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2 relative hover:border-[#b5179e]/30 transition-all"

                                            >

                                              <div className="flex items-center justify-between">

                                                <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider bg-rose-50/10 px-1.5 py-0.5 rounded border border-rose-50/20">

                                                  Ví dụ #{exIdx + 1}

                                                </span>

                                                <button

                                                  onClick={() => playAudioWithFallback(ex.japanese, ex.japanese)}

                                                  className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 text-pink-700 dark:text-pink-400 font-extrabold dark:text-pink-300 hover:text-slate-707 dark:hover:text-slate-200 text-xs transition-all active:scale-90"

                                                  title="Phát âm"

                                                >

                                                  🔊

                                                </button>

                                              </div>

                                              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">

                                                {highlightEnding(cleanAndHiraganizeExample(ex.japanese, ex.romaji), 'negative')}

                                              </p>

                                              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-200 tracking-wider">

                                                {ex.romaji}

                                              </p>

                                              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium border-t border-slate-100/60 dark:border-slate-800/40 pt-1.5">

                                                {ex.vietnamese}

                                              </p>

                                            </div>

                                          ))}

                                        </div>

                                      </div>

                                    )}

                                    {/* 3. Nghi vấn Examples */}

                                    {intExs.length > 0 && (

                                      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">

                                        <span className="text-xs font-extrabold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">

                                          🟡 Nghi vấn ({intExs.length} ví dụ)

                                        </span>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                          {intExs.map((ex: any, exIdx: number) => (

                                            <div 

                                              key={exIdx}

                                              className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2 relative hover:border-[#b5179e]/30 transition-all"

                                            >

                                              <div className="flex items-center justify-between">

                                                <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider bg-amber-505/10 px-1.5 py-0.5 rounded border border-amber-505/20">

                                                  Ví dụ #{exIdx + 1}

                                                </span>

                                                <button

                                                  onClick={() => playAudioWithFallback(ex.japanese, ex.japanese)}

                                                  className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 text-pink-700 dark:text-pink-400 font-extrabold dark:text-pink-300 hover:text-slate-707 dark:hover:text-slate-200 text-xs transition-all active:scale-90"

                                                  title="Phát âm"

                                                >

                                                  🔊

                                                </button>

                                              </div>

                                              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">

                                                {highlightEnding(cleanAndHiraganizeExample(ex.japanese, ex.romaji), 'interrogative')}

                                              </p>

                                              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-200 tracking-wider">

                                                {ex.romaji}

                                              </p>

                                              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium border-t border-slate-100/60 dark:border-slate-800/40 pt-1.5">

                                                {ex.vietnamese}

                                              </p>

                                            </div>

                                          ))}

                                        </div>

                                      </div>

                                    )}

                                  </div>

                                )}

                              </div>

                            )}

                          </div>

                        );

                      })}

                    </div>

                  ) : (

                    /* CHẾ ĐỘ LUYỆN TẬP NGỮ PHÁP MARUGOTO */

                    
                    <div className="space-y-6 max-w-2xl mx-auto">
                      {/* Giao diện nút chọn 2 tab luyện tập ngữ pháp */}
                      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 w-full overflow-x-auto gap-2">
                        <button
                          onClick={() => {
                            setGrammarPracticeMode('translation');
                            handleStartTranslation(translationDirection);
                          }}
                          className={"flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap " + (
                            grammarPracticeMode === 'translation'
                              ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                          )}
                        >
                          ✍️ Luyện dịch câu
                        </button>
                        <button
                          onClick={() => setGrammarPracticeMode('listening')}
                          className={"flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap " + (
                            grammarPracticeMode === 'listening'
                              ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                          )}
                        >
                          🔊 Nghe chọn đáp án
                        </button>
                      </div>

                      {/* NỘI DUNG 2 TAB LUYỆN TẬP */}
                      <div className="w-full p-6 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md rounded-3xl shadow-sm">
                        
                        {/* TAB 1: LUYỆN DỊCH TỰ LUẬN (VÔ HẠN & NGHE DỊCH) */}
                        {grammarPracticeMode === 'translation' && (
                          !activeTranslationQuestion ? (
                            <p className="text-center text-slate-500 py-6">Đang chuẩn bị câu hỏi luyện dịch...</p>
                          ) : (
                            <div className="space-y-6">
                              <div className="flex justify-between items-center text-xs text-slate-450 font-bold">
                                <span>Câu hỏi số {translationIndex} (Không giới hạn câu)</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-indigo-500 font-bold">Đã dịch: {translationScore} câu</span>
                                  <button
                                    onClick={() => {
                                      const nextDir = translationDirection === 'vi-to-ja' ? 'ja-to-vi' : 'vi-to-ja';
                                      setTranslationDirection(nextDir);
                                      handleStartTranslation(nextDir);
                                    }}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-[10px] text-indigo-700 dark:text-indigo-300 rounded-md font-extrabold shadow-sm border border-indigo-200/50 dark:border-indigo-800/40 cursor-pointer transition-all"
                                  >
                                    🔄 Đổi chiều ({translationDirection === 'vi-to-ja' ? 'Việt-Nhật' : 'Nhật-Việt'})
                                  </button>
                                </div>
                              </div>

                              {/* Thanh công cụ bổ sung cho chế độ nghe dịch */}
                              {translationDirection === 'ja-to-vi' && (
                                <div className="flex items-center justify-end gap-2 p-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/80 rounded-xl">
                                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                    <input 
                                      type="checkbox" 
                                      checked={isListeningTranslationMode} 
                                      onChange={() => {
                                        const newMode = !isListeningTranslationMode;
                                        setIsListeningTranslationMode(newMode);
                                        // Tự động phát âm ngay khi chuyển sang chế độ nghe dịch
                                        if (newMode && activeTranslationQuestion) {
                                          playAudioWithFallback(activeTranslationQuestion.japanese, activeTranslationQuestion.japanese);
                                        }
                                      }}
                                      className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-550" 
                                    />
                                    <span>🎧 Chế độ Nghe dịch (Ẩn chữ Nhật)</span>
                                  </label>
                                </div>
                              )}

                              {/* Giao diện câu hỏi */}
                              <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center space-y-2 relative overflow-hidden">
                                <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-[10px] text-indigo-700 dark:text-indigo-400 rounded-full font-bold uppercase tracking-wider">
                                  {translationDirection === 'vi-to-ja' 
                                    ? 'Dịch sang tiếng Nhật' 
                                    : isListeningTranslationMode 
                                      ? 'Nghe và dịch sang tiếng Việt' 
                                      : 'Dịch sang tiếng Việt'}
                                </span>
                                
                                {translationDirection === 'ja-to-vi' && isListeningTranslationMode && !translationIsAnswered ? (
                                  <div className="py-4 space-y-3">
                                    <div className="text-3xl animate-bounce">🎧</div>
                                    <p className="text-xs text-slate-450 italic">Hãy lắng nghe âm thanh chuẩn và nhập câu dịch nghĩa tiếng Việt.</p>
                                    <button
                                      onClick={() => playAudioWithFallback(activeTranslationQuestion.japanese, activeTranslationQuestion.japanese)}
                                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 mx-auto transition-all shadow-md cursor-pointer active:scale-95"
                                    >
                                      🔊 Phát lại âm thanh
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed pt-2">
                                      {activeTranslationQuestion.questionText}
                                    </h4>
                                    {translationDirection === 'ja-to-vi' && (
                                      <button
                                        onClick={() => playAudioWithFallback(activeTranslationQuestion.questionText, activeTranslationQuestion.questionText)}
                                        className="w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full inline-flex items-center justify-center text-xs shadow-sm hover:border-pink-500 cursor-pointer"
                                      >
                                        🔊
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Ô gõ câu dịch */}
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  disabled={translationIsAnswered}
                                  value={translationInput}
                                  onChange={(e) => setTranslationInput(e.target.value)}
                                  placeholder={translationDirection === 'vi-to-ja' ? "Nhập câu dịch tiếng Nhật (Hiragana/Romaji)..." : "Nhập câu dịch tiếng Việt..."}
                                  className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#b5179e] focus:ring-1 focus:ring-[#b5179e] text-slate-700 dark:text-slate-200 dark:bg-slate-955 outline-none"
                                />
                                
                                {translationShowAnswer && (
                                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl space-y-1">
                                    {translationDirection === 'ja-to-vi' && isListeningTranslationMode && (
                                      <div className="pb-2 border-b border-emerald-100/30 mb-2">
                                        <p className="text-xs text-indigo-500 font-bold">Câu tiếng Nhật gốc:</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-205">{activeTranslationQuestion.japanese}</p>
                                      </div>
                                    )}
                                    <p className="text-xs text-emerald-600 font-bold">Đáp án đúng:</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                      {activeTranslationQuestion.displayAnswer}
                                    </p>
                                    <p className="text-xs text-slate-450">
                                      {activeTranslationQuestion.romaji}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-4">
                                {!translationIsAnswered ? (
                                  <button
                                    onClick={() => {
                                      setTranslationIsAnswered(true);
                                      setTranslationShowAnswer(true);
                                      setTranslationScore(prev => prev + 1);
                                      if (activeTranslationQuestion.japanese) {
                                        playAudioWithFallback(activeTranslationQuestion.japanese, activeTranslationQuestion.japanese);
                                      }
                                    }}
                                    className="w-full py-3 bg-[#b5179e] hover:bg-[#7209b7] text-white font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer text-sm shadow-md"
                                  >
                                    ✓ Hoàn thành câu dịch
                                  </button>
                                ) : (
                                  <button
                                    onClick={handleNextTranslation}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-855 dark:bg-slate-100 dark:hover:bg-slate-202 text-white dark:text-slate-900 font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer text-sm shadow-md"
                                  >
                                    Câu tiếp theo ➔
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        )}

                        {/* TAB 2: NGHE TRẮC NGHIỆM CHỌN ĐÁP ÁN */}
                        {grammarPracticeMode === 'listening' && (
                          <div className="space-y-4">
                            <div className="p-3 bg-pink-50/50 dark:bg-pink-955/10 border border-pink-100 dark:border-pink-900 text-xs text-pink-700 dark:text-pink-400 rounded-2xl">
                              💡 Trình duyệt sẽ phát âm câu tiếng Nhật. Hãy lắng nghe và lựa chọn đáp án đúng bên dưới!
                            </div>
                            <ListeningQuiz 
                              vocabItems={[]} 
                              grammarItems={translationQuestions || []} 
                              onStartGame={() => handleStartTranslation(translationDirection)}
                            />
                          </div>
                        )}

                      </div>
                    </div>
                  )}
                </div>
              ) : (

                /* NGỮ PHÁP MINNA HẬU BỊ */

                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

                  <p className="text-center text-slate-500">Mở lộ trình học hoặc từ vựng của Minna no Nihongo để xem ngữ pháp lồng ghép.</p>

                </div>

              )

            )}

            {currentTab === 'kanji' && (

              <div className="space-y-6">

                

                {/* 1. Kanji Progress Card */}

                <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-5 rounded-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                  <div className="md:col-span-4 space-y-2">

                    <h2 className="text-md font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2">

                      <span>📊</span>

                      <span>Tiến độ chữ Hán bài học</span>

                    </h2>

                    <p className="text-xs text-slate-400 dark:text-slate-500">

                      Học chữ Hán giúp bạn làm chủ mặt chữ và hiểu sâu nghĩa từ vựng

                    </p>

                  </div>

                  {/* Progress values */}

                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 rounded-xl flex items-center justify-between">

                      <span className="text-xs text-slate-400 dark:text-slate-500">Tổng chữ Hán</span>

                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{kanjiTotalCount} chữ</span>

                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 rounded-xl flex items-center justify-between">

                      <span className="text-xs text-slate-400 dark:text-slate-500">Đã thuộc</span>

                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{kanjiMasteredCount} chữ</span>

                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 rounded-xl flex items-center justify-between">

                      <span className="text-xs text-slate-400 dark:text-slate-500">Đang học</span>

                      <span className="text-sm font-black text-amber-400">{kanjiLearningCount} chữ</span>

                    </div>

                    {/* Progress Bar overall */}

                    <div className="sm:col-span-3 pt-2">

                      <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5">

                        <span className="text-slate-400 dark:text-slate-500 uppercase">Tỷ lệ hoàn thành</span>

                        <span className="text-blue-600 dark:text-blue-400">{kanjiProgressPercent}%</span>

                      </div>

                      <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40">

                        <div

                          className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500"

                          style={{ width: `${kanjiProgressPercent}%` }}

                        />

                      </div>

                    </div>

                  </div>

                </div>

                {/* 2. Search & Filters */}

                <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">

                  <div className="flex flex-col sm:flex-row gap-3 items-center w-full xl:w-auto flex-1">

                    {/* Search box */}

                    <div className="relative w-full sm:max-w-md">

                      <input

                        type="text"

                        placeholder="Tìm chữ Hán, Hán Việt, Nghĩa, Onyomi, Kunyomi..."

                        value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}

                        className="w-full bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-base md:text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-600/60"

                      />

                      <span className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 text-sm">🔍</span>

                    </div>

                    {/* Học bộ thủ button */}

                    <button

                      onClick={() => router.push('/radicals')}

                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 dark:text-white text-xs font-black rounded-xl border border-emerald-500/20 shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"

                    >

                      <span>🉐</span> Ôn bộ thủ

                    </button>

                    {/* Toggle hiển thị bộ thủ */}

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 cursor-pointer shrink-0 select-none hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 py-1 sm:py-0">

                      <input

                        type="checkbox"

                        checked={showRadicals}

                        onChange={(e) => setShowRadicals(e.target.checked)}

                        className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-blue-650 bg-white dark:bg-slate-950 focus:ring-blue-600 cursor-pointer"

                      />

                      <span>Hiển thị bộ thủ</span>

                    </label>

                  </div>

                  {/* Status filters */}

                  <div className="flex bg-slate-50 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto shrink-0 overflow-x-auto max-w-full justify-between sm:justify-start">

                    <button

                      onClick={() => setStatusFilter('all')}

                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                        statusFilter === 'all'

                          ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'

                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                      }`}

                    >

                      Tất cả ({kanjiTotalCount})

                    </button>

                    <button

                      onClick={() => setStatusFilter('not_learned')}

                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                        statusFilter === 'not_learned'

                          ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'

                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                      }`}

                    >

                      Chưa học ({kanjiItems.filter(v => v.status === 'not_learned').length})

                    </button>

                    <button

                      onClick={() => setStatusFilter('learning')}

                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                        statusFilter === 'learning'

                          ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'

                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                      }`}

                    >

                      Đang học ({kanjiItems.filter(v => v.status === 'learning').length})

                    </button>

                    <button

                      onClick={() => setStatusFilter('mastered')}

                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${

                        statusFilter === 'mastered'

                          ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'

                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'

                      }`}

                    >

                      Đã thuộc ({kanjiItems.filter(v => v.status === 'mastered').length})

                    </button>

                  </div>

                </div>

                {/* 2.5 Grammar Filter Indicator / Already Learned Kanji Notice */}

                {/* 3. Kanji Cards Grouped by Grammar (Collapsible Accordions) */}

                {processedKanjiGroups.totalVisible === 0 ? (

                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-100/20 dark:bg-slate-900/20">

                    📭 Không tìm thấy chữ Hán nào phù hợp với điều kiện tìm kiếm.

                  </div>

                ) : (

                  <div className="space-y-6">

                    {processedKanjiGroups.groups.map((group) => {

                      const idx = group.grammarIndex;

                      const isCollapsedBool = collapsedKanjiSections[idx.toString()] === true;

                      // Skip rendering if search/filter is active and no items are inside

                      if (group.newItems.length === 0 && group.copiedItems.length === 0 && (searchQuery || statusFilter !== 'all')) {

                        return null;

                      }

                      return (

                        <div key={idx} className="space-y-4 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 rounded-2xl p-4 bg-slate-100/20 dark:bg-slate-900/20 backdrop-blur-md">

                          {/* Accordion Header */}

                          <div 

                            onClick={() => toggleKanjiSection(idx.toString())}

                            className="flex flex-col md:flex-row md:items-center justify-between py-3.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 dark:bg-slate-900/60 hover:border-slate-200 dark:border-slate-800 transition-all select-none gap-3 group/header active:scale-[0.995]"

                          >

                            <div className="flex items-center gap-3 flex-1 min-w-0">

                              <span className="text-lg shrink-0 text-blue-600 dark:text-blue-400 group-hover/header:scale-110 transition-transform">

                                {isCollapsedBool ? '📁' : '📂'}

                              </span>

                              <div className="min-w-0">

                                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex flex-wrap items-center gap-2">

                                  <span className="text-blue-500 text-xs uppercase tracking-wider">Mẫu {idx + 1}:</span>

                                  <span className="text-slate-700 dark:text-slate-200 truncate">{group.grammarTitle}</span>

                                  <div className="flex items-center gap-1.5 ml-1 sm:ml-2">

                                    <span className="px-1.5 py-0.2 bg-emerald-950/80 border border-emerald-900/40 text-[9px] font-black text-emerald-600 dark:text-emerald-400 rounded-md">

                                      {group.newItems.length} mới

                                    </span>

                                    {group.copiedItems.length > 0 && (

                                      <span className="px-1.5 py-0.2 bg-blue-950/80 border border-blue-900/40 text-[9px] font-black text-blue-600 dark:text-blue-400 rounded-md">

                                        {group.copiedItems.length} trùng lặp

                                      </span>

                                    )}

                                  </div>

                                </h3>

                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate italic">

                                  {group.grammarMeaning || 'Không có dịch nghĩa'}

                                </p>

                              </div>

                            </div>

                            <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">

                              {/* Luyện tập button */}

                              <button

                                onClick={(e) => {

                                  e.stopPropagation();

                                  router.push(`/roadmap/practice?lessonId=${selectedLessonId}&grammarIndex=${idx}&from=lessons`);

                                }}

                                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white text-xs font-black rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"

                              >

                                <span>⚡</span> Luyện thế câu

                              </button>

                              <div className="flex items-center gap-2">

                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">

                                  {isCollapsedBool ? 'Mở rộng' : 'Thu gọn'}

                                </span>

                                <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-black text-blue-600 dark:text-blue-400">

                                  {isCollapsedBool ? '▼' : '▲'}

                                </span>

                              </div>

                            </div>

                          </div>

                          {/* Accordion Content */}

                          {!isCollapsedBool && (

                            <div className="space-y-4 pt-2">

                              {/* Warning overlaps / Copied Items */}

                              {group.copiedItems.length > 0 && (

                                <div className="p-3 bg-blue-950/20 border border-blue-100 rounded-xl space-y-1.5">

                                  <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">

                                    Các chữ Hán đã được học ở phần trước nhưng được dùng ở mẫu này:

                                  </span>

                                  <div className="flex flex-wrap gap-1.5">

                                    {group.copiedItems.map((c) => (

                                      <span 

                                        key={c.id} 

                                        onClick={() => playAudio(c.character)}

                                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-800 text-sm font-black rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 transition-all" 

                                        title={`${c.vietnamese_meaning} - Nhấp để nghe`}

                                      >

                                        <span>{c.character}</span>

                                        <span className="text-[10px] text-blue-455">🔊</span>

                                      </span>

                                    ))}

                                  </div>

                                </div>

                              )}

                              {/* Cards Grid for new items */}

                              {group.newItems.length === 0 ? (

                                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100/5">

                                  📝 Không có chữ Hán mới nào trong mẫu ngữ pháp này.

                                </div>

                              ) : (

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                  {group.newItems.map((item) => {

                                    let borderClass = 'border-slate-200 dark:border-slate-800';

                                    let statusBg = 'bg-slate-50 dark:bg-slate-950/40';

                                    let shadowClass = '';

                                    if (item.status === 'mastered') {

                                      borderClass = 'border-emerald-800/30 hover:border-emerald-600/50';

                                      statusBg = 'bg-emerald-950/5';

                                      shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.02)]';

                                    } else if (item.status === 'learning') {

                                      borderClass = 'border-amber-800/30 hover:border-amber-600/50';

                                      statusBg = 'bg-amber-950/5';

                                      shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.02)]';

                                    }

                                    return (

                                      <div

                                        key={item.id}

                                        className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/20 ${borderClass} ${statusBg} ${shadowClass}`}

                                      >

                                        <div>

                                          {/* Card Top Row: stroke count and dropdown status */}

                                          <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">

                                            <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-600 dark:text-blue-400">

                                              {item.stroke_count} nét

                                            </span>

                                            <select

                                              value={item.status}

                                              onChange={(e) => handleKanjiStatusChange(item.id, e.target.value as any)}

                                              className={`bg-white dark:bg-slate-900/60 border rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${

                                                item.status === 'mastered'

                                                  ? 'border-emerald-900 text-emerald-600 dark:text-emerald-400 bg-emerald-950/20'

                                                  : item.status === 'learning'

                                                  ? 'border-amber-900 text-amber-400 bg-amber-950/20'

                                                  : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900/60'

                                              }`}

                                            >

                                              <option value="not_learned" className="bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500">⚪ Chưa học</option>

                                              <option value="learning" className="bg-white dark:bg-slate-950 text-amber-400">🟡 Đang học</option>

                                              <option value="mastered" className="bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400">🟢 Đã thuộc</option>

                                            </select>

                                          </div>

                                          {/* Card Character & readings row */}

                                          <div className="flex items-start gap-3.5 mb-3">

                                            {/* Large Kanji Display */}

                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center relative shrink-0">

                                              <span className="text-3xl font-black text-slate-900 dark:text-white select-none">

                                                {item.character}

                                              </span>

                                              <button

                                                onClick={() => playAudio(item.character)}

                                                className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:text-blue-400 hover:border-blue-200 dark:border-blue-800/50 dark:border-blue-800/40 transition-colors cursor-pointer active:scale-90"

                                                title="Nghe phát âm"

                                              >

                                                🔊

                                              </button>

                                            </div>

                                            {/* Sino-Vietnamese & Vietnamese Meaning */}

                                            <div className="flex-1 space-y-0.5">

                                              <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">

                                                {item.sino_vietnamese}

                                              </h4>

                                              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-tight">

                                                {item.vietnamese_meaning}

                                              </p>

                                            </div>

                                          </div>

                                          {/* Onyomi & Kunyomi */}

                                          <div className="grid grid-cols-2 gap-3 mt-3 border-t border-slate-200 dark:border-slate-800 pb-2.5 pt-2.5 text-[11px]">

                                            <div className="space-y-0.5">

                                              <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Onyomi</span>

                                              <span className="font-semibold text-slate-400 dark:text-slate-500">{item.onyomi || '-'}</span>

                                            </div>

                                            <div className="space-y-0.5">

                                              <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kunyomi</span>

                                              <span className="font-semibold text-slate-355">{item.kunyomi || '-'}</span>

                                            </div>

                                          </div>

                                          {/* Radicals mapping display */}

                                          {showRadicals && (

                                            <div className="mt-3 p-2.5 rounded-lg bg-teal-950/20 border border-teal-900/35 flex items-start space-x-2">

                                              <span className="text-xs shrink-0">🉐</span>

                                              <div className="space-y-0.5">

                                                <span className="block text-[8px] font-black text-teal-400 uppercase tracking-wider">Bộ thủ cấu thành</span>

                                                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">

                                                  {getRadicalsString(item.character)}

                                                </p>

                                              </div>

                                            </div>

                                          )}

                                          {/* Mnemonic tip */}

                                          {item.mnemonic_tip && (

                                            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 flex items-start space-x-2">

                                              <span className="text-xs shrink-0">💡</span>

                                              <div className="space-y-0.5">

                                                <span className="block text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>

                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{item.mnemonic_tip}</p>

                                              </div>

                                            </div>

                                          )}

                                          {/* Compounds section */}

                                          {item.compounds && (

                                            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 pb-1.5 space-y-1">

                                              <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-1.5 py-0.2 rounded uppercase tracking-wider inline-block">

                                                Từ ghép ví dụ

                                              </span>

                                              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-serif whitespace-pre-line">

                                                {item.compounds}

                                              </p>

                                            </div>

                                          )}

                                        </div>

                                      </div>

                                    );

                                  })}

                                </div>

                              )}

                            </div>

                          )}

                        </div>

                      );

                    })}

                    {/* Supplemental Kanji Accordion */}

                    {processedKanjiGroups.supplemental.length > 0 && (() => {

                      const isCollapsedBool = collapsedKanjiSections['supplemental'] === true;

                      return (

                        <div className="space-y-4 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 rounded-2xl p-4 bg-slate-100/20 dark:bg-slate-900/20 backdrop-blur-md">

                          {/* Accordion Header */}

                          <div 

                            onClick={() => toggleKanjiSection('supplemental')}

                            className="flex items-center justify-between py-3.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 dark:bg-slate-900/60 hover:border-slate-200 dark:border-slate-800 transition-all select-none group/header active:scale-[0.995]"

                          >

                            <div className="flex items-center gap-3">

                              <span className="text-lg shrink-0 text-blue-600 dark:text-blue-400 group-hover/header:scale-110 transition-transform">

                                {isCollapsedBool ? '📁' : '📂'}

                              </span>

                              <div>

                                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">

                                  <span className="text-slate-700 dark:text-slate-200">Chữ Hán bổ sung / Khác</span>

                                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-400 dark:text-slate-500 rounded-md">

                                    {processedKanjiGroups.supplemental.length} chữ

                                  </span>

                                </h3>

                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">

                                  Các chữ Hán bổ sung hỗ trợ thêm cho bài học

                                </p>

                              </div>

                            </div>

                            <div className="flex items-center gap-2">

                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">

                                {isCollapsedBool ? 'Mở rộng' : 'Thu gọn'}

                              </span>

                              <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-black text-blue-600 dark:text-blue-400">

                                {isCollapsedBool ? '▼' : '▲'}

                              </span>

                            </div>

                          </div>

                          {/* Accordion Content */}

                          {!isCollapsedBool && (

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

                              {processedKanjiGroups.supplemental.map((item) => {

                                let borderClass = 'border-slate-200 dark:border-slate-800';

                                let statusBg = 'bg-slate-50 dark:bg-slate-950/40';

                                let shadowClass = '';

                                if (item.status === 'mastered') {

                                  borderClass = 'border-emerald-800/30 hover:border-emerald-600/50';

                                  statusBg = 'bg-emerald-950/5';

                                  shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.02)]';

                                } else if (item.status === 'learning') {

                                  borderClass = 'border-amber-800/30 hover:border-amber-600/50';

                                  statusBg = 'bg-amber-950/5';

                                  shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.02)]';

                                }

                                return (

                                  <div

                                    key={item.id}

                                    className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/20 ${borderClass} ${statusBg} ${shadowClass}`}

                                  >

                                    <div>

                                      {/* Card Top Row */}

                                      <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">

                                        <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-600 dark:text-blue-400">

                                          {item.stroke_count} nét

                                        </span>

                                        <select

                                          value={item.status}

                                          onChange={(e) => handleKanjiStatusChange(item.id, e.target.value as any)}

                                          className={`bg-white dark:bg-slate-900/60 border rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${

                                            item.status === 'mastered'

                                              ? 'border-emerald-900 text-emerald-600 dark:text-emerald-400 bg-emerald-950/20'

                                              : item.status === 'learning'

                                              ? 'border-amber-900 text-amber-400 bg-amber-950/20'

                                              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900/60'

                                          }`}

                                        >

                                          <option value="not_learned" className="bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500">⚪ Chưa học</option>

                                          <option value="learning" className="bg-white dark:bg-slate-950 text-amber-400">🟡 Đang học</option>

                                          <option value="mastered" className="bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400">🟢 Đã thuộc</option>

                                        </select>

                                      </div>

                                      {/* Card Character & readings row */}

                                      <div className="flex items-start gap-3.5 mb-3">

                                        {/* Large Kanji Display */}

                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center relative shrink-0">

                                          <span className="text-3xl font-black text-slate-900 dark:text-white select-none">

                                            {item.character}

                                          </span>

                                          <button

                                            onClick={() => playAudio(item.character)}

                                            className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:text-blue-400 hover:border-blue-200 dark:border-blue-800/50 dark:border-blue-800/40 transition-colors cursor-pointer active:scale-90"

                                            title="Nghe phát âm"

                                          >

                                            🔊

                                          </button>

                                        </div>

                                        {/* Sino-Vietnamese & Vietnamese Meaning */}

                                        <div className="flex-1 space-y-0.5">

                                          <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">

                                            {item.sino_vietnamese}

                                          </h4>

                                          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-tight">

                                            {item.vietnamese_meaning}

                                          </p>

                                        </div>

                                      </div>

                                      {/* Onyomi & Kunyomi */}

                                      <div className="grid grid-cols-2 gap-3 mt-3 border-t border-slate-200 dark:border-slate-800 pb-2.5 pt-2.5 text-[11px]">

                                        <div className="space-y-0.5">

                                          <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Onyomi</span>

                                          <span className="font-semibold text-slate-400 dark:text-slate-500">{item.onyomi || '-'}</span>

                                        </div>

                                        <div className="space-y-0.5">

                                          <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kunyomi</span>

                                          <span className="font-semibold text-slate-355">{item.kunyomi || '-'}</span>

                                        </div>

                                      </div>

                                      {/* Radicals mapping display */}

                                      {showRadicals && (

                                        <div className="mt-3 p-2.5 rounded-lg bg-teal-950/20 border border-teal-900/35 flex items-start space-x-2">

                                          <span className="text-xs shrink-0">🉐</span>

                                          <div className="space-y-0.5">

                                            <span className="block text-[8px] font-black text-teal-400 uppercase tracking-wider">Bộ thủ cấu thành</span>

                                            <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">

                                              {getRadicalsString(item.character)}

                                            </p>

                                          </div>

                                        </div>

                                      )}

                                      {/* Mnemonic tip */}

                                      {item.mnemonic_tip && (

                                        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 flex items-start space-x-2">

                                          <span className="text-xs shrink-0">💡</span>

                                          <div className="space-y-0.5">

                                            <span className="block text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>

                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{item.mnemonic_tip}</p>

                                          </div>

                                        </div>

                                      )}

                                      {/* Compounds section */}

                                      {item.compounds && (

                                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 pb-1.5 space-y-1">

                                          <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-1.5 py-0.2 rounded uppercase tracking-wider inline-block">

                                            Từ ghép ví dụ

                                          </span>

                                          <p className="text-[11px] text-slate-355 leading-relaxed font-serif whitespace-pre-line">

                                            {item.compounds}

                                          </p>

                                        </div>

                                      )}

                                    </div>

                                  </div>

                                );

                              })}

                            </div>

                          )}

                        </div>

                      );

                    })()}

                  </div>

                )}

              </div>

            )}

            {currentTab === 'flashcards' && null}
            {currentTab === 'kaiwa' && null}
            {currentTab === 'practice' && (

              isMarugoto ? (

                /* ==================== GIAO DIỆN LUYỆN TẬP MARUGOTO CUSTOM ==================== */

                <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">

                  {/* 1. Kế hoạch Luyện tập & Header */}

                  <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div className="space-y-1">

                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">

                        <span>⚡</span>

                        <span>{lessonTitle} - LUYỆN TẬP 4 KỸ NĂNG</span>

                      </h2>

                      <p className="text-sm text-slate-500 dark:text-slate-400">

                        Phát triển trọn vẹn 4 kỹ năng Nghe - Nói - Đọc - Viết cho bài học.

                      </p>

                    </div>

                  </div>

                  {/* 2. Switcher chọn Kỹ năng */}

                  <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 overflow-x-auto justify-between sm:justify-start gap-2">

                    <button

                      onClick={() => setPracticeSkill('listening')}

                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${

                        practiceSkill === 'listening'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'

                      }`}

                    >

                      <span>🔊</span> NGHE (Listening)

                    </button>

                    <button

                      onClick={() => setPracticeSkill('speaking')}

                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${

                        practiceSkill === 'speaking'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'

                      }`}

                    >

                      <span>💬</span> NÓI (Speaking)

                    </button>

                    <button

                      onClick={() => setPracticeSkill('reading')}

                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${

                        practiceSkill === 'reading'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'

                      }`}

                    >

                      <span>📖</span> ĐỌC (Reading)

                    </button>

                    <button

                      onClick={() => setPracticeSkill('writing')}

                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${

                        practiceSkill === 'writing'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm'

                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'

                      }`}

                    >

                      <span>✍️</span> VIẾT (Writing)

                    </button>

                  </div>

                  {/* 3. Render Panel Kỹ Năng */}

                  <div className="mt-4">

                    {/* NGHE (Listening) */}

                    {practiceSkill === 'listening' && (

                      <ListeningQuiz vocabItems={vocabItems} grammarItems={grammarItems} />

                    )}

                    {/* NÓI (Speaking) */}

                    {practiceSkill === 'speaking' && (

                      <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md rounded-3xl p-6 space-y-6 shadow-sm">

                        <div className="space-y-1">

                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Luyện Nói Shadowing</h3>

                          <p className="text-xs text-slate-500">Nghe giọng đọc bản xứ và lặp lại to rõ ràng để cải thiện phát âm.</p>

                        </div>

                        

                        <div className="space-y-4">

                          {(() => {

                            const sentences: { japanese: string; romaji: string; vietnamese: string }[] = [];

                            grammarItems.forEach(g => {

                              let examples = [];

                         if (g.examples_json) {

                           try {

                             const rawExamples = typeof g.examples_json === 'string'

                               ? JSON.parse(g.examples_json)

                               : g.examples_json;

                             examples = getExtendedExamplesForGrammar(g.id, rawExamples);

                           } catch (e) {

                             examples = [];

                           }

                         }

                              if (examples && examples.length > 0) {

                                sentences.push(...examples);

                              } else if (g.japanese_example) {

                                sentences.push({

                                  japanese: g.japanese_example,

                                  romaji: g.romaji_example || '',

                                  vietnamese: g.example_meaning

                                });

                              }

                            });

                            if (sentences.length === 0) {

                              return <p className="text-sm text-slate-500 text-center py-4">Chưa có câu mẫu để luyện nói.</p>;

                            }

                            return sentences.map((s, idx) => {

                              const isSpoken = spokenSentences[s.japanese] || false;

                              return (

                                <div 

                                  key={idx}

                                  className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4"

                                >

                                  <div className="space-y-1.5 flex-1">

                                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{s.japanese}</p>

                                    <p className="text-xs text-slate-400 font-semibold">{s.romaji}</p>

                                    <p className="text-sm text-slate-600 dark:text-slate-400">{s.vietnamese}</p>

                                  </div>

                                  <div className="flex items-center gap-2.5">

                                    <button

                                      onClick={() => playAudioWithFallback(s.japanese, s.japanese)}

                                      className="w-10 h-10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer active:scale-95 shadow-sm"

                                      title="Nghe phát âm"

                                    >

                                      🔊

                                    </button>

                                    <button

                                      onClick={() => setSpokenSentences(prev => ({

                                        ...prev,

                                        [s.japanese]: !isSpoken

                                      }))}

                                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${

                                        isSpoken

                                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-400'

                                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'

                                      }`}

                                    >

                                      {isSpoken ? '✓ Đã nói' : '🎙️ Luyện nói'}

                                    </button>

                                  </div>

                                </div>

                              );

                            });

                          })()}

                        </div>

                      </div>

                    )}

                    {/* ĐỌC (Reading) */}

                    {practiceSkill === 'reading' && (

                      <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">

                        {dialogueItems.length > 0 ? (

                          <DialogueReading dialogueItems={dialogueItems} />

                        ) : (

                          <p className="text-center text-slate-500 py-4">Bài học này chưa có hội thoại Kaiwa.</p>

                        )}

                      </div>

                    )}

                    {/* VIẾT (Writing) */}

                    {practiceSkill === 'writing' && (

                      <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md rounded-3xl p-6 space-y-6 shadow-sm max-w-xl mx-auto">

                        <div className="space-y-1">

                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Dịch câu tự luận</h3>

                          <p className="text-xs text-slate-500">Dịch câu tiếng Việt sang tiếng Nhật. Hệ thống sẽ so khớp chính xác và phát hiện lỗi sai.</p>

                        </div>

                        {writingQuestions.length === 0 ? (

                          <p className="text-center text-slate-500 py-4">Chưa có câu ví dụ để luyện viết.</p>

                        ) : (

                          <div className="space-y-6">

                            <div className="flex justify-between items-center text-xs text-slate-400">

                              <span>Câu {writingIndex + 1} / {writingQuestions.length}</span>

                              {writingScore !== null && (

                                <span className="font-bold text-indigo-500">Độ chính xác: {writingScore}%</span>

                              )}

                            </div>

                            <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-3">

                              <span className="text-[10px] font-extrabold bg-[#b5179e]/10 border border-[#b5179e]/20 px-2 py-0.5 rounded text-pink-700 dark:text-pink-400 font-extrabold uppercase tracking-wider">Đề bài tiếng Việt</span>

                              <p className="text-base font-bold text-slate-800 dark:text-slate-200">{writingQuestions[writingIndex].vietnamese}</p>

                            </div>

                            <div className="space-y-3">

                              <label className="block text-xs font-bold text-slate-400 uppercase">Câu trả lời (Nhập Hiragana hoặc Romaji)</label>

                              <input

                                type="text"

                                value={writingAnswer}

                                onChange={(e) => setWritingAnswer(e.target.value)}

                                disabled={writingIsGraded}

                                placeholder="Gõ câu trả lời của bạn..."

                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#FCF3CF] text-slate-900 font-bold focus:ring-[#b5179e] focus:border-[#b5179e] outline-none placeholder-slate-400 text-base"

                              />

                            </div>

                            {writingIsGraded && (

                              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-850 space-y-3 text-sm">

                                <div className="flex items-center justify-between">

                                  <span className="text-xs font-bold text-slate-400 uppercase">Phân tích lỗi sai:</span>

                                  <span className="text-xs font-bold text-pink-700 dark:text-pink-400 font-extrabold">{getEncouragementText(writingScore || 0)}</span>

                                </div>

                                <div className="p-3 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-md rounded-xl font-mono text-base tracking-wide leading-relaxed text-center">

                                  {renderDiff(writingAnswer, writingQuestions[writingIndex].japanese)}

                                </div>

                                <div className="text-xs text-slate-450 space-y-1 mt-1">

                                  <p>• Đáp án đúng: <span className="font-bold text-slate-700 dark:text-slate-350">{writingQuestions[writingIndex].japanese}</span></p>

                                  <p>• Phiên âm Romaji: <span className="font-semibold">{writingQuestions[writingIndex].romaji}</span></p>

                                </div>

                              </div>

                            )}

                            <div className="flex gap-4">

                              {!writingIsGraded ? (

                                <button

                                  onClick={() => {

                                    if (!writingAnswer.trim()) return;

                                    const acc = calculateAccuracy(writingAnswer, writingQuestions[writingIndex].japanese);

                                    setWritingScore(acc);

                                    setWritingIsGraded(true);

                                    if (acc === 100) {

                                      playAudioWithFallback(writingQuestions[writingIndex].japanese, writingQuestions[writingIndex].japanese);

                                    }

                                  }}

                                  disabled={!writingAnswer.trim()}

                                  className="w-full py-3.5 bg-[#b5179e] hover:bg-[#7209b7] text-white font-bold rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"

                                >

                                  🔍 Chấm điểm

                                </button>

                              ) : (

                                <>

                                  <button

                                    onClick={() => playAudioWithFallback(writingQuestions[writingIndex].japanese, writingQuestions[writingIndex].japanese)}

                                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl active:scale-[0.98] transition-all"

                                  >

                                    🔊 Nghe đọc câu

                                  </button>

                                  <button

                                    onClick={() => {

                                      if (writingIndex + 1 < writingQuestions.length) {

                                        setWritingIndex(prev => prev + 1);

                                        setWritingAnswer('');

                                        setWritingIsGraded(false);

                                        setWritingScore(null);

                                      } else {

                                        generateWritingQuestions();

                                      }

                                    }}

                                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-2xl active:scale-[0.98] transition-all"

                                  >

                                    {writingIndex + 1 < writingQuestions.length ? 'Câu tiếp theo ➔' : '🔄 Làm đề mới'}

                                  </button>

                                </>

                              )}

                            </div>

                          </div>

                        )}

                      </div>

                    )}

                  </div>

                </div>

              ) : (

                <>{renderInteractivePractice()}</>

              )

            )}

                      {currentTab === 'cando' && (

              <div className="space-y-6 animate-fade-in">

                {/* Header card */}

                <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-2">

                  <h2 className="text-sm sm:text-md font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2">

                    <span>🎯</span>

                    <span>TỰ ĐÁNH GIÁ NĂNG LỰC (CAN-DO CHECK)</span>

                  </h2>

                  <p className="text-xs text-slate-400 dark:text-slate-500">

                    Hãy đánh giá mức độ đạt được của bạn đối với các mục tiêu giao tiếp của bài học này theo chuẩn JF Standard.

                  </p>

                </div>

                {/* Checklist items */}

                <div className="space-y-4">

                  {candoChecks.length === 0 ? (

                    <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">

                      📭 Chưa có danh sách mục tiêu Can-do cho bài học này.

                    </div>

                  ) : (

                    candoChecks.map((item, idx) => (

                      <div

                        key={item.id}

                        className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm"

                      >

                        <div className="space-y-1.5 flex-1">

                          <div className="flex items-center space-x-2">

                            <span className="w-5 h-5 rounded-md bg-blue-950/60 border border-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">

                              {idx + 1}

                            </span>

                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">{item.text_vi}</h3>

                          </div>

                          <p className="text-xs text-slate-400 dark:text-slate-500 italic pl-7">{item.text}</p>

                        </div>

                        {/* Status controllers */}

                        <div className="flex items-center gap-2 self-start md:self-auto pl-7 md:pl-0">

                          <button

                            onClick={() => handleCandoStatusChange(item.id, 'not_learned')}

                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 cursor-pointer ${

                              item.status === 'not_learned'

                                ? 'bg-red-950/30 border-red-800/80 text-red-600 dark:text-red-400 shadow-md shadow-red-900/20'

                                : 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:border-slate-800'

                            }`}

                          >

                            🔴 Chưa đạt

                          </button>

                          <button

                            onClick={() => handleCandoStatusChange(item.id, 'learning')}

                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 cursor-pointer ${

                              item.status === 'learning'

                                ? 'bg-amber-950/30 border-amber-800/80 text-amber-400 shadow-md shadow-amber-900/20'

                                : 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:border-slate-800'

                            }`}

                          >

                            🟡 Đạt một phần

                          </button>

                          <button

                            onClick={() => handleCandoStatusChange(item.id, 'mastered')}

                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 cursor-pointer ${

                              item.status === 'mastered'

                                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-900/20'

                                : 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:border-slate-800'

                            }`}

                          >

                            🟢 Đạt tốt

                          </button>

                        </div>

                      </div>

                    ))

                  )}

                </div>

              </div>

            )}

            {currentTab === 'culture' && (

              <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">

                {/* Header info */}

                <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-1 text-center font-sans">

                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">Tìm hiểu văn hoá</span>

                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">CÂU CHUYỆN VĂN HÓA & CUỘC SỐNG NHẬT BẢN</h2>

                </div>

                {/* Culture contents */}

                {cultureData.length === 0 ? (

                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">

                    📭 Chưa có nội dung Văn hóa & Cuộc sống cho bài học này.

                  </div>

                ) : (

                  cultureData.map((item) => (

                    <div

                      key={item.id}

                      className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm space-y-6"

                    >

                      {/* Image header */}

                      {item.image_url && (

                        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden group">

                          <img

                            src={item.image_url}

                            alt={item.title}

                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"

                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-6 md:p-8">

                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white drop-shadow-lg leading-tight">

                              {item.title}

                            </h3>

                          </div>

                        </div>

                      )}

                      {/* Content text */}

                      <div className="p-6 md:p-8 pt-0 space-y-4">

                        {!item.image_url && (

                          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight border-b border-slate-200 dark:border-slate-800 pb-4">

                            {item.title}

                          </h3>

                        )}

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-justify whitespace-pre-line">

                          {item.content}

                        </p>

                      </div>

                    </div>

                  ))

                )}

              </div>

            )}

            {currentTab === 'summary' && (

              <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">

                {/* Filters Row */}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/40 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-sm">

                  {/* View sub-tabs */}

                  <div className="flex space-x-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 w-fit shrink-0">

                    <button

                      onClick={() => setSummarySubTab('vocab')}

                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer \${

                        summarySubTab === 'vocab'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm border border-slate-200 dark:border-slate-700'

                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'

                      }`}

                    >

                      Từ vựng ({filteredSummaryVocab.length})

                    </button>

                    <button

                      onClick={() => setSummarySubTab('grammar')}

                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer \${

                        summarySubTab === 'grammar'

                          ? 'bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-400 font-extrabold shadow-sm border border-slate-200 dark:border-slate-700'

                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'

                      }`}

                    >

                      Ngữ pháp ({filteredSummaryGrammar.length})

                    </button>

                  </div>

                  {/* Filters and search */}

                  <div className="flex flex-wrap items-center gap-3">

                    <select

                      value={summaryFilterLesson}

                      onChange={(e) => setSummaryFilterLesson(e.target.value)}

                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"

                    >

                      <option value="all">📂 Tất cả bài</option>

                      {summaryLessons.map(l => (

                        <option key={l.id} value={l.id}>

                          Bài {l.id - 100}: {l.title.split(':').pop()?.trim()}

                        </option>

                      ))}

                    </select>

                    <select

                      value={summaryFilterStatus}

                      onChange={(e) => setSummaryFilterStatus(e.target.value)}

                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"

                    >

                      <option value="all">🎯 Trạng thái</option>

                      <option value="not_learned">⚪ Chưa học</option>

                      <option value="learning">🟡 Đang học</option>

                      <option value="mastered">🟢 Đã thuộc</option>

                    </select>

                    <div className="relative">

                      <input

                        type="text"

                        placeholder="Tìm kiếm..."

                        value={localSummarySearchQuery}
                      onChange={(e) => setLocalSummarySearchQuery(e.target.value)}

                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none transition-all placeholder-slate-400 w-[150px] sm:w-[200px]"

                      />

                      <span className="absolute left-2.5 top-2 text-[10px] text-slate-400">🔍</span>

                    </div>

                  </div>

                </div>

                {/* List contents */}

                {summaryLoading ? (

                  <div className="text-center py-12 text-slate-400">

                    <div className="w-8 h-8 border-4 border-indigo-650 dark:border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>

                    <p className="text-xs">Đang tải toàn bộ dữ liệu khóa học...</p>

                  </div>

                ) : (

                  <div className="space-y-6">

                    {summarySubTab === 'vocab' ? (

                      Object.keys(groupedSummaryVocab).length === 0 ? (

                        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">

                          Chưa có từ vựng phù hợp bộ lọc.

                        </div>

                      ) : (

                        Object.keys(groupedSummaryVocab).sort((a,b) => parseInt(a) - parseInt(b)).map(lessonIdStr => {

                          const lessonId = parseInt(lessonIdStr);

                          const lessonObj = summaryLessons.find(l => l.id === lessonId);

                          const items = groupedSummaryVocab[lessonId];

                          return (

                            <div key={lessonId} className="space-y-3">

                              <h3 className="text-xs font-black tracking-wider text-indigo-600 dark:text-blue-400 uppercase border-b border-indigo-50 dark:border-slate-800 pb-1">

                                Bài {lessonId - 100}: {lessonObj?.title.split(':').pop()?.trim()}

                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {items.map(item => {

                                  const isCore = item.word_type === 'noun' || item.word_type === 'verb' || item.word_type === 'adjective' || item.word_type === 'pronoun' || item.word_type === 'greeting';

                                  const cardBorder = item.status === 'mastered' 

                                    ? 'border-emerald-500/30' 

                                    : item.status === 'learning' 

                                    ? 'border-amber-500/30' 

                                    : 'border-slate-200 dark:border-slate-800';

                                  const cardBg = item.status === 'mastered'

                                    ? 'bg-emerald-500/5 dark:bg-emerald-950/10'

                                    : item.status === 'learning'

                                    ? 'bg-amber-500/5 dark:bg-amber-955/10'

                                    : 'bg-slate-50/60 dark:bg-slate-900/60';

                                  return (

                                    <div

                                      key={item.id}

                                      className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-200 \${cardBorder} \${cardBg} \${isCore ? 'border-l-4 border-l-[#b5179e] dark:border-l-pink-500' : ''}`}

                                    >

                                      <div>

                                        <div className="flex items-center justify-between mb-3 border-b border-slate-200/55 dark:border-slate-800/40 pb-2">

                                          <span className={`px-2 py-0.5 border text-[9px] font-extrabold uppercase rounded-md \${

                                            isCore 

                                              ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-900 text-pink-700 dark:text-pink-400 font-extrabold' 

                                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'

                                          }`}>

                                            {item.word_type === 'noun' && 'Danh từ'}

                                            {item.word_type === 'pronoun' && 'Đại từ'}

                                            {item.word_type === 'verb' && 'Động từ'}

                                            {item.word_type === 'adjective' && 'Tính từ'}

                                            {item.word_type === 'greeting' && 'Chào hỏi'}

                                            {!['noun','pronoun','verb','adjective','greeting'].includes(item.word_type) && (item.word_type || 'Từ vựng')}

                                            {item.isCustom && ' • Cá nhân'}

                                          </span>

                                          {/* Read-only Badge representing actual status */}

                                          <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-lg shrink-0 \${

                                            item.status === 'mastered'

                                              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-450'

                                              : item.status === 'learning'

                                              ? 'bg-amber-500/10 border-amber-500/35 text-amber-600 dark:text-amber-450'

                                              : 'bg-slate-500/10 border-slate-500/35 text-slate-500 dark:text-slate-400'

                                          }`}>

                                            {item.status === 'mastered' && '🟢 Đã thuộc'}

                                            {item.status === 'learning' && '🟡 Đang học'}

                                            {(item.status === 'not_learned' || !item.status) && '⚪ Chưa học'}

                                          </span>

                                        </div>

                                        <div className="flex items-baseline flex-wrap gap-2 mb-2">

                                          {item.kanji_word || item.hiragana.length > 7 ? (

                                            <>

                                              <span className="text-lg font-black text-slate-900 dark:text-white select-none">

                                                {item.kanji_word || item.hiragana}

                                              </span>

                                              {item.kanji_word && (

                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-400">

                                                  ({item.hiragana})

                                                </span>

                                              )}

                                            </>

                                          ) : (

                                            <PitchAccentDisplay kana={item.hiragana} accent={0} size="md" />

                                          )}

                                          <button

                                            onClick={() => playAudioWithFallback(item.kanji_word || item.hiragana, item.hiragana)}

                                            className="p-1 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 hover:text-indigo-650 hover:border-indigo-300 transition-colors cursor-pointer active:scale-90"

                                          >

                                            🔊

                                          </button>

                                        </div>

                                        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug">{item.vietnamese_meaning}</div>

                                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-350 tracking-wider">{item.romaji}</div>

                                      </div>

                                    </div>

                                  );

                                })}

                              </div>

                            </div>

                          );

                        })

                      )

                    ) : (

                      Object.keys(groupedSummaryGrammar).length === 0 ? (

                        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">

                          Chưa có ngữ pháp phù hợp bộ lọc.

                        </div>

                      ) : (

                        Object.keys(groupedSummaryGrammar).sort((a,b) => parseInt(a) - parseInt(b)).map(lessonIdStr => {

                          const lessonId = parseInt(lessonIdStr);

                          const lessonObj = summaryLessons.find(l => l.id === lessonId);

                          const items = groupedSummaryGrammar[lessonId];

                          const computedStatus = computedLessonStatus[lessonId] || 'not_learned';

                          return (

                            <div key={lessonId} className="space-y-3">

                              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-1">

                                <h3 className="text-xs font-black tracking-wider text-indigo-600 dark:text-blue-400 uppercase">

                                  Bài {lessonId - 100}: {lessonObj?.title.split(':').pop()?.trim()}

                                </h3>

                                <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-lg \${

                                  computedStatus === 'mastered'

                                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-450'

                                    : computedStatus === 'learning'

                                    ? 'bg-amber-500/10 border-amber-500/35 text-amber-650 dark:text-amber-450'

                                    : 'bg-slate-500/10 border-slate-500/35 text-slate-500 dark:text-slate-400'

                                }`}>

                                  {computedStatus === 'mastered' && '🟢 Đã thuộc từ vựng'}

                                  {computedStatus === 'learning' && '🟡 Đang học từ vựng'}

                                  {computedStatus === 'not_learned' && '⚪ Chưa học từ vựng'}

                                </span>

                              </div>

                              <div className="space-y-4">

                                {items.map(item => (

                                  <div

                                    key={item.id}

                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#FCF3CF]/10 dark:bg-slate-900/60 backdrop-blur-md space-y-2.5"

                                  >

                                    <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2">

                                      <div>

                                        <h4 className="text-base font-black text-slate-900 dark:text-white">{item.title}</h4>

                                        <p className="text-xs font-bold text-pink-700 dark:text-pink-400 font-extrabold">{item.meaning}</p>

                                      </div>

                                      {item.isCustom && (

                                        <span className="px-2 py-0.5 border border-slate-200 text-[8px] font-extrabold uppercase rounded bg-slate-50 text-slate-400">

                                          Cá nhân

                                        </span>

                                      )}

                                    </div>

                                    {item.structure && (

                                      <div className="text-xs">

                                        <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cấu trúc</span>

                                        <code className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded font-mono font-bold text-slate-700 dark:text-slate-300">

                                          {item.structure}

                                        </code>

                                      </div>

                                    )}

                                    {item.vietnamese_explanation && (

                                      <div className="text-xs">

                                        <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Giải nghĩa</span>

                                        <p className="text-slate-800 dark:text-slate-100 leading-relaxed font-bold">{item.vietnamese_explanation}</p>

                                      </div>

                                    )}

                                    {(item.japanese_example || item.romaji_example || item.example_meaning) && (

                                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3">

                                        <button

                                          onClick={() => playAudioWithFallback(item.japanese_example || '', item.japanese_example || '')}

                                          className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 text-xs text-indigo-600 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all shrink-0"

                                        >

                                          🔊

                                        </button>

                                        <div className="flex-1 space-y-0.5 text-xs min-w-0">

                                          <p className="font-extrabold text-slate-900 dark:text-white leading-snug">{item.japanese_example}</p>

                                          <p className="font-extrabold text-pink-700 dark:text-pink-400">{item.romaji_example}</p>

                                          <p className="font-semibold text-slate-800 dark:text-slate-200 border-t border-dashed border-slate-200 dark:border-slate-800/40 pt-1 mt-1">{item.example_meaning}</p>

                                        </div>

                                      </div>

                                    )}

                                  </div>

                                ))}

                              </div>

                            </div>

                          );

                        })

                      )

                    )}

                  </div>

                )}

              </div>

            )}            {!['vocab', 'kanji', 'grammar', 'flashcards', 'kaiwa', 'practice', 'cando', 'culture', 'summary'].includes(currentTab) && (

              <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 space-y-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">

                <span className="text-3xl">🚧</span>

                <div className="text-center">

                  <h3 className="text-md font-bold text-slate-700 dark:text-slate-200">Phân hệ đang được xây dựng</h3>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">

                    Giao diện tab "{currentTab}" cho {lessonTitle} sẽ được bổ sung tiếp theo.

                  </p>

                </div>

                <button

                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=vocab`)}

                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition-all duration-300"

                >

                  Quay lại Học Từ vựng

                </button>

              </div>

            )}

          </div>

        )}

            </main>

      {selectedPopupGrammar && (

        <GrammarDetailModal 

          grammar={selectedPopupGrammar.grammar} 

          initialFormType={selectedPopupGrammar.selectedFormType}

          onClose={() => setSelectedPopupGrammar(null)} 

        />

      )}

    </div>

  );

}

// Component Popup Modal hiển thị chi tiết ngữ pháp & ví dụ Marugoto phong phú

const GrammarDetailModal = ({ grammar, initialFormType, onClose }: { grammar: any, initialFormType: 'affirmative' | 'negative' | 'interrogative', onClose: () => void }) => {

  const [activeFormType, setActiveFormType] = useState<'affirmative' | 'negative' | 'interrogative'>(

    initialFormType || 'affirmative'

  );

  let structureExplain: any = {};

  if (grammar.notes && grammar.notes.startsWith('{')) {

    try {

      structureExplain = JSON.parse(grammar.notes);

    } catch (e) {

      structureExplain = {};

    }

  }

  let examples = [];

  if (grammar.examples_json) {

    try {

      const rawExamples = typeof grammar.examples_json === 'string'

        ? JSON.parse(grammar.examples_json)

        : grammar.examples_json;

      examples = getExtendedExamplesForGrammar(grammar.id, rawExamples);

    } catch (e) {

      examples = [];

    }

  }

  const affExs = examples.filter(ex => (ex.type || 'affirmative') === 'affirmative');

  const negExs = examples.filter(ex => ex.type === 'negative');

  const intExs = examples.filter(ex => ex.type === 'interrogative');

  const filteredExamples = examples.filter(ex => {

    const type = ex.type || 'affirmative';

    return type === activeFormType;

  }).slice(0, 4);

  const formTypeName = activeFormType === 'affirmative' ? 'Khẳng định' : activeFormType === 'negative' ? 'Phủ định' : 'Nghi vấn';

  const formTypeColor = activeFormType === 'affirmative' ? 'text-emerald-500' : activeFormType === 'negative' ? 'text-rose-500' : 'text-amber-500';

  const formTypeBorder = activeFormType === 'affirmative' ? 'border-emerald-500/25 dark:border-emerald-500/35' : activeFormType === 'negative' ? 'border-rose-500/25 dark:border-rose-500/35' : 'border-amber-500/25 dark:border-amber-500/35';

  const formMeaning = activeFormType === 'affirmative' ? structureExplain.affirmative : activeFormType === 'negative' ? structureExplain.negative : structureExplain.interrogative;

  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {

      if (e.key === 'Escape') onClose();

    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [onClose]);

  const playAudio = (text: string) => {

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = 'ja-JP';

      utterance.rate = 0.85;

      window.speechSynthesis.speak(utterance);

    }

  };

  const highlightEnding = (text: string, type: 'affirmative' | 'negative' | 'interrogative' = 'affirmative') => {

    if (!text) return '';

    const replaced = text

      .replace(/(じゃないes|じゃありません|ではないです|いません|ありません|しません)/g, '<span class="text-rose-500 font-extrabold">$1</span>')

      .replace(/(ですか|ますか|でしょうか)/g, '<span class="text-amber-500 font-extrabold">$1</span>')

      .replace(/(es|です|ます|ています|あります|います|します)/g, '<span class="text-pink-700 dark:text-pink-400 font-extrabold font-extrabold">$1</span>');

    return <span dangerouslySetInnerHTML={{ __html: replaced }} />;

  };

  const translateSymbolToVi = (symbol: string) => {

    let s = symbol;

    // Chuẩn hóa hiển thị đuôi câu Nhật Bản (es, us, じゃないes...)

    s = s.replace(/じゃない\s*es/g, 'じゃないes'); 

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないđây/g, 'じゃないes');

    s = s.replace(/じゃないđó/g, 'base'); 

    s = s.replace(/じゃないđúng/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/ない\s*es/g, 'ないです');

    s = s.replace(/ないes/g, 'ないes'); 

    s = s.replace(/ないes/g, 'ないes'); 

    s = s.replace(/ないes/g, 'ないes'); 

    s = s.replace(/ないes/g, 'ないです');

    s = s.replace(/\bes\b/g, 'es'); 

    s = s.replace(/\bus\b/g, 'es');

    s = s.replace(/\bđây\b/g, 'es');

    s = s.replace(/\bđó\b/g, 'es');

    s = s.replace(/\bđúng\b/g, 'es');

    s = s.replace(/es。/g, 'es');

    s = s.replace(/es/g, 'es');

    s = s.replace(/us/g, 'es');

    s = s.replace(/đúng/g, 'es');

    s = s.replace(/đây/g, 'es');

    s = s.replace(/đó/g, 'es');

    s = s.replace(/es/g, 'です');

    s = s.replace(/んじゃないです/g, 'んじゃないです');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes'); 

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないです');

    s = s.replace(/base/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'base');

    s = s.replace(/base/g, 'じゃないes');

    s = s.replace(/base/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないes');

    s = s.replace(/じゃないes/g, 'じゃないです');

    // Dịch chuẩn hóa ký hiệu tính từ Marugoto (イA, ナA)

    s = s.replace(/イ\s*A\s*－\s*い/gi, 'T\u00ednh từ đuôi い'); // Tính từ đuôi い

    s = s.replace(/イ\s*A\s*－?\s*い?/gi, 'T\u00ednh từ đuôi い');

    s = s.replace(/ナ\s*A\s*－\s*な/gi, 'T\u00ednh từ đuôi な'); // Tính từ đuôi な

    s = s.replace(/ナ\s*A\s*－?\s*na?/gi, 'T\u00ednh từ đuôi な');

    s = s.replace(/ナ\s*A\s*－?\s*な?/gi, 'T\u00ednh từ đuôi な');

    

    // Một số từ rác khác

    s = s.replace(/T\u00ednh t\u1eeb\s*\u0111u\u00f4i\s*\u3044\s*\u304f/gi, 'T\u00ednh từ đuôi い'); // Sửa 'Tính từ đuôi いく' thành 'Tính từ đuôi い'

    s = s.replace(/\u304f$/g, ''); 

    return s;

  };

  const getVisualStructureForForm = (baseStructure: string, formType: 'affirmative' | 'negative' | 'interrogative', grammarId?: number) => {
    if (grammarId === 151) {
      if (formType === 'affirmative') return 'N1 + は + N2 + です';
      if (formType === 'negative') return 'N1 + は + N2 + じゃないesです'.replace(/es/g, '');
      if (formType === 'interrogative') return 'N1 + は + N2 + ですか | N1 + は + なん + ですか';
    }
    if (grammarId === 152) {
      if (formType === 'affirmative') return 'N1 (Người) + は + N2 (Ngôn ngữ) + が + できます';
      if (formType === 'negative') return 'N1 (Người) + は + N2 (Ngôn ngữ) + が + できません';
      if (formType === 'interrogative') return 'N1 (Người) + は + N2 (Ngôn ngữ) + が + できますか';
    }
    if (grammarId === 153) {
      if (formType === 'affirmative') return 'N1 + も + N2 + です | N1 + は + N2 (Ngôn ngữ) + も + できます';
      if (formType === 'negative') return 'N1 + も + N2 + じゃないです | N1 + は + N2 (Ngôn ngữ) + も + できません';
      if (formType === 'interrogative') return 'N1 + も + N2 + ですか | N1 + は + N2 (Ngôn ngữ) + も + できますか';
    }
    if (grammarId === 157) {
      if (formType === 'affirmative') return 'N (Đồ ăn/Thức uống) + が + すきです';
      if (formType === 'negative') return 'N (Đồ ăn/Thức uống) + は + すき + じゃないです';
      if (formType === 'interrogative') return 'N (Đồ ăn/Thức uống) + が + すきですか | なに + が + すきですか';
    }
    if (grammarId === 158) {
      if (formType === 'affirmative') return 'N (Object) + を + V + ます';
      if (formType === 'negative') return 'N (Object) + を + V + ません';
      if (formType === 'interrogative') return 'N (Object) + を + V + ますか | なに + を + V + ますか';
    }
    if (grammarId === 159) {
      if (formType === 'affirmative') return 'よく + V + ます';
      if (formType === 'negative') return 'amuり + V + ません'.replace(/amu/g, 'あま');
      if (formType === 'interrogative') return 'よく + V + ますか';
    }
    if (grammarId === 197) {
      if (formType === 'affirmative') return 'Noun + は + N2 + です';
      if (formType === 'negative') return 'Noun + は + N2 + じゃない/じゃありません';
      if (formType === 'interrogative') return 'Noun + は + だれですか | Noun + は + どなたですか';
    }
    if (grammarId === 198) {
      if (formType === 'affirmative') return 'Noun + は + [Số tuổi] + さいです';
      if (formType === 'negative') return 'Noun + は + [Số tuổi] + さい + じゃない/じゃありません';
      if (formType === 'interrogative') return 'Noun + は + おいくつですか | Noun + は + なんさいですか';
    }
    if (grammarId === 199) {
      if (formType === 'affirmative') return 'Noun + は + [Tên nghề] + です';
      if (formType === 'negative') return 'Noun + は + [Tên nghề] + じゃない/じゃありません';
      if (formType === 'interrogative') return 'お仕事は + なんですか | お仕事は';
    }

    if (!baseStructure) return '';

    const getNegativeOf = (word: string) => {

      const w = word.toLowerCase();

      if (w.includes('です') || w.includes('es') || w.includes('us') || w.includes('đúng') || w.includes('đây')) {

        return 'じゃないです';

      }

      if (w.includes('ます')) return word.replace('ます', 'ません');

      if (w.includes('できます')) return word.replace('できます', 'できません');

      if (w.includes('います')) return word.replace('います', 'いません');

      if (w.includes('あります')) return word.replace('あります', 'ありません');

      return word + ' + じゃないです';

    };

    const subStructures = baseStructure.split('|').map(s => s.trim());

    const resultStructures = [];

    for (const sub of subStructures) {

      const cleanSub = sub.replace(/。$/, '').trim();

      const parts = cleanSub.split('+').map(p => p.trim());

      if (parts.length === 0) continue;

      const hasNegativePart = parts.some(p => p.includes('ない') || p.includes('ません') || p.includes('じゃない'));

      const hasInterrogativePart = parts.some(p => p.includes('か') || p.includes('ka') || p.includes('なん'));

      if (formType === 'negative') {

        if (hasNegativePart) {

          const negativeParts = [];

          for (const p of parts) {

            if (p.includes('か') || p.includes('ka') || p.includes('なん')) {

              continue;

            }

            if ((p.includes('es') || p.includes('です')) && !p.includes('ない') && !p.includes('じゃない')) {

              continue;

            }

            negativeParts.push(p);

          }

          resultStructures.push(negativeParts.join(' + '));

        } else {

          const lastIndex = parts.length - 1;

          const lastPart = parts[lastIndex];

          const negativeLastPart = getNegativeOf(lastPart);

          const newParts = [...parts.slice(0, -1), negativeLastPart];

          resultStructures.push(newParts.join(' + '));

        }

      } else if (formType === 'interrogative') {

        if (hasInterrogativePart) {

          const interrogativeParts = [];

          for (const p of parts) {

            if (p.includes('ない') || p.includes('ません') || p.includes('じゃない')) {

              continue;

            }

            if ((p.includes('es') || p.includes('です')) && !p.includes('か') && parts.some(x => x.includes('か'))) {

              continue;

            }

            interrogativeParts.push(p);

          }

          resultStructures.push(interrogativeParts.join(' + '));

        } else {

          const lastIndex = parts.length - 1;

          const lastPart = parts[lastIndex];

          let interrogativeLastPart = lastPart;

          if (lastPart.includes('đáp') || lastPart.includes('đâu') || lastPart.includes('どこ') || lastPart.includes('だれ')) {

            interrogativeLastPart = lastPart;

          } else if (lastPart.includes('です') || lastPart.includes('es') || lastPart.includes('us')) {

            interrogativeLastPart = lastPart.replace(/です|es|us/g, 'ですか');

          } else if (lastPart.includes('ます')) {

            interrogativeLastPart = lastPart.replace('ます', 'ますか');

          } else {

            interrogativeLastPart = lastPart + ' + か';

          }

          const newParts = [...parts.slice(0, -1), interrogativeLastPart];

          resultStructures.push(newParts.join(' + '));

        }

      } else {

        // Thể Khẳng định: loại bỏ vế phủ định và nghi vấn, ngắt khi câu kết thúc bằng dấu chấm

        const affirmativeParts = [];

        for (const p of parts) {

          if (p.includes('ない') || p.includes('ません') || p.includes('じゃない')) {

            continue;

          }

          if (p.includes('か') || p.includes('ka') || p.includes('なん')) {

            continue;

          }

          affirmativeParts.push(p.replace(/。$/, ''));

          // Ngắt ngay lập tức khi vế kết thúc bằng dấu chấm tròn câu khẳng định

          if (p.includes('。') || p.includes('.')) {

            break;

          }

        }

        resultStructures.push(affirmativeParts.join(' + '));

      }

    }

    let finalStr = resultStructures.join(' | ');

    // Chuẩn hóa hiển thị đuôi câu

    finalStr = finalStr.replace(/じゃない\s*es/gi, 'じゃないです');

    finalStr = finalStr.replace(/じゃないes/gi, 'base'); 

    finalStr = finalStr.replace(/じゃないđây/gi, 'base');

    finalStr = finalStr.replace(/じゃないđó/gi, 'base');

    finalStr = finalStr.replace(/じゃないđúng/gi, 'base');

    finalStr = finalStr.replace(/じゃないes/gi, 'じゃないです');

    finalStr = finalStr.replace(/じゃないes/gi, 'じゃないes');

    finalStr = finalStr.replace(/じゃないです/gi, 'じゃないです');

    finalStr = finalStr.replace(/ない\s*es/gi, 'ないes'); 

    finalStr = finalStr.replace(/ないes/gi, 'ないes'); 

    finalStr = finalStr.replace(/ないes/gi, 'ないです');

    finalStr = finalStr.replace(/\bes\b/gi, 'es'); 

    finalStr = finalStr.replace(/\bus\b/gi, 'es');

    finalStr = finalStr.replace(/\bđây\b/gi, 'es'); 

    finalStr = finalStr.replace(/\bđó\b/gi, 'es'); 

    finalStr = finalStr.replace(/\bđúng\b/gi, 'es');

    finalStr = finalStr.replace(/es。/gi, 'es');

    finalStr = finalStr.replace(/es/gi, 'es');

    finalStr = finalStr.replace(/us/gi, 'es');

    finalStr = finalStr.replace(/đúng/gi, 'es');

    finalStr = finalStr.replace(/đây/gi, 'es');

    finalStr = finalStr.replace(/đó/gi, 'es');

    finalStr = finalStr.replace(/es/gi, 'đúng'); // Telex fix

    finalStr = finalStr.replace(/es/gi, 'です');

    finalStr = finalStr.replace(/us/gi, 'です');

    finalStr = finalStr.replace(/base/gi, 'じゃないes');

    finalStr = finalStr.replace(/じゃないes/gi, 'じゃないes');

    finalStr = finalStr.replace(/じゃないes/gi, 'じゃないです');

    return finalStr;

  };

  const renderVisualStructure = (structure: string) => {

    if (!structure) return null;

    const lines = structure.split('|').map(l => l.trim());

    return (

      <div className="space-y-3 mt-1">

        {lines.map((line, lineIdx) => {

          const parts = line.split('+').map(p => p.trim());

          if (parts.length <= 1) {

            return (

              <div 

                key={lineIdx} 

                className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl"

              >

                {translateSymbolToVi(line)}

              </div>

            );

          }

          return (

            <div key={lineIdx} className="overflow-x-auto pb-1">

              <div className="inline-flex items-stretch border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden min-w-[280px]">

                {parts.map((part, index) => {

                  const isParticle = ['は', 'g', 'に', 'を', 'も', 'と', 'de', 'で', 'へ', 'の', 'k'].includes(part) || part.length <= 2;

                  const isEnding = ['es', 'es。', 'じゃないes', 'じゃないes。', 'đúng', 'đúng。', 'じゃないđúng', 'じゃないđúng。', 'ですか', 'ですか。', 'います', 'あります', 'ありません', 'です', 'じゃないです', 'じゃないです。'].some(end => part.includes(end));

                  

                  let borderClass = "";

                  if (index > 0) {

                    if (isParticle || isEnding) {

                      borderClass = "border-l border-dashed border-slate-200 dark:border-slate-700/80";

                    } else {

                      borderClass = "border-l border-slate-200 dark:border-slate-850";

                    }

                  }

                  const options = part.split('/').map(opt => opt.trim());

                  return (

                    <div 

                      key={index}

                      className={"px-3 py-2 flex flex-col justify-center items-center text-center " + borderClass + " bg-slate-50/20 dark:bg-slate-900/10 min-w-[60px]"}

                    >

                      {options.length > 1 ? (

                        <div className="flex flex-col space-y-1 items-center justify-center">

                          {options.map((opt, oIdx) => (

                            <span 

                              key={oIdx}

                              className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"

                            >

                              {translateSymbolToVi(opt)}

                            </span>

                          ))}

                        </div>

                      ) : (

                        <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">

                          {translateSymbolToVi(part)}

                        </span>

                      )}

                    </div>

                  );

                })}

              </div>

            </div>

          );

        })}

      </div>

    );

  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in font-sans">

      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 animate-scale-up text-slate-800 dark:text-slate-200">

        

        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-900 pb-4">

          <div className="space-y-1">

            <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-955/30 text-pink-700 dark:text-pink-400 font-extrabold dark:text-pink-300 border border-pink-100/50 dark:border-pink-900/40 uppercase tracking-widest">

              Marugoto A1 • Chi tiết Ngữ pháp

            </span>

            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">

              {grammar.title}

            </h2>

          </div>

          <button 

            onClick={onClose}

            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-all active:scale-95"

          >

            ✕

          </button>

        </div>

        {/* Content */}

        <div className="space-y-6">

          

          {/* Tabs chuyển đổi nhanh trong Modal */}

          <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 max-w-md shadow-inner">

            {affExs.length > 0 && (

              <button

                onClick={() => setActiveFormType('affirmative')}

                className={"flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer " + (

                  activeFormType === 'affirmative'

                    ? 'bg-emerald-500 text-white shadow-md'

                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'

                )}

              >

                🟢 Khẳng định

              </button>

            )}

            {negExs.length > 0 && (

              <button

                onClick={() => setActiveFormType('negative')}

                className={"flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer " + (

                  activeFormType === 'negative'

                    ? 'bg-rose-500 text-white shadow-md'

                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'

                )}

              >

                🔴 Phủ định

              </button>

            )}

            {intExs.length > 0 && (

              <button

                onClick={() => setActiveFormType('interrogative')}

                className={"flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer " + (

                  activeFormType === 'interrogative'

                    ? 'bg-amber-500 text-white shadow-md'

                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'

                )}

              >

                🟡 Nghi vấn

              </button>

            )}

          </div>

          {/* 1. Ý nghĩa & Cách dùng */}

          <div className={"p-5 rounded-2xl border bg-slate-50/30 dark:bg-slate-900/20 shadow-sm space-y-3 " + formTypeBorder}>

            <div className="space-y-1">

              <span className={"text-xs font-black uppercase tracking-wider flex items-center gap-1.5 " + formTypeColor}>

                💡 Ý nghĩa ({formTypeName})

              </span>

              <p className="text-sm md:text-base font-extrabold text-slate-900 dark:text-slate-100">

                {formMeaning || grammar.meaning}

              </p>

            </div>

            

            {grammar.vietnamese_explanation && (

              <div className="space-y-1 pt-3 border-t border-slate-200/50 dark:border-slate-800/40">

                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">

                  🎯 Cách dùng mẫu câu chung

                </span>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-355 leading-relaxed font-semibold italic">

                  {grammar.vietnamese_explanation}

                </p>

              </div>

            )}

          </div>

          {/* 2. Cấu trúc */}

          <div className="space-y-4">

            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-900 pb-1">

              📋 Công thức ({formTypeName})

            </h3>

            <div className="p-5 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900 rounded-2xl">

              {renderVisualStructure(getVisualStructureForForm(grammar.structure, activeFormType, grammar.id))}

            </div>

          </div>

          {/* 3. Ví dụ */}

          <div className="space-y-4">

            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-900 pb-1">

              💬 Câu ví dụ ({filteredExamples.length} câu)

            </h3>

            {filteredExamples.length === 0 ? (

              <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">

                Không tìm thấy câu ví dụ nào.

              </div>

            ) : (

              <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">

                {filteredExamples.map((ex, exIdx) => (

                  <div 

                    key={exIdx} 

                    className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-2xl flex items-start gap-4 hover:border-[#b5179e]/30 transition-all group"

                  >

                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 shrink-0">

                      {(activeFormType === 'affirmative' ? '🟢 ' : activeFormType === 'negative' ? '🔴 ' : '🟡 ') + (exIdx + 1)}

                    </span>

                    <div className="flex-1 space-y-1">

                      <p className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">

                        {highlightEnding(cleanAndHiraganizeExample(ex.japanese, ex.romaji), activeFormType)}

                      </p>

                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">

                        {ex.romaji}

                      </p>

                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 border-t border-dashed border-slate-200/50 dark:border-slate-800/40 pt-1.5 mt-1">

                        {ex.vietnamese}

                      </p>

                    </div>

                    <button

                      onClick={() => playAudio(ex.japanese)}

                      className="w-8 h-8 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-pink-700 dark:text-pink-400 font-extrabold dark:text-pink-300 hover:text-white hover:bg-[#b5179e] dark:hover:bg-pink-500 cursor-pointer shrink-0 transition-all active:scale-90"

                      title="Phát âm"

                    >

                      🔊

                    </button>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-900">

          <button

            onClick={onClose}

            className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-sm hover:opacity-90 transition-all cursor-pointer"

          >

            Đóng lại

          </button>

        </div>

      </div>

    </div>

  );

};

// Helper chuyển đổi Kanji ví dụ sang Hiragana và sửa lỗi font hiển thị quả trám 

const cleanAndHiraganizeExample = (text: string, romaji: string) => {

  if (!text) return '';

  let s = text;

  

  // Sửa lỗi font quả trám đôi 

  s = s.replace(/\uFFFD\uFFFD/g, '\u3072\u308d'); // �� -> ひろ

  s = s.replace(/\uFFFD/g, '\u3072\u308d'); // fallback

  s = s.replace(/\uFFFD/g, '\u3072\u308d');

  const map = {

    "\u90e8\u5c4b": "\u3078\u3084", // 部屋 -> へや

    "\u6559\u5ba4": "\u304d\u3087\u3046\u3057\u3064", // 教室 -> きょうしつ

    "\u5b66\u751f": "\u304c\u304f\u305b\u3044", // 学生 -> がくせい

    "\u79c1": "\u305f\u3057", // 私 -> わたし

    "\u592b": "\u304a\u3063\u3068", // 夫 -> おっと

    "\u5bb6\u65cf": "\u304b\u305e\u304f", // 家族 -> かぞく (hoặc かぞく)

    "\u4e00\u4eba": "\u3072\u3068\u308a", // 一人 -> ひとり

    "\u672c": "\u307b\u3093", // 本 -> ほん

    "\u68da": "\u305f\u306a", // 棚 -> taな

    "\u4e0a": "\u3046\u3048", // 上 -> うえ

    "\u304a\u98a8\u5442": "\u304a\u3075\u308d", // お風呂 -> おふろ

    "\u524d": "\u307e\u3048", // 前 -> まえ

    "\u8a66\u9a13": "\u3057\u3051\u3093", // 試験 -> しけん

    "\u91d1\u66dc\u65e5": "\u304d\u3093\u3088\u3046\u3073", // 金曜日 -> きんようび

    "\u65e5\u66dc\u65e5": "\u306b\u3061\u3088\u3046\u3073", // 日曜日 -> にchようび

    "\u4f55\u6642": "\u306a\u3093\u3058", // 何時 -> なんじ

    "\u671d": "\u3042\u3055", // 朝 -> あさ

    "\u4eca": "\u3044\u307e", // 今 -> いま

    "\u592b\u5a66": "\u3075\u3046\u3075", // 夫婦 -> ふうふ

    "\u592b\u5a66\u3067": "\u3075\u3046\u3075\u3067", // 夫婦で

    "\u592b\u3068": "\u304a\u3063\u3068\u3068", // 夫と

    "\u5bb6\u65cf\u3068": "\u304b\u305e\u304f\u3068", // 家族と

    "\u4e00\u4eba\u3067": "\u3072\u3068\u308a\u3067", // 一人で

    "\u75c5\u9662": "\u3073\u3087\u3046\u3044\u3093", // 病院 -> びょういn

    "\u85ac": "\u304f\u3059\u308a", // 薬 -> くすり

    "\u8eca": "\u304f\u308b\u307e", // 車 -> くるま

    "\u81ea\u8ee2\u8eca": "\u3058\u3066\u3093\u3057\u3083", // 自転車 -> じてんしゃ

    "\u51b7\u8535\u5eab": "\u308c\u3044\u305e\u3046\u3053", // 冷蔵庫 -> れいぞうこ

    "\u5375": "\u305f\u307e\u3054", // 卵 -> たまご

    "\u5ead": "\u306b\u308f", // 庭 -> にわ

    "\u4f4f\u3093\u3067": "\u3059\u3093\u3067", // 住んで -> すんで

    "広い": "ひろい", // 広い

      "広くない": "ひろくない" // 広くない

  };

  for (const [kanji, hira] of Object.entries(map)) {

    s = s.split(kanji).join(hira);

  }

  s = s.replace(/\u5b66/g, '\u304c\u304f'); // 学 -> がく

  s = s.replace(/\u751f/g, '\u305b\u3044'); // 生 -> せい

  s = s.replace(/\u5ba5/g, '\u3057\u3064'); // 室 -> しつ

  s = s.replace(/\u8a9e/g, '\u3054'); // 語 -> ご

  s = s.replace(/\u4f4f/g, '\u3059'); // 住 -> す

  s = s.replace(/\u592b/g, '\u304a\u3063\u3068'); // 夫 -> おっと

  s = s.replace(/\u66dc\u65e5/g, '\u3088\u3046\u3073'); // 曜日 -> ようび

  s = s.replace(/\u4f55/g, '\u306a\u3093'); // 何 -> なん

  s = s.replace(/\u6642/g, '\u3058'); // 時 -> じ

  s = s.replace(/\u5206/g, '\u3075\u3093'); // 分 -> fuん

  s = s.replace(/\u5e83/g, '\u3072\u308d'); // 広 -> ひろ

  s = s.replace(/\u5925/g, '\u304a\u304a'); // 大 -> おお

  s = s.replace(/\u5c0f/g, '\u3061\u3044'); // 小 -> ちい

  s = s.replace(/\u65b0/g, '\u3042\u305f\u3089'); // 新 -> あたら

  s = s.replace(/\u53e4/g, '\u3075\u308b'); // 古 -> ふる

  s = s.replace(/\u9ad8/g, '\u305f\u304b'); // 高 -> たか

  s = s.replace(/\u5b89/g, '\u3085'); // 安 -> やす

  s = s.replace(/\uFFFD/g, '\u3072\u308d');

  s = s.replace(/\uFFFD/g, '\u3072\u308d');

  return s;

};

// Helper mở rộng các câu ví dụ còn thiếu cho cấu trúc ngữ pháp song song

const getExtendedExamplesForGrammar = (grammarId: number, baseExamples: any[]) => {

  const exs = [...baseExamples];

  // Mẫu "で ます de masu" (id = 160 hoặc 178)

  if (grammarId === 160 || grammarId === 178) {

    // Thể Nghi vấn (interrogative): cần 2 ví dụ cho 2 cấu trúc

    const hasNPlaceQuery = exs.some(ex => ex.type === 'interrogative' && !ex.japanese.includes('\u3069\u3053')); // どこ

    if (!hasNPlaceQuery) {

      exs.unshift({

        japanese: "\u3042\u305d\u3053\u3067\u3000\u30e9\u30fc\u30e1\u3093\u3092\u3000\u305f\u3079\u307e\u3059\u304b\u3002",

        romaji: "Asoko de raamen o tabemasu ka.",

        vietnamese: "Bạn ăn mì Ramen ở đằng kia phải không?",

        type: "interrogative"

      });

    }

    // Thể Phủ định (negative): cần 2 ví dụ cho 2 cấu trúc

    const hasDokoNegative = exs.some(ex => ex.type === 'negative' && (ex.japanese.includes('\u3069\u3053') || ex.japanese.includes('\u3069\u3053\u304b'))); // どこ hoặc どこか

    if (!hasDokoNegative) {

      exs.push({

        japanese: "\u3069\u3053\u304b\u3067\u3000\u3072\u308b\u3054\u306f\u3093\u3092\u3000\u305f\u3079\u307e\u305b\u3093\u304b\u3002",

        romaji: "Dokoka de hirugohan o tabemasen ka.",

        vietnamese: "Chúng ta ăn trưa ở đâu đó nhé?",

        type: "negative"

      });

    }

  }

  // Mẫu "を ます o masu" (id = 158)

  if (grammarId === 158) {

    // Thể Phủ định (negative): cần 2 ví dụ cho 2 cấu trúc

    // Cấu trúc 1: N (Object) + を + V + ません

    // Cấu trúc 2: なに + を + V + ませんか

    const hasNanikaNegative = exs.some(ex => ex.type === 'negative' && (ex.japanese.includes('\u306a\u306b\u304b') || ex.japanese.includes('\u306a\u306b'))); // なにか

    if (!hasNanikaNegative) {

      exs.push({

        japanese: "\u306a\u306b\u304b\u3000\u305f\u3079\u307e\u305b\u3093\u304b\u3002", // なにか　たべませんか。

        romaji: "Nanika tabemasen ka.",

        vietnamese: "Chúng ta ăn cái gì đó nhé?",

        type: "negative"

      });

    }

  }

  return exs;

};

// Helper class CSS động cho trạng thái học tập từ vựng & Kanji

const getStatusSelectClass = (status: 'not_learned' | 'learning' | 'mastered' | string) => {

  const base = "text-[10px] font-extrabold py-1 px-1.5 border rounded-lg cursor-pointer transition-all duration-200 focus:outline-none";

  if (status === 'mastered') {

    return `${base} bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400`;

  }

  if (status === 'learning') {

    return `${base} bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/50 text-amber-600 dark:text-amber-400`;

  }

  return `${base} bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-900/50 text-rose-600 dark:text-rose-400`;

};

