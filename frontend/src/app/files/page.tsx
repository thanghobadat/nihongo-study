'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { api, getBaseUrl } from '../utils/api';

interface FileItem {
  name: string;
  sizeBytes: number;
  lineCount: number;
  createdAt: string;
  updatedAt: string;
}

type QueueStatus = 'pending' | 'uploading' | 'done' | 'error';

interface BatchQueueItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  status: QueueStatus;
  progressPct: number;
  detail: string;
  savedLineCount?: number;
  errorMsg?: string;
}

// 64 KB Base64 characters per chunk (~48 KB binary, well inside Cloudflare/QUIC/Render limits)
const CHUNK_SIZE_CHARS = 65536;
const MAX_CHUNK_RETRIES = 4;

/**
 * Format byte count into human-readable string
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Fast O(N) zero-allocation line counter for strings
 */
function countStringLinesFast(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  let lines = 1;
  for (let i = 0; i < len; i++) {
    const c = str.charCodeAt(i);
    if (c === 10) {
      lines++;
    } else if (c === 13 && str.charCodeAt(i + 1) !== 10) {
      lines++;
    }
  }
  return lines;
}

/**
 * Safe Uint8Array -> Base64 encoder without call-stack overflow on large files
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  const SLICE = 16384;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += SLICE) {
    const end = Math.min(i + SLICE, bytes.length);
    let chunkStr = '';
    for (let j = i; j < end; j++) {
      chunkStr += String.fromCharCode(bytes[j]);
    }
    parts.push(chunkStr);
  }
  return btoa(parts.join(''));
}

/**
 * Compress bytes in browser via native GZIP CompressionStream (shrinks JSON ~5x);
 * gracefully falls back to uncompressed bytes if unavailable.
 */
async function compressBytesIfSupported(
  rawBytes: Uint8Array
): Promise<{ payload: Uint8Array; compressed: 'gzip' | 'none' }> {
  if (typeof CompressionStream === 'undefined' || rawBytes.length < 512) {
    return { payload: rawBytes, compressed: 'none' };
  }
  try {
    const blob = new Blob([rawBytes as unknown as BlobPart]);
    const compressedStream = blob.stream().pipeThrough(new CompressionStream('gzip'));
    const ab = await new Response(compressedStream).arrayBuffer();
    return { payload: new Uint8Array(ab), compressed: 'gzip' };
  } catch {
    return { payload: rawBytes, compressed: 'none' };
  }
}

/**
 * Sleep helper for retry exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send a single chunk to POST /api/files/save-chunk with 4x exponential backoff retry
 */
async function postChunkWithRetry(
  body: {
    uploadId: string;
    filename: string;
    chunkIndex: number;
    totalChunks: number;
    chunkBase64: string;
    compressed: 'gzip' | 'none';
  },
  onRetryNotice?: (attempt: number, maxRetries: number) => void
): Promise<any> {
  let lastErr: any = null;
  for (let attempt = 0; attempt <= MAX_CHUNK_RETRIES; attempt++) {
    try {
      const res = await api.post('/api/files/save-chunk', body, { skipCache: true });
      if (res && res.success) {
        return res;
      }
      throw new Error(res?.error || 'Máy chủ phản hồi lỗi khi lưu mảnh dữ liệu.');
    } catch (err: any) {
      lastErr = err;
      if (attempt < MAX_CHUNK_RETRIES) {
        const backoffMs = 1000 * Math.pow(2, attempt); // 1s -> 2s -> 4s -> 8s
        if (onRetryNotice) {
          onRetryNotice(attempt + 1, MAX_CHUNK_RETRIES);
        }
        await sleep(backoffMs);
      }
    }
  }
  throw lastErr || new Error('Tải mảnh dữ liệu thất bại sau nhiều lần thử lại.');
}

/**
 * Compress, slice into 64 KB Base64 chunks, and upload sequentially with retry
 */
