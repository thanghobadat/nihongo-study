// Utility to resolve Kanji forms for vocabulary words.
// Reads directly from vocabulary.kanji_word and dynamic Kanji lesson context.
// No static hardcoded dictionaries to prevent mismatch errors.

export const HIRAGANA_TO_KANJI: Record<string, string> = {};

/**
 * Converts a Hiragana/Katakana word into its Kanji form using vocabulary kanji_word,
 * compound matching from current lesson's Kanji list, or fallback to original hiragana.
 */
export function getKanjiForm(hiragana: string, kanjiItems: any[] = [], kanjiWord?: string): string {
  if (kanjiWord && kanjiWord.trim()) {
    return kanjiWord.trim();
  }
  if (!hiragana) return '';

  const trimmed = hiragana.trim();

  // Try to resolve using current lesson's Kanji compounds or character match
  if (Array.isArray(kanjiItems) && kanjiItems.length > 0) {
    for (const kanji of kanjiItems) {
      if (!kanji?.character) continue;

      if (kanji.compounds) {
        const parts = kanji.compounds.split(';');
        for (const part of parts) {
          const m = part.match(/([^\(\)\s:;]+)\s*\(([^)]+)\)/);
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

  return hiragana;
}

/**
 * Checks if a word has a valid Kanji form composed of the current lesson's Kanji characters.
 */
export function hasLessonKanji(hiragana: string, kanjiItems: any[] = [], kanjiWord?: string): boolean {
  if (!hiragana && !kanjiWord) return false;
  if (!Array.isArray(kanjiItems) || kanjiItems.length === 0) return false;

  const kForm = (kanjiWord && kanjiWord.trim()) || getKanjiForm(hiragana, kanjiItems);
  if (!kForm || kForm.trim() === hiragana.trim()) return false;

  const lessonKanjiChars = new Set(kanjiItems.map((k: any) => k?.character).filter(Boolean));
  const kanjiChars = kForm.match(/[\u4e00-\u9faf]/g);
  return Boolean(kanjiChars && kanjiChars.length > 0 && kanjiChars.every(c => lessonKanjiChars.has(c)));
}

/**
 * Global Kanji lookup across all available kanji.
 */
export function getGlobalKanjiForm(hiragana: string, allKanjiList: any[] = [], kanjiWord?: string): string {
  if (kanjiWord && kanjiWord.trim()) {
    return kanjiWord.trim();
  }
  if (!hiragana) return '';

  const trimmed = hiragana.trim();

  if (Array.isArray(allKanjiList) && allKanjiList.length > 0) {
    for (const kanji of allKanjiList) {
      if (!kanji?.character) continue;
      if (kanji.compounds) {
        const parts = kanji.compounds.split(';');
        for (const part of parts) {
          const m = part.match(/([^\(\)\s:;]+)\s*\(([^)]+)\)/);
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

  return hiragana;
}

/**
 * Finds all vocabulary items in the course that contain a specific Kanji character.
 */
export function getRelatedVocabForKanji(kanjiChar: string, allVocabs: any[], allKanjiList: any[] = []): any[] {
  if (!kanjiChar || !Array.isArray(allVocabs) || allVocabs.length === 0) return [];
  const char = kanjiChar.trim();

  return allVocabs.filter(v => {
    if (!v) return false;
    const kForm = v.kanji_word || v.kanji_form || getGlobalKanjiForm(v.hiragana, allKanjiList);
    return kForm && kForm.includes(char);
  }).map(v => ({
    ...v,
    kanji_form: v.kanji_word || v.kanji_form || getGlobalKanjiForm(v.hiragana, allKanjiList)
  }));
}
