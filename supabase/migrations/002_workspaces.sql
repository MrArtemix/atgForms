create table if not exists public.workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create type workspace_role as enum ('owner', 'editor', 'viewer');

create table if not exists public.workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role workspace_role default 'viewer' not null,
  invited_email text,
  joined_at timestamptz default now() not null,
  unique(workspace_id, user_id)
);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

-- Helper function to check workspace membership
create or replace function public.is_workspace_member(ws_id uuid, min_role workspace_role default 'viewer')
returns boolean as $$
begin
  return exists (
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
  );
end;
$$ language plpgsql security definer stable;

create policy "Members can view workspace" on public.workspaces
  for select using (is_workspace_member(id));

create policy "Owners can update workspace" on public.workspaces
  for update using (is_workspace_member(id, 'owner'));

create policy "Users can create workspaces" on public.workspaces
  for insert with check (auth.uid() = owner_id);

create policy "Owners can delete workspace" on public.workspaces
  for delete using (is_workspace_member(id, 'owner'));

create policy "Members can view members" on public.workspace_members
  for select using (is_workspace_member(workspace_id));

create policy "Editors can manage members" on public.workspace_members
  for insert with check (is_workspace_member(workspace_id, 'editor'));

create policy "Editors can update members" on public.workspace_members
  for update using (is_workspace_member(workspace_id, 'editor'));

create policy "Editors can remove members" on public.workspace_members
  for delete using (is_workspace_member(workspace_id, 'editor'));
