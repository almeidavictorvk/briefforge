-- ============================================================================
-- BriefForge — Migration 002: Fix RLS policies
-- ============================================================================
-- The original header-based RLS policies (x-anonymous-id) don't work with
-- the Supabase JS client. Replacing with permissive policies.
-- Ownership is enforced client-side via .eq('anonymous_id', id) filtering
-- and server-side via explicit checks in API routes.
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "owner_select" ON briefs;
DROP POLICY IF EXISTS "owner_insert" ON briefs;
DROP POLICY IF EXISTS "owner_update" ON briefs;
DROP POLICY IF EXISTS "owner_delete" ON briefs;
DROP POLICY IF EXISTS "shared_select" ON briefs;
DROP POLICY IF EXISTS "shared_update" ON briefs;

-- Allow all operations for anon/authenticated roles.
-- Security is enforced at the application layer:
--   - Client-side: .eq('anonymous_id', anonymousId) on all queries
--   - Server-side: ownership verification in API route PATCH handler
--   - Share access: share_enabled check in API route

CREATE POLICY "allow_select" ON briefs
  FOR SELECT USING (true);

CREATE POLICY "allow_insert" ON briefs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_update" ON briefs
  FOR UPDATE USING (true);

CREATE POLICY "allow_delete" ON briefs
  FOR DELETE USING (true);
