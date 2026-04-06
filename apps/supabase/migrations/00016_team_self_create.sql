-- Allow authenticated users to create their own team
CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Allow team owners to insert members (uses teams table, not team_members, to avoid recursion)
CREATE POLICY "Team owners can manage members"
  ON public.team_members FOR ALL
  USING (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );
