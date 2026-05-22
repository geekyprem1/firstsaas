-- ========================================================
-- AdViral AI - Supabase Production SQL Schema Blueprint
-- Copy and paste this script directly into your Supabase SQL Editor
-- ========================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. PROFILES TABLE (Extends Supabase Auth users table)
-- --------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan TEXT DEFAULT 'Free' CHECK (plan IN ('Free', 'Pro', 'Enterprise')),
  credits INTEGER DEFAULT 50 CHECK (credits >= 0),
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 2. GENERATIONS TABLE (Audit logs of copywriting runs)
-- --------------------------------------------------------
CREATE TABLE public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('ad_generator', 'viral_hooks', 'ugc_scripts')),
  input_data JSONB NOT NULL,
  generated_result JSONB NOT NULL,
  credits_used INTEGER DEFAULT 1,
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 3. API SETTINGS TABLE (LLM Credentials)
-- --------------------------------------------------------
CREATE TABLE public.api_settings (
  id SERIAL PRIMARY KEY,
  provider_name TEXT UNIQUE NOT NULL CHECK (provider_name IN ('openai', 'gemini')),
  api_key TEXT DEFAULT '',
  status BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 4. SUBSCRIPTION PLANS TABLE (Available Plans Editor)
-- --------------------------------------------------------
CREATE TABLE public.subscription_plans (
  id SERIAL PRIMARY KEY,
  plan_name TEXT UNIQUE NOT NULL CHECK (plan_name IN ('Free', 'Pro', 'Enterprise')),
  credits INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 5. TRANSACTIONS TABLE (Stripe Checkout Audits)
-- --------------------------------------------------------
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  credits_added INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- ========================================================

-- Sync function and trigger to keep auth.users.raw_app_meta_data synchronized with public.profiles.role.
-- This ensures that JWT claims contain the correct role immediately for RLS checks.
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to public.profiles (ONLY on UPDATE of role to avoid transaction locks during signup INSERT)
CREATE OR REPLACE TRIGGER on_profile_role_updated
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role_to_auth();

-- Helper function to check if a user is an admin without causing infinite recursion in RLS.
-- This function queries auth.users in the auth schema (which has no RLS policies calling it) rather than public.profiles.
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false)
    OR coalesce(auth.jwt() ->> 'email' = 'admin@adviral.ai', false)
    OR EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = user_id AND (
        raw_app_meta_data ->> 'role' = 'admin'
        OR email = 'admin@adviral.ai'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles RLS Policies:
-- Users can read/update their own profiles.
CREATE POLICY "Allow users to read own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Admins can perform all actions on all profiles, safely checking role through the recursion-free helper.
CREATE POLICY "Allow admins full access to profiles" 
  ON public.profiles FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Generations RLS Policies:
-- Users can manage their own generations.
CREATE POLICY "Allow users to manage own generations" 
  ON public.generations FOR ALL 
  USING (auth.uid() = user_id);

-- Admins can perform all actions on generations.
CREATE POLICY "Allow admins full access to generations" 
  ON public.generations FOR ALL 
  USING (public.is_admin(auth.uid()));

-- API Settings RLS Policies:
-- Admins can manage settings; Users cannot.
CREATE POLICY "Allow admins full access to api_settings" 
  ON public.api_settings FOR ALL 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow authenticated users to read api_settings" 
  ON public.api_settings FOR SELECT 
  TO authenticated 
  USING (true);

-- Subscription Plans RLS Policies:
-- Anyone can view plans; Admins can edit them.
CREATE POLICY "Allow anyone to view plans" 
  ON public.subscription_plans FOR SELECT 
  USING (true);

CREATE POLICY "Allow admins full access to plans" 
  ON public.subscription_plans FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Transactions RLS Policies:
-- Users can view their own transactions; Admins can read all transactions.
CREATE POLICY "Allow users to view own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins full access to transactions" 
  ON public.transactions FOR ALL 
  USING (public.is_admin(auth.uid()));

-- ========================================================
-- AUTOMATIC SIGNUP PROFILE TRIGGER
-- ========================================================

-- Define a database function that executes when a new auth user registers.
-- It fetches metadata (name) provided during signup and creates a profile row automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, credits, plan, is_banned)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New Creator'), -- default name if empty
    new.email,
    'user', -- default role
    50,     -- welcome credits
    'Free',  -- default plan
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the function as a trigger to the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- PRE-SEED SYSTEM CONFIGURATIONS DATA
-- ========================================================

-- Insert API settings slots
INSERT INTO public.api_settings (provider_name, api_key, status, is_default)
VALUES 
  ('openai', 'sk-proj-••••••••••••••••••••••••', TRUE, TRUE),
  ('gemini', 'AIzaSy••••••••••••••••••••••••', FALSE, FALSE)
ON CONFLICT (provider_name) DO NOTHING;

-- Insert pricing plan levels
INSERT INTO public.subscription_plans (plan_name, credits, price, features)
VALUES 
  ('Free', 50, 0.00, ARRAY['50 welcome credits', 'Access all AI tool editors', 'Local storage backup logs']),
  ('Pro', 1000, 49.00, ARRAY['1,000 monthly credits', 'Saved Projects project folders', 'Priority service SLA queue', 'Stripe checkout simulator access']),
  ('Enterprise', 99999, 199.00, ARRAY['Unlimited credits supply', 'Live API keys toggling switcher', 'Dedicated account support 24/7', 'Custom tools cost override nodes'])
ON CONFLICT (plan_name) DO NOTHING;
