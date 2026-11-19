export interface PracticeOptionItem {
  id: string;
  label: string;
  subLabel?: string;
}

export type BadgeTone = 'indigo' | 'amber' | 'emerald' | 'rose';

export interface PracticeArenaQuestion {
  id: string;
  badgeText: string;
  badgeTone: BadgeTone;
  promptMain: string;
  promptSub?: string;
  contextHint?: string;
  isAudioPrompt?: boolean;
  ttsText: string;
  correctId: string;
  correctDisplay: string;
  explanationTitle?: string;
  explanationSub?: string;
  options: PracticeOptionItem[];
  trapNote: string;
}

export interface ArenaTopicTab<T extends string = string> {
  id: T;
  label: string;
}

export interface ArenaModeOption<M extends string = string> {
  id: M;
  badge: string;
  title: string;
  desc: string;
}

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * WebKit / iOS Safari hardened Japanese SpeechSynthesis helper
 */
export function speakJapaneseNote(text: string, rate = 0.92): void {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
  if (jaVoice) utterance.voice = jaVoice;

  const win = window as unknown as { _activeUtterances?: SpeechSynthesisUtterance[] };
  win._activeUtterances = win._activeUtterances || [];
  win._activeUtterances.push(utterance);
  const cleanup = () => {
    if (!win._activeUtterances) return;
    const idx = win._activeUtterances.indexOf(utterance);
    if (idx > -1) win._activeUtterances.splice(idx, 1);
  };
  utterance.onend = cleanup;
  utterance.onerror = cleanup;

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  window.speechSynthesis.speak(utterance);
}
