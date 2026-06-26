// Helper to play native audio from LanguagePod101 with a browser SpeechSynthesis fallback

/**
 * Speaks text using the browser's built-in Text-to-Speech (TTS).
 */
export function speakTTS(text: string) {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to locate a Japanese native voice
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
    if (jpVoice) {
      utterance.voice = jpVoice;
    }
    
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // Slightly slower for easier learning
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Attempts to play native speaker audio for a word from LanguagePod101.
 * Automatically falls back to browser TTS if download fails, times out, or errors out.
 * 
 * @param kanji The Kanji form of the word (if any).
 * @param kana The Hiragana/Katakana reading.
 */
export function playAudioWithFallback(kanji: string, kana: string) {
  if (typeof window === 'undefined') return;

  const cleanKanji = (kanji || '').trim();
  const cleanKana = (kana || '').trim();
  
  if (!cleanKana) return;

  // Use kanji if available and different from kana; otherwise, use kana for both fields
  const queryKanji = cleanKanji && cleanKanji !== cleanKana ? cleanKanji : cleanKana;
  const audioUrl = `https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji=${encodeURIComponent(queryKanji)}&kana=${encodeURIComponent(cleanKana)}`;
  
  console.log(`[AudioHelper] Attempting native audio: ${queryKanji} (${cleanKana})`);
  
  const audio = new Audio(audioUrl);
  let isFallbackTriggered = false;

  const triggerFallback = (reason: string) => {
    if (isFallbackTriggered) return;
    isFallbackTriggered = true;
    console.warn(`[AudioHelper] Native audio fallback triggered: ${reason}. Using TTS for: ${cleanKana}`);
    speakTTS(cleanKana);
  };

  // 2-second timeout fallback trigger
  const timeoutId = setTimeout(() => {
    triggerFallback('load_timeout');
  }, 2000);

  audio.addEventListener('playing', () => {
    clearTimeout(timeoutId);
    console.log('[AudioHelper] Native audio playing successfully.');
  });

  audio.addEventListener('error', () => {
    clearTimeout(timeoutId);
    triggerFallback('network_or_404_error');
  });

  audio.play().catch((err) => {
    clearTimeout(timeoutId);
    triggerFallback(err?.message || 'autoplay_blocked');
  });
}
