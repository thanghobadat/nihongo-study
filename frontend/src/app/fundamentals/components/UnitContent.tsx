'use client';

import React from 'react';
import { KnowledgeUnit } from '../data/knowledgeUnits';
import CompactTable, { CompactTableRow } from './CompactTable';
import { BASIC_NUMBERS, COUNTERS_LIST } from '../data/numbersCountersData';
import { HOURS_DATA, MINUTES_DATA, DAYS_OF_MONTH, DAYS_OF_WEEK, MONTHS_DATA, RELATIVE_TIME_MATRIX } from '../data/timeCalendarData';
import { PARTICLES_LIST, CONFUSABLE_PAIRS } from '../data/particlesData';
import { VERB_GROUPS, GROUP1_EXCEPTIONS, CONJUGATION_FORMS, ADJECTIVE_CONJUGATION } from '../data/conjugationData';
import { KOSOADO_MATRIX, QUESTION_COMPOUNDS } from '../data/kosoadoQuestionsData';
import { CONJUNCTIONS_LIST, ADVERBS_LIST } from '../data/conjunctionsAdverbsData';
import { speakTTS } from '../../utils/audioHelper';

interface UnitContentProps {
  unit: KnowledgeUnit;
}

export default function UnitContent({ unit }: UnitContentProps) {
  const handlePlayAudio = (text: string) => {
    speakTTS(text);
  };

  // 1. Number tables (0-99 and 100-100M)
  if (unit.kind === 'number_table_0_99') {
    const rows: CompactTableRow[] = BASIC_NUMBERS.filter(n => n.num <= 10).map(n => ({
      col1: `${n.num} (${n.kanji})`,
      col2: n.kana,
      col3: n.romaji,
      isSpecial: n.isSpecial,
      specialNote: n.note,
    }));
    return (
      <div className="space-y-3">
        <CompactTable headers={['Số', 'Cách đọc', 'Romaji', 'Nghe']} rows={rows} />
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-300">
          💡 <strong>Quy tắc ghép số 11 ➔ 99:</strong> Ghép cơ số 10 (じゅう) + Số lẻ. Ví dụ: 15 = じゅうご, 20 = にじゅう, 74 = ななじゅうよん (hoặc ななじゅうし).
        </div>
      </div>
    );
  }

  if (unit.kind === 'number_table_100_100m') {
    const rows: CompactTableRow[] = BASIC_NUMBERS.filter(n => n.num >= 100).map(n => ({
      col1: `${n.num.toLocaleString('vi-VN')} (${n.kanji})`,
      col2: n.kana,
      col3: n.romaji,
      isSpecial: n.isSpecial,
      specialNote: n.note,
    }));
    return (
      <div className="space-y-3">
        <CompactTable headers={['Con số', 'Cách đọc', 'Romaji / Đơn vị', 'Nghe']} rows={rows} />
        <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 border-l-3 border-amber-500">
          ⚠️ <strong>Ghi nhớ biến âm:</strong> 300 (sanbyaku - âm đục), 600 (roppyaku - âm ngắt), 800 (happyaku - âm ngắt), 3000 (sanzen - âm đục), 8000 (hassen - âm ngắt). Tiếng Nhật nhóm số 4 chữ số (万 - Vạn = 10.000).
        </div>
      </div>
    );
  }

  // 2. Single Counter
  if (unit.kind === 'counter_single') {
    const counter = COUNTERS_LIST.find(c => c.id === unit.refId);
    if (!counter) return <div className="text-xs text-slate-400">Không tìm thấy đơn vị đếm</div>;

    const rows: CompactTableRow[] = counter.items.map(it => ({
      col1: `#${it.number} (${it.kanji})`,
      col2: it.kana,
      col3: it.romaji,
      isSpecial: it.isSpecial,
      specialNote: it.note,
    }));

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-1 pb-1">
          <span><strong>Dùng cho:</strong> {counter.targetObjects}</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
            Từ hỏi: {counter.questionWord.kana} ({counter.questionWord.meaning})
          </span>
        </div>
        {counter.tips && (
          <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs text-slate-600 dark:text-slate-300">
            💡 {counter.tips}
          </div>
        )}
        <CompactTable headers={['Số lượng', 'Phát âm (Kana)', 'Romaji', 'Nghe']} rows={rows} />
      </div>
    );
  }

  // 3. Counter group (Extended counters)
  if (unit.kind === 'counter_group') {
    const extendedIds = ['hon', 'mai', 'hai', 'hiki', 'satsu', 'ko', 'kai', 'soku', 'ken', 'chaku'];
    const list = COUNTERS_LIST.filter(c => extendedIds.includes(c.id));

    return (
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Tổng hợp các đơn vị đếm thường gặp trong đời sống và đề thi JLPT N5/N4:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map(c => (
            <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {c.kanji} - {c.name.split('(')[0]}
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Hỏi: {c.questionWord.kana}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {c.targetObjects}
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {c.items.slice(0, 5).map(it => (
                  <span
                    key={it.number}
                    onClick={() => handlePlayAudio(it.kana)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                      it.isSpecial
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    #{it.number}: {it.kana}
                  </span>
                ))}
                <span className="text-[10px] text-slate-400 self-center">...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. Time tables
  if (unit.kind === 'time_hours') {
    const rows: CompactTableRow[] = HOURS_DATA.map(h => ({
      col1: h.kanji,
      col2: h.kana,
      col3: h.meaning,
      isSpecial: h.isSpecial,
      specialNote: h.note,
    }));
    return (
      <div className="space-y-3">
        <CompactTable headers={['Giờ', 'Cách đọc', 'Ý nghĩa', 'Nghe']} rows={rows} />
        <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 border-l-3 border-amber-500">
          ⚠️ <strong>Chú ý bắt buộc:</strong> 4 giờ là <strong>よじ (yoji)</strong>, 9 giờ là <strong>くじ (kuji)</strong>, 7 giờ là <strong>しちじ (shichiji)</strong>.
        </div>
      </div>
    );
  }

  if (unit.kind === 'time_minutes') {
    const rows: CompactTableRow[] = MINUTES_DATA.map(m => ({
      col1: m.kanji,
      col2: m.kana,
      col3: m.meaning,
      isSpecial: m.isSpecial,
      specialNote: m.note,
    }));
    return (
      <div className="space-y-3">
        <CompactTable headers={['Số phút', 'Cách đọc', 'Ý nghĩa', 'Nghe']} rows={rows} />
        <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs text-slate-600 dark:text-slate-300">
          💡 <strong>Quy tắc nhớ nhanh fun vs pun:</strong> 1, 3, 4, 6, 8, 10 đọc là <strong>ぷん (pun)</strong>; 2, 5, 7, 9 đọc là <strong>ふん (fun)</strong>.
        </div>
      </div>
    );
  }

  if (unit.kind === 'time_days') {
    const rows: CompactTableRow[] = DAYS_OF_MONTH.map(d => ({
      col1: `${d.number} (${d.kanji})`,
      col2: d.kana,
      col3: d.meaning,
      isSpecial: d.isSpecial,
      specialNote: d.note,
    }));
    return (
      <div className="space-y-3">
        <CompactTable headers={['Ngày', 'Cách đọc (Kana)', 'Ý nghĩa / Nguồn gốc', 'Nghe']} rows={rows} />
      </div>
    );
  }

  if (unit.kind === 'time_weekdays') {
    const rows: CompactTableRow[] = DAYS_OF_WEEK.map(w => ({
      col1: w.kanji,
      col2: w.kana,
      col3: `${w.meaning} (${w.note})`,
    }));
    return <CompactTable headers={['Thứ', 'Cách đọc', 'Ý nghĩa & Ý niệm', 'Nghe']} rows={rows} />;
  }

  if (unit.kind === 'time_months') {
    const rows: CompactTableRow[] = MONTHS_DATA.map(m => ({
      col1: m.kanji,
      col2: m.kana,
      col3: m.meaning,
      isSpecial: m.isSpecial,
      specialNote: m.note,
    }));
    return <CompactTable headers={['Tháng', 'Cách đọc', 'Ý nghĩa', 'Nghe']} rows={rows} />;
  }

  if (unit.kind === 'time_relative') {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-xs text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500">
              <th className="py-2 px-3">Phân loại</th>
              <th className="py-2 px-3">Hôm kia (-2)</th>
              <th className="py-2 px-3">Hôm qua (-1)</th>
              <th className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-black">Hôm nay (0)</th>
              <th className="py-2 px-3">Ngày mai (+1)</th>
              <th className="py-2 px-3">Ngày kia (+2)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {RELATIVE_TIME_MATRIX.map(r => (
              <tr key={r.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{r.category}</td>
                <td className="py-2 px-3 cursor-pointer" onClick={() => handlePlayAudio(r.minus2.kana)}>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{r.minus2.kanji}</div>
                  <div className="text-[10px] text-slate-400">{r.minus2.kana}</div>
                </td>
                <td className="py-2 px-3 cursor-pointer" onClick={() => handlePlayAudio(r.minus1.kana)}>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{r.minus1.kanji}</div>
                  <div className="text-[10px] text-slate-400">{r.minus1.kana}</div>
                </td>
                <td className="py-2 px-3 bg-indigo-50/40 dark:bg-indigo-950/20 cursor-pointer" onClick={() => handlePlayAudio(r.zero.kana)}>
                  <div className="font-black text-indigo-600 dark:text-indigo-400">{r.zero.kanji}</div>
                  <div className="text-[10px] text-indigo-500">{r.zero.kana}</div>
                </td>
                <td className="py-2 px-3 cursor-pointer" onClick={() => handlePlayAudio(r.plus1.kana)}>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{r.plus1.kanji}</div>
                  <div className="text-[10px] text-slate-400">{r.plus1.kana}</div>
                </td>
                <td className="py-2 px-3 cursor-pointer" onClick={() => handlePlayAudio(r.plus2.kana)}>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{r.plus2.kanji}</div>
                  <div className="text-[10px] text-slate-400">{r.plus2.kana}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 5. Particle detail
  if (unit.kind === 'particle_detail') {
    const particle = PARTICLES_LIST.find(p => p.id === unit.refId);
    if (!particle) return <div className="text-xs text-slate-400">Không tìm thấy thông tin trợ từ</div>;

    return (
      <div className="space-y-3">
        {particle.tips && (
          <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/20 border-l-3 border-indigo-500 rounded-lg text-xs text-indigo-900 dark:text-indigo-300">
            💡 {particle.tips}
          </div>
        )}
        <div className="space-y-2">
          {particle.functions.map((fn, idx) => (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                • {fn.usage}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {fn.explanation}
              </div>
              <div
                onClick={() => handlePlayAudio(fn.exampleJp)}
                className="pt-1 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer group"
              >
                <span>{fn.exampleJp}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">🔊</span>
              </div>
              <div className="text-[11px] text-slate-500 italic">
                "{fn.exampleVn}"
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. Confusable Pair
  if (unit.kind === 'confusable_pair') {
    const pair = CONFUSABLE_PAIRS.find(p => p.id === unit.refId);
    if (!pair) return <div className="text-xs text-slate-400">Không tìm thấy thông tin cặp trợ từ</div>;

    return (
      <div className="space-y-3">
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-900 dark:text-amber-300 border-l-3 border-amber-500">
          💡 <strong>Mẹo phân biệt nhanh:</strong> {pair.mnemonic}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {pair.cases.map((c, idx) => (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {c.particle}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {c.condition}
                </span>
              </div>
              <div
                onClick={() => handlePlayAudio(c.exampleJp)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer flex items-center justify-between group pt-1"
              >
                <span>{c.exampleJp}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">🔊</span>
              </div>
              <div className="text-[11px] text-slate-500 italic">
                "{c.exampleVn}"
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7. Verb Groups
  if (unit.kind === 'verb_groups') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {VERB_GROUPS.map(vg => (
            <div key={vg.group} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {vg.name}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {vg.identification}
              </div>
              <div className="text-[11px] text-slate-500">
                {vg.description}
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {vg.examples.map(ex => (
                  <span key={ex.dictionary} className="text-[10px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {ex.kanji} ({ex.meaning})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. Verb Exceptions
  if (unit.kind === 'verb_exceptions') {
    return (
      <div className="space-y-3">
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-900 dark:text-amber-300 border-l-3 border-amber-500">
          ⚠️ <strong>Đặc điểm nhận dạng:</strong> Nhìn đuôi <code>-iru</code> hoặc <code>-eru</code> giống Nhóm 2 nhưng BẮT BUỘC chia theo Nhóm 1 (Đổi cột âm chứ không bỏ ru).
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GROUP1_EXCEPTIONS.map(ex => (
            <div
              key={ex.kanji}
              onClick={() => handlePlayAudio(ex.reading)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-all"
            >
              <div className="font-black text-xs text-slate-800 dark:text-slate-200">
                {ex.kanji} ({ex.reading})
              </div>
              <div className="text-[10px] text-slate-400">{ex.meaning}</div>
              <div className="text-[9px] text-amber-600 dark:text-amber-400 mt-1 font-medium">{ex.whySpecial}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 9. Conjugation Form Table
  if (unit.kind === 'conjugation_form') {
    const form = CONJUGATION_FORMS.find(f => f.formId === unit.refId);
    if (!form) return <div className="text-xs text-slate-400">Không tìm thấy thể động từ</div>;

    const rows: CompactTableRow[] = [
      {
        col1: 'Nhóm 1 (Godan)',
        col2: form.group1Rule,
        col3: `VD: ${form.exampleGroup1.jisho} ➔ ${form.exampleGroup1.conjugated} (${form.exampleGroup1.meaning})`,
        audioText: form.exampleGroup1.conjugated,
      },
      {
        col1: 'Nhóm 2 (Ichidan)',
        col2: form.group2Rule,
        col3: `VD: ${form.exampleGroup2.jisho} ➔ ${form.exampleGroup2.conjugated} (${form.exampleGroup2.meaning})`,
        audioText: form.exampleGroup2.conjugated,
      },
      {
        col1: 'Nhóm 3 (Bất quy tắc)',
        col2: form.group3Rule,
        col3: `VD: ${form.exampleGroup3.jisho} ➔ ${form.exampleGroup3.conjugated} (${form.exampleGroup3.meaning})`,
        audioText: form.exampleGroup3.conjugated,
        isSpecial: true,
      },
    ];

    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500">{form.description}</p>
        <CompactTable headers={['Nhóm động từ', 'Quy tắc chia', 'Ví dụ thực tế', 'Nghe']} rows={rows} />
      </div>
    );
  }

  // 10. Adjective Conjugation
  if (unit.kind === 'adj_conjugation') {
    const isPast = unit.refId === 'past';
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Đuôi i */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-red-600 dark:text-red-400">
              Tính từ đuôi い (i-Adjective)
            </div>
            <div className="space-y-1 text-xs">
              {!isPast ? (
                <>
                  <div>• Khẳng định: Giữ nguyên い (高いです - Đắt)</div>
                  <div>• Phủ định: Bỏ い + <strong>くない</strong> (高くないです - Không đắt)</div>
                </>
              ) : (
                <>
                  <div>• Quá khứ: Bỏ い + <strong>かった</strong> (高かったです - Đã đắt)</div>
                  <div>• Phủ định quá khứ: Bỏ い + <strong>くなかった</strong> (高くなかったです)</div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-[11px] text-amber-800 dark:text-amber-300 font-semibold mt-1">
                    ⚠️ Ngoại lệ: いい ➔ よかった (Đã tốt), よくない (Không tốt).
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Đuôi na */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Tính từ đuôi な (na-Adjective)
            </div>
            <div className="space-y-1 text-xs">
              {!isPast ? (
                <>
                  <div>• Khẳng định: Bỏ な + <strong>です</strong> (静かです - Yên tĩnh)</div>
                  <div>• Phủ định: Bỏ な + <strong>じゃありません</strong></div>
                </>
              ) : (
                <>
                  <div>• Quá khứ: Bỏ な + <strong>でした</strong> (静かでした - Đã yên tĩnh)</div>
                  <div>• Phủ định quá khứ: Bỏ な + <strong>じゃありませんでした</strong></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 11. Ko-so-a-do Rows
  if (unit.kind === 'kosoado_rows') {
    const row = KOSOADO_MATRIX.find(r => unit.refId.startsWith(r.ko.word.slice(0, 2)) || unit.title.includes(r.ko.word));
    const targetRow = row || KOSOADO_MATRIX[0];

    const rows: CompactTableRow[] = [
      { col1: 'Ko- (Gần người nói)', col2: targetRow.ko.word, col3: targetRow.ko.meaning },
      { col1: 'So- (Gần người nghe)', col2: targetRow.so.word, col3: targetRow.so.meaning },
      { col1: 'A- (Xa cả hai)', col2: targetRow.a.word, col3: targetRow.a.meaning },
      { col1: 'Do- (Nghi vấn)', col2: targetRow.do.word, col3: targetRow.do.meaning, isSpecial: true },
    ];

    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500">{targetRow.usageRule}</p>
        <CompactTable headers={['Vị trí', 'Từ vựng (Kana)', 'Ý nghĩa', 'Nghe']} rows={rows} />
      </div>
    );
  }

  // 12. Question compounds
  if (unit.kind === 'question_compounds') {
    return (
      <div className="space-y-2.5">
        {QUESTION_COMPOUNDS.slice(0, 2).map(qc => (
          <div key={qc.questionWord} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="font-bold text-indigo-600 dark:text-indigo-400">
              {qc.questionWord} ({qc.basicMeaning})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                <span className="font-bold text-blue-600">+ か:</span> {qc.withKa.word} ➔ {qc.withKa.meaning}
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                <span className="font-bold text-red-600">+ も:</span> {qc.withMo.word} ➔ {qc.withMo.meaning}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 13. Conjunctions & Adverbs
  if (unit.kind === 'conjunctions_group' || unit.kind === 'adverbs_group') {
    const isConj = unit.kind === 'conjunctions_group';
    return (
      <div className="space-y-2">
        {isConj ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CONJUNCTIONS_LIST.slice(0, 4).map(c => (
              <div key={c.word} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{c.word}</span>
                  <span className="text-[10px] text-slate-400">{c.category}</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 mt-0.5">{c.meaning}</div>
                <div className="text-[10px] text-slate-400 mt-1 italic">"{c.exampleVn}"</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {ADVERBS_LIST.slice(0, 5).map(a => (
              <div key={a.word} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{a.word}</span>
                  <span className="text-slate-500 ml-2">({a.meaning})</span>
                </div>
                {a.levelPercent !== undefined && (
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{a.levelPercent}%</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <div className="text-xs text-slate-400">Nội dung chi tiết đang được cập nhật...</div>;
}
