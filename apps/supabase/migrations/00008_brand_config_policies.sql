-- Migration: Add INSERT, UPDATE, DELETE policies for brand_configs
-- The initial migration (00001) only created SELECT policies.

-- ============================================================
-- 1. INSERT: owners can create personal brand configs
-- ============================================================

CREATE POLICY "Users can insert their own brand configs"
  ON public.brand_configs FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team admins can insert team brand configs"
  ON public.brand_configs FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 2. UPDATE: owners and team admins can update brand configs
-- ============================================================

CREATE POLICY "Users can update their own brand configs"
  ON public.brand_configs FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team admins can update team brand configs"
  ON public.brand_configs FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 3. DELETE: owners and team owners can delete brand configs
-- ============================================================

CREATE POLICY "Users can delete their own brand configs"
  ON public.brand_configs FOR DELETE
  USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete team brand configs"
  ON public.brand_configs FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
        AND role = 'owner'
    )
  );
