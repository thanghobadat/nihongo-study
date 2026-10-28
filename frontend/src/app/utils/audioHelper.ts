// Helper to play native audio from LanguagePod101 with a browser SpeechSynthesis fallback

/**
 * Speaks text using the browser's built-in Text-to-Speech (TTS).
 */
export function speakTTS(text: string) {
  const cleanText = (text || '').replace(/\([^)]+\)/g, '').replace(/（[^）]+）/g, '').trim();
  if (!cleanText) return;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to locate a Japanese native voice
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
    if (jpVoice) {
      utterance.voice = jpVoice;
    }
    
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // Slightly slower for easier learning

    // GC protection for Chrome & iOS/Safari
    (window as any)._activeUtterances = (window as any)._activeUtterances || [];
    (window as any)._activeUtterances.push(utterance);
    utterance.onend = () => {
      const idx = (window as any)._activeUtterances.indexOf(utterance);
      if (idx > -1) (window as any)._activeUtterances.splice(idx, 1);
    };
    utterance.onerror = () => {
      const idx = (window as any)._activeUtterances.indexOf(utterance);
      if (idx > -1) (window as any)._activeUtterances.splice(idx, 1);
    };

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Attempts to play native speaker audio for a word from LanguagePod101.
 * Automatically falls back to browser TTS if download fails, times out, errors out,
 * or returns the standard 52KB error audio file.
 * 
 * @param kanji The Kanji form of the word (if any).
 * @param kana The Hiragana/Katakana reading.
 */
export async function playAudioWithFallback(kanji: string, kana?: string) {
  if (typeof window === 'undefined') return;

  const cleanKanji = (kanji || '').trim();
  const cleanKana = (kana !== undefined ? kana : cleanKanji).trim();
  
  if (!cleanKana && !cleanKanji) return;

  // 1. Detect if it's a sentence or contains Japanese grammatical markers/particles/spaces
  const isSentence = cleanKana.length >= 8 || 
                    /[\u3001\u3002\uff0c\uff0e\uff1f\uff01\?\!（）\(\)]/.test(cleanKana) || 
                    cleanKana.includes(' ') || 
                    cleanKana.includes('　') ||
                    /(です|ます|でした|ません|じゃありません|か$|は|が|を|に|で|と)/.test(cleanKana);

  if (isSentence) {
    console.log(`[AudioHelper] Detected sentence. Using Browser TTS directly: ${cleanKana}`);
    speakTTS(cleanKana);
    return;
  }

  // 2. For single words, fetch and check content size to detect LanguagePod151 error audio (52288 bytes)
  const queryKanji = cleanKanji && cleanKanji !== cleanKana ? cleanKanji : cleanKana;
  const audioUrl = `https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji=${encodeURIComponent(queryKanji)}&kana=${encodeURIComponent(cleanKana)}`;
  
  console.log(`[AudioHelper] Fetching native audio: ${queryKanji} (${cleanKana})`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout
    
    const response = await fetch(audioUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Network error or 404');
    }

    const blob = await response.blob();
    
    // Check if it's the standard LanguagePod101 English error voice file (exactly 52288 bytes)
    if (blob.size === 52288) {
      console.warn(`[AudioHelper] Error audio file detected (52288 bytes). Falling back to TTS for: ${cleanKana}`);
      speakTTS(cleanKana);
      return;
    }

    // Check if the file is too small (meaningless or empty audio)
    if (blob.size < 500) {
      console.warn(`[AudioHelper] Audio file too small (${blob.size} bytes). Falling back to TTS.`);
      speakTTS(cleanKana);
      return;
    }

    // Play the valid native speaker audio
    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio(objectUrl);
    await audio.play();
  } catch (error: any) {
    console.warn(`[AudioHelper] Native audio failed, falling back to TTS:`, error?.message || error);
    speakTTS(cleanKana);
  }
}

/**
 * Synthesizes instantaneous feedback sound effects for speedrun practice using Web Audio API.
 * Zero external audio downloads, zero latency.
 */
export function playSpeedrunSound(type: 'correct' | 'wrong') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'correct') {
      // Pleasant dual-tone chime (C5 ~523Hz -> G5 ~784Hz)
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.08);
      gain2.gain.setValueAtTime(0.15, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.25);
    } else {
      // Soft low buzzer tone (~160Hz -> ~110Hz)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // Graceful fallback if audio context is blocked
  }
}

