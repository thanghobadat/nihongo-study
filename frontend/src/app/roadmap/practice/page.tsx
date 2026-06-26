'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';
import { getSubstitutionTemplate, getGrammarVocabMapping, SubstitutionSlot } from '../../utils/roadmapMapping';
import { getKanjiForm, HIRAGANA_TO_KANJI } from '../../utils/kanjiFormLookup';
import SidebarSettings from '../../components/SidebarSettings';

interface Lesson {
  id: number;
  title: string;
  description: string;
}

interface VocabItem {
  id: number;
  lesson_id: number;
  hiragana: string;
  romaji: string;
  vietnamese_meaning: string;
  word_type: string;
}

interface GrammarItem {
  id: number;
  lesson_id: number;
  title: string;
  meaning: string;
  structure: string;
  vietnamese_explanation: string;
}



const EXTRA_KANJI_MAP: Record<string, string> = {
  '会社員': 'かいしゃいん',
  '銀行員': 'ぎんこういn',
  'ぎんこういん': 'ぎんこういん',
  '研究者': 'けんきゅうしゃ',
  '山川さん': 'やまかわさん',
  '山田さん': 'やまださん',
  'ミラーさん': 'ミラーさん',
  'サントスさん': 'サントスさん',
  'ワットさん': 'ワットさん',
  'ナムさん': 'ナムさん',
  '木村さん': 'きむらさん',
  '佐藤さん': 'さとうさん',
  '鈴木さん': 'すずきさん',
  '高橋さん': 'たかはしさん',
  '田中さん': 'たなかさん',
  '渡辺さん': 'わたなべさん',
  '小林さん': 'こばやしさん',
  '加藤さん': 'かとうさん',
  '吉田さん': 'よしださん',
  '佐々木さん': 'ささきさん',
  '違います': 'ちがいます',
  '面白です': 'おもしろいです',
  '面白い': 'おもしろい',
  '日本語': 'にほんご',
  '英語': 'えいご',
  '私': 'わたし',
  'あの人': 'あのひと',
  'あの方': 'あのかた',
  '学生': 'がくせい',
  '教師': 'きょうし',
  '先生': 'せんせい',
  '医者': 'いしゃ',
  '本': 'ほん',
  '辞書': 'じしょ',
  '雑誌': 'ざっし',
  '手帳': 'てちょう',
  '時計': 'とけい',
  '傘': 'かさ',
  '自動車': 'じどうしゃ',
  '車': 'くるま',
  '朝ご飯': 'あさごはん',
  '昼ご飯': 'ひるごはん',
  '晩ご飯': 'ばんごはん',
  'お茶': 'おちゃ',
  '紅茶': 'こうちゃ',
  '牛乳': 'ぎゅうにゅう',
  '映画': 'えいが',
  '宿題': 'しゅくだい',
  'お花見': 'おはなみ',
  '一緒に': 'いっしょに',
  '時々': 'ときどき',
  '公園': 'こうえん',
  '庭': 'にわ',
  '病院': 'びょういん',
  '教室': 'きょうしつ',
  '食堂': 'しょくどう',
  '事務所': 'じむしょ',
  '会議室': 'かいぎしつ',
  '受付': 'うけつけ',
  '部屋': 'へや',
  'お手洗い': 'おてあらい',
  '階段': 'かいだん',
  'お国': 'おくに',
  '電話': 'でんわ',
  '靴': 'くつ',
  '売り場': 'うりば',
  '地下': 'ちか',
  '何階': 'なんがい',
  '休み': 'やすみ',
  '昼休み': 'ひるやすみ',
  '毎朝': 'まいあさ',
  '毎晩': 'まいばん',
  '毎日': 'まいにch',
  '毎日 ': 'まいにち',
  '番号': 'ばんごう',
  '何番': 'なんばん',
  '月曜日': 'げつようび',
  '火曜日': 'かようび',
  '水曜日': 'すいようび',
  '木曜日': 'もくようび',
  '金曜日': 'きんようび',
  '土曜日': 'どようび',
  '日曜日': 'にちようび',
  '何曜日': 'なんようび',
  '行きます': 'いきます',
  '来ます': 'きます',
  '帰ります': 'かえります',
  '学校': 'がっこう',
  '飛行機': 'ひこうき',
  '電車': 'でんしゃ',
  '地下鉄': 'ちかてつ',
  'じてんしゃ': 'じてんしゃ',
  '自転車': 'じてんしゃ',
  '一人': 'ひとり',
  '一人で': 'ひとりで',
  '先週': 'せんしゅう',
  '今週': 'こんしゅう',
  'らいしゅう': 'らいしゅう',
  '先月': 'せんげつ',
  '今月': 'こんげつ',
  '来月': 'らいげつ',
  '去年': 'きょねん',
  '今年': 'ことし',
  '来年': 'らいねn',
  '来年 ': 'らいねん',
  '何月': 'なんがつ',
  '誕生日': 'たんじょうび',
  '何日': 'なにち',
  '食べます': 'たべます',
  '見ます': 'みます',
  '聞きます': 'ききます',
  '読みます': 'よみます',
  '書きます': 'かきます',
  '買います': 'かいます',
  '撮ります': 'とります',
  '会います': 'あいます',
  '卵': 'たまご',
  '肉': 'にく',
  '魚': 'さかな',
  '野菜': 'やさい',
  '果物': 'くだもの',
  '水': 'みず',
};

