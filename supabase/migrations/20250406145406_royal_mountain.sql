/*
  # Safe Database Cleanup

  This migration safely removes any existing database objects by:
  1. Using DO blocks to safely check for and drop existing objects
  2. Ensuring operations only run if objects exist
  3. Maintaining proper order of operations
*/

-- Safely drop policies if the table exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "System can create user profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  END IF;
END $$;

-- Safely drop functions
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'handle_new_user'
  ) THEN
    DROP FUNCTION handle_new_user CASCADE;
  END IF;
END $$;

-- Finally, drop tables if they exist
DROP TABLE IF EXISTS profiles CASCADE;