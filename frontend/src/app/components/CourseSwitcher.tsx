'use client';

interface CourseSwitcherProps {
  activeCourse: 'minna' | 'marugoto';
  onSwitch: (course: 'minna' | 'marugoto') => void;
}

export default function CourseSwitcher({ activeCourse, onSwitch }: CourseSwitcherProps) {
  return (
    <div className="mb-6 px-2">
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">
        Khoá học
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onSwitch('minna')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
            activeCourse === 'minna'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-900/30'
              : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          📚 Minna
        </button>
        <button
          onClick={() => onSwitch('marugoto')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
            activeCourse === 'marugoto'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-500 shadow-lg shadow-rose-900/30'
              : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          🌸 Marugoto
        </button>
      </div>
    </div>
  );
}
