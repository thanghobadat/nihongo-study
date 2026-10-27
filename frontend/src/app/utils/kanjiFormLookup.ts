/**
 * Utility to map Hiragana words to their corresponding Kanji form.
 * Reads directly from vocabulary `kanji_word` (filled from Jisho / JMdict),
 * and falls back to Kanji compounds if not available.
 * 
 * Replaces the old 1,781-entry hardcoded dictionary to eliminate hardcoded lookup bugs.
 */

export const HIRAGANA_TO_KANJI: Record<string, string> = {};

/**
 * Converts a Hiragana/Katakana word into its Kanji form.
 * If kanjiItems is provided, only converts if the Kanji characters belong to current lesson's Kanji list.
 * Fallbacks to compounds or original hiragana.
 */
export function getKanjiForm(
  hiraganaOrVocab: string | any,
  kanjiItems: any[] = [],
  vocabItems: any[] = []
): string {
  if (!hiraganaOrVocab) return '';

  let hiragana = '';
  let kanjiWord = '';

  if (typeof hiraganaOrVocab === 'object') {
    hiragana = (hiraganaOrVocab.hiragana || '').trim();
    kanjiWord = (hiraganaOrVocab.kanji_word || hiraganaOrVocab.kanji_form || '').trim();
  } else {
    hiragana = String(hiraganaOrVocab).trim();
  }

  const hasLessonKanji = Array.isArray(kanjiItems) && kanjiItems.length > 0;
  const lessonKanjiChars = hasLessonKanji ? new Set(kanjiItems.map((k: any) => k?.character).filter(Boolean)) : null;

  // 1. If kanji_word is already known or found in vocabItems
  if (!kanjiWord && Array.isArray(vocabItems) && vocabItems.length > 0) {
    const matched = vocabItems.find((v: any) => (v?.hiragana || '').trim() === hiragana && (v?.kanji_word || v?.kanji_form));
    if (matched) {
      kanjiWord = (matched.kanji_word || matched.kanji_form || '').trim();
    }
  }

  if (kanjiWord && kanjiWord !== hiragana) {
    // If lessonKanji context is provided, enforce that all kanji in the candidate exist in this lesson
    if (lessonKanjiChars && lessonKanjiChars.size > 0) {
      const kanjiInCandidate = kanjiWord.match(/[\u4e00-\u9faf]/g);
      if (kanjiInCandidate && kanjiInCandidate.length > 0) {
        const allInLesson = kanjiInCandidate.every((c: string) => lessonKanjiChars.has(c));
        if (allInLesson) {
          return kanjiWord;
        }
        return hiragana;
      }
    }
    return kanjiWord;
  }

  // 2. Try to resolve using current lesson's Kanji compounds directly
  if (hasLessonKanji && kanjiItems) {
    for (const kanji of kanjiItems) {
      if (!kanji?.character) continue;

      if (kanji.compounds) {
        const parts = kanji.compounds.split(';');
        for (const part of parts) {
          const m = part.match(/^([^\(（\s:;]+)[\(（]([^)）]+)[\)）]/);
          if (m) {
            const kWord = m[1].trim();
            const hWord = m[2].trim();
            if (hiragana === hWord) {
              return kWord;
            }
          }
        }
      }

      if (hiragana === kanji.character) {
        return kanji.character;
      }
    }
  }

  // 3. Fallback to original Hiragana/Katakana form
  return hiragana;
}

/**
 * Checks if a word has a valid Kanji form composed of the current lesson's Kanji characters.
 * Returns true only if the word converts to a Kanji form and all its Kanji belong to this lesson.
 */
export function hasLessonKanji(hiragana: string, kanjiItems: any[] = []): boolean {
  if (!hiragana || !Array.isArray(kanjiItems) || kanjiItems.length === 0) return false;
  const kForm = getKanjiForm(hiragana, kanjiItems);
  if (!kForm || kForm.trim() === hiragana.trim()) return false;

  const lessonKanjiChars = new Set(kanjiItems.map((k: any) => k?.character).filter(Boolean));
  const kanjiChars = kForm.match(/[\u4e00-\u9faf]/g);
  return Boolean(kanjiChars && kanjiChars.length > 0 && kanjiChars.every(c => lessonKanjiChars.has(c)));
}

/**
 * Global Kanji lookup without restricting to a single lesson's taught Kanji.
 * Reads directly from `kanji_word`, falls back to `compounds` across all kanji, or returns hiragana.
 */
export function getGlobalKanjiForm(
  itemOrHiragana: string | any,
  allKanjiList: any[] = [],
  allVocabList: any[] = []
): string {
  if (!itemOrHiragana) return '';

  if (typeof itemOrHiragana === 'object') {
    if (itemOrHiragana.kanji_word && itemOrHiragana.kanji_word.trim()) {
      return itemOrHiragana.kanji_word.trim();
    }
    if (itemOrHiragana.kanji_form && itemOrHiragana.kanji_form.trim()) {
      return itemOrHiragana.kanji_form.trim();
    }
    itemOrHiragana = itemOrHiragana.hiragana || '';
  }

  const trimmed = String(itemOrHiragana).trim();

  // 1. Check allVocabList if available
  if (Array.isArray(allVocabList) && allVocabList.length > 0) {
    const matched = allVocabList.find((v: any) => (v?.hiragana || '').trim() === trimmed && (v?.kanji_word || v?.kanji_form));
    if (matched) {
      const k = (matched.kanji_word || matched.kanji_form || '').trim();
      if (k) return k;
    }
  }

  // 2. Check compounds across all kanji if provided
  if (Array.isArray(allKanjiList) && allKanjiList.length > 0) {
    for (const kanji of allKanjiList) {
      if (!kanji?.character) continue;
      if (kanji.compounds) {
        const parts = kanji.compounds.split(';');
        for (const part of parts) {
          const m = part.match(/^([^\(（\s:;]+)[\(（]([^)）]+)[\)）]/);
          if (m) {
            const kWord = m[1].trim();
            const hWord = m[2].trim();
            if (trimmed === hWord) {
              return kWord;
            }
          }
        }
      }
      if (trimmed === kanji.character) {
        return kanji.character;
      }
    }
  }

  // 3. Fallback
  return trimmed;
}

/**
 * Finds all vocabulary items in the course that contain a specific Kanji character.
 */
export function getRelatedVocabForKanji(kanjiChar: string, allVocabs: any[], allKanjiList: any[] = []): any[] {
  if (!kanjiChar || !Array.isArray(allVocabs) || allVocabs.length === 0) return [];
  const char = kanjiChar.trim();

  return allVocabs.filter(v => {
    if (!v) return false;
    const kForm = v.kanji_word || v.kanji_form || getGlobalKanjiForm(v, allKanjiList, allVocabs);
    return kForm && kForm.includes(char);
  }).map(v => ({
    ...v,
    kanji_form: v.kanji_word || v.kanji_form || getGlobalKanjiForm(v, allKanjiList, allVocabs)
  }));
}
