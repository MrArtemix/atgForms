-- Invitations system for Holdings, Filiales, and Workspaces (Projets)

-- Add invited_email to existing member tables
ALTER TABLE public.filiale_members ADD COLUMN IF NOT EXISTS invited_email text;
ALTER TABLE public.holding_members ADD COLUMN IF NOT EXISTS invited_email text;

-- Enums
DO $$ BEGIN
  CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM ('holding', 'filiale', 'workspace');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  email text NOT NULL,
  entity_type entity_type NOT NULL,
  entity_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  status invitation_status NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate pending invitations for same email+entity
CREATE UNIQUE INDEX idx_invitations_pending_unique
  ON public.invitations (email, entity_type, entity_id)
  WHERE status = 'pending';

-- Index for looking up invitations by token
CREATE INDEX idx_invitations_token ON public.invitations (token);

-- Index for looking up invitations by email
CREATE INDEX idx_invitations_email ON public.invitations (email, status);

-- RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Inviter can see invitations they sent
CREATE POLICY "Inviters can view their invitations"
  ON public.invitations FOR SELECT
  USING (auth.uid() = invited_by);

-- Invitee can see invitations for their email
CREATE POLICY "Invitees can view their invitations"
  ON public.invitations FOR SELECT
  USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Entity members can view invitations (workspace members, filiale members, etc.)
CREATE POLICY "Entity members can view invitations"
  ON public.invitations FOR SELECT
  USING (
    CASE entity_type
      WHEN 'workspace' THEN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = entity_id AND user_id = auth.uid()
      )
      WHEN 'filiale' THEN EXISTS (
        SELECT 1 FROM public.filiale_members
        WHERE filiale_id = entity_id AND user_id = auth.uid()
      )
      WHEN 'holding' THEN EXISTS (
        SELECT 1 FROM public.holding_members
        WHERE holding_id = entity_id AND user_id = auth.uid()
      )
    END
  );

-- Members can create invitations
CREATE POLICY "Members can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (auth.uid() = invited_by);

-- Inviters can cancel (delete) their invitations
CREATE POLICY "Inviters can delete invitations"
  ON public.invitations FOR DELETE
  USING (auth.uid() = invited_by);

-- Allow updates (for accept/decline via RPC - SECURITY DEFINER handles auth)
CREATE POLICY "System can update invitations"
  ON public.invitations FOR UPDATE
  WITH CHECK (true);

-- Reuse update_updated_at trigger from 010_functions.sql
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
