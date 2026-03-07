-- ============================================
-- FILIALES (Niveau 2: ADEM, Urban Park, etc.)
-- ============================================

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
EXCEPTION
  WHEN duplicate_object THEN null;
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

-- Helper: check filiale membership (or inherited from holding)
create or replace function public.is_filiale_member(f_id uuid, min_role filiale_role default 'member')
returns boolean as $$
declare
  h_id uuid;
begin
  -- Direct filiale membership
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

  -- Inherited from holding (holding admins can access all filiales)
  select holding_id into h_id from public.filiales where id = f_id;
  if h_id is not null and is_holding_member(h_id) then
    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer stable;

-- RLS Policies (idempotent: drop then create)
drop policy if exists "Members can view filiale" on public.filiales;
create policy "Members can view filiale" on public.filiales
  for select using (is_filiale_member(id));

drop policy if exists "Holding admins can create filiales" on public.filiales;
create policy "Holding admins can create filiales" on public.filiales
  for insert with check (is_holding_member(holding_id));

drop policy if exists "Admins can update filiale" on public.filiales;
create policy "Admins can update filiale" on public.filiales
  for update using (is_filiale_member(id, 'admin'));

drop policy if exists "Holding admins can delete filiale" on public.filiales;
create policy "Holding admins can delete filiale" on public.filiales
  for delete using (is_holding_member(holding_id));

drop policy if exists "Members can view filiale members" on public.filiale_members;
create policy "Members can view filiale members" on public.filiale_members
  for select using (is_filiale_member(filiale_id));

drop policy if exists "Admins can manage filiale members" on public.filiale_members;
create policy "Admins can manage filiale members" on public.filiale_members
  for insert with check (is_filiale_member(filiale_id, 'admin'));

drop policy if exists "Admins can update filiale members" on public.filiale_members;
create policy "Admins can update filiale members" on public.filiale_members
  for update using (is_filiale_member(filiale_id, 'admin'));

drop policy if exists "Admins can remove filiale members" on public.filiale_members;
create policy "Admins can remove filiale members" on public.filiale_members
  for delete using (is_filiale_member(filiale_id, 'admin'));

-- Trigger updated_at (idempotent: drop then create)
drop trigger if exists update_filiales_updated_at on public.filiales;
create trigger update_filiales_updated_at before update on public.filiales
  for each row execute function public.update_updated_at();
