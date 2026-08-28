'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../utils/api';

interface StashItem {
  id: string;
  filename: string;
  line_count: number;
  size_bytes: number;
  created_at: string;
}

export default function StashPage() {
  const [content, setContent] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [savedItems, setSavedItems] = useState<StashItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') || 
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Generate default filename based on current time
  const generateDefaultFilename = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `stash_${timeStr}.txt`;
  };

  useEffect(() => {
    setFilename(generateDefaultFilename());
    fetchSavedItems();
  }, []);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch list of saved items
  const fetchSavedItems = async () => {
    try {
      setIsLoadingList(true);
      setConnectionError(null);
      const data = await api.get('/api/stash', { skipCache: true });
      if (data && data.items) {
        setSavedItems(data.items);
      } else if (Array.isArray(data)) {
        setSavedItems(data);
      } else {
        setSavedItems([]);
      }
    } catch (err: any) {
      console.error('Error fetching stash list:', err);
      setConnectionError(err.message || 'Không thể kết nối máy chủ Backend. Vui lòng kiểm tra server.');
    } finally {
      setIsLoadingList(false);
    }
  };

  // Calculate stats (lines, chars, size) efficiently with ZERO RAM allocation
  const stats = useMemo(() => {
    if (!content) {
      return { lines: 0, chars: 0, sizeKb: '0 KB', sizeMb: '0.00 MB', bytes: 0 };
    }
    const chars = content.length;
    let lines = 1;
    let bytes = 0;

    // Fast single-pass integer loop (runs in < 1ms for 4MB text without array creation)
    for (let i = 0; i < chars; i++) {
      const code = content.charCodeAt(i);
      if (code === 10) lines++; // '\n'
      if (code <= 0x7f) {
        bytes += 1;
      } else if (code <= 0x7ff) {
        bytes += 2;
      } else if (code >= 0xd800 && code <= 0xdbff) {
        bytes += 4;
        i++; // skip surrogate pair
      } else {
        bytes += 3;
      }
    }

    const sizeKb = (bytes / 1024).toFixed(1) + ' KB';
    const sizeMb = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return { lines, chars, sizeKb, sizeMb, bytes };
  }, [content]);

  // Format file size helper
  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format datetime helper
  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // Save / Upload text stash
  const handleSave = async () => {
    if (!content || content.trim().length === 0) {
      alert('Vui lòng dán hoặc nhập nội dung văn bản trước khi lưu.');
      return;
    }

    try {
      setIsSaving(true);
      const cleanFilename = filename.trim() || generateDefaultFilename();
      const sizeStr = stats.bytes > 1024 * 1024 ? stats.sizeMb : stats.sizeKb;
      showToast(`⏳ Đang tải lên máy chủ (${stats.lines.toLocaleString()} dòng / ${sizeStr})...`);

      const data = await api.post('/api/stash', {
        filename: cleanFilename,
        content: content
      });

      if (data && (data.success || data.id)) {
        showToast(`✅ Đã lưu thành công tệp "${cleanFilename}" (${stats.lines.toLocaleString()} dòng / ${sizeStr})!`);
        setFilename(generateDefaultFilename());
        fetchSavedItems();
      }
    } catch (err: any) {
      console.error('Error saving stash:', err);
      alert('Lỗi kết nối máy chủ khi lưu: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  // Direct download file trigger (using client-side Blob for maximum speed & resilience)
  const handleDownload = async (item: StashItem) => {
    try {
      showToast(`⏳ Đang chuẩn bị tải tệp "${item.filename}"...`);
      const data = await api.get(`/api/stash/${item.id}`, { skipCache: true });
      if (data?.item && data.item.content !== undefined) {
        const blob = new Blob([data.item.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`⬇️ Đã tải xong tệp "${item.filename}"!`);
      } else {
        throw new Error('Không có nội dung để tải.');
      }
    } catch (err: any) {
      console.error('Error downloading stash:', err);
      showToast(`⚠️ Lỗi khi tải tệp: ${err.message}`);
    }
  };

  // Load content from saved stash into editor
  const handleLoadContent = async (item: StashItem) => {
    try {
      showToast(`⏳ Đang tải nội dung "${item.filename}"...`);
      const data = await api.get(`/api/stash/${item.id}`, { skipCache: true });
      if (data?.item && data.item.content !== undefined) {
        setContent(data.item.content);
        setFilename(item.filename);
        setActiveItemId(item.id);
        showToast(`📋 Đã nạp "${item.filename}" (${(data.item.line_count || 0).toLocaleString()} dòng) vào ô nhập.`);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      } else {
        alert('Không thể nạp tệp.');
      }
    } catch (err: any) {
      console.error('Error loading stash:', err);
      alert('Lỗi khi nạp tệp: ' + err.message);
    }
  };

  // Copy content directly to clipboard
  const handleCopyContent = async (item: StashItem) => {
    try {
      const data = await api.get(`/api/stash/${item.id}`, { skipCache: true });
      if (data?.item && data.item.content) {
        await navigator.clipboard.writeText(data.item.content);
        showToast(`📋 Đã sao chép toàn bộ nội dung "${item.filename}" vào Clipboard!`);
      }
    } catch (err: any) {
      showToast('⚠️ Không thể tự động sao chép: ' + err.message);
    }
  };

  // Delete saved stash
  const handleDelete = async (item: StashItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tệp "${item.filename}" không?`)) {
      return;
    }

    try {
      await api.delete(`/api/stash/${item.id}`);
      showToast(`🗑️ Đã xóa tệp "${item.filename}".`);
      if (activeItemId === item.id) {
        setActiveItemId(null);
      }
      setSavedItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err: any) {
      alert('Lỗi khi xóa tệp: ' + err.message);
    }
  };

  // Paste from clipboard button
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
        showToast(`📋 Đã dán nội dung từ Clipboard!`);
      } else {
        showToast('Clipboard trống.');
      }
    } catch {
      showToast('💡 Bạn có thể dùng phím tắt Ctrl + V để dán trực tiếp vào ô bên dưới.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-2xl shadow-indigo-500/40 border border-indigo-400 flex items-center space-x-3 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/30">
              📋
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Text Stash
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                  Large File Transfer
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Dán văn bản dung lượng lớn (30.000+ dòng) • Lưu trữ Cloud • Tải về trên bất kỳ máy tính nào
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shadow-sm"
              title="Đổi giao diện Sáng / Tối"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={fetchSavedItems}
              disabled={isLoadingList}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition flex items-center space-x-1.5 shadow-sm"
              title="Tải lại danh sách tệp"
            >
              <span className={isLoadingList ? 'animate-spin' : ''}>🔄</span>
              <span className="hidden sm:inline">Làm mới danh sách</span>
            </button>
          </div>
        </header>

        {/* Input & Control Card */}
        <section className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filename input */}
            <div className="flex-1 flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                📄 Tên tệp:
              </span>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="VD: code_backup.txt, dump.sql, data.json..."
                className="w-full max-w-md px-3.5 py-2 rounded-xl text-sm font-mono font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5"
                title="Dán từ Clipboard"
              >
                <span>📋 Dán từ Clipboard</span>
              </button>

              <button
                type="button"
                onClick={() => setContent('')}
                disabled={!content}
                className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
                title="Xóa trắng nội dung"
              >
                <span>🗑️ Dọn trống</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !content || content.trim().length === 0}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>LƯU TỆP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Statistics Banner */}
          <div className="px-5 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm font-medium">
            <div className="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-300 font-bold">
              <span>📊 Số dòng:</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-200/70 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-100 font-mono text-sm">
                {stats.lines.toLocaleString()} dòng
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
              <span>🔤 Ký tự:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {stats.chars.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
              <span>💾 Dung lượng:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {stats.bytes > 1024 * 1024 ? stats.sizeMb : stats.sizeKb}
              </span>
            </div>

            {stats.lines > 10000 && (
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ⚡ Tệp lớn ({stats.lines.toLocaleString()} dòng)
              </span>
            )}
          </div>

          {/* Big Textarea */}
          <div className="p-4 sm:p-5">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dán văn bản lớn (hỗ trợ tới 50.000+ dòng hoặc 50MB) vào đây..."
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              className="w-full h-[460px] sm:h-[540px] p-4 rounded-xl font-mono text-xs sm:text-sm leading-relaxed bg-slate-950 text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y shadow-inner"
              style={{
                tabSize: 2,
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflowX: 'auto'
              }}
            />
          </div>
        </section>

        {/* Saved Stashes List */}
        <section className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📂</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Danh Sách Tệp Đã Lưu ({savedItems.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Mở trang này trên máy khác để tải về
            </span>
          </div>

          {connectionError && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-start space-x-2.5">
                <span className="text-xl shrink-0">⚠️</span>
                <div>
                  <p className="font-bold">Không thể kết nối với máy chủ Backend:</p>
                  <p className="text-amber-800 dark:text-amber-300 font-mono text-xs mt-0.5">{connectionError}</p>
                  <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                    Nếu đang chạy cục bộ, vui lòng bật server backend (cổng 8080). Nếu trên Render, server có thể đang khởi động lại (vui lòng chờ 30s).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchSavedItems}
                className="self-end sm:self-center px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow transition"
              >
                🔄 Thử lại
              </button>
            </div>
          )}

          {isLoadingList ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <span className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
              <span className="text-sm font-medium">Đang tải danh sách tệp đã lưu...</span>
            </div>
          ) : savedItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <span className="text-4xl block">📭</span>
              <p className="text-sm font-medium">Chưa có tệp nào được lưu.</p>
              <p className="text-xs">Dán văn bản vào ô bên trên và nhấn "LƯU TỆP" để lưu tệp đầu tiên.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-indigo-300 dark:hover:border-indigo-700/80 transition shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-white break-all leading-tight">
                        📄 {item.filename}
                      </h3>
                      <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
                        {formatSize(item.size_bytes)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        📊 {(item.line_count || 0).toLocaleString()} dòng
                      </span>
                      <span>•</span>
                      <span>🕒 {formatDate(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="col-span-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm"
                      title="Tải tệp về máy tính này"
                    >
                      <span>⬇️</span>
                      <span>Tải về</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadContent(item)}
                      className="px-2 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center"
                      title="Nạp nội dung vào ô nhập bên trên"
                    >
                      <span>👁️ Xem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="px-2 py-2 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition flex items-center justify-center"
                      title="Xóa tệp này"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
