'use client';

import React, { useCallback, useRef } from 'react';
import {
  AudioIconButton,
  CalloutBar,
  SheetHeader,
  SheetSection,
} from '../components/NotesUI';
import ParticlePracticeArena from './ParticlePracticeArena';

export type ParticleFilterId =
  | 'all'
  | 'de'
  | 'ni'
  | 'kara_made'
  | 'wo'
  | 'he'
  | 'to'
  | 'no'
  | 'wa_mo';

export const PARTICLE_FILTER_OPTIONS: {
  id: ParticleFilterId;
  shortKana: string;
  dropdownLabel: string;
}[] = [
  {
    id: 'all',
    shortKana: 'Tất cả',
    dropdownLabel: 'Tất cả trợ từ (Bài 1 → 7)',
  },
  {
    id: 'de',
    shortKana: 'で',
    dropdownLabel: 'で — 4 cách dùng (Bài 5, 6, 7)',
  },
  {
    id: 'ni',
    shortKana: 'に',
    dropdownLabel: 'に — 4 cách dùng (Bài 4, 6, 7)',
  },
  {
    id: 'kara_made',
    shortKana: 'から・まで',
    dropdownLabel: 'から・まで — 2 cách dùng (Bài 4, 7)',
  },
  {
    id: 'wo',
    shortKana: 'を',
    dropdownLabel: 'を — 3 cách dùng (Bài 3, 6, 7)',
  },
  {
    id: 'he',
    shortKana: 'へ',
    dropdownLabel: 'へ — Hướng di chuyển (Bài 5, 7)',
  },
  {
    id: 'to',
    shortKana: 'と',
    dropdownLabel: 'と — 2 cách dùng (Bài 4, 5)',
  },
  {
    id: 'no',
    shortKana: 'の',
    dropdownLabel: 'の — 3 cách dùng (Bài 1, 2, 3)',
  },
  {
    id: 'wa_mo',
    shortKana: 'は・も',
    dropdownLabel: 'は・も — 4 cách dùng (Bài 1, 5, 6, 7)',
  },
];

interface ParticleUsageCase {
  id: string;
  lesson: string;
  role: string;
  questionWord?: string;
  formulaBefore: string;
  formulaParticle: string;
  formulaAfter: string;
  exBefore: string;
  exParticle: string;
  exAfter: string;
  exHira: string;
  exVi: string;
}

interface ParticleContrastLine {
  id: string;
  leftBefore?: string;
  leftParticle?: string;
  leftAfter: string;
  leftSub?: string;
  leftBad?: boolean;
  sep: 'VS' | '→';
  rightBefore?: string;
  rightParticle?: string;
  rightAfter: string;
  rightSub?: string;
}

interface ParticleProfile {
  id: Exclude<ParticleFilterId, 'all'>;
  kana: string;
  readingHint?: string;
  lessonsSpan: string;
  cases: ParticleUsageCase[];
  contrasts: ParticleContrastLine[];
}

const SAME_NOUN_MATRIX = [
  {
    lesson: 'Bài 5',
    role: 'Hướng đi',
    particle: 'へ',
    after: '行きます',
    hira: 'かいしゃへ いきます',
    vi: 'Đi tới công ty',
  },
  {
    lesson: 'Bài 6',
    role: 'Nơi làm',
    particle: 'で',
    after: '働きます',
    hira: 'かいしゃで はたらきます',
    vi: 'Làm tại công ty',
  },
  {
    lesson: 'Bài 7',
    role: 'Đích nhận',
    particle: 'に',
    after: '電話します',
    hira: 'かいしゃに でんわをかけます',
    vi: 'Gọi cho công ty',
  },
  {
    lesson: 'Bài 7',
    role: 'Nguồn vay',
    particle: 'から',
    after: '借ります',
    hira: 'かいしゃから かります',
    vi: 'Mượn từ công ty',
  },
  {
    lesson: 'Bài 1–2',
    role: 'Sở hữu',
    particle: 'の',
    after: 'パソコン',
    hira: 'かいしゃの パソコン',
    vi: 'Máy của công ty',
  },
];

