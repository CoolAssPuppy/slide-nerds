-- Drop the problematic policies that reference auth.users or cause recursion
DROP POLICY IF EXISTS "Team admins can manage invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can read their own invites" ON public.team_invites;
DROP POLICY IF EXISTS "Team admins can add members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can update member roles" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can remove members" ON public.team_members;

-- Team owners can manage invites (uses SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Team owners can manage invites"
  ON public.team_invites FOR ALL
  USING (public.is_team_owner(team_id));

-- Anyone can read invites by token (for accept/decline flow)
CREATE POLICY "Anyone can read invites by token"
  ON public.team_invites FOR SELECT
  USING (true);

