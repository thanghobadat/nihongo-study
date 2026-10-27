-- Down Migration: 001_add_jlpt_level_and_kanji_word_down.sql
-- Description: Revert jlpt_level columns

ALTER TABLE public.grammar DROP COLUMN IF EXISTS jlpt_level;
ALTER TABLE public.vocabulary DROP COLUMN IF EXISTS jlpt_level;
ALTER TABLE public.kanji DROP COLUMN IF EXISTS jlpt_level;
