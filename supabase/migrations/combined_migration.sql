-- ============================================================
-- MIGRATION COMBINÉE: Holdings + Filiales + Workspace Updates
-- À exécuter dans le SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/wikdhdgdyobunzpaualp/sql/new
-- ============================================================

-- ============================
-- 1. HOLDINGS (Holding: ATG)
-- ============================

create table if not exists public.holdings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  logo_url text,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

DO $$ BEGIN
  create type holding_role as enum ('super_admin', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

create table if not exists public.holding_members (
  id uuid default gen_random_uuid() primary key,
  holding_id uuid references public.holdings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role holding_role default 'admin' not null,
  joined_at timestamptz default now() not null,
  unique(holding_id, user_id)
);

alter table public.holdings enable row level security;
alter table public.holding_members enable row level security;

create or replace function public.is_holding_member(h_id uuid, min_role holding_role default 'admin')
returns boolean as $$
begin
  return exists (
    select 1 from public.holding_members
    where holding_id = h_id
    and user_id = auth.uid()
    and (
      case min_role
        when 'admin' then role in ('admin', 'super_admin')
        when 'super_admin' then role = 'super_admin'
      end
    )
  );
end;
$$ language plpgsql security definer stable;

create policy "Members can view holding" on public.holdings
  for select using (is_holding_member(id));

create policy "Super admins can update holding" on public.holdings
  for update using (is_holding_member(id, 'super_admin'));

create policy "Members can view holding members" on public.holding_members
  for select using (is_holding_member(holding_id));

create policy "Super admins can manage holding members" on public.holding_members
  for insert with check (is_holding_member(holding_id, 'super_admin'));

create policy "Super admins can update holding members" on public.holding_members
  for update using (is_holding_member(holding_id, 'super_admin'));

create policy "Super admins can remove holding members" on public.holding_members
  for delete using (is_holding_member(holding_id, 'super_admin'));

create trigger update_holdings_updated_at before update on public.holdings
  for each row execute function public.update_updated_at();

-- ============================
-- 2. FILIALES (ADEM, etc.)
-- ============================

create table if not exists public.filiales (
  id uuid default gen_random_uuid() primary key,
  holding_id uuid references public.holdings(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  color text default '#6366f1',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

DO $$ BEGIN
  create type filiale_role as enum ('admin', 'manager', 'member');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

create table if not exists public.filiale_members (
  id uuid default gen_random_uuid() primary key,
  filiale_id uuid references public.filiales(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role filiale_role default 'member' not null,
  joined_at timestamptz default now() not null,
  unique(filiale_id, user_id)
);

create index if not exists idx_filiales_holding on public.filiales(holding_id);

alter table public.filiales enable row level security;
alter table public.filiale_members enable row level security;

create or replace function public.is_filiale_member(f_id uuid, min_role filiale_role default 'member')
returns boolean as $$
declare
  h_id uuid;
begin
  if exists (
    select 1 from public.filiale_members
    where filiale_id = f_id
    and user_id = auth.uid()
    and (
      case min_role
        when 'member' then role in ('member', 'manager', 'admin')
        when 'manager' then role in ('manager', 'admin')
        when 'admin' then role = 'admin'
      end
    )
  ) then
    return true;
  end if;

  select holding_id into h_id from public.filiales where id = f_id;
  if h_id is not null and is_holding_member(h_id) then
    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer stable;

create policy "Members can view filiale" on public.filiales
  for select using (is_filiale_member(id));

create policy "Holding admins can create filiales" on public.filiales
  for insert with check (is_holding_member(holding_id));

create policy "Admins can update filiale" on public.filiales
  for update using (is_filiale_member(id, 'admin'));

create policy "Holding admins can delete filiale" on public.filiales
  for delete using (is_holding_member(holding_id));

create policy "Members can view filiale members" on public.filiale_members
  for select using (is_filiale_member(filiale_id));

create policy "Admins can manage filiale members" on public.filiale_members
  for insert with check (is_filiale_member(filiale_id, 'admin'));

create policy "Admins can update filiale members" on public.filiale_members
  for update using (is_filiale_member(filiale_id, 'admin'));

create policy "Admins can remove filiale members" on public.filiale_members
  for delete using (is_filiale_member(filiale_id, 'admin'));

create trigger update_filiales_updated_at before update on public.filiales
  for each row execute function public.update_updated_at();

-- ============================================
-- 3. WORKSPACES → PROJETS (ajout filiale_id)
-- ============================================

alter table public.workspaces
  add column if not exists filiale_id uuid references public.filiales(id) on delete set null;

create index if not exists idx_workspaces_filiale on public.workspaces(filiale_id);

alter table public.profiles
  add column if not exists system_role text default 'member' not null;

create or replace function public.is_workspace_member(ws_id uuid, min_role workspace_role default 'viewer')
returns boolean as $$
declare
  f_id uuid;
begin
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

  select filiale_id into f_id from public.workspaces where id = ws_id;
  if f_id is not null then
    if min_role in ('viewer', 'editor') and is_filiale_member(f_id, 'manager') then
      return true;
    end if;
    if is_filiale_member(f_id, 'admin') then
      return true;
    end if;
  end if;

  return false;
end;
$$ language plpgsql security definer stable;
