-- RLS Policies for profiles table
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_all" ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for contests table
CREATE POLICY "contests_select_all" ON public.contests 
  FOR SELECT USING (true);

CREATE POLICY "contests_insert_own" ON public.contests 
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "contests_update_own" ON public.contests 
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "contests_delete_own" ON public.contests 
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for contest_positions table
CREATE POLICY "contest_positions_select_all" ON public.contest_positions 
  FOR SELECT USING (true);

CREATE POLICY "contest_positions_insert_creator" ON public.contest_positions 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contests 
      WHERE id = contest_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "contest_positions_update_creator" ON public.contest_positions 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.contests 
      WHERE id = contest_id AND creator_id = auth.uid()
    )
  );

-- RLS Policies for contest_participants table
CREATE POLICY "contest_participants_select_all" ON public.contest_participants 
  FOR SELECT USING (true);

CREATE POLICY "contest_participants_insert_own" ON public.contest_participants 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contest_participants_delete_own" ON public.contest_participants 
  FOR DELETE USING (auth.uid() = user_id);
