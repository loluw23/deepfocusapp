/*
  # Authentication Setup and Security Measures

  1. Security Settings
    - Enable strong password policy
    - Configure MFA settings
    - Set up row level security
    - Add profile management

  2. Functions
    - Create secure user management functions with proper search paths
    - Add email verification handling

  3. Triggers
    - Add user profile creation trigger
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable strong password policy
DO $$
BEGIN
  ALTER TABLE auth.users 
    ADD CONSTRAINT strong_password 
    CHECK (raw_user_meta_data->>'password' ~ '^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$');
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Enable MFA by updating auth settings
UPDATE auth.config
SET enable_totp_mfa = true
WHERE enable_totp_mfa IS FALSE;

-- Set search path for functions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_auth_config') THEN
    ALTER FUNCTION public.get_auth_config() SET search_path = public, auth;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_email_templates') THEN
    ALTER FUNCTION public.get_email_templates() SET search_path = public, auth;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_email_verification_required') THEN
    ALTER FUNCTION public.is_email_verification_required() SET search_path = public, auth;
  END IF;
END $$;

-- Create secure profile handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable row level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable leaked password protection
ALTER TABLE auth.config
SET (enable_password_breach_detection = true);