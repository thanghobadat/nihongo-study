'use client';

import React, { useState, useEffect, useRef } from 'react';

interface StrokePath {
  id: string;
  d: string;
}

interface StrokeNumber {
  text: string;
  x: number;
  y: number;
}

interface KanjiStrokePlayerProps {
  character: string;
  sinoVietnamese?: string;
  size?: number;
  className?: string;
}

export default function KanjiStrokePlayer({
  character,
  sinoVietnamese = '',
  size = 260,
  className = ''
}: KanjiStrokePlayerProps) {
  const [paths, setPaths] = useState<StrokePath[]>([]);
  const [strokeNumbers, setStrokeNumbers] = useState<StrokeNumber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentStroke, setCurrentStroke] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1 = normal, 0.5 = slow
  const [showNumbers, setShowNumbers] = useState<boolean>(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch KanjiVG SVG data
  useEffect(() => {
    if (!character) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setCurrentStroke(0);
    setIsPlaying(false);

    const codePoint = character.codePointAt(0);
    if (!codePoint) {
      setError('Ký tự không hợp lệ');
      setLoading(false);
      return;
    }

    const hexCode = codePoint.toString(16).toLowerCase().padStart(5, '0');
    const svgUrl = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${hexCode}.svg`;

    fetch(svgUrl)
      .then(res => {
        if (!res.ok) throw new Error(`Không tải được SVG (HTTP ${res.status})`);
        return res.text();
      })
      .then(svgText => {
        if (!isMounted) return;

        // Parse SVG using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');

        // Extract all stroke paths
        const pathElements = Array.from(doc.querySelectorAll('path[id^="kvg:"]'));
        const parsedPaths: StrokePath[] = pathElements.map((el, idx) => ({
          id: el.getAttribute('id') || `stroke-${idx}`,
          d: el.getAttribute('d') || ''
        })).filter(p => p.d.length > 0);

        // Extract stroke numbers if available
        const textElements = Array.from(doc.querySelectorAll('text'));
        const parsedNumbers: StrokeNumber[] = textElements.map(el => {
          const transform = el.getAttribute('transform') || '';
          const match = transform.match(/matrix\(1\s+0\s+0\s+1\s+([0-9.-]+)\s+([0-9.-]+)\)/);
          const x = match ? parseFloat(match[1]) : 0;
          const y = match ? parseFloat(match[2]) : 0;
          return {
            text: el.textContent || '',
            x,
            y
          };
        }).filter(n => n.text.length > 0);

        if (parsedPaths.length === 0) {
          throw new Error('Dữ liệu nét vẽ trống');
        }

        setPaths(parsedPaths);
        setStrokeNumbers(parsedNumbers);
        setCurrentStroke(parsedPaths.length); // Mặc định hiển thị đầy đủ
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn(`[KanjiStrokePlayer] Error loading SVG for ${character}:`, err.message);
        setError('Không tìm thấy dữ liệu nét vẽ trực tuyến');
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [character]);

  // Handle animation timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(750 / speed);
      timerRef.current = setInterval(() => {
        setCurrentStroke(prev => {
          if (prev >= paths.length) {
            setIsPlaying(false);
            return paths.length;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, paths.length, speed]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStroke >= paths.length) {
        setCurrentStroke(0);
      }
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    setCurrentStroke(0);
    setIsPlaying(true);
  };

  const handlePrevStroke = () => {
    setIsPlaying(false);
    setCurrentStroke(prev => Math.max(0, prev - 1));
  };

  const handleNextStroke = () => {
    setIsPlaying(false);
    setCurrentStroke(prev => Math.min(paths.length, prev + 1));
  };

  const handleShowAll = () => {
    setIsPlaying(false);
    setCurrentStroke(paths.length);
  };

  return (
    <div className={`flex flex-col items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 shadow-inner ${className}`}>
      {/* Khung vẽ chữ điền Tian Zi Ge */}
      <div
        className="relative bg-slate-950/80 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Nền ô chữ điền 田字格 (nét đứt) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          viewBox="0 0 109 109"
        >
          {/* Trục ngang */}
          <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
          {/* Trục dọc */}
          <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
          {/* Đường chéo 1 */}
          <line x1="0" y1="0" x2="109" y2="109" stroke="#64748b" strokeWidth="0.7" strokeDasharray="3,3" />
          {/* Đường chéo 2 */}
          <line x1="109" y1="0" x2="0" y2="109" stroke="#64748b" strokeWidth="0.7" strokeDasharray="3,3" />
        </svg>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Đang tải nét vẽ...</span>
          </div>
        ) : error || paths.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <span className="text-6xl font-bold text-slate-200 mb-1">{character}</span>
            <span className="text-xs text-amber-400/90">{error || 'Không có mẫu động'}</span>
            <span className="text-[11px] text-slate-400 mt-1">
              {character} • {sinoVietnamese}
            </span>
          </div>
        ) : (
          <svg
            className="w-full h-full"
            viewBox="0 0 109 109"
            style={{ width: size, height: size }}
          >
            {/* Các nét mờ tham chiếu toàn bộ chữ (nét xám nhạt phía sau) */}
            <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
              {paths.map(p => (
                <path key={`bg-${p.id}`} d={p.d} />
              ))}
            </g>

            {/* Các nét đã vẽ (màu trắng sáng / xanh nổi bật) */}
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              {paths.slice(0, currentStroke).map((p, idx) => {
                const isLatest = idx === currentStroke - 1;
                return (
                  <path
                    key={`stroke-${p.id}`}
                    d={p.d}
                    stroke={isLatest && isPlaying ? '#38bdf8' : '#f8fafc'}
                    strokeWidth={isLatest && isPlaying ? '4' : '3.6'}
                    className={isLatest && isPlaying ? 'transition-all duration-300' : ''}
                  />
                );
              })}
            </g>

            {/* Hiển thị số thứ tự nét nếu được bật */}
            {showNumbers && strokeNumbers.length > 0 && (
              <g fill="#38bdf8" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                {strokeNumbers.slice(0, Math.max(1, currentStroke)).map((n, idx) => (
                  <text
                    key={`num-${idx}`}
                    x={n.x}
                    y={n.y}
                    className="select-none transition-opacity duration-200"
                    opacity={idx < currentStroke ? '1' : '0.4'}
                  >
                    {n.text}
                  </text>
                ))}
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Thanh tiến trình & Đếm nét */}
      {!loading && !error && paths.length > 0 && (
        <div className="w-full flex items-center justify-between mt-3 px-1 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-200 font-bold">{character}</span>
            <span className="text-indigo-400">({sinoVietnamese})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono font-semibold border border-slate-700/80">
              Nét: {currentStroke} / {paths.length}
            </span>
          </div>
        </div>
      )}

      {/* Bảng điều khiển nút bấm */}
      {!loading && !error && paths.length > 0 && (
        <div className="w-full flex flex-col gap-2 mt-2">
          {/* Hàng nút điều hướng nét */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={handlePrevStroke}
              disabled={currentStroke <= 0}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
              title="Lùi lại 1 nét"
            >
              ⏮️ Trước
            </button>
            <button
              onClick={handlePlayPause}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1 cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
              }`}
            >
              {isPlaying ? '⏸️ Tạm dừng' : '▶️ Tự chạy'}
            </button>
            <button
              onClick={handleNextStroke}
              disabled={currentStroke >= paths.length}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
              title="Tiến lên 1 nét"
            >
              Sau ⏭️
            </button>
            <button
              onClick={handleReplay}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
              title="Phát lại từ nét 1"
            >
              🔁 Lại từ đầu
            </button>
          </div>

          {/* Hàng tùy chọn phụ trợ */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
            <button
              onClick={() => setShowNumbers(!showNumbers)}
              className={`px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                showNumbers
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              🔢 {showNumbers ? 'Số thứ tự: Bật' : 'Số thứ tự: Tắt'}
            </button>

            <button
              onClick={() => setSpeed(prev => (prev === 1 ? 0.5 : 1))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition cursor-pointer"
            >
              ⚡ Tốc độ: {speed === 1 ? '1x (Chuẩn)' : '0.5x (Chậm)'}
            </button>

            <button
              onClick={handleShowAll}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition cursor-pointer"
              title="Hiện đầy đủ cả chữ"
            >
              👁️ Đầy đủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