const PARTICLE_PROFILES: ParticleProfile[] = [
  {
    id: 'de',
    kana: 'で',
    lessonsSpan: 'Bài 5, 6, 7',
    cases: [
      {
        id: 'de-transport',
        lesson: 'Bài 5',
        role: 'Phương tiện',
        questionWord: '? なんで',
        formulaBefore: '[Xe/Tàu]',
        formulaParticle: 'で',
        formulaAfter: '行きます',
        exBefore: '電車',
        exParticle: 'で',
        exAfter: '行きます',
        exHira: 'でんしゃで いきます',
        exVi: 'Đi bằng tàu điện',
      },
      {
        id: 'de-place',
        lesson: 'Bài 6',
        role: 'Nơi hành động',
        questionWord: '? どこで',
        formulaBefore: '[Địa điểm]',
        formulaParticle: 'で',
        formulaAfter: 'V',
        exBefore: 'スーパー',
        exParticle: 'で',
        exAfter: '買います',
        exHira: 'スーパーで かいます',
        exVi: 'Mua ở siêu thị',
      },
      {
        id: 'de-tool',
        lesson: 'Bài 7',
        role: 'Công cụ',
        questionWord: '? なんで',
        formulaBefore: '[Dụng cụ]',
        formulaParticle: 'で',
        formulaAfter: 'V',
        exBefore: 'はさみ',
        exParticle: 'で',
        exAfter: '切ります',
        exHira: 'はさみで きります',
        exVi: 'Cắt bằng kéo',
      },
      {
        id: 'de-lang',
        lesson: 'Bài 7',
        role: 'Ngôn ngữ',
        questionWord: '? 何語で',
        formulaBefore: '[Ngôn ngữ]',
        formulaParticle: 'で',
        formulaAfter: 'V / 何ですか',
        exBefore: '日本語',
        exParticle: 'で',
        exAfter: '書きます',
        exHira: 'にほんごで かきます',
        exVi: 'Viết bằng tiếng Nhật',
      },
    ],
    contrasts: [
      {
        id: 'de-vs-he',
        leftBefore: '駅',
        leftParticle: 'へ',
        leftAfter: '行きます',
        leftSub: 'Đi tới ga (B5)',
        sep: 'VS',
        rightBefore: '駅',
        rightParticle: 'で',
        rightAfter: '買います',
        rightSub: 'Mua tại ga (B6)',
      },
      {
        id: 'de-walk',
        leftAfter: '歩いてで 行きます',
        leftSub: 'Sai',
        leftBad: true,
        sep: '→',
        rightAfter: '歩いて 行きます',
        rightSub: 'Đi bộ: bỏ で',
      },
    ],
  },
  {
    id: 'ni',
    kana: 'に',
    lessonsSpan: 'Bài 4, 6, 7',
    cases: [
      {
        id: 'ni-time',
        lesson: 'Bài 4',
        role: 'Giờ / Ngày có số',
        questionWord: '? 何時に',
        formulaBefore: '[Mốc có số]',
        formulaParticle: 'に',
        formulaAfter: 'V',
        exBefore: '6時',
        exParticle: 'に',
        exAfter: '起きます',
        exHira: 'ろくじに おきます',
        exVi: 'Dậy lúc 6 giờ',
      },
      {
        id: 'ni-meet',
        lesson: 'Bài 6',
        role: 'Gặp ai (会います)',
        questionWord: '? だれに',
        formulaBefore: '[Người]',
        formulaParticle: 'に',
        formulaAfter: '会います',
        exBefore: '友達',
        exParticle: 'に',
        exAfter: '会います',
        exHira: 'ともだちに あいます',
        exVi: 'Gặp bạn (không dùng を)',
      },
      {
        id: 'ni-receiver',
        lesson: 'Bài 7',
        role: 'Người nhận (cho đi)',
        questionWord: '? だれに',
        formulaBefore: '[Người]',
        formulaParticle: 'に',
        formulaAfter: 'あげます・貸します・送ります',
        exBefore: '母',
        exParticle: 'に',
        exAfter: '花を あげました',
        exHira: 'ははに はなを あげました',
        exVi: 'Tặng hoa cho mẹ',
      },
      {
        id: 'ni-giver',
        lesson: 'Bài 7',
        role: 'Người cho (nhận về)',
        questionWord: '? だれに',
        formulaBefore: '[Người]',
        formulaParticle: 'に',
        formulaAfter: 'もらいます・借ります・習います',
        exBefore: '父',
        exParticle: 'に',
        exAfter: '時計を もらいました',
        exHira: 'ちちに とけいを もらいました',
        exVi: 'Nhận đồng hồ từ bố',
      },
    ],
    contrasts: [
      {
        id: 'ni-number',
        leftBefore: '6時',
        leftParticle: 'に',
        leftAfter: '・7月2日に',
        leftSub: 'Có số: dùng に',
        sep: 'VS',
        rightAfter: 'きのう・毎朝・いつ',
        rightSub: 'Không số: bỏ に',
      },
      {
        id: 'ni-arrow',
        leftBefore: '木村さん',
        leftParticle: 'に',
        leftAfter: 'あげます',
        leftSub: 'Cho Kimura',
        sep: 'VS',
        rightBefore: '木村さん',
        rightParticle: 'に',
        rightAfter: 'もらいます',
        rightSub: 'Từ Kimura (nhìn V cuối)',
      },
      {
        id: 'ni-watashi',
        leftAfter: 'わたしに あげました',
        leftSub: 'Cấm dùng',
        leftBad: true,
        sep: '→',
        rightBefore: 'わたしは ～',
        rightParticle: 'に',
        rightAfter: 'もらいました',
        rightSub: 'Đổi tôi làm chủ ngữ',
      },
    ],
  },
  {
    id: 'kara_made',
    kana: 'から・まで',
    lessonsSpan: 'Bài 4, 7',
    cases: [
      {
        id: 'kara-range',
        lesson: 'Bài 4',
        role: 'Từ ... đến ...',
        questionWord: '? 何時から',
        formulaBefore: '[Mốc đầu]',
        formulaParticle: 'から',
        formulaAfter: '[Mốc cuối] まで',
        exBefore: '9時',
        exParticle: 'から',
        exAfter: '5時まで 働きます',
        exHira: 'くじから ごじまで はたらきます',
        exVi: 'Làm từ 9h đến 5h',
      },
      {
        id: 'kara-org',
        lesson: 'Bài 7',
        role: 'Nhận / Vay từ tổ chức',
        questionWord: '? どこから',
        formulaBefore: '[Người/Tổ chức]',
        formulaParticle: 'から',
        formulaAfter: 'もらいます・借ります',
        exBefore: '銀行',
        exParticle: 'から',
        exAfter: 'お金を 借りました',
        exHira: 'ぎんこうから おかねを かりました',
        exVi: 'Vay tiền từ ngân hàng',
      },
    ],
    contrasts: [
      {
        id: 'kara-org-rule',
        leftBefore: '先生',
        leftParticle: 'に / から',
        leftAfter: '習います',
        leftSub: 'Cá nhân: cả hai',
        sep: 'VS',
        rightBefore: '銀行',
        rightParticle: 'から',
        rightAfter: '借ります',
        rightSub: 'Tổ chức: bắt buộc から (không dùng に)',
      },
    ],
  },
  {
    id: 'wo',
    kana: 'を',
    readingHint: 'đọc "o"',
    lessonsSpan: 'Bài 3, 6, 7',
    cases: [
      {
        id: 'wo-buy',
        lesson: 'Bài 3',
        role: 'Mua / Gọi món',
        questionWord: '? なにを',
        formulaBefore: '[Vật]',
        formulaParticle: 'を',
        formulaAfter: 'ください',
        exBefore: 'これ',
        exParticle: 'を',
        exAfter: 'ください',
        exHira: 'これを ください',
        exVi: 'Cho tôi lấy cái này',
      },
      {
        id: 'wo-obj',
        lesson: 'Bài 6',
        role: 'Tân ngữ hành động',
        questionWord: '? なにを',
        formulaBefore: '[Danh từ]',
        formulaParticle: 'を',
        formulaAfter: 'V (ăn, đọc, します...)',
        exBefore: 'パン',
        exParticle: 'を',
        exAfter: '食べます',
        exHira: 'パンを たべます',
        exVi: 'Ăn bánh mì',
      },
      {
        id: 'wo-gift',
        lesson: 'Bài 7',
        role: 'Vật trao đổi',
        questionWord: '? なにを',
        formulaBefore: '[Người] に [Vật]',
        formulaParticle: 'を',
        formulaAfter: 'あげます・もらいます',
        exBefore: '友達に 手紙',
        exParticle: 'を',
        exAfter: '送ります',
        exHira: 'ともだちに てがみを おくります',
        exVi: 'Gửi thư cho bạn',
      },
    ],
    contrasts: [
      {
        id: 'wo-nanimo',
        leftAfter: '何を 食べません',
        leftSub: 'Sai',
        leftBad: true,
        sep: '→',
        rightBefore: '何',
        rightParticle: 'も',
        rightAfter: '食べません',
        rightSub: 'Không ăn gì cả (も xóa を)',
      },
    ],
  },
  {
    id: 'he',
    kana: 'へ',
    readingHint: 'đọc "e"',
    lessonsSpan: 'Bài 5, 7',
    cases: [
      {
        id: 'he-dir',
        lesson: 'Bài 5',
        role: 'Hướng di chuyển',
        questionWord: '? どこへ',
        formulaBefore: '[Địa điểm]',
        formulaParticle: 'へ',
        formulaAfter: '行きます・来ます・帰ります',
        exBefore: '京都',
        exParticle: 'へ',
        exAfter: '行きます',
        exHira: 'きょうとへ いきます',
        exVi: 'Đi Kyoto',
      },
    ],
    contrasts: [
      {
        id: 'he-send',
        leftBefore: '日本',
        leftParticle: 'へ',
        leftAfter: '荷物を送ります',
        leftSub: 'Gửi sang nước nào (B7)',
        sep: 'VS',
        rightBefore: '母',
        rightParticle: 'に',
        rightAfter: '荷物を送ります',
        rightSub: 'Gửi cho người nhận nào',
      },
    ],
  },
  {
    id: 'to',
    kana: 'と',
    lessonsSpan: 'Bài 4, 5',
    cases: [
      {
        id: 'to-and',
        lesson: 'Bài 4',
        role: 'Nối danh từ ("và")',
        formulaBefore: '[Danh từ 1]',
        formulaParticle: 'と',
        formulaAfter: '[Danh từ 2]',
        exBefore: '土曜日',
        exParticle: 'と',
        exAfter: '日曜日',
        exHira: 'どようびと にちようび',
        exVi: 'Thứ Bảy và Chủ nhật',
      },
      {
        id: 'to-with',
        lesson: 'Bài 5',
        role: 'Làm cùng ai',
        questionWord: '? だれと',
        formulaBefore: '[Người]',
        formulaParticle: 'と',
        formulaAfter: 'V',
        exBefore: '家族',
        exParticle: 'と',
        exAfter: '日本へ 来ました',
        exHira: 'かぞくと にほんへ きました',
        exVi: 'Đến Nhật cùng gia đình',
      },
    ],
    contrasts: [
      {
        id: 'to-alone',
        leftBefore: '友達',
        leftParticle: 'と',
        leftAfter: '行きます',
        leftSub: 'Đi cùng bạn',
        sep: 'VS',
        rightBefore: '1人',
        rightParticle: 'で',
        rightAfter: '行きます',
        rightSub: 'Đi 1 mình: dùng で (không dùng と)',
      },
    ],
  },
  {
    id: 'no',
    kana: 'の',
    lessonsSpan: 'Bài 1, 2, 3',
    cases: [
      {
        id: 'no-org',
        lesson: 'Bài 1',
        role: 'Thuộc công ty / trường',
        formulaBefore: '[Tổ chức]',
        formulaParticle: 'の',
        formulaAfter: '[Người]',
        exBefore: 'IMC',
        exParticle: 'の',
        exAfter: '社員です',
        exHira: 'アイエムシーの しゃいんです',
        exVi: 'Nhân viên của IMC',
      },
      {
        id: 'no-possess',
        lesson: 'Bài 2',
        role: 'Sở hữu & Nội dung',
        questionWord: '? だれの・なんの',
        formulaBefore: '[Chủ / Đề tài]',
        formulaParticle: 'の',
        formulaAfter: '[Đồ vật]',
        exBefore: '日本語',
        exParticle: 'の',
        exAfter: '本です',
        exHira: 'にほんごの ほんです',
        exVi: 'Sách dạy tiếng Nhật',
      },
      {
        id: 'no-origin',
        lesson: 'Bài 3',
        role: 'Xuất xứ / Hãng',
        questionWord: '? どこの',
        formulaBefore: '[Nước / Hãng]',
        formulaParticle: 'の',
        formulaAfter: '[Sản phẩm]',
        exBefore: '日本',
        exParticle: 'の',
        exAfter: '車です',
        exHira: 'にほんの くるまです',
        exVi: 'Ô tô xuất xứ Nhật',
      },
    ],
    contrasts: [
      {
        id: 'no-book',
        leftBefore: '日本語',
        leftParticle: 'の',
        leftAfter: '本 (なんの)',
        leftSub: 'Sách về tiếng Nhật',
        sep: 'VS',
        rightBefore: '日本',
        rightParticle: 'の',
        rightAfter: '本 (どこの)',
        rightSub: 'Sách của nước Nhật',
      },
    ],
  },
  {
    id: 'wa_mo',
    kana: 'は・も',
    readingHint: 'は đọc "wa"',
    lessonsSpan: 'Bài 1, 5, 6, 7',
    cases: [
      {
        id: 'wa-topic',
        lesson: 'Bài 1',
        role: 'Chủ đề câu',
        formulaBefore: '[Chủ đề]',
        formulaParticle: 'は',
        formulaAfter: 'Vị ngữ',
        exBefore: 'わたし',
        exParticle: 'は',
        exAfter: '学生です',
        exHira: 'わたしは がくせいです',
        exVi: 'Tôi là sinh viên',
      },
      {
        id: 'mo-also',
        lesson: 'Bài 1',
        role: '"Cũng" (thay は)',
        formulaBefore: '[Danh từ]',
        formulaParticle: 'も',
        formulaAfter: 'Vị ngữ tương đồng',
        exBefore: 'ミラーさん',
        exParticle: 'も',
        exAfter: '会社員です',
        exHira: 'ミラーさんも かいしゃいんです',
        exVi: 'Anh Miller cũng là nhân viên',
      },
      {
        id: 'mo-neg',
        lesson: 'Bài 5–6',
        role: 'Phủ định hoàn toàn',
        formulaBefore: 'どこ(へ) / 何',
        formulaParticle: 'も',
        formulaAfter: 'V-ません',
        exBefore: 'どこへ',
        exParticle: 'も',
        exAfter: '行きません',
        exHira: 'どこへも いきません',
        exVi: 'Không đi đâu cả',
      },
      {
        id: 'nimo-niwa',
        lesson: 'Bài 7',
        role: 'Ghép にも / には',
        formulaBefore: '[Người]',
        formulaParticle: 'にも・には',
        formulaAfter: 'V',
        exBefore: '日曜日は 父',
        exParticle: 'にも',
        exAfter: 'かけます',
        exHira: 'にちようびは ちちにも かけます',
        exVi: 'Chủ nhật gọi cho cả bố',
      },
    ],
    contrasts: [
      {
        id: 'nimo-vs-niwa',
        leftBefore: '父',
        leftParticle: 'にも',
        leftAfter: '送ります',
        leftSub: 'Cho cả bố (cộng thêm)',
        sep: 'VS',
        rightBefore: '母',
        rightParticle: 'には',
        rightAfter: 'チョコです',
        rightSub: 'Riêng mẹ thì... (đối lập)',
      },
    ],
  },
];

