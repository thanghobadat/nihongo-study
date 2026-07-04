'use client';

import { useState, useEffect, useCallback } from 'react';
import { playAudioWithFallback } from '../../../utils/audioHelper';

interface VocabItem {
  id: number;
  hiragana: string;
  romaji: string;
  kanji_word?: string;
  vietnamese_meaning: string;
}

interface MatchingGameProps {
  vocabItems: VocabItem[];
}

interface Card {
  uniqueId: string;
  id: number; // Liên kết giữa từ tiếng Nhật và nghĩa tiếng Việt
  type: 'ja' | 'vi';
  text: string;
  romaji?: string;
  matched: boolean;
  selected: boolean;
}

export default function MatchingGame({ vocabItems }: MatchingGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [firstSelected, setFirstSelected] = useState<Card | null>(null);
  const [secondSelected, setSecondSelected] = useState<Card | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [scriptMode, setScriptMode] = useState<'hiragana' | 'kanji'>('hiragana');

  // Khởi tạo trò chơi
  const initGame = useCallback(() => {
    if (vocabItems.length === 0) return;

    // Chọn tối đa 6 từ vựng để tạo 12 thẻ
    const selectedVocab = [...vocabItems]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(6, vocabItems.length));

    const cardList: Card[] = [];

    selectedVocab.forEach(item => {
      // Thẻ tiếng Nhật
      const jaText = scriptMode === 'kanji' && item.kanji_word 
        ? item.kanji_word 
        : item.hiragana;

      cardList.push({
        uniqueId: `ja-${item.id}`,
        id: item.id,
        type: 'ja',
        text: jaText,
        romaji: item.romaji,
        matched: false,
        selected: false
      });

      // Thẻ tiếng Việt
      cardList.push({
        uniqueId: `vi-${item.id}`,
        id: item.id,
        type: 'vi',
        text: item.vietnamese_meaning,
        matched: false,
        selected: false
      });
    });

    // Tráo thẻ
    const shuffledCards = cardList.sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setFirstSelected(null);
    setSecondSelected(null);
    setElapsedTime(0);
    setStartTime(Date.now());
    setGameActive(true);
    setGameFinished(false);
    setIsChecking(false);
  }, [vocabItems, scriptMode]);

  useEffect(() => {
    initGame();
  }, [initGame, scriptMode]);

  // Bộ đếm thời gian
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && !gameFinished && startTime) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameActive, gameFinished, startTime]);

  const handleCardClick = (card: Card) => {
    if (isChecking || card.matched || card.selected) return;

    // Phát âm khi click vào thẻ tiếng Nhật
    if (card.type === 'ja') {
      playAudioWithFallback(card.text, card.text);
    }

    // Đánh dấu thẻ được chọn
    setCards(prev => prev.map(c => c.uniqueId === card.uniqueId ? { ...c, selected: true } : c));

    if (!firstSelected) {
      setFirstSelected(card);
    } else {
      setSecondSelected(card);
      setIsChecking(true);

      // So khớp thẻ
      if (firstSelected.id === card.id && firstSelected.type !== card.type) {
        // Cặp thẻ đúng
        setTimeout(() => {
          setCards(prev => prev.map(c => {
            if (c.id === card.id) {
              return { ...c, matched: true, selected: false };
            }
            return c;
          }));

          setFirstSelected(null);
          setSecondSelected(null);
          setIsChecking(false);

          // Kiểm tra xem game kết thúc chưa
          setCards(currentCards => {
            const allMatched = currentCards.every(c => c.matched || c.id === card.id);
            if (allMatched) {
              setGameFinished(true);
              setGameActive(false);
            }
            return currentCards;
          });
        }, 500);
      } else {
        // Cặp thẻ sai
        setTimeout(() => {
          setCards(prev => prev.map(c => {
            if (c.uniqueId === firstSelected.uniqueId || c.uniqueId === card.uniqueId) {
              return { ...c, selected: false };
            }
            return c;
          }));

          setFirstSelected(null);
          setSecondSelected(null);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  if (vocabItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center">
        <p className="text-slate-500 dark:text-slate-400">Không có đủ dữ liệu từ vựng để chơi game ghép thẻ.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 dark:text-slate-500">Bảng chữ:</span>
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800/80">
            <button
              onClick={() => setScriptMode('hiragana')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                scriptMode === 'hiragana'
                  ? 'bg-white dark:bg-slate-900 text-[#b5179e] shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Hiragana
            </button>
            <button
              onClick={() => setScriptMode('kanji')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                scriptMode === 'kanji'
                  ? 'bg-white dark:bg-slate-900 text-[#b5179e] shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Kanji
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400 dark:text-slate-500">⏱️ Thời gian: <span className="font-bold text-slate-700 dark:text-slate-200">{elapsedTime} giây</span></span>
          <button
            onClick={initGame}
            className="px-3.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold rounded-xl active:scale-[0.97] transition-all"
          >
            🔄 Tráo thẻ mới
          </button>
        </div>
      </div>

      {gameFinished ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce">
            🎉
          </div>
          <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Chiến thắng!</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Bạn đã ghép hết các cặp thẻ trong vòng <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">{elapsedTime}</span> giây.
          </p>
          <button
            onClick={initGame}
            className="px-6 py-3 bg-[#b5179e] hover:bg-[#7209b7] text-white font-bold rounded-xl active:scale-[0.98] transition-all"
          >
            🎮 Chơi lại vòng mới
          </button>
        </div>
      ) : (
        /* Thẻ Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {cards.map(card => {
            // Style cơ bản
            let cardClass = "min-h-[100px] p-4 border rounded-2xl flex flex-col items-center justify-center text-center font-medium transition-all duration-200 cursor-pointer select-none ";
            
            if (card.matched) {
              cardClass += "border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 text-slate-300 dark:text-slate-700 cursor-default opacity-40";
            } else if (card.selected) {
              cardClass += "border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 scale-[0.98] shadow-sm";
            } else {
              cardClass += "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-900 text-slate-800 dark:text-slate-200 hover:shadow-sm active:scale-95";
            }

            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(card)}
                className={cardClass}
              >
                <span className={`text-base ${card.type === 'ja' ? 'font-semibold text-lg' : 'text-sm'}`}>
                  {card.text}
                </span>
                {card.type === 'ja' && card.selected && card.romaji && (
                  <span className="text-xs text-amber-500/80 mt-1 font-normal block">{card.romaji}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
