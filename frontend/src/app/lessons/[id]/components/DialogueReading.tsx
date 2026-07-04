'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { playAudioWithFallback } from '../../../utils/audioHelper';

interface DialogueItem {
  id: number;
  speaker: string;
  japanese: string;
  romaji: string;
  vietnamese: string;
}

interface DialogueReadingProps {
  dialogueItems: DialogueItem[];
}

export default function DialogueReading({ dialogueItems }: DialogueReadingProps) {
  const [showRomaji, setShowRomaji] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);
  
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeIndexRef = useRef<number | null>(null);

  // Dừng auto-play
  const stopAutoPlay = useCallback(() => {
    setIsPlayingAll(false);
    setActiveSpeechIndex(null);
    activeIndexRef.current = null;
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  // Thực thi phát âm từng câu thoại
  const playSpeech = useCallback((index: number) => {
    if (index >= dialogueItems.length) {
      stopAutoPlay();
      return;
    }

    setActiveSpeechIndex(index);
    activeIndexRef.current = index;
    const item = dialogueItems[index];

    // Phát âm câu thoại
    playAudioWithFallback(item.japanese, item.japanese);

    // Ở chế độ phát tự động, chờ 3.5s rồi phát tiếp câu sau
    if (isPlayingAll) {
      autoPlayTimerRef.current = setTimeout(() => {
        playSpeech(index + 1);
      }, 3500);
    }
  }, [dialogueItems, isPlayingAll, stopAutoPlay]);

  // Bật/tắt phát tự động (Auto Play)
  const toggleAutoPlay = () => {
    if (isPlayingAll) {
      stopAutoPlay();
    } else {
      setIsPlayingAll(true);
      playSpeech(0);
    }
  };

  // Click phát đơn lẻ từng câu thoại
  const handleSinglePlay = (index: number) => {
    stopAutoPlay(); // Dừng chạy tự động nếu có
    playSpeech(index);
    // Tự động bỏ active highlight sau 2.5 giây
    setTimeout(() => {
      setActiveSpeechIndex(prev => prev === index ? null : prev);
    }, 2500);
  };

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, []);

  // Theo dõi sự thay đổi của trạng thái phát tự động để bắt đầu chạy
  useEffect(() => {
    if (isPlayingAll && activeIndexRef.current === null) {
      playSpeech(0);
    }
  }, [isPlayingAll, playSpeech]);

  if (dialogueItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center">
        <p className="text-slate-500 dark:text-slate-400">Không có dữ liệu hội thoại cho bài học này.</p>
      </div>
    );
  }

  // Phân biệt 2 nhân vật (ví dụ: Speaker 1 là nhân vật đầu tiên xuất hiện trong danh sách)
  const primarySpeaker = dialogueItems[0]?.speaker;

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleAutoPlay}
            className={`px-4 py-2 text-sm font-bold rounded-xl active:scale-[0.98] transition-all flex items-center gap-2 ${
              isPlayingAll
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-[#b5179e] hover:bg-[#7209b7] text-white shadow-md shadow-pink-500/10'
            }`}
          >
            {isPlayingAll ? '⏹️ Dừng đọc' : '▶️ Tự động đọc (Shadowing)'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRomaji}
              onChange={(e) => setShowRomaji(e.target.checked)}
              className="rounded text-[#b5179e] focus:ring-[#b5179e] border-slate-300 w-4 h-4"
            />
            Hiện Romaji
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showVietnamese}
              onChange={(e) => setShowVietnamese(e.target.checked)}
              className="rounded text-[#b5179e] focus:ring-[#b5179e] border-slate-300 w-4 h-4"
            />
            Hiện dịch Việt
          </label>
        </div>
      </div>

      {/* Chat Windows Area */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {dialogueItems.map((item, index) => {
          // Xác định vị trí hiển thị: Trái hay Phải
          // Nhân vật đầu tiên (primarySpeaker) nằm bên Phải (Right), nhân vật khác nằm bên Trái (Left)
          const isRight = item.speaker === primarySpeaker;
          const isActive = activeSpeechIndex === index;

          return (
            <div
              key={item.id}
              className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}
            >
              {/* Speaker Label */}
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 px-3">
                {item.speaker}
              </span>

              {/* Chat Bubble Layout */}
              <div className={`flex items-center gap-2.5 max-w-[85%] ${isRight ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Loa Button */}
                <button
                  onClick={() => handleSinglePlay(index)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90 text-sm ${
                    isActive 
                      ? 'bg-amber-100 border-amber-300 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                  }`}
                  title="Đọc câu thoại"
                >
                  🔊
                </button>

                {/* Bubble box */}
                <div
                  onClick={() => handleSinglePlay(index)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isRight
                      ? `bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-tr-sm dark:bg-indigo-950/20 dark:border-indigo-900/60 dark:text-indigo-200 ${
                          isActive ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''
                        }`
                      : `bg-slate-100 border border-slate-200/50 text-slate-800 rounded-tl-sm dark:bg-slate-800/80 dark:border-slate-800/80 dark:text-slate-200 ${
                          isActive ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''
                        }`
                  }`}
                >
                  {/* Japanese Text */}
                  <p className="text-base font-semibold leading-relaxed tracking-wide">
                    {item.japanese}
                  </p>

                  {/* Romaji */}
                  {showRomaji && item.romaji && (
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1.5 select-all">
                      {item.romaji}
                    </p>
                  )}

                  {/* Vietnamese Translate */}
                  {showVietnamese && item.vietnamese && (
                    <p className="text-sm font-medium border-t border-slate-200/40 dark:border-slate-700/40 pt-1.5 mt-1.5 opacity-90 text-slate-600 dark:text-slate-400">
                      {item.vietnamese}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
