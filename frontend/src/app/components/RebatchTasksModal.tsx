'use client';

import React, { useState, useEffect, useMemo } from 'react';

export interface CustomBatchItem {
  id: string;
  count: number;
  due_time?: string;
}

export interface RebatchConfig {
  lesson: number;
  itemType: string;
  batchCount?: number;
  batches?: Array<{ count: number; title?: string; due_time?: string }>;
}

interface RebatchTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  dayTasks: any[];
  onApplyRebatch: (configs: RebatchConfig[]) => Promise<void>;
  isRebatching?: boolean;
}

interface SkillGroup {
  key: string;
  lesson: number;
  itemType: string;
  totalItems: number;
  unit: string;
  icon: string;
  name: string;
  initialBatches: CustomBatchItem[];
}

export default function RebatchTasksModal({
  isOpen,
  onClose,
  date,
  dayTasks = [],
  onApplyRebatch,
  isRebatching = false
}: RebatchTasksModalProps) {
  // Extract groups and their initial tasks from dayTasks
  const skillGroups: SkillGroup[] = useMemo(() => {
    const groupsMap = new Map<string, SkillGroup>();

    dayTasks.forEach(task => {
      const type = task.itemType;
      if (type !== 'vocabulary' && type !== 'kanji' && type !== 'grammar') return;
      const lesson = task.lesson || task.lesson_id || 1;
      const key = `${lesson}_${type}`;

      if (!groupsMap.has(key)) {
        let name = 'Từ vựng';
        let icon = '📚';
        let unit = 'từ';
        if (type === 'kanji') {
          name = 'Chữ Hán (Kanji)';
          icon = '✍️';
          unit = 'chữ';
        } else if (type === 'grammar') {
          name = 'Ngữ pháp';
          icon = '⛩️';
          unit = 'mẫu';
        }

        groupsMap.set(key, {
          key,
          lesson,
          itemType: type,
          totalItems: 0,
          unit,
          icon,
          name,
          initialBatches: []
        });
      }

      const g = groupsMap.get(key)!;
      const count = task.targetCount || 1;
      g.totalItems += count;
      g.initialBatches.push({
        id: task.id || `b_${Date.now()}_${Math.random()}`,
        count,
        due_time: task.due_time
      });
    });

    return Array.from(groupsMap.values());
  }, [dayTasks]);

  // Map of groupKey -> CustomBatchItem[]
  const [groupBatches, setGroupBatches] = useState<{ [key: string]: CustomBatchItem[] }>({});

  // 3 Time Slots states (minutes)
  const [morningMins, setMorningMins] = useState<number>(30);
  const [afternoonMins, setAfternoonMins] = useState<number>(30);
  const [eveningMins, setEveningMins] = useState<number>(90);
  const [aiSlotExplanation, setAiSlotExplanation] = useState<string | null>(null);

  // Handle AI Auto-allocation based on 3 Time Slots
  const handleAutoAllocateTimeSlots = () => {
    const updatedMap: { [key: string]: CustomBatchItem[] } = {};
    const explanations: string[] = [];

    skillGroups.forEach(group => {
      const minsPerItem = group.itemType === 'vocabulary' ? 6 : 18;
      const total = group.totalItems;

      // 1. Morning (08:00 - 12:00)
      const cap1 = Math.floor(Math.max(0, morningMins) / minsPerItem);
      const count1 = Math.min(total, cap1);
      const rem1 = total - count1;

      // 2. Afternoon (12:00 - 18:00)
      const cap2 = Math.floor(Math.max(0, afternoonMins) / minsPerItem);
      const count2 = Math.min(rem1, cap2);

      // 3. Evening (18:00 - 22:00) - Absorbs 100% of remaining overflow!
      const count3 = rem1 - count2;

      const newBatches: CustomBatchItem[] = [];
      const partsSummary: string[] = [];

      if (count1 > 0) {
        newBatches.push({
          id: `batch_${group.key}_morn_${Date.now()}`,
          count: count1,
          due_time: '11:30'
        });
        partsSummary.push(`Sáng ${count1} ${group.unit} (11:30)`);
      }
      if (count2 > 0) {
        newBatches.push({
          id: `batch_${group.key}_aft_${Date.now() + 1}`,
          count: count2,
          due_time: '17:30'
        });
        partsSummary.push(`Chiều ${count2} ${group.unit} (17:30)`);
      }
      if (count3 > 0) {
        newBatches.push({
          id: `batch_${group.key}_eve_${Date.now() + 2}`,
          count: count3,
          due_time: '21:30'
        });
        partsSummary.push(`Tối dồn ${count3} ${group.unit} dư (21:30)`);
      }

      if (newBatches.length === 0 && total > 0) {
        newBatches.push({
          id: `batch_${group.key}_eve_${Date.now()}`,
          count: total,
          due_time: '21:30'
        });
        partsSummary.push(`Tối dồn ${total} ${group.unit} dư (21:30)`);
      }

      updatedMap[group.key] = newBatches;
      explanations.push(`${group.name}: ${partsSummary.join(' • ')}`);
    });

    setGroupBatches(updatedMap);
    setAiSlotExplanation(`🎯 AI đã phân bổ tự động: ${explanations.join(' | ')}. Toàn bộ bài tập dư đã dồn vào khung giờ tối để đảm bảo đạt 100% mục tiêu hôm nay!`);
  };

  useEffect(() => {
    if (isOpen) {
      const initial: { [key: string]: CustomBatchItem[] } = {};
      skillGroups.forEach(g => {
        if (g.initialBatches.length > 0) {
          initial[g.key] = g.initialBatches.map((b, idx) => ({
            id: `batch_${g.key}_${idx + 1}_${Date.now()}`,
            count: b.count,
            due_time: b.due_time
          }));
        } else {
          initial[g.key] = [{
            id: `batch_${g.key}_1_${Date.now()}`,
            count: g.totalItems || 10
          }];
        }
      });
      setGroupBatches(initial);
    }
  }, [isOpen, skillGroups]);

  if (!isOpen) return null;

  // Handle changing count of a specific batch
  const handleUpdateCount = (groupKey: string, batchId: string, count: number) => {
    setGroupBatches(prev => {
      const list = prev[groupKey] || [];
      const updated = list.map(b => b.id === batchId ? { ...b, count: Math.max(0, count) } : b);
      return { ...prev, [groupKey]: updated };
    });
  };

  // Handle changing due time of a specific batch
  const handleUpdateDueTime = (groupKey: string, batchId: string, due_time: string) => {
    setGroupBatches(prev => {
      const list = prev[groupKey] || [];
      const updated = list.map(b => b.id === batchId ? { ...b, due_time } : b);
      return { ...prev, [groupKey]: updated };
    });
  };

  // Add a new batch
  const handleAddBatch = (group: SkillGroup) => {
    setGroupBatches(prev => {
      const list = prev[group.key] || [];
      const currentAllocated = list.reduce((s, b) => s + (b.count || 0), 0);
      const remaining = Math.max(1, group.totalItems - currentAllocated);
      const newBatch: CustomBatchItem = {
        id: `batch_${group.key}_${list.length + 1}_${Date.now()}`,
        count: remaining > 0 ? remaining : 5
      };
      return { ...prev, [group.key]: [...list, newBatch] };
    });
  };

  // Remove a batch
  const handleRemoveBatch = (groupKey: string, batchId: string) => {
    setGroupBatches(prev => {
      const list = prev[groupKey] || [];
      if (list.length <= 1) return prev;
      return { ...prev, [groupKey]: list.filter(b => b.id !== batchId) };
    });
  };

  // Quick preset: Split evenly into N batches
  const handlePresetSplit = (group: SkillGroup, numBatches: number) => {
    const total = group.totalItems;
    const n = Math.min(numBatches, total);
    const base = Math.floor(total / n);
    const rem = total % n;

    const newBatches: CustomBatchItem[] = [];
    for (let i = 0; i < n; i++) {
      const count = base + (i < rem ? 1 : 0);
      newBatches.push({
        id: `batch_${group.key}_${i + 1}_${Date.now()}`,
        count
      });
    }

    setGroupBatches(prev => ({
      ...prev,
      [group.key]: newBatches
    }));
  };

  // Quick preset: Combine all into 1 single batch
  const handleCombineAll = (group: SkillGroup) => {
    setGroupBatches(prev => ({
      ...prev,
      [group.key]: [{
        id: `batch_${group.key}_1_${Date.now()}`,
        count: group.totalItems
      }]
    }));
  };

  // Validate all groups: each group's allocated sum must exactly equal group.totalItems
  const validationSummary = skillGroups.map(group => {
    const batches = groupBatches[group.key] || [];
    const allocated = batches.reduce((sum, b) => sum + (parseInt(String(b.count), 10) || 0), 0);
    const diff = group.totalItems - allocated;
    const hasZeroOrNegative = batches.some(b => !b.count || b.count <= 0);
    const isValid = diff === 0 && !hasZeroOrNegative;
    return {
      group,
      allocated,
      diff,
      hasZeroOrNegative,
      isValid
    };
  });

  const isAllValid = validationSummary.every(v => v.isValid);
  const firstInvalid = validationSummary.find(v => !v.isValid);

  const handleApply = async () => {
    if (!isAllValid) return;

    const configs: RebatchConfig[] = skillGroups.map(group => {
      const batches = groupBatches[group.key] || [];
      return {
        lesson: group.lesson,
        itemType: group.itemType,
        batches: batches.map(b => ({
          count: parseInt(String(b.count), 10) || 1,
          due_time: b.due_time
        }))
      };
    });

    await onApplyRebatch(configs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl p-5 sm:p-6 text-white space-y-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 text-2xl shrink-0 border border-indigo-500/40 shadow-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Chủ Động Tạo & Phân Chia Batch
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {date}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Tự do tạo số lượng batch và điền số mục mong muốn (học hết 1 lần hoặc chia nhỏ). Bắt buộc phải chia hết 100% kiến thức trong ngày.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 3 Time-Slots AI Auto-Allocation Card */}
        {skillGroups.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-950 to-cyan-950/30 border border-indigo-500/40 space-y-3 shadow-md shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Phân bổ tự động theo 3 mốc thời gian rảnh</span>
                    <span className="text-[10px] font-normal text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Tối dồn task dư
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Điền số phút bạn rảnh trong ngày. AI sẽ tính toán chia batch, toàn bộ bài tập dư sẽ tự động dồn vào khung tối (18h-22h).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoAllocateTimeSlots}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-950/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>⚡</span>
                <span>AI Phân Bổ Tự Động</span>
              </button>
            </div>

            {/* 3 Slots Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Slot 1: Sáng 8h-12h */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <span>🌅</span>
                    <span>Sáng (08:00 - 12:00)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Hẹn 11:30</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Rảnh:</span>
                  <input
                    type="number"
                    min="0"
                    max="240"
                    step="5"
                    value={morningMins}
                    onChange={(e) => setMorningMins(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-center text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-xs text-slate-300 font-medium">phút</span>
                </div>
              </div>

              {/* Slot 2: Chiều 12h-18h */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    <span>☀️</span>
                    <span>Chiều (12:00 - 18:00)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Hẹn 17:30</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Rảnh:</span>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    step="5"
                    value={afternoonMins}
                    onChange={(e) => setAfternoonMins(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-center text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-xs text-slate-300 font-medium">phút</span>
                </div>
              </div>

              {/* Slot 3: Tối 18h-22h (Dồn task dư) */}
              <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300 flex items-center gap-1">
                    <span>🌙</span>
                    <span>Tối (18:00 - 22:00)</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Dồn task dư
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Rảnh:</span>
                    <input
                      type="number"
                      min="0"
                      max="240"
                      step="5"
                      value={eveningMins}
                      onChange={(e) => setEveningMins(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-16 bg-slate-950 border border-purple-500/50 rounded px-2 py-1 text-xs font-bold text-center text-purple-200 focus:outline-none focus:border-purple-400"
                    />
                    <span className="text-xs text-slate-300 font-medium">phút</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Hẹn 21:30</span>
                </div>
              </div>
            </div>

            {/* AI Explanation Banner */}
            {aiSlotExplanation && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2">
                <span>{aiSlotExplanation}</span>
                <button
                  type="button"
                  onClick={() => setAiSlotExplanation(null)}
                  className="text-emerald-400 hover:text-white text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {skillGroups.length > 0 ? (
            validationSummary.map(({ group, allocated, diff, hasZeroOrNegative, isValid }) => {
              const batches = groupBatches[group.key] || [];
              const percent = group.totalItems > 0 ? Math.min(100, Math.round((allocated / group.totalItems) * 100)) : 100;

              return (
                <div
                  key={group.key}
                  className={`p-4 rounded-xl border space-y-3 transition-all ${
                    isValid
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      : diff > 0
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  {/* Skill Group Header & Allocation Progress */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{group.icon}</span>
                      <div>
                        <span className="text-sm font-bold text-white">
                          Bài {group.lesson}: {group.name}
                        </span>
                        <span className="text-xs text-cyan-300 font-semibold ml-2">
                          (Mục tiêu ngày: {group.totalItems} {group.unit})
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isValid ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <span>✓</span>
                          <span>Đã phân bổ 100% ({allocated}/{group.totalItems} {group.unit})</span>
                        </span>
                      ) : diff > 0 ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>Còn thiếu {diff} {group.unit} chưa chia</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <span>❌</span>
                          <span>Vượt quá {Math.abs(diff)} {group.unit}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Allocation Visual Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isValid ? 'bg-emerald-400' : diff > 0 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  {/* Quick Action Presets */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase">Mẫu chia nhanh:</span>
                      <button
                        type="button"
                        onClick={() => handleCombineAll(group)}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 hover:border-purple-400 transition-colors"
                      >
                        1 Batch (Gộp hết)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetSplit(group, 2)}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-colors"
                      >
                        Chia 2 Batch
                      </button>
                      {group.totalItems >= 3 && (
                        <button
                          type="button"
                          onClick={() => handlePresetSplit(group, 3)}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400 transition-colors"
                        >
                          Chia 3 Batch
                        </button>
                      )}
                      {group.totalItems >= 5 && (
                        <button
                          type="button"
                          onClick={() => handlePresetSplit(group, 5)}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition-colors"
                        >
                          Chia 5 Batch
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddBatch(group)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 hover:border-indigo-400 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span>+</span>
                      <span>Thêm Batch</span>
                    </button>
                  </div>

                  {/* Batches Editable List */}
                  <div className="space-y-2 pt-1">
                    {batches.map((batch, bIdx) => {
                      const mins = (batch.count || 0) * (group.itemType === 'vocabulary' ? 6 : 18);
                      const isSingle = batches.length === 1;

                      return (
                        <div
                          key={batch.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                              Batch #{bIdx + 1}
                            </span>

                            {/* Stepper / Input */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateCount(group.key, batch.id, (batch.count || 1) - 1)}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={group.totalItems}
                                value={batch.count}
                                onChange={(e) => handleUpdateCount(group.key, batch.id, parseInt(e.target.value, 10) || 0)}
                                className="w-14 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs font-bold text-center text-white focus:outline-none focus:border-cyan-400"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateCount(group.key, batch.id, (batch.count || 0) + 1)}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                +
                              </button>
                              <span className="text-xs text-slate-300 font-medium">
                                {group.unit}
                              </span>
                            </div>

                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              (~{mins} phút)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Deadline Picker */}
                            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              <span className="text-[11px] text-slate-400">⏰</span>
                              <input
                                type="time"
                                value={batch.due_time || '10:00'}
                                onChange={(e) => handleUpdateDueTime(group.key, batch.id, e.target.value)}
                                className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                              />
                            </div>

                            {/* Delete Batch Button */}
                            {!isSingle && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBatch(group.key, batch.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Xóa batch này"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Warning message if has zero */}
                  {hasZeroOrNegative && (
                    <p className="text-xs text-rose-400 font-semibold">
                      ⚠️ Mỗi batch phải có ít nhất 1 {group.unit}!
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
              <span className="text-3xl block">🛡️</span>
              <p className="text-sm font-semibold text-slate-300">
                Hôm nay là ngày thực hành hoặc ôn tập chuyên biệt!
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Không có bài học mới (từ vựng, kanji, ngữ pháp) cần phân chia batch.
              </p>
            </div>
          )}
        </div>

        {/* Validation Error Banner */}
        {!isAllValid && firstInvalid && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span>⚠️</span>
              <span>
                {firstInvalid.diff > 0
                  ? `Chưa hoàn tất: Còn thiếu ${firstInvalid.diff} ${firstInvalid.group.unit} của ${firstInvalid.group.name} chưa được chia vào batch nào!`
                  : firstInvalid.diff < 0
                  ? `Số lượng ${firstInvalid.group.name} vượt quá ${Math.abs(firstInvalid.diff)} ${firstInvalid.group.unit}!`
                  : `Mỗi batch phải có ít nhất 1 ${firstInvalid.group.unit}!`}
              </span>
            </span>
            <span className="font-bold underline text-[11px] shrink-0">Bắt buộc chia hết 100%</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isRebatching}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          {skillGroups.length > 0 && (
            <button
              type="button"
              onClick={handleApply}
              disabled={!isAllValid || isRebatching}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isAllValid && !isRebatching
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-950/50 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              {isRebatching ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Đang áp dụng...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Áp Dụng Phân Chia Mới</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
