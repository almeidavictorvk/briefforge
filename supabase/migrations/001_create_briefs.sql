-- ============================================================================
-- BriefForge — Migration 001: Create briefs table
-- ============================================================================

-- 1. Create the briefs table
CREATE TABLE briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  raw_input TEXT NOT NULL,
  structured_brief JSONB NOT NULL DEFAULT '{}',
  audit_results JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  field_scores JSONB DEFAULT '{}',
  title TEXT,
  language TEXT DEFAULT 'pt-BR',
  status TEXT DEFAULT 'draft',
  share_enabled BOOLEAN DEFAULT false,
  client_inputs JSONB DEFAULT '{}',
  client_last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX idx_briefs_anonymous_id ON briefs (anonymous_id);
CREATE INDEX idx_briefs_share_enabled ON briefs (id) WHERE share_enabled = true;

-- 3. Enable Row Level Security
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- NOTE: Owner identification uses the x-anonymous-id header passed via
-- current_setting('request.headers'). If this approach causes issues with
-- your Supabase setup, fall back to client-side .eq('anonymous_id', id)
-- filtering and document as a known limitation.

-- Owner can SELECT their own briefs
CREATE POLICY "owner_select" ON briefs
  FOR SELECT
  USING (
    anonymous_id = (current_setting('request.headers', true)::json ->> 'x-anonymous-id')
  );

-- Owner can INSERT briefs with their anonymous_id
CREATE POLICY "owner_insert" ON briefs
  FOR INSERT
  WITH CHECK (
    anonymous_id = (current_setting('request.headers', true)::json ->> 'x-anonymous-id')
  );

-- Owner can UPDATE their own briefs
CREATE POLICY "owner_update" ON briefs
  FOR UPDATE
  USING (
    anonymous_id = (current_setting('request.headers', true)::json ->> 'x-anonymous-id')
  );

-- Owner can DELETE their own briefs
CREATE POLICY "owner_delete" ON briefs
  FOR DELETE
  USING (
    anonymous_id = (current_setting('request.headers', true)::json ->> 'x-anonymous-id')
  );

-- Shared briefs are readable by anyone (public SELECT)
CREATE POLICY "shared_select" ON briefs
  FOR SELECT
  USING (share_enabled = true);

-- Shared briefs can be updated by anyone (client_inputs from external users)
CREATE POLICY "shared_update" ON briefs
  FOR UPDATE
  USING (share_enabled = true);

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE briefs;
