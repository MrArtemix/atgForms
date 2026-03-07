create type field_type as enum (
  'short_text', 'long_text', 'number', 'email', 'phone', 'url', 'date', 'time',
  'single_choice', 'multiple_choice', 'dropdown', 'linear_scale', 'rating', 'matrix',
  'file_upload', 'section_header', 'paragraph_text', 'signature'
);

create table if not exists public.form_fields (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  page_id uuid references public.form_pages(id) on delete cascade not null,
  type field_type not null,
  label text not null default '',
  description text,
  placeholder text,
  required boolean default false not null,
  sort_order int default 0 not null,

  -- Flexible config stored as JSONB
  validation_rules jsonb default '{}'::jsonb,
  options jsonb default '[]'::jsonb,  -- for choice fields: [{label, value, color?}]
  field_config jsonb default '{}'::jsonb,  -- type-specific config (min, max, step, rows, cols, etc.)
  conditional_logic jsonb,  -- {conditions: [{field_id, operator, value}], logic: 'and'|'or', action: 'show'|'hide'|'require'|'skip_to_page'}

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_form_fields_form on public.form_fields(form_id);
create index idx_form_fields_page on public.form_fields(page_id, sort_order);

alter table public.form_fields enable row level security;

create policy "Members can view fields" on public.form_fields
  for select using (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id))
  );

create policy "Editors can manage fields" on public.form_fields
  for insert with check (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id, 'editor'))
  );

create policy "Editors can update fields" on public.form_fields
  for update using (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id, 'editor'))
  );

create policy "Editors can delete fields" on public.form_fields
  for delete using (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id, 'editor'))
  );

-- Public access
create policy "Public can view fields of published forms" on public.form_fields
  for select using (
    exists (select 1 from public.forms f where f.id = form_id and f.status = 'published')
  );
