-- ============================================
-- HOLDINGS (Niveau 1 de la hiérarchie: ex ATG)
-- ============================================

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
EXCEPTION
  WHEN duplicate_object THEN null;
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

-- Helper: check holding membership
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

-- RLS Policies (idempotent: drop then create)
drop policy if exists "Members can view holding" on public.holdings;
create policy "Members can view holding" on public.holdings
  for select using (is_holding_member(id));

drop policy if exists "Super admins can update holding" on public.holdings;
create policy "Super admins can update holding" on public.holdings
  for update using (is_holding_member(id, 'super_admin'));

drop policy if exists "Members can view holding members" on public.holding_members;
create policy "Members can view holding members" on public.holding_members
  for select using (is_holding_member(holding_id));

drop policy if exists "Super admins can manage holding members" on public.holding_members;
create policy "Super admins can manage holding members" on public.holding_members
  for insert with check (is_holding_member(holding_id, 'super_admin'));

drop policy if exists "Super admins can update holding members" on public.holding_members;
create policy "Super admins can update holding members" on public.holding_members
  for update using (is_holding_member(holding_id, 'super_admin'));

drop policy if exists "Super admins can remove holding members" on public.holding_members;
create policy "Super admins can remove holding members" on public.holding_members
  for delete using (is_holding_member(holding_id, 'super_admin'));

-- Trigger updated_at (idempotent: drop then create)
drop trigger if exists update_holdings_updated_at on public.holdings;
create trigger update_holdings_updated_at before update on public.holdings
  for each row execute function public.update_updated_at();
