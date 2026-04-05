# Contest Platform - Database Setup

## Quick Setup

Since the SQL script execution requires Supabase dashboard access, please run these SQL commands in your Supabase SQL Editor:

### Step 1: Create Profiles Table

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  total_wins INT DEFAULT 0,
  total_contests INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
```

### Step 2: Create Contests Table

```sql
CREATE TABLE IF NOT EXISTS public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  num_positions INT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contests_select_all" ON public.contests FOR SELECT USING (true);
CREATE POLICY "contests_insert_own" ON public.contests FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "contests_update_own" ON public.contests FOR UPDATE USING (auth.uid() = creator_id);
```

### Step 3: Create Positions Table

```sql
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  position_number INT NOT NULL,
  assigned_user_id UUID REFERENCES auth.users(id),
  winner_rank INT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(contest_id, team_name, position_number)
);

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "positions_select_contest" ON public.positions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.contests WHERE id = positions.contest_id)
);
CREATE POLICY "positions_insert_creator" ON public.positions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.contests WHERE id = contest_id AND creator_id = auth.uid())
);
CREATE POLICY "positions_update_creator" ON public.positions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.contests WHERE id = contest_id AND creator_id = auth.uid())
);
```

### Step 4: Create Participants Table

```sql
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_number INT NOT NULL,
  assigned_position INT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_select_contest" ON public.participants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.contests WHERE id = contest_id)
);
CREATE POLICY "participants_insert_own" ON public.participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "participants_select_own" ON public.participants FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.contests WHERE id = contest_id AND creator_id = auth.uid()
  )
);
```

### Step 5: Create Profile Trigger (Auto-create profile on signup)

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'username'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## How to Execute

1. Go to your Supabase Dashboard
2. Navigate to the **SQL Editor**
3. Create a new query and paste each section above
4. Run each section sequentially
5. Verify tables are created in the **Table Editor**

The application is now ready to use!