function convertKanjiToHira(text: string, kanjiItems: any[], vocabItems: any[]): string {
  if (!text) return '';
  let result = text;

  const dynamicMap: Record<string, string> = {};
  if (Array.isArray(vocabItems)) {
    const sortedVocab = [...vocabItems].sort((a, b) => (b.hiragana?.length || 0) - (a.hiragana?.length || 0));
    for (const vocab of sortedVocab) {
      if (!vocab.hiragana) continue;
      const kanji = getKanjiForm(vocab.hiragana, kanjiItems);
      if (kanji && kanji !== vocab.hiragana) {
        dynamicMap[kanji] = vocab.hiragana;
      }
    }
  }

  const baseMap: Record<string, string> = {};
  for (const [hira, kanji] of Object.entries(HIRAGANA_TO_KANJI)) {
    if (kanji && kanji !== hira) {
      baseMap[kanji] = hira;
    }
  }

  const finalMap = { ...baseMap, ...EXTRA_KANJI_MAP, ...dynamicMap };
  const sortedKeys = Object.keys(finalMap).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (!key) continue;
    const regex = new RegExp(key, 'g');
    result = result.replace(regex, finalMap[key]);
  }

  return result;
}

function getOptionDisplay(
  option: { ja: string; vi: string; romaji: string },
  scriptMode: 'kanji' | 'hiragana',
  kanjiItems: any[],
  vocabItems: any[]
): string {
  if (scriptMode === 'kanji') {
    return getKanjiForm(option.ja, kanjiItems);
  } else {
    return convertKanjiToHira(option.ja, kanjiItems, vocabItems);
  }
}

function adjustScriptMode(
  text: string,
  scriptMode: 'kanji' | 'hiragana',
  kanjiItems: any[],
  vocabItems: any[]
): string {
  if (!text) return '';
  if (scriptMode === 'kanji') {
    return text;
  } else {
    return convertKanjiToHira(text, kanjiItems, vocabItems);
  }
}