function ParticleBadge({ text }: { text: string }) {
  return (
    <span className="inline-block px-1.5 py-0.5 rounded-md bg-blue-100/90 text-blue-700 dark:bg-blue-950/85 dark:text-blue-300 font-bold text-xs mx-0.5">
      {text}
    </span>
  );
}

interface ParticleSectionProps {
  filter: ParticleFilterId;
  onSelectFilter: (next: ParticleFilterId) => void;
}

export default function ParticleSection({ filter, onSelectFilter }: ParticleSectionProps) {
  const practiceRef = useRef<HTMLDivElement | null>(null);

  const jumpToPractice = useCallback(() => {
    setTimeout(() => {
      practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  }, []);

  const visibleProfiles =
    filter === 'all' ? PARTICLE_PROFILES : PARTICLE_PROFILES.filter((p) => p.id === filter);

  return (
    <div className="space-y-5 sm:space-y-6">
      <SheetSection className="space-y-6">
        <SheetHeader
          title="Hệ thống Trợ từ & Cách phân biệt (Bài 1 – Bài 7)"
          subtitle="Thống kê các trường hợp sử dụng của từng trợ từ qua từng bài và các cặp đối chiếu dễ nhầm."
          actionLabel="Luyện tập Trợ từ"
          onAction={jumpToPractice}
        />

        {/* 1. Thanh chọn nhanh dạng Pill tròn tối giản */}
        <div className="flex flex-wrap items-center gap-2">
          {PARTICLE_FILTER_OPTIONS.map((opt) => {
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectFilter(opt.id)}
                aria-pressed={isActive}
                className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer touch-manipulation border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.shortKana}
              </button>
            );
          })}
        </div>

        {/* 2. Dải mỏ neo 5 cột: Cùng danh từ 会社 đi với 5 trợ từ */}
        {filter === 'all' && (
          <div className="space-y-2.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50">
              Cùng danh từ「会社」đi với 5 trợ từ
            </h3>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 grid grid-cols-1 sm:grid-cols-5 overflow-hidden">
              {SAME_NOUN_MATRIX.map((item) => (
                <div
                  key={item.particle}
                  className="p-3 sm:p-3.5 flex items-center justify-between sm:items-start gap-2 bg-white dark:bg-slate-900/40"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {item.lesson} · {item.role}
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      会社 <ParticleBadge text={item.particle} />{' '}
                      <span className="sm:block sm:mt-0.5">{item.after}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.vi}</p>
                  </div>

                  <AudioIconButton
                    tts={item.hira}
                    label={`Nghe ${item.hira}`}
                    className="min-h-[36px] min-w-[36px]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Các Bảng Kẻ Dòng Phẳng Cho Từng Trợ Từ */}
        <div className="space-y-7">
          {visibleProfiles.map((profile) => (
            <div key={profile.id} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
                    Trợ từ {profile.kana} — {profile.cases.length} cách dùng
                  </h3>
                  {profile.readingHint && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {profile.readingHint}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {profile.lessonsSpan}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                {profile.cases.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900/40 px-3.5 py-3 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-0 items-center"
                  >
                    <div className="lg:col-span-4 lg:pr-3 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium shrink-0">
                        {item.lesson}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {item.role}
                      </span>
                      {item.questionWord && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({item.questionWord})
                        </span>
                      )}
                    </div>

                    <div className="hidden sm:flex lg:col-span-4 lg:px-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 items-center flex-wrap gap-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <span>{item.formulaBefore}</span>
                      <strong className="font-bold text-slate-900 dark:text-white">
                        {item.formulaParticle}
                      </strong>
                      <span>{item.formulaAfter}</span>
                    </div>

                    <div className="lg:col-span-4 lg:pl-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {item.exBefore} <ParticleBadge text={item.exParticle} /> {item.exAfter}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.exHira} · {item.exVi}
                        </p>
                      </div>

                      <AudioIconButton tts={item.exHira} label={`Nghe ${item.exHira}`} />
                    </div>
                  </div>
                ))}
              </div>

              {profile.contrasts.length > 0 && (
                <CalloutBar tone="blue">
                  <div className="space-y-1.5">
                    {profile.contrasts.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm"
                      >
                        <span
                          className={
                            c.leftBad
                              ? 'line-through text-rose-600 dark:text-rose-400 font-semibold'
                              : 'font-bold text-slate-900 dark:text-white'
                          }
                        >
                          {c.leftBefore && <>{c.leftBefore} </>}
                          {c.leftParticle && <ParticleBadge text={c.leftParticle} />}
                          {c.leftAfter}
                        </span>
                        {c.leftSub && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({c.leftSub})
                          </span>
                        )}

                        <span className="font-bold text-blue-600 dark:text-blue-400 px-1">
                          {c.sep}
                        </span>

                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.rightBefore && <>{c.rightBefore} </>}
                          {c.rightParticle && <ParticleBadge text={c.rightParticle} />}
                          {c.rightAfter}
                        </span>
                        {c.rightSub && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({c.rightSub})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CalloutBar>
              )}
            </div>
          ))}
        </div>
      </SheetSection>

      {/* 4. Phòng luyện tập phân biệt Trợ từ (Bài 1 -> Bài 7) */}
      <div ref={practiceRef} className="scroll-mt-4">
        <ParticlePracticeArena activeFilter={filter} />
      </div>
    </div>
  );
}
