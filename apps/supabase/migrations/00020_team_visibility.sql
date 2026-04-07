-- SECURITY DEFINER function to get a user's team IDs without triggering RLS on team_members
CREATE OR REPLACE FUNCTION public.get_my_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = auth.uid();
$$;

-- Allow team members to see all members of their teams (not just their own row)
CREATE POLICY "Team members can see their teammates"
  ON public.team_members FOR SELECT
  USING (team_id IN (SELECT public.get_my_team_ids()));

-- Allow team members to see teammate profiles
CREATE POLICY "Team members can read teammate profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT tm.user_id FROM public.team_members tm
      WHERE tm.team_id IN (SELECT public.get_my_team_ids())
    )
  );
