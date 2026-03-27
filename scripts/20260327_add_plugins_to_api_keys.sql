-- Migration: add plugin feature flags to api_keys
-- Run this against your Supabase/Postgres instance

ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS memory_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lore_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lore_harvest_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS storyweaver_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS web_search_mode TEXT NOT NULL DEFAULT 'off';

-- Optional indexes for quick filtering by flags (useful for admin dashboards)
CREATE INDEX IF NOT EXISTS idx_api_keys_memory_enabled ON public.api_keys(memory_enabled);
CREATE INDEX IF NOT EXISTS idx_api_keys_lore_enabled ON public.api_keys(lore_enabled);
CREATE INDEX IF NOT EXISTS idx_api_keys_storyweaver_enabled ON public.api_keys(storyweaver_enabled);

-- Note: This is an additive migration. Apply during maintenance window if you have heavy load.
