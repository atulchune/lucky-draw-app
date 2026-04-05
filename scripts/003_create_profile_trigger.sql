-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  username_base TEXT;
  username_final TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate username from email (remove domain)
  username_base := LOWER(SPLIT_PART(new.email, '@', 1));
  username_final := username_base;
  
  -- Check if username exists and generate unique one
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_final) LOOP
    counter := counter + 1;
    username_final := username_base || counter::TEXT;
  END LOOP;
  
  -- Insert profile with auto-generated username
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name,
    contests_created,
    contests_participated,
    wins_first,
    wins_second,
    wins_third
  )
  VALUES (
    new.id,
    username_final,
    COALESCE(new.raw_user_meta_data ->> 'full_name', NULL),
    0,
    0,
    0,
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
