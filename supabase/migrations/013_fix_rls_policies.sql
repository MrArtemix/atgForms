-- Fix: Allow workspace owners to add themselves as first member
-- Without this, workspace creation fails because the INSERT on workspace_members
-- requires is_workspace_member() which checks for existing membership (chicken-and-egg)
CREATE POLICY "Owners can add themselves as member" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- Fix: Allow anyone to insert responses for published forms (anonymous submissions)
-- The existing policy uses anon key but responses need to work without auth
CREATE POLICY "Anon can create responses" ON public.form_responses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.forms f WHERE f.id = form_id AND f.status = 'published')
  );

-- Fix: Allow anon to create answers
CREATE POLICY "Anon can create answers" ON public.response_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.form_responses r
      JOIN public.forms f ON f.id = r.form_id
      WHERE r.id = response_id AND f.status = 'published'
    )
  );
