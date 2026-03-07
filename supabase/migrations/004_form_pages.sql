create table if not exists public.form_pages (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  title text default 'Page' not null,
  description text,
  sort_order int default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_form_pages_form on public.form_pages(form_id, sort_order);

alter table public.form_pages enable row level security;

create policy "Members can view pages" on public.form_pages
  for select using (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id))
  );

create policy "Editors can manage pages" on public.form_pages
  for insert with check (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id, 'editor'))
  );

create policy "Editors can update pages" on public.form_pages
  for update using (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id, 'editor'))
  );

create policy "Editors can delete pages" on public.form_pages
  for delete using (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id, 'editor'))
  );

-- Public access for published forms
create policy "Public can view pages of published forms" on public.form_pages
  for select using (
    exists (select 1 from public.forms f where f.id = form_id and f.status = 'published')
  );
