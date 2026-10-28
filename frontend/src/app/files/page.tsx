'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { api, getBaseUrl } from '../utils/api';

interface FileItem {
  name: string;
  sizeBytes: number;
  lineCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function FileManagerPage() {
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [suggestedName, setSuggestedName] = useState('file_1.txt');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Preview Modal State
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    content: string;
    lineCount: number;
    sizeBytes: number;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch files list & suggested name
  const fetchFiles = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await api.get('/api/files/list', { skipCache: true });
      if (res && res.success) {
        setFiles(res.files || []);
        if (res.nextSuggestedName) {
          setSuggestedName(res.nextSuggestedName);
        }
      }
    } catch (err: any) {
      console.error('Lỗi nạp danh sách file:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Compute live metrics for the pasted text
  const metrics = useMemo(() => {
    const chars = content.length;
    // Fast line count calculation
    const lines = content ? content.split(/\r?\n/).length : 0;
    const bytes = new Blob([content]).size;
    const formatBytes = (b: number) => {
      if (b < 1024) return `${b} B`;
      if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
      return `${(b / (1024 * 1024)).toFixed(2)} MB`;
    };
    return {
      lines,
      chars,
      sizeStr: formatBytes(bytes),
      bytes
    };
  }, [content]);

  // Handle Save File
  const handleSaveFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('⚠️ Vui lòng dán hoặc nhập nội dung văn bản trước khi lưu!');
      return;
    }

    setIsSaving(true);
    try {
      const targetName = filename.trim() || suggestedName;
      const res = await api.post('/api/files/save', {
        filename: targetName,
        content
      });

      if (res && res.success) {
        showToast(`🎉 ${res.message || 'Lưu tệp thành công!'}`);
        setContent('');
        setFilename('');
        fetchFiles();
      } else {
        showToast(`❌ ${res?.error || 'Không thể lưu tệp lúc này.'}`);
      }
    } catch (err: any) {
      showToast(`❌ Lỗi: ${err.message || 'Lưu thất bại'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        showToast('⚠️ Trình duyệt không cho phép đọc clipboard tự động. Vui lòng bấm Ctrl+V!');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (!text) {
        showToast('ℹ️ Clipboard đang trống!');
        return;
      }
      setContent(text);
      showToast(`📋 Đã dán ${text.split(/\r?\n/).length.toLocaleString()} dòng từ Clipboard!`);
    } catch (err: any) {
      showToast('⚠️ Không thể đọc Clipboard (Vui lòng bấm Ctrl+V vào ô bên dưới)!');
    }
  };

  // Clear text area
  const handleClear = () => {
    if (!content) return;
    if (confirm('Bạn có chắc chắn muốn xóa trắng ô nhập nội dung này không?')) {
      setContent('');
      showToast('🧹 Đã xóa trắng nội dung soạn thảo.');
    }
  };

  // Auto fill suggested name
  const handleUseSuggestedName = () => {
    setFilename(suggestedName);
    showToast(`⚡ Đã áp dụng tên tự động: ${suggestedName}`);
  };

  // Open Preview Modal
  const handleOpenPreview = async (fileName: string) => {
    setIsLoadingPreview(true);
    try {
      const res = await api.get(`/api/files/content/${encodeURIComponent(fileName)}`, { skipCache: true });
      if (res && res.success) {
        setPreviewFile({
          name: res.name,
          content: res.content,
          lineCount: res.lineCount,
          sizeBytes: res.sizeBytes
        });
      } else {
        showToast(`❌ ${res?.error || 'Không thể đọc nội dung file.'}`);
      }
    } catch (err: any) {
      showToast(`❌ Lỗi đọc file: ${err.message}`);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Handle Download individual file
  const handleDownloadFile = (fileName: string) => {
    const baseUrl = getBaseUrl();
    const downloadUrl = `${baseUrl}/api/files/download/${encodeURIComponent(fileName)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`⬇️ Đang tải về tệp ${fileName}...`);
  };

  // Handle Download All as ZIP
  const handleDownloadAll = () => {
    if (files.length === 0) {
      showToast('⚠️ Chưa có file nào để tải về!');
      return;
    }
    const baseUrl = getBaseUrl();
    const downloadUrl = `${baseUrl}/api/files/download-all`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `all_files_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`📦 Đang đóng gói và tải về toàn bộ ${files.length} tệp tin dạng ZIP...`);
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/api/files/${encodeURIComponent(deleteTarget)}`);
      if (res && res.success) {
        showToast(`🗑️ ${res.message || 'Đã xóa file thành công!'}`);
        setDeleteTarget(null);
        fetchFiles();
      } else {
        showToast(`❌ ${res?.error || 'Không thể xóa file.'}`);
      }
    } catch (err: any) {
      showToast(`❌ Lỗi khi xóa: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter files by search term
  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return files;
    const q = searchTerm.toLowerCase();
    return files.filter(f => f.name.toLowerCase().includes(q));
  }, [files, searchTerm]);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(d);
    } catch {
      return isoString;
    }
  };

  // File extension badge color
  const getFileBadge = (name: string) => {
    const ext = (name.split('.').pop() || '').toLowerCase();
    switch (ext) {
      case 'json':
        return { label: 'JSON', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'md':
        return { label: 'MD', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'csv':
        return { label: 'CSV', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'js':
      case 'ts':
        return { label: 'CODE', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: 'TXT', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    }
  };

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3.5 bg-slate-900/95 border border-indigo-500/60 text-white text-sm font-semibold rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Header Navigation */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <span>←</span>
                <span>Về Dashboard</span>
              </Link>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold">
                ⚡ Hỗ trợ 20.000+ dòng
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Quản Lý & Lưu Trữ Tệp Tin (Text to File Manager)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Dán nội dung văn bản dung lượng lớn, tự động đánh số tăng dần, lưu trữ trên máy chủ và quản lý tải về.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tệp trên máy chủ</div>
              <div className="text-lg font-black text-emerald-400">{files.length} tệp</div>
            </div>
            <button
              onClick={handleDownloadAll}
              disabled={files.length === 0}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs sm:text-sm text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/40 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>📦</span>
              <span>Tải toàn bộ (ZIP)</span>
            </button>
          </div>
        </header>

        {/* 2. Main Grid: Paste Box (Left/Top) & Files List (Right/Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Textarea & Submit Form (7 cols) */}
          <section className="lg:col-span-7 bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📝</span>
                <h2 className="text-base sm:text-lg font-bold text-slate-200">Dán Nội Dung & Tạo File Mới</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Dán nhanh nội dung từ Clipboard"
                >
                  <span>📋</span>
                  <span>Dán Clipboard</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!content}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/40 hover:border-red-700/50 hover:text-red-300 border border-slate-700/60 text-slate-400 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Xóa trắng nội dung"
                >
                  <span>🧹</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveFile} className="space-y-4">
              {/* Filename Input & Auto Suggestion */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="filename-input" className="text-slate-300 flex items-center gap-1.5">
                    <span>🏷️ Tên tệp tin:</span>
                    <span className="text-[11px] text-slate-400 font-normal">(để trống sẽ tự động tăng số)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSuggestedName}
                    className="text-cyan-400 hover:text-cyan-300 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>⚡ Gợi ý: {suggestedName}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="filename-input"
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder={`Ví dụ: ${suggestedName} hoặc de_thi_bai_1.txt`}
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  />
                  {filename && (
                    <button
                      type="button"
                      onClick={() => setFilename('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Textarea Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Nội dung văn bản:</span>
                  <span className="text-[11px]">Hỗ trợ định dạng bất kỳ (Text, JSON, Markdown, CSV, Code...)</span>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Dán nội dung văn bản của bạn vào đây (có thể paste đến 20.000 dòng)..."
                    rows={16}
                    className="w-full bg-transparent text-slate-200 placeholder-slate-400 p-4 text-xs font-mono resize-y focus:outline-none scrollbar-thin scrollbar-thumb-slate-700 leading-relaxed"
                  />
                </div>

                {/* Live Realtime Metrics Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 text-xs">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📝 Số dòng:</span>
                      <span className={`font-mono font-bold ${
                        metrics.lines >= 10000
                          ? 'text-amber-400'
                          : metrics.lines >= 1000
                          ? 'text-cyan-400'
                          : 'text-indigo-300'
                      }`}>
                        {metrics.lines.toLocaleString()} dòng
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">🔤 Ký tự:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {metrics.chars.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">💾 Dung lượng:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {metrics.sizeStr}
                      </span>
                    </div>
                  </div>

                  {metrics.lines >= 20000 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      🚀 File lớn 20K+
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving || !content.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span>
                    <span>Đang ghi file lên server...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">💾</span>
                    <span>Lưu Tệp Tin Lên Máy Chủ</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* RIGHT: Saved Files List (5 cols) */}
          <section className="lg:col-span-5 bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📁</span>
                <h2 className="text-base sm:text-lg font-bold text-slate-200">Tệp Đã Lưu ({files.length})</h2>
              </div>
              <button
                onClick={fetchFiles}
                disabled={isLoadingList}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                title="Làm mới danh sách"
              >
                <span className={isLoadingList ? 'animate-spin' : ''}>🔄</span>
                <span>Làm mới</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên tệp..."
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-2xl px-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Files List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {isLoadingList && files.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <div className="animate-spin text-2xl">⏳</div>
                  <div>Đang tải danh sách tệp tin...</div>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-2xl p-6">
                  <div className="text-3xl">📭</div>
                  <div className="font-semibold text-slate-300">Chưa có tệp tin nào phù hợp</div>
                  <p className="text-[11px] text-slate-400">
                    {searchTerm ? 'Không tìm thấy tệp khớp với từ khóa tìm kiếm.' : 'Hãy dán văn bản ở khung bên trái và bấm Lưu Tệp Tin để bắt đầu.'}
                  </p>
                </div>
              ) : (
                filteredFiles.map((file) => {
                  const badge = getFileBadge(file.name);
                  return (
                    <div
                      key={file.name}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <div className="flex items-center gap-2.5">
                          <span className="text-cyan-400 font-semibold">{file.lineCount.toLocaleString()} dòng</span>
                          <span>•</span>
                          <span className="text-emerald-400">{formatSize(file.sizeBytes)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{formatDate(file.updatedAt || file.createdAt)}</span>
                      </div>

                      {/* Action buttons for each file */}
                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-900">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(file.name)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-indigo-950/60 hover:text-indigo-300 border border-slate-800 text-[11px] font-semibold text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                          title="Xem trước nội dung file"
                        >
                          <span>👁️</span>
                          <span>Xem</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(file.name)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-emerald-950/60 hover:text-emerald-300 border border-slate-800 text-[11px] font-semibold text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                          title="Tải file về máy"
                        >
                          <span>⬇️</span>
                          <span>Tải</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(file.name)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-red-950/60 hover:text-red-300 hover:border-red-800/60 border border-slate-800 text-[11px] font-semibold text-slate-400 transition-all flex items-center gap-1 cursor-pointer"
                          title="Xóa file khỏi máy chủ"
                        >
                          <span>🗑️</span>
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* 3. Preview Content Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👁️</span>
                  <h3 className="font-mono text-sm sm:text-base font-bold text-slate-100 truncate">
                    {previewFile.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>📝 {previewFile.lineCount.toLocaleString()} dòng</span>
                  <span>•</span>
                  <span>💾 {formatSize(previewFile.sizeBytes)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewFile.content);
                    showToast('📋 Đã sao chép toàn bộ nội dung file vào clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📋</span>
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => handleDownloadFile(previewFile.name)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>⬇️</span>
                  <span>Tải về</span>
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-700">
              <pre className="whitespace-pre-wrap break-words leading-relaxed select-text">
                {previewFile.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-base font-bold text-slate-100">Xác Nhận Xóa Tệp Tin</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Bạn có chắc chắn muốn xóa vĩnh viễn tệp <strong className="font-mono text-red-300">{deleteTarget}</strong> khỏi máy chủ không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
