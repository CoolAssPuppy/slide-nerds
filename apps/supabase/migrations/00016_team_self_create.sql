-- Allow authenticated users to create their own team
CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Allow team owners to read their teams directly (avoids recursion with team_members)
CREATE POLICY "Owners can read their teams"
  ON public.teams FOR SELECT
  USING (owner_id = auth.uid());

-- Allow users to insert themselves as a team member
CREATE POLICY "Users can add themselves to teams they own"
  ON public.team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- SECURITY DEFINER function bypasses RLS to check team ownership without recursion
CREATE OR REPLACE FUNCTION public.is_team_owner(p_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.teams WHERE id = p_team_id AND owner_id = auth.uid());
$$;

-- Allow team owners to delete members
CREATE POLICY "Team owners can delete members"
  ON public.team_members FOR DELETE
  USING (public.is_team_owner(team_id));
