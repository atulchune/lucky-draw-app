-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  contests_created INTEGER DEFAULT 0,
  contests_participated INTEGER DEFAULT 0,
  wins_first INTEGER DEFAULT 0,
  wins_second INTEGER DEFAULT 0,
  wins_third INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create contests table
CREATE TABLE IF NOT EXISTS public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  contest_type TEXT DEFAULT 'team', -- 'team' or 'individual'
  team1_name TEXT,
  team2_name TEXT,
  num_positions INTEGER NOT NULL,
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'closed', 'finished'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create contest positions and assignments
CREATE TABLE IF NOT EXISTS public.contest_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  position_number TEXT NOT NULL, -- AES-256-GCM encrypted position number
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_user_name TEXT,
  winner_rank INTEGER, -- 1 for 1st, 2 for 2nd, 3 for 3rd
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  UNIQUE(contest_id, team_name, position_number)
);

-- Create contest participants table
CREATE TABLE IF NOT EXISTS public.contest_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  UNIQUE(contest_id, user_id)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_contests_creator ON public.contests(creator_id);
CREATE INDEX IF NOT EXISTS idx_contests_status ON public.contests(status);
CREATE INDEX IF NOT EXISTS idx_contest_positions_contest ON public.contest_positions(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_positions_user ON public.contest_positions(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest ON public.contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_user ON public.contest_participants(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;
