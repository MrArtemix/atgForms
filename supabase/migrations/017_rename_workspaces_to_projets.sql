-- =====================================================
-- Link workspaces (now "Projets") to filiales
-- Add system_role to profiles for hierarchical access
-- =====================================================

-- Add filiale_id to workspaces (workspaces are now "Projets" in UI)
alter table public.workspaces
  add column if not exists filiale_id uuid references public.filiales(id) on delete set null;

create index if not exists idx_workspaces_filiale on public.workspaces(filiale_id);

-- Add system_role to profiles
alter table public.profiles
  add column if not exists system_role text default 'member' not null;

-- Update is_workspace_member to also grant access to filiale/holding admins
create or replace function public.is_workspace_member(ws_id uuid, min_role workspace_role default 'viewer')
returns boolean as $$
declare
  f_id uuid;
begin
  -- Direct workspace membership (existing logic)
  if exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id
    and user_id = auth.uid()
    and (
      case min_role
        when 'viewer' then role in ('viewer', 'editor', 'owner')
        when 'editor' then role in ('editor', 'owner')
        when 'owner' then role = 'owner'
      end
    )
  ) then
    return true;
  end if;

  -- Inherited from filiale (filiale admins/managers can access projects)
  select filiale_id into f_id from public.workspaces where id = ws_id;
  if f_id is not null then
    -- Filiale managers get at least editor-level access
    if min_role in ('viewer', 'editor') and is_filiale_member(f_id, 'manager') then
      return true;
    end if;
    -- Filiale admins get owner-level access
    if is_filiale_member(f_id, 'admin') then
      return true;
    end if;
  end if;

  return false;
end;
$$ language plpgsql security definer stable;
