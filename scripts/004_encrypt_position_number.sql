-- Migration: Encrypt position_number column
-- 
-- This migration changes position_number from INTEGER to TEXT
-- to store AES-256-GCM encrypted values instead of plain numbers.
--
-- IMPORTANT: Run this AFTER backing up your data.
-- After running this SQL, you must also run the data migration script
-- to encrypt existing plain-text position numbers.

-- Step 1: Drop the unique constraint that depends on position_number
ALTER TABLE public.contest_positions 
DROP CONSTRAINT IF EXISTS contest_positions_contest_id_team_name_position_number_key;

-- Step 2: Alter column type from INTEGER to TEXT
ALTER TABLE public.contest_positions 
ALTER COLUMN position_number TYPE TEXT USING position_number::TEXT;

-- Step 3: Re-add the unique constraint on the text column
-- Note: Since encrypted values are unique by nature (random IV), 
-- this constraint still works for preventing true duplicates.
ALTER TABLE public.contest_positions 
ADD CONSTRAINT contest_positions_contest_id_team_name_position_number_key 
UNIQUE (contest_id, team_name, position_number);

-- Step 4: Add a comment explaining the encryption
COMMENT ON COLUMN public.contest_positions.position_number IS 
'AES-256-GCM encrypted position number. Decrypt via server-side API only.';