async function uploadBytesChunked(
  rawBytes: Uint8Array,
  targetFilename: string,
  onProgress?: (pct: number, detail: string) => void,
  abortSignal?: { aborted: boolean }
): Promise<any> {
  if (abortSignal?.aborted) {
    throw new Error('Đã tạm dừng tải lên.');
  }

  onProgress?.(5, 'Đang nén GZIP...');
  const { payload, compressed } = await compressBytesIfSupported(rawBytes);
  const b64 = uint8ArrayToBase64(payload);
  const totalChunks = Math.max(1, Math.ceil(b64.length / CHUNK_SIZE_CHARS));
  const uploadId = `up_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

  let finalResponse: any = null;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    if (abortSignal?.aborted) {
      throw new Error('Đã tạm dừng tải lên.');
    }

    const start = chunkIndex * CHUNK_SIZE_CHARS;
    const chunkBase64 = b64.slice(start, start + CHUNK_SIZE_CHARS);

    const startPct = Math.round((chunkIndex / totalChunks) * 90) + 8;
    onProgress?.(startPct, `Mảnh ${chunkIndex + 1}/${totalChunks}`);

    finalResponse = await postChunkWithRetry(
      {
        uploadId,
        filename: targetFilename,
        chunkIndex,
        totalChunks,
        chunkBase64,
        compressed
      },
      (attempt, maxRetries) => {
        onProgress?.(
          startPct,
          `Thử lại mảnh ${chunkIndex + 1}/${totalChunks} (${attempt}/${maxRetries})...`
        );
      }
    );

    const donePct = Math.min(99, Math.round(((chunkIndex + 1) / totalChunks) * 92) + 8);
    onProgress?.(donePct, `Đã gửi ${chunkIndex + 1}/${totalChunks} mảnh`);
  }

  onProgress?.(100, 'Hoàn tất');
  return finalResponse;
}

export default function FileManagerPage() {
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [suggestedName, setSuggestedName] = useState('file_1.txt');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [manualUploadStatus, setManualUploadStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Batch Multi-File Upload Queue State (50+ files in 1 batch)
  const [batchQueue, setBatchQueue] = useState<BatchQueueItem[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchAbortRef = useRef<{ aborted: boolean }>({ aborted: false });

  // Preview Modal State
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    content: string;
    lineCount: number;
    sizeBytes: number;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Delete Confirmation State (Single & Delete All)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
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

  // Compute live metrics for the pasted text with O(N) zero-allocation scan
  const metrics = useMemo(() => {
    const chars = content.length;
    if (chars === 0) {
      return { lines: 0, chars: 0, sizeStr: '0 B', bytes: 0 };
    }

    let lines = 1;
    let bytes = 0;
    for (let i = 0; i < chars; i++) {
      const code = content.charCodeAt(i);
      if (code === 10) {
        lines++;
      } else if (code === 13 && content.charCodeAt(i + 1) !== 10) {
        lines++;
      }

      if (code <= 0x7f) {
        bytes += 1;
      } else if (code <= 0x7ff) {
        bytes += 2;
      } else if (code >= 0xd800 && code <= 0xdbff) {
        bytes += 4;
        i++;
      } else {
        bytes += 3;
      }
    }

    return {
      lines,
      chars,
      sizeStr: formatSize(bytes),
      bytes
    };
  }, [content]);

  // Batch Queue Summary Metrics
  const batchSummary = useMemo(() => {
    const total = batchQueue.length;
    let doneCount = 0;
    let errorCount = 0;
    let pendingCount = 0;
    let uploadingCount = 0;
    let totalBytes = 0;
    let progressSum = 0;

    for (const item of batchQueue) {
      totalBytes += item.sizeBytes;
      progressSum += item.status === 'done' ? 100 : item.progressPct;
      if (item.status === 'done') doneCount++;
      else if (item.status === 'error') errorCount++;
      else if (item.status === 'uploading') uploadingCount++;
      else pendingCount++;
    }

    const overallPct = total > 0 ? Math.round(progressSum / total) : 0;
    return {
      total,
      doneCount,
      errorCount,
      pendingCount,
      uploadingCount,
       actionableCount: pendingCount + errorCount,
      totalBytes,
      overallPct
    };
  }, [batchQueue]);

  // Add selected or dropped files into Batch Queue (deduplicating by filename within pending queue)
  const addFilesToQueue = useCallback(
    (incomingFiles: FileList | File[]) => {
      const arr = Array.from(incomingFiles || []);
      if (arr.length === 0) return;

      setBatchQueue((prev) => {
        const next = [...prev];
        for (const f of arr) {
          const existingIdx = next.findIndex((item) => item.name === f.name);
          const newItem: BatchQueueItem = {
            id: `${f.name}_${f.size}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            file: f,
            name: f.name,
            sizeBytes: f.size,
            status: 'pending',
            progressPct: 0,
            detail: 'Chờ tải lên'
          };
          if (existingIdx >= 0 && next[existingIdx].status !== 'uploading') {
            next[existingIdx] = newItem;
          } else if (existingIdx < 0) {
            next.push(newItem);
          }
        }
        return next;
      });

      showToast(`📂 Đã thêm ${arr.length} tệp vào hàng đợi tải lên!`);
    },
    [showToast]
  );

  // Handle file input selection
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files);
      e.target.value = '';
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  // Execute sequential batch upload for all pending / failed items
  const handleStartBatchUpload = async () => {
    if (isBatchRunning) return;

    const targets = batchQueue.filter((item) => item.status === 'pending' || item.status === 'error');
    if (targets.length === 0) {
      showToast('ℹ️ Tất cả tệp trong hàng đợi đã được tải lên thành công!');
      return;
    }

    setIsBatchRunning(true);
    batchAbortRef.current = { aborted: false };

    let uploadedInRun = 0;
    let failedInRun = 0;

    for (let i = 0; i < targets.length; i++) {
      if (batchAbortRef.current.aborted) {
        break;
      }

      const target = targets[i];

      setBatchQueue((prev) =>
        prev.map((it) =>
          it.id === target.id
            ? { ...it, status: 'uploading', progressPct: 2, detail: 'Đang đọc tệp...', errorMsg: undefined }
            : it
        )
      );

      try {
        // Read only ONE file into memory at a time so 50-100 large files never spike browser RAM
        const ab = await target.file.arrayBuffer();
        const rawBytes = new Uint8Array(ab);

        const res = await uploadBytesChunked(
          rawBytes,
          target.name,
          (pct, detail) => {
            setBatchQueue((prev) =>
              prev.map((it) => (it.id === target.id ? { ...it, progressPct: pct, detail } : it))
            );
          },
          batchAbortRef.current
        );

        uploadedInRun++;
        const savedLines = res?.file?.lineCount;

        setBatchQueue((prev) =>
          prev.map((it) =>
            it.id === target.id
              ? {
                  ...it,
                  status: 'done',
                  progressPct: 100,
                  savedLineCount: savedLines,
                  detail: savedLines ? `${savedLines.toLocaleString()} dòng` : 'Đã lưu'
                }
              : it
          )
        );

        // Refresh server list periodically every 5 files so UI updates smoothly
        if (uploadedInRun % 5 === 0) {
          fetchFiles();
        }
      } catch (err: any) {
        if (batchAbortRef.current.aborted) {
          setBatchQueue((prev) =>
            prev.map((it) =>
              it.id === target.id
                ? { ...it, status: 'pending', progressPct: 0, detail: 'Đã tạm dừng' }
                : it
            )
          );
          break;
        }

        failedInRun++;
        const errMsg = err?.message || 'Lỗi kết nối';
        setBatchQueue((prev) =>
          prev.map((it) =>
            it.id === target.id
              ? { ...it, status: 'error', detail: `Lỗi: ${errMsg}`, errorMsg: errMsg }
              : it
          )
        );
      }
    }

    setIsBatchRunning(false);
    await fetchFiles();

    if (batchAbortRef.current.aborted) {
      showToast(`⏸️ Đã tạm dừng! Đã tải xong ${uploadedInRun} tệp.`);
    } else if (failedInRun === 0) {
      showToast(`🎉 Tuyệt vời! Đã đẩy thành công toàn bộ ${uploadedInRun} tệp lên máy chủ!`);
    } else {
      showToast(`⚠️ Đã tải ${uploadedInRun} tệp thành công, ${failedInRun} tệp lỗi (bấm "Đẩy lại tệp lỗi" để tiếp tục).`);
    }
  };

  // Stop/Pause active batch upload
  const handleStopBatch = () => {
    batchAbortRef.current.aborted = true;
    showToast('⏹️ Đang tạm dừng sau mảnh hiện tại...');
  };

  // Remove single item from queue
  const handleRemoveQueueItem = (id: string) => {
    setBatchQueue((prev) => prev.filter((it) => it.id !== id));
  };

  // Clear entire batch queue UI
  const handleClearQueue = () => {
    if (isBatchRunning) return;
    setBatchQueue([]);
  };

  // Handle Manual Paste Save File (also uses GZIP + Chunked Base64 + Auto-Retry!)
  const handleSaveFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('⚠️ Vui lòng dán hoặc nhập nội dung văn bản trước khi lưu!');
      return;
    }

    setIsSaving(true);
    setManualUploadStatus('Đang chuẩn bị dữ liệu...');
    try {
      const targetName = filename.trim() || suggestedName;
      const rawBytes = new TextEncoder().encode(content);

      const res = await uploadBytesChunked(rawBytes, targetName, (pct, detail) => {
        setManualUploadStatus(`Đang nén & tải lên... ${pct}% (${detail})`);
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
      setManualUploadStatus('');
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
      showToast(`📋 Đã dán ${countStringLinesFast(text).toLocaleString()} dòng từ Clipboard!`);
    } catch {
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
    showToast(`⏳ Đang nạp nội dung ${fileName}...`);
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

  // Handle Download All as Streamed ZIP
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
    showToast(`📦 Đang đóng gói Stream ZIP toàn bộ ${files.length} tệp tin...`);
  };

  // Handle Delete Single File
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

  // Handle Delete All Files
  const handleConfirmDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete('/api/files');
      if (res && res.success) {
        showToast(`🧹 ${res.message || 'Đã xóa sạch toàn bộ tệp trên máy chủ!'}`);
        setShowDeleteAllModal(false);
        fetchFiles();
      } else {
        showToast(`❌ ${res?.error || 'Không thể xóa toàn bộ tệp.'}`);
      }
    } catch (err: any) {
      showToast(`❌ Lỗi khi xóa tất cả: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter files by search term
  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return files;
    const q = searchTerm.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, searchTerm]);

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
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <span>←</span>
                <span>Về Dashboard</span>
              </Link>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold">
                ⚡ Hỗ trợ 20.000+ dòng / file
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                🚀 Batch 50+ file 1 lần • Lưu vĩnh viễn Cloud
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Quản Lý & Lưu Trữ Tệp Tin (Batch & Text File Manager)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Đẩy hàng loạt 50+ bộ câu hỏi JSON/TXT dung lượng lớn (nén GZIP + chia mảnh tự động chống rớt mạng) hoặc dán trực tiếp văn bản.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
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
            <button
              onClick={() => setShowDeleteAllModal(true)}
              disabled={files.length === 0 || isBatchRunning}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-red-950/70 border border-slate-700 hover:border-red-600/60 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs sm:text-sm text-slate-300 hover:text-red-300 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Xóa toàn bộ tệp đã lưu trên máy chủ"
            >
              <span>🗑️</span>
              <span>Xóa tất cả</span>
            </button>
          </div>
        </header>

        {/* 2. Main Grid: Batch + Paste Box (Left 7 cols) & Saved Files List (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (7 cols): Batch Multi-File Upload + Manual Paste */}
          <div className="lg:col-span-7 space-y-6">
            {/* 2A. BATCH MULTI-FILE UPLOAD CARD (50+ FILES IN ONE GO) */}
            <section className="bg-slate-900/75 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🚀</span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-100">
                      Đẩy Hàng Loạt 50+ File Cùng Lúc (Batch Upload)
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Chọn Ctrl+A cả 50 bộ JSON/TXT (15.000+ dòng/file) — tự động nén GZIP, cắt mảnh 64KB & tự thử lại nếu mạng chập chờn
                    </p>
                  </div>
                </div>
              </div>

              {/* Hidden Multiple File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".json,.txt,.md,.csv,.js,.ts,.tsx,.sql,.xml,.yaml,.yml,text/*,application/json"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isBatchRunning && fileInputRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                  isBatchRunning
                    ? 'border-slate-700 bg-slate-950/50 cursor-not-allowed opacity-70'
                    : isDragOver
                    ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01] cursor-pointer'
                    : 'border-slate-700 hover:border-cyan-500/70 bg-slate-950/60 hover:bg-slate-950/90 cursor-pointer'
                }`}
              >
                <div className="text-3xl mb-2">📂</div>
                <div className="text-xs sm:text-sm font-bold text-slate-200">
                  Bấm vào đây để chọn nhiều tệp (50+ file) hoặc Kéo-Thả cả cụm file vào khung này
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Giữ nguyên 100% tên file gốc • Hỗ trợ <span className="text-amber-300 font-mono">.json</span>,{' '}
                  <span className="text-indigo-300 font-mono">.txt</span>,{' '}
                  <span className="text-emerald-300 font-mono">.md</span>,{' '}
                  <span className="text-purple-300 font-mono">.csv</span>...
                </div>
              </div>

              {/* Batch Queue Progress & List */}
              {batchQueue.length > 0 && (
                <div className="space-y-3 pt-1">
                  {/* Overall Progress Bar */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="font-bold text-slate-200">
                        Tiến độ hàng đợi: {batchSummary.doneCount} / {batchSummary.total} tệp ({batchSummary.overallPct}%)
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="text-slate-400">Tổng: {formatSize(batchSummary.totalBytes)}</span>
                        <span className="text-emerald-400 font-bold">✅ {batchSummary.doneCount}</span>
                        {batchSummary.errorCount > 0 && (
                          <span className="text-red-400 font-bold">❌ {batchSummary.errorCount}</span>
                        )}
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 transition-all duration-200"
                        style={{ width: `${batchSummary.overallPct}%` }}
                      />
                    </div>

                    {/* Batch Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!isBatchRunning ? (
                          <button
                            type="button"
                            onClick={handleStartBatchUpload}
                            disabled={batchSummary.actionableCount === 0}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white shadow-lg shadow-cyan-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>🚀</span>
                            <span>
                              {batchSummary.errorCount > 0 && batchSummary.pendingCount === 0
                                ? `Đẩy lại ${batchSummary.errorCount} tệp lỗi`
                                : `Bắt đầu đẩy ${batchSummary.actionableCount} tệp lên Server`}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleStopBatch}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>⏸️</span>
                            <span>Tạm dừng</span>
                          </button>
                        )}

                        {!isBatchRunning && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                          >
                            ➕ Thêm tệp
                          </button>
                        )}
                      </div>

                      {!isBatchRunning && (
                        <button
                          type="button"
                          onClick={handleClearQueue}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                        >
                          🧹 Đóng danh sách hàng đợi
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Per-File Queue Items */}
                  <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                    {batchQueue.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          item.status === 'uploading'
                            ? 'bg-indigo-950/40 border-indigo-500/60'
                            : item.status === 'done'
                            ? 'bg-emerald-950/20 border-emerald-800/40'
                            : item.status === 'error'
                            ? 'bg-red-950/30 border-red-700/50'
                            : 'bg-slate-950/70 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-slate-400 w-6 shrink-0">#{idx + 1}</span>
                          <span className="shrink-0">
                            {item.status === 'done'
                              ? '✅'
                              : item.status === 'uploading'
                              ? '🚀'
                              : item.status === 'error'
                              ? '❌'
                              : '⏳'}
                          </span>
                          <span className="font-mono font-semibold text-slate-200 truncate" title={item.name}>
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            ({formatSize(item.sizeBytes)})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[11px] font-mono ${
                              item.status === 'done'
                                ? 'text-emerald-400 font-semibold'
                                : item.status === 'uploading'
                                ? 'text-cyan-300 font-semibold'
                                : item.status === 'error'
                                ? 'text-red-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {item.status === 'uploading' ? `${item.progressPct}% • ${item.detail}` : item.detail}
                          </span>

                          {!isBatchRunning && item.status !== 'uploading' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQueueItem(item.id)}
                              className="text-slate-400 hover:text-red-300 px-1 cursor-pointer"
                              title="Bỏ khỏi hàng đợi"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 2B. MANUAL PASTE TEXTAREA & SUBMIT FORM */}
            <section className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📝</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-200">Hoặc Dán Nội Dung & Tạo File Lẻ</h2>
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
                      placeholder={`Ví dụ: ${suggestedName} hoặc bo_cau_hoi_bai3_full_global.json`}
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
                      placeholder="Dán nội dung văn bản của bạn vào đây (hỗ trợ 20.000+ dòng mượt mà)..."
                      rows={13}
                      className="w-full bg-transparent text-slate-200 placeholder-slate-400 p-4 text-xs font-mono resize-y focus:outline-none scrollbar-thin scrollbar-thumb-slate-700 leading-relaxed"
                    />
                  </div>

                  {/* Live Realtime Metrics Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 text-xs">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">📝 Số dòng:</span>
                        <span
                          className={`font-mono font-bold ${
                            metrics.lines >= 10000
                              ? 'text-amber-400'
                              : metrics.lines >= 1000
                              ? 'text-cyan-400'
                              : 'text-indigo-300'
                          }`}
                        >
                          {metrics.lines.toLocaleString()} dòng
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">🔤 Ký tự:</span>
                        <span className="font-mono font-bold text-slate-200">{metrics.chars.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">💾 Dung lượng:</span>
                        <span className="font-mono font-bold text-emerald-400">{metrics.sizeStr}</span>
                      </div>
                    </div>

                    {metrics.lines >= 15000 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        🚀 Chế độ Nén GZIP + Chia mảnh tự động
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
                      <span>{manualUploadStatus || 'Đang ghi file lên server...'}</span>
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
          </div>

          {/* RIGHT COLUMN: Saved Files List (5 cols) */}
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
            <div className="space-y-2.5 max-h-[760px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
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
                    {searchTerm
                      ? 'Không tìm thấy tệp khớp với từ khóa tìm kiếm.'
                      : 'Hãy chọn hàng loạt 50+ file hoặc dán văn bản ở khung bên trái để bắt đầu.'}
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
                          <span
                            className="font-mono text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors"
                            title={file.name}
                          >
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
                          disabled={isLoadingPreview}
                          onClick={() => handleOpenPreview(file.name)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-indigo-950/60 hover:text-indigo-300 border border-slate-800 text-[11px] font-semibold text-slate-300 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
              <pre className="whitespace-pre-wrap break-words leading-relaxed select-text">{previewFile.content}</pre>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Single File Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-base font-bold text-slate-100">Xác Nhận Xóa Tệp Tin</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Bạn có chắc chắn muốn xóa vĩnh viễn tệp <strong className="font-mono text-red-300">{deleteTarget}</strong>{' '}
              khỏi máy chủ và Cloud không? Hành động này không thể hoàn tác.
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

      {/* 5. Delete ALL Files Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-2xl">🗑️</span>
              <h3 className="text-base font-bold text-slate-100">Xác Nhận Xóa Toàn Bộ ({files.length} Tệp)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Bạn có chắc chắn muốn xóa sạch toàn bộ <strong className="text-red-300">{files.length} tệp tin</strong> đang
              lưu trên máy chủ và Cloud không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Đang xóa tất cả...' : `Xóa sạch ${files.length} tệp`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
