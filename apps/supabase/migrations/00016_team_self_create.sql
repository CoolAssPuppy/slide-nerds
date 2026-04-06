-- Allow authenticated users to create their own team
CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Allow team owners to insert themselves as members
CREATE POLICY "Users can join as owner"
  ON public.team_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- Allow team owners/admins to manage members (for invites)
CREATE POLICY "Team admins can manage members"
  ON public.team_members FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
