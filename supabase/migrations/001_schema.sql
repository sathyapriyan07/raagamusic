-- Raaga Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your database.

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  banner TEXT DEFAULT '',
  primary_role TEXT NOT NULL DEFAULT 'Singer',
  bio TEXT NOT NULL DEFAULT '',
  roles TEXT[] DEFAULT '{}',
  song_count INTEGER DEFAULT 0,
  album_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Albums table
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  artists JSONB DEFAULT '[]',
  artwork TEXT NOT NULL DEFAULT '',
  logo_url TEXT DEFAULT '',
  release_year INTEGER NOT NULL DEFAULT 2026,
  release_date TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT 'Pop',
  language TEXT NOT NULL DEFAULT 'English',
  type TEXT NOT NULL DEFAULT 'album' CHECK (type IN ('album', 'single', 'ep')),
  track_ids TEXT[] DEFAULT '{}',
  runtime TEXT NOT NULL DEFAULT '0 mins',
  streaming_links JSONB DEFAULT '{}',
  credits JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  album_id TEXT REFERENCES albums(id) ON DELETE SET NULL,
  album_name TEXT DEFAULT '',
  artwork TEXT DEFAULT '',
  artists JSONB DEFAULT '[]',
  duration TEXT NOT NULL DEFAULT '3:30',
  explicit BOOLEAN DEFAULT FALSE,
  release_date TEXT DEFAULT '',
  release_year INTEGER DEFAULT 2026,
  genre TEXT DEFAULT 'Pop',
  language TEXT DEFAULT 'English',
  youtube_video_id TEXT DEFAULT '',
  track_number INTEGER DEFAULT 1,
  credits JSONB DEFAULT '{}',
  streaming_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curated sections (home page rows)
CREATE TABLE IF NOT EXISTS curated_sections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  item_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin / system logs
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  message TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'add' CHECK (type IN ('import', 'edit', 'add')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_artists_updated_at') THEN
    CREATE TRIGGER set_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_albums_updated_at') THEN
    CREATE TRIGGER set_albums_updated_at BEFORE UPDATE ON albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_songs_updated_at') THEN
    CREATE TRIGGER set_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_curated_sections_updated_at') THEN
    CREATE TRIGGER set_curated_sections_updated_at BEFORE UPDATE ON curated_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_profiles_updated_at') THEN
    CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- Enable Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE curated_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Allow public read, admin write
CREATE POLICY "Allow public read access" ON artists FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON artists FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Allow admin update" ON artists FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Allow admin delete" ON artists FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Allow public read access" ON albums FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON albums FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Allow admin update" ON albums FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Allow admin delete" ON albums FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Allow public read access" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON songs FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Allow admin update" ON songs FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Allow admin delete" ON songs FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Allow public read access" ON curated_sections FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON curated_sections FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Allow admin update" ON curated_sections FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Allow admin delete" ON curated_sections FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Allow public read access" ON logs FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON logs FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
