-- Notification triggers and RPC functions

---------------------------------------------------------------
-- 1. Notify on form response
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_form_response()
RETURNS trigger AS $$
DECLARE
  form_rec RECORD;
BEGIN
  SELECT id, title, created_by, settings
    INTO form_rec
    FROM public.forms
    WHERE id = NEW.form_id;

  -- Only notify if the form owner opted in
  IF form_rec IS NOT NULL
     AND form_rec.settings->>'notify_on_response' = 'true'
  THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      form_rec.created_by,
      'response_received',
      'Nouvelle réponse',
      'Une réponse a été soumise sur "' || form_rec.title || '"',
      jsonb_build_object(
        'form_id', form_rec.id,
        'form_title', form_rec.title,
        'response_id', NEW.id,
        'link', '/forms/' || form_rec.id || '/analytics'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_form_response_notify
  AFTER INSERT ON public.form_responses
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_form_response();

---------------------------------------------------------------
-- 2. Notify on invitation created
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_invitation_created()
RETURNS trigger AS $$
DECLARE
  invitee_id uuid;
  inviter_name text;
  entity_name text;
BEGIN
  -- Check if the invitee already has an account
  SELECT id INTO invitee_id
    FROM public.profiles
    WHERE email = NEW.email;

  IF invitee_id IS NOT NULL THEN
    -- Get inviter name
    SELECT COALESCE(full_name, email) INTO inviter_name
      FROM public.profiles
      WHERE id = NEW.invited_by;

    -- Get entity name
    CASE NEW.entity_type
      WHEN 'workspace' THEN
        SELECT name INTO entity_name FROM public.workspaces WHERE id = NEW.entity_id;
      WHEN 'filiale' THEN
        SELECT name INTO entity_name FROM public.filiales WHERE id = NEW.entity_id;
      WHEN 'holding' THEN
        SELECT name INTO entity_name FROM public.holdings WHERE id = NEW.entity_id;
    END CASE;

    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      invitee_id,
      'invitation_received',
      'Invitation reçue',
      COALESCE(inviter_name, 'Quelqu''un') || ' vous invite à rejoindre "' || COALESCE(entity_name, 'une entité') || '"',
      jsonb_build_object(
        'invitation_id', NEW.id,
        'token', NEW.token,
        'entity_type', NEW.entity_type,
        'entity_id', NEW.entity_id,
        'entity_name', COALESCE(entity_name, ''),
        'role', NEW.role,
        'link', '/invitations/accept?token=' || NEW.token
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_invitation_created_notify
  AFTER INSERT ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_invitation_created();

---------------------------------------------------------------
-- 3. Notify on invitation status change
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_invitation_status_change()
RETURNS trigger AS $$
DECLARE
  invitee_name text;
  entity_name text;
  notif_type notification_type;
BEGIN
  -- Only fire when status actually changed to accepted or declined
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('accepted', 'declined') THEN
    RETURN NEW;
  END IF;

  -- Get invitee name
  SELECT COALESCE(full_name, email) INTO invitee_name
    FROM public.profiles
    WHERE email = NEW.email;

  -- Get entity name
  CASE NEW.entity_type
    WHEN 'workspace' THEN
      SELECT name INTO entity_name FROM public.workspaces WHERE id = NEW.entity_id;
    WHEN 'filiale' THEN
      SELECT name INTO entity_name FROM public.filiales WHERE id = NEW.entity_id;
    WHEN 'holding' THEN
      SELECT name INTO entity_name FROM public.holdings WHERE id = NEW.entity_id;
  END CASE;

  IF NEW.status = 'accepted' THEN
    notif_type := 'invitation_accepted';
  ELSE
    notif_type := 'invitation_declined';
  END IF;

  -- Notify the inviter
  IF NEW.invited_by IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.invited_by,
      notif_type,
      CASE WHEN NEW.status = 'accepted' THEN 'Invitation acceptée' ELSE 'Invitation déclinée' END,
      COALESCE(invitee_name, NEW.email) || ' a ' ||
        CASE WHEN NEW.status = 'accepted' THEN 'accepté' ELSE 'décliné' END ||
        ' l''invitation pour "' || COALESCE(entity_name, '') || '"',
      jsonb_build_object(
        'entity_type', NEW.entity_type,
        'entity_id', NEW.entity_id,
        'entity_name', COALESCE(entity_name, ''),
        'email', NEW.email,
        'link', CASE NEW.entity_type
          WHEN 'workspace' THEN '/filiales'
          WHEN 'filiale' THEN '/filiales/' || NEW.entity_id
          WHEN 'holding' THEN '/dashboard'
        END
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_invitation_status_change_notify
  AFTER UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_invitation_status_change();

---------------------------------------------------------------
-- 4. Notify on form published
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_form_published()
RETURNS trigger AS $$
DECLARE
  member_rec RECORD;
BEGIN
  -- Only fire when status changes to 'published'
  IF OLD.status = NEW.status OR NEW.status != 'published' THEN
    RETURN NEW;
  END IF;

  -- Notify all workspace members except the publisher
  FOR member_rec IN
    SELECT user_id FROM public.workspace_members
    WHERE workspace_id = NEW.workspace_id AND user_id != NEW.created_by
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      member_rec.user_id,
      'form_published',
      'Formulaire publié',
      '"' || NEW.title || '" est maintenant en ligne',
      jsonb_build_object(
        'form_id', NEW.id,
        'form_title', NEW.title,
        'link', '/forms/' || NEW.id || '/analytics'
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_form_published_notify
  AFTER UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_form_published();

---------------------------------------------------------------
-- 5. RPC: Accept invitation
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token uuid)
RETURNS jsonb AS $$
DECLARE
  inv RECORD;
  current_user_email text;
BEGIN
  -- Get current user email
  SELECT email INTO current_user_email
    FROM public.profiles
    WHERE id = auth.uid();

  -- Find the invitation
  SELECT * INTO inv
    FROM public.invitations
    WHERE token = invitation_token
      AND status = 'pending'
      AND expires_at > now();

  IF inv IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation invalide, expirée ou déjà traitée');
  END IF;

  -- Verify the current user matches the invited email
  IF inv.email != current_user_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cette invitation ne correspond pas à votre compte');
  END IF;

  -- Insert into the appropriate members table
  CASE inv.entity_type
    WHEN 'workspace' THEN
      INSERT INTO public.workspace_members (workspace_id, user_id, role)
      VALUES (inv.entity_id, auth.uid(), inv.role)
      ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role;
    WHEN 'filiale' THEN
      INSERT INTO public.filiale_members (filiale_id, user_id, role)
      VALUES (inv.entity_id, auth.uid(), inv.role)
      ON CONFLICT (filiale_id, user_id) DO UPDATE SET role = EXCLUDED.role;
    WHEN 'holding' THEN
      INSERT INTO public.holding_members (holding_id, user_id, role)
      VALUES (inv.entity_id, auth.uid(), inv.role)
      ON CONFLICT (holding_id, user_id) DO UPDATE SET role = EXCLUDED.role;
  END CASE;

  -- Update invitation status (triggers notification to inviter)
  UPDATE public.invitations
    SET status = 'accepted'
    WHERE id = inv.id;

  RETURN jsonb_build_object('success', true, 'entity_type', inv.entity_type, 'entity_id', inv.entity_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

---------------------------------------------------------------
-- 6. RPC: Decline invitation
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decline_invitation(invitation_token uuid)
RETURNS jsonb AS $$
DECLARE
  inv RECORD;
  current_user_email text;
BEGIN
  SELECT email INTO current_user_email
    FROM public.profiles
    WHERE id = auth.uid();

  SELECT * INTO inv
    FROM public.invitations
    WHERE token = invitation_token
      AND status = 'pending';

  IF inv IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation invalide ou déjà traitée');
  END IF;

  IF inv.email != current_user_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cette invitation ne correspond pas à votre compte');
  END IF;

  -- Update invitation status (triggers notification to inviter)
  UPDATE public.invitations
    SET status = 'declined'
    WHERE id = inv.id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