export default function SubstitutionPracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = api.getUser();

  const lessonIdParam = searchParams.get('lessonId');
  const lessonId = lessonIdParam ? parseInt(lessonIdParam) : 1;
  const grammarIndexParam = searchParams.get('grammarIndex');
  const initialGrammarIndex = grammarIndexParam ? parseInt(grammarIndexParam) : 0;
  const from = searchParams.get('from') || 'roadmap';

  // Sidebar Menu list (all active = false since we are in a practice page)
  const menuItems = [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: true },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: false },
    { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: false },
    { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: false }
  ];

  // States
  const [grammarIndex, setGrammarIndex] = useState<number>(initialGrammarIndex);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [grammarItems, setGrammarItems] = useState<GrammarItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [slotValues, setSlotValues] = useState<Record<string, { ja: string; vi: string; romaji: string }>>({});
  const [showRomaji, setShowRomaji] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);
  const [showQuestionRomaji, setShowQuestionRomaji] = useState<boolean>(true);
  const [showQuestionVietnamese, setShowQuestionVietnamese] = useState<boolean>(true);
  const [kanjiItems, setKanjiItems] = useState<any[]>([]);
  const [scriptMode, setScriptMode] = useState<'kanji' | 'hiragana'>('kanji');

  // Randomize all slot selections and hide answers
  const handleRandomize = () => {
    if (!template || !template.slots) return;
    const randomVals: Record<string, { ja: string; vi: string; romaji: string }> = {};
    template.slots.forEach(slot => {
      if (slot.options && slot.options.length > 0) {
        const randomIndex = Math.floor(Math.random() * slot.options.length);
        randomVals[slot.id] = slot.options[randomIndex];
      }
    });
    setSlotValues(randomVals);
    setShowRomaji(false);
    setShowVietnamese(false);
    setShowQuestionRomaji(false);
    setShowQuestionVietnamese(false);
  };

  // Fetch initial lessons
  useEffect(() => {
    async function loadLessons() {
      try {
        const lessonData = await api.get('/api/user/lessons');
        if (Array.isArray(lessonData)) {
          setLessons(lessonData);
        }
      } catch (error) {
        console.error('Failed to load lessons:', error);
      }
    }
    loadLessons();
  }, []);

  // Fetch vocabulary, kanji & grammar items
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const vocabData = await api.get(`/api/user/lessons/${lessonId}/vocabulary`);
        const kanjiData = await api.get(`/api/user/lessons/${lessonId}/kanji`);
        const grammarData = await api.get(`/api/user/lessons/${lessonId}/grammar`);
        if (Array.isArray(vocabData)) setVocabItems(vocabData);
        if (Array.isArray(kanjiData)) setKanjiItems(kanjiData);
        if (Array.isArray(grammarData)) setGrammarItems(grammarData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lessonId]);

  // Load substitution template based on current lesson & active grammar index
  const template = useMemo(() => {
    return getSubstitutionTemplate(lessonId, grammarIndex, vocabItems, grammarItems);
  }, [lessonId, grammarIndex, vocabItems, grammarItems]);

  // Initialize selected values for slots when template changes
  useEffect(() => {
    if (template && template.slots) {
      const initialVals: Record<string, { ja: string; vi: string; romaji: string }> = {};
      template.slots.forEach(slot => {
        if (slot.options && slot.options.length > 0) {
          initialVals[slot.id] = slot.options[0];
        }
      });
      setSlotValues(initialVals);
      setShowRomaji(true);
      setShowVietnamese(true);
      setShowQuestionRomaji(true);
      setShowQuestionVietnamese(true);
    }
  }, [template]);

  // Synthesize sentence outputs
  const synthesizedSentence = useMemo(() => {
    if (!template) return { ja: '', vi: '', romaji: '' };
    if (template.slots && template.slots.length > 0) {
      const hasAllSlots = template.slots.every(slot => slotValues[slot.id]);
      if (!hasAllSlots) return { ja: '', vi: '', romaji: '' };
    }
    return template.getSynthesis(slotValues);
  }, [template, slotValues]);

  // Change slot selection
  const handleSlotChange = (slotId: string, valueJa: string) => {
    const slot = template.slots.find(s => s.id === slotId);
    if (!slot) return;
    const option = slot.options.find(o => o.ja === valueJa);
    if (option) {
      setSlotValues(prev => ({ ...prev, [slotId]: option }));
    }
  };

  // Play synthesized audio for answer
  const playSynthesisAudio = () => {
    if (synthesizedSentence.ja && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(synthesizedSentence.ja);
      utterance.lang = 'ja-JP';
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
      if (jaVoice) utterance.voice = jaVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Play synthesized audio for question
  const playQuestionAudio = () => {
    if (synthesizedSentence.questionJa && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(synthesizedSentence.questionJa);
      utterance.lang = 'ja-JP';
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
      if (jaVoice) utterance.voice = jaVoice;
      window.speechSynthesis.speak(utterance);
    }
  };
  // Handle Smart Back Button click
  const handleBack = () => {
    if (from === 'lessons') {
      router.push(`/lessons/${lessonId}?tab=vocab&grammarIndex=${grammarIndex}`);
    } else {
      router.push(`/roadmap`);
    }
  };



  const activeLesson = lessons.find(l => l.id === lessonId);
  const activeGrammar = grammarItems[grammarIndex];

  const selectorOptions = useMemo(() => {
    const options = grammarItems.map((g, idx) => ({
      value: idx,
      label: `Mẫu ${idx + 1}: ${g.title}`
    }));
    
    if (vocabItems.length > 0 && grammarItems.length > 0) {
      const associatedIds = new Set<number>();
      grammarItems.forEach((_, idx) => {
        const mapping = getGrammarVocabMapping(lessonId, idx, vocabItems);
        mapping.associatedItems.forEach(item => {
          associatedIds.add(item.id);
        });
      });
      const hasSupplemental = vocabItems.some(item => !associatedIds.has(item.id));
      if (hasSupplemental) {
        options.push({
          value: grammarItems.length,
          label: lessonId === 1 
            ? "Giao tiếp: Chào hỏi & Giới thiệu bản thân" 
            : "Giao tiếp: Các cụm từ & Từ vựng khác"
        });
      }
    }
    return options;
  }, [grammarItems, vocabItems, lessonId]);

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
          <div className="flex items-center justify-between mb-8 px-2 shrink-0">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Minna Nihongo
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

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
                    router.push(`/lessons/${lessonId}?tab=${item.id}`);
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6 md:space-y-8">
        
        {/* Header Back & Info row */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 shadow-sm flex items-center space-x-1.5 active:scale-95"
            >
              <span>←</span>
              <span>Quay lại</span>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                LUYỆN TẬP THẾ CÂU
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Thay đổi các từ trong ngoặc để xem cấu trúc biến đổi linh hoạt ra sao.
              </p>
            </div>
          </div>
          
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 px-3.5 py-1.5 rounded-xl">
            {activeLesson?.title || `Bài ${lessonId}`}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Đang tải câu mẫu tương tác...</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl mx-auto">
            
            {/* Grammar Selector & Details */}
            <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 pb-3">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  📚 Chọn Mẫu Câu Ngữ Pháp
                </h3>
                <select
                  value={grammarIndex}
                  onChange={(e) => setGrammarIndex(parseInt(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
                >
                  {selectorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {grammarIndex === grammarItems.length ? (
                <div className="space-y-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <p><strong className="text-slate-600 dark:text-slate-300">Cấu trúc:</strong> <code className="text-blue-600 dark:text-blue-400 font-mono bg-slate-50 dark:bg-slate-950/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">{lessonId === 1 ? "はじめまして。[Tên] です。[Đất nước] から来ました。どうぞよろしく。" : "[Cụm từ giao tiếp / Từ vựng]"}</code></p>
                  <p><strong className="text-slate-600 dark:text-slate-300">Giải thích:</strong> Luyện tập phát âm, ghi nhớ nghĩa và phiên âm của các câu chào hỏi giao tiếp và từ vựng bổ trợ trong Bài {lessonId}.</p>
                </div>
              ) : activeGrammar && (
                <div className="space-y-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <p><strong className="text-slate-600 dark:text-slate-300">Công thức câu:</strong> <code className="text-blue-600 dark:text-blue-400 font-mono bg-slate-50 dark:bg-slate-950/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">{activeGrammar.structure}</code></p>
                  <p><strong className="text-slate-600 dark:text-slate-300">Giải thích:</strong> {activeGrammar.vietnamese_explanation}</p>
                </div>
              )}
            </div>

            {/* Substitution Playground area */}
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 shadow-2xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Controls: Randomize & Toggle Visibility */}
              <div className="flex flex-wrap items-center justify-center gap-4 py-3 border-b border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40 w-full mb-6">
                <button
                  onClick={handleRandomize}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-900 dark:text-white text-xs font-black rounded-xl border border-purple-500/20 hover:border-purple-400/30 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <span>🎲</span> Random từ vựng
                </button>

                {/* Script Switcher */}
                <div className="flex items-center bg-slate-50 dark:bg-slate-950/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 shadow-inner">
                  <button
                    onClick={() => setScriptMode('kanji')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      scriptMode === 'kanji'
                        ? 'bg-indigo-600/90 text-slate-900 dark:text-white shadow-md'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
                    }`}
                  >
                    漢字 Kanji
                  </button>
                  <button
                    onClick={() => setScriptMode('hiragana')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      scriptMode === 'hiragana'
                        ? 'bg-indigo-600/90 text-slate-900 dark:text-white shadow-md'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
                    }`}
                  >
                    かな Hira/Kata
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowRomaji(!showRomaji);
                      setShowQuestionRomaji(!showRomaji);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      showRomaji 
                        ? 'bg-blue-600/25 border border-blue-500/40 text-blue-600 dark:text-blue-400' 
                        : 'bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {showRomaji ? '👁️ Romaji: Hiện' : '🙈 Romaji: Ẩn'}
                  </button>

                  <button
                    onClick={() => {
                      setShowVietnamese(!showVietnamese);
                      setShowQuestionVietnamese(!showVietnamese);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      showVietnamese 
                        ? 'bg-emerald-600/25 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {showVietnamese ? '👁️ Nghĩa: Hiện' : '🙈 Nghĩa: Ẩn'}
                  </button>
                </div>
              </div>

              {/* Japanese Sentence Template / Q&A rendering */}
              {synthesizedSentence.questionJa ? (
                /* CHẾ ĐỘ 1: GIAO DIỆN HỘI THOẠI HỎI - ĐÁP (Q&A DIALOGUE) */
                <div className="w-full space-y-6 sm:space-y-8 py-4">
                  {/* Bong bóng Câu hỏi (Q) */}
                  <div className="flex items-start space-x-3 text-left max-w-[85%] mr-auto">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs shadow-md flex-shrink-0 font-bold text-slate-400 dark:text-slate-500">
                      Q
                    </div>
                    <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none relative shadow-lg flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2 border-b border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40 pb-1.5">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">CÂU HỎI NHẬN DIỆN</span>
                        <button
                          onClick={playQuestionAudio}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white dark:text-white flex items-center justify-center transition-all cursor-pointer text-xs"
                          title="Nghe câu hỏi"
                        >
                          🔊
                        </button>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-wide font-sans leading-relaxed">
                        {adjustScriptMode(synthesizedSentence.questionJa, scriptMode, kanjiItems, vocabItems)}
                      </p>
                      
                      {/* Q Romaji */}
                      {synthesizedSentence.questionRomaji && (
                        <p 
                          onClick={() => setShowQuestionRomaji(true)}
                          className={`font-mono text-xs font-bold tracking-wide mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/20 cursor-pointer select-none transition-all duration-300 ${
                            showQuestionRomaji ? 'text-blue-600 dark:text-blue-400/90 blur-none' : 'text-slate-400 dark:text-slate-500 blur-[4px]'
                          }`}
                        >
                          {showQuestionRomaji ? synthesizedSentence.questionRomaji : 'Nhấp để hiện Romaji câu hỏi'}
                        </p>
                      )}
                      
                      {/* Q Vietnamese Meaning */}
                      {synthesizedSentence.questionVi && (
                        <p 
                          onClick={() => setShowQuestionVietnamese(true)}
                          className={`text-xs font-semibold mt-1.5 cursor-pointer select-none transition-all duration-300 ${
                            showQuestionVietnamese ? 'text-slate-600 dark:text-slate-300/95 blur-none' : 'text-slate-400 dark:text-slate-500 blur-[4px]'
                          }`}
                        >
                          {showQuestionVietnamese ? synthesizedSentence.questionVi : 'Nhấp để hiện nghĩa câu hỏi'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bong bóng Trả lời (A) */}
                  <div className="flex items-start space-x-3 text-left max-w-[90%] ml-auto flex-row-reverse space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-500/50 flex items-center justify-center text-xs shadow-md flex-shrink-0 text-slate-900 dark:text-white font-bold">
                      A
                    </div>
                    <div className="bg-indigo-950/20 border border-indigo-500/30 p-5 rounded-3xl rounded-tr-none relative shadow-xl flex-1">
                      <div className="flex items-center justify-between gap-4 mb-2 border-b border-indigo-900/10 pb-1.5">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">CÂU TRẢ LỜI (THẾ TỪ)</span>
                        <button
                          onClick={playSynthesisAudio}
                          className="w-7 h-7 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:text-slate-900 dark:hover:text-white dark:text-white flex items-center justify-center transition-all cursor-pointer text-xs"
                          title="Nghe câu trả lời"
                        >
                          🔊
                        </button>
                      </div>
                      
                       {/* Trả lời Japanese Sentence (Dropdowns) */}
                       <div className="w-full flex flex-wrap items-center gap-y-3 gap-x-2 py-2">
                         {(() => {
                           const parts: React.ReactNode[] = [];
                           const slotsMap = new Map<string, SubstitutionSlot>();
                           template.slots.forEach(s => slotsMap.set(s.id, s));

                           template.templateParts.forEach((part, index) => {
                             if (part) {
                               parts.push(
                                 <span key={`txt-${index}`} className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-200 tracking-wide font-sans leading-normal">
                                   {adjustScriptMode(part, scriptMode, kanjiItems, vocabItems)}
                                 </span>
                               );
                             }
                             
                             const slotId = template.slots[index]?.id;
                             if (slotId) {
                               const slot = slotsMap.get(slotId);
                               const selectedVal = slotValues[slotId]?.ja || '';
                               
                               parts.push(
                                 <div key={`slot-${slotId}`} className="inline-block relative">
                                   <select
                                     value={selectedVal}
                                     onChange={(e) => handleSlotChange(slotId, e.target.value)}
                                     className="appearance-none bg-indigo-950/40 hover:bg-indigo-900/50 border-2 border-indigo-500/50 hover:border-indigo-400/80 text-slate-900 dark:text-white font-extrabold text-base sm:text-lg px-3.5 py-2 pr-7 rounded-xl focus:outline-none cursor-pointer text-center shadow-lg transition-all duration-300"
                                     title={slot?.label}
                                   >
                                     {slot?.options.map(o => (
                                       <option key={o.ja} value={o.ja} className="bg-white dark:bg-slate-950 text-left text-xs font-bold text-slate-700 dark:text-slate-200">
                                         {getOptionDisplay(o, scriptMode, kanjiItems, vocabItems)}
                                       </option>
                                     ))}
                                   </select>
                                   <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-indigo-600 dark:text-indigo-400/80 pointer-events-none">▼</span>
                                 </div>
                               );
                             }
                           });
                           return parts;
                         })()}
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ 2: GIAO DIỆN CÂU ĐƠN GIẢN NHƯ CŨ (TƯƠNG THÍCH NGƯỢC) */
                <>
                  <div className="w-full flex flex-wrap items-center justify-center gap-y-4 gap-x-2.5 py-6">
                    {(() => {
                      const parts: React.ReactNode[] = [];
                      const slotsMap = new Map<string, SubstitutionSlot>();
                      template.slots.forEach(s => slotsMap.set(s.id, s));

                      template.templateParts.forEach((part, index) => {
                        if (part) {
                          parts.push(
                            <span key={`txt-${index}`} className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-200 tracking-wide font-sans">
                              {adjustScriptMode(part, scriptMode, kanjiItems, vocabItems)}
                            </span>
                          );
                        }
                        
                        const slotId = template.slots[index]?.id;
                        if (slotId) {
                          const slot = slotsMap.get(slotId);
                          const selectedVal = slotValues[slotId]?.ja || '';
                          
                          parts.push(
                            <div key={`slot-${slotId}`} className="inline-block relative">
                              <select
                                value={selectedVal}
                                onChange={(e) => handleSlotChange(slotId, e.target.value)}
                                className="appearance-none bg-indigo-950/40 hover:bg-indigo-900/50 border-2 border-indigo-500/50 hover:border-indigo-400/80 text-slate-900 dark:text-white font-extrabold text-lg sm:text-xl px-4 py-2.5 pr-8 rounded-2xl focus:outline-none cursor-pointer text-center shadow-lg transition-all duration-300"
                                title={slot?.label}
                              >
                                {slot?.options.map(o => (
                                  <option key={o.ja} value={o.ja} className="bg-white dark:bg-slate-950 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {getOptionDisplay(o, scriptMode, kanjiItems, vocabItems)}
                                  </option>
                                ))}
                              </select>
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-indigo-600 dark:text-indigo-400/80 pointer-events-none">▼</span>
                            </div>
                          );
                        }
                      });
                      return parts;
                    })()}
                  </div>
                  
                  {/* Loa phát âm trung tâm chỉ xuất hiện ở chế độ câu đơn */}
                  <button
                    onClick={playSynthesisAudio}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white font-black text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.35)] active:scale-90 transition-all cursor-pointer"
                    title="Nghe câu hoàn chỉnh"
                  >
                    🔊
                  </button>
                </>
              )}

              {/* Outputs: Romaji & Vietnamese (Chỉ hiển thị khi có dữ liệu) */}
              <div className="w-full space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40">
                {synthesizedSentence.romaji && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Phiên âm Romaji trả lời</span>
                    <p 
                      onClick={() => setShowRomaji(true)}
                      className={`font-mono text-sm sm:text-base font-bold tracking-wide cursor-pointer select-none transition-all duration-300 ${
                        showRomaji ? 'text-blue-600 dark:text-blue-400 blur-none' : 'text-slate-400 dark:text-slate-500 blur-[4px]'
                      }`}
                    >
                      {showRomaji ? synthesizedSentence.romaji : 'Nhấp để hiển thị phiên âm Romaji'}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Bản dịch nghĩa Việt trả lời</span>
                  <p 
                    onClick={() => setShowVietnamese(true)}
                    className={`text-sm sm:text-base font-extrabold cursor-pointer select-none transition-all duration-300 ${
                      showVietnamese ? 'text-slate-800 dark:text-slate-100 blur-none' : 'text-slate-400 dark:text-slate-500 blur-[4px]'
                    }`}
                  >
                    {showVietnamese ? synthesizedSentence.vi : 'Nhấp để hiển thị bản dịch tiếng Việt'}
                  </p>
                </div>
              </div>
            </div>

            {/* Substitution Guide */}
            <div className="p-5 sm:p-6 bg-indigo-950/15 border border-indigo-900/30 rounded-2xl flex items-start space-x-4">
              <span className="text-2xl mt-0.5">💡</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wide">
                  HƯỚNG DẪN LUYỆN TẬP SUB-DRILL
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Thay thế từ vựng sẽ giúp bạn hiểu được cách danh từ lồng vào các cấu trúc câu. Khi đã thế từ, hãy bấm nút loa 🔊 ở trên để luyện nghe phát âm câu đó nhiều lần, hoặc tự đọc to câu đó lên để tăng phản xạ nhịp điệu của tiếng Nhật.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
