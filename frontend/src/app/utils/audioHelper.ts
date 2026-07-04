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
 * Automatically falls back to browser TTS if download fails, times out, errors out,
 * or returns the standard 52KB error audio file.
 * 
 * @param kanji The Kanji form of the word (if any).
 * @param kana The Hiragana/Katakana reading.
 */
export async function playAudioWithFallback(kanji: string, kana: string) {
  if (typeof window === 'undefined') return;

  const cleanKanji = (kanji || '').trim();
  const cleanKana = (kana || '').trim();
  
  if (!cleanKana) return;

  // 1. Detect if it's a long sentence or contains Japanese punctuation/spaces
  const isSentence = cleanKana.length > 15 || 
                    /[\u3001\u3002\uff0c\uff0e\uff1f\uff01\?\!（）\(\)]/.test(cleanKana) || 
                    cleanKana.includes(' ') || 
                    cleanKana.includes('　');

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
