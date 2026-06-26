// Helper for Japanese Pitch Accent analysis and visual formatting

export interface MoraState {
  text: string;
  pitch: 'H' | 'L';
  hasDrop: boolean;
}

/**
 * Splits a Kana string (Hiragana or Katakana) into its component Morae.
 * Handles contractions (yōon) like 'きょ' or 'ちゅ' as a single mora.
 */
export function splitIntoMorae(kana: string): string[] {
  if (!kana) return [];
  const morae: string[] = [];
  // Matches any character optionally followed by a small yōon kana (ya/yu/yo/a/i/u/e/o)
  const regex = /.[ゃゅょぁぃぅぇぉャュョァィゥェォ]?/g;
  let match;
  while ((match = regex.exec(kana)) !== null) {
    morae.push(match[0]);
  }
  return morae;
}

/**
 * Returns the pitch accent states (High/Low and drop position) for each mora in a word.
 * @param kana The pronunciation reading in Hiragana/Katakana.
 * @param accent The accent nucleus index (0 for Heiban, 1 for Atamadaka, N for Nakadaka/Odaka).
 */
export function getPitchAccentStates(kana: string, accent: number): MoraState[] {
  const morae = splitIntoMorae(kana);
  const M = morae.length;
  const N = accent;

  return morae.map((mora, index) => {
    const i = index + 1; // 1-indexed mora position
    let pitch: 'H' | 'L' = 'L';
    let hasDrop = false;

    if (N === 1) {
      pitch = (i === 1) ? 'H' : 'L';
    } else {
      // For N = 0 (Heiban) or N > 1 (Nakadaka/Odaka)
      pitch = (i === 1) ? 'L' : (i <= N || N === 0) ? 'H' : 'L';
    }

    if (N > 0 && i === N) {
      hasDrop = true;
    }

    return {
      text: mora,
      pitch,
      hasDrop
    };
  });
}

/**
 * Returns a user-friendly label describing the pitch accent type.
 */
export function getPitchAccentLabel(accent: number, kana: string): { name: string; description: string } {
  const M = splitIntoMorae(kana).length;
  if (accent === 0) {
    return {
      name: 'Heiban (平板 - Flat)',
      description: 'Âm đầu thấp, các âm tiếp theo cao và giữ nguyên độ cao cho trợ từ.'
    };
  } else if (accent === 1) {
    return {
      name: 'Atamadaka (頭高 - Head-high)',
      description: 'Âm đầu cao, các âm sau thấp dần và trợ từ đi kèm cũng thấp.'
    };
  } else if (accent === M) {
    return {
      name: 'Odaka (尾高 - Tail-high)',
      description: 'Âm đầu thấp, các âm sau cao đến hết từ, nhưng trợ từ đi kèm sẽ rơi xuống thấp.'
    };
  } else if (accent > 1 && accent < M) {
    return {
      name: 'Nakadaka (中高 - Middle-high)',
      description: `Âm đầu thấp, đi lên cao và rơi xuống thấp bắt đầu từ âm tiết thứ ${accent + 1}.`
    };
  }
  return {
    name: 'Không xác định',
    description: 'Không có dữ liệu trọng âm.'
  };
}
