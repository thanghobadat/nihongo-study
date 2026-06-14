-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Profile Trigger when a new user registers in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create Lessons Table
CREATE TABLE public.lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Vocabulary Table
CREATE TABLE public.vocabulary (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES public.lessons(id) ON DELETE CASCADE,
  hiragana TEXT NOT NULL,
  romaji TEXT NOT NULL,
  vietnamese_meaning TEXT NOT NULL,
  word_type TEXT, -- e.g., 'noun', 'verb', 'adjective'
  japanese_example TEXT,
  example_meaning TEXT,
  mnemonic_tip TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Kanji Table
CREATE TABLE public.kanji (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES public.lessons(id) ON DELETE CASCADE,
  character TEXT NOT NULL,
  stroke_count TEXT,
  onyomi TEXT,
  kunyomi TEXT,
  sino_vietnamese TEXT,
  vietnamese_meaning TEXT NOT NULL,
  mnemonic_tip TEXT,
  compounds TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Grammar Table
CREATE TABLE public.grammar (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g., N1 + N2
  meaning TEXT NOT NULL,
  structure TEXT,
  vietnamese_explanation TEXT,
  japanese_example TEXT,
  example_meaning TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 6. Create Kaiwa Dialog Table
CREATE TABLE public.kaiwa_dialog (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES public.lessons(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL,
  japanese TEXT NOT NULL,
  romaji TEXT NOT NULL,
  vietnamese TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 7. Create User Progress Table (Zebra / Checkbox Progress)
CREATE TABLE public.user_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'vocabulary' or 'kanji'
  item_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_learned', -- 'not_learned', 'learning', 'mastered'
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);


-- 7. Create Target Plans Table (Dashboard planning)
CREATE TABLE public.target_plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  vocabulary_target INTEGER DEFAULT 0,
  kanji_target INTEGER DEFAULT 0,
  self_evaluation TEXT, -- 'Chưa đạt', 'Cần cố gắng', 'Khá', 'Tốt', 'Xuất sắc'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- RLS Policies Configuration (Simplified read all lessons, secure write to progress/targets)
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanji ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaiwa_dialog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_plans ENABLE ROW LEVEL SECURITY;

-- General SELECT Policies for public lessons
CREATE POLICY "Allow public read of lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Allow public read of vocabulary" ON public.vocabulary FOR SELECT USING (true);
CREATE POLICY "Allow public read of kanji" ON public.kanji FOR SELECT USING (true);
CREATE POLICY "Allow public read of grammar" ON public.grammar FOR SELECT USING (true);
CREATE POLICY "Allow public read of kaiwa_dialog" ON public.kaiwa_dialog FOR SELECT USING (true);

-- User specific Policies for user_progress
CREATE POLICY "Allow user read own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow user insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user delete own progress" ON public.user_progress FOR DELETE USING (auth.uid() = user_id);

-- User specific Policies for target_plans
CREATE POLICY "Allow user read own targets" ON public.target_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow user insert own targets" ON public.target_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user update own targets" ON public.target_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin CRUD Policies
CREATE POLICY "Admin full access profiles" ON public.profiles USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admin write access lessons" ON public.lessons FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admin write access vocabulary" ON public.vocabulary FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admin write access kanji" ON public.kanji FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admin write access grammar" ON public.grammar FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admin write access kaiwa_dialog" ON public.kaiwa_dialog FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

