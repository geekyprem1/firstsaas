-- ========================================================
-- AdViral AI - Supabase Schema Patch
-- Drops old tool_type check constraint and updates it to
-- support 'image_generator' and 'vision' tools.
-- Run this in your Supabase SQL Editor if using real database.
-- ========================================================

-- 1. Drop old constraint if it exists
ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS generations_tool_type_check;

-- 2. Create updated CHECK constraint including image generator and vision tools
ALTER TABLE public.generations ADD CONSTRAINT generations_tool_type_check 
  CHECK (tool_type IN ('ad_generator', 'viral_hooks', 'ugc_scripts', 'image_generator', 'vision'));
