-- Migration: 001_add_jlpt_level_and_kanji_word.sql
-- Description: Add jlpt_level to kanji, vocabulary, grammar and ensure kanji_word in vocabulary

-- 1. Ensure kanji_word exists in vocabulary
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS kanji_word TEXT;

-- 2. Add jlpt_level to kanji
ALTER TABLE public.kanji ADD COLUMN IF NOT EXISTS jlpt_level TEXT DEFAULT 'other';

-- 3. Add jlpt_level to vocabulary
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS jlpt_level TEXT DEFAULT 'other';

-- 4. Add jlpt_level to grammar
ALTER TABLE public.grammar ADD COLUMN IF NOT EXISTS jlpt_level TEXT DEFAULT 'other';
