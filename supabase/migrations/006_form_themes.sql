create table if not exists public.form_themes (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.forms(id) on delete cascade,
  name text not null,
  is_system boolean default false not null,

  -- Colors
  primary_color text default '#3B82F6' not null,
  background_color text default '#FFFFFF' not null,
  text_color text default '#1F2937' not null,
  accent_color text default '#8B5CF6',
  error_color text default '#EF4444',
  success_color text default '#10B981',

  -- Typography
  font_family text default 'Inter, system-ui, sans-serif' not null,
  heading_font_family text,
  font_size_base int default 16,

  -- Layout
  border_radius int default 8,
  field_spacing int default 24,
  page_max_width int default 720,

  -- Background
  background_image_url text,
  background_pattern text, -- 'dots', 'lines', 'grid', 'none'

  -- Custom CSS
  custom_css text,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_form_themes_form on public.form_themes(form_id);

alter table public.form_themes enable row level security;

create policy "Anyone can view system themes" on public.form_themes
  for select using (is_system = true);

create policy "Members can view form themes" on public.form_themes
  for select using (
    form_id is not null and exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id))
  );

create policy "Editors can manage themes" on public.form_themes
  for all using (
    form_id is not null and exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id, 'editor'))
  );

-- Public access for rendering
create policy "Public can view themes of published forms" on public.form_themes
  for select using (
    form_id is not null and exists (select 1 from public.forms f where f.id = form_id and f.status = 'published')
  );
