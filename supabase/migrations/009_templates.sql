create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null,
  thumbnail_url text,
  form_definition jsonb not null, -- snapshot of form structure: {pages, fields, theme}
  is_system boolean default false not null,
  created_by uuid references public.profiles(id) on delete set null,
  use_count int default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_templates_category on public.templates(category);

alter table public.templates enable row level security;

create policy "Anyone can view system templates" on public.templates
  for select using (is_system = true);

create policy "Users can view own templates" on public.templates
  for select using (auth.uid() = created_by);

create policy "Users can create templates" on public.templates
  for insert with check (auth.uid() = created_by);

create policy "Users can update own templates" on public.templates
  for update using (auth.uid() = created_by);

create policy "Users can delete own templates" on public.templates
  for delete using (auth.uid() = created_by);
