create type form_status as enum ('draft', 'published', 'closed', 'archived');

create table if not exists public.forms (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null default 'Untitled Form',
  description text,
  slug text unique,
  status form_status default 'draft' not null,

  -- Settings
  settings jsonb default '{
    "allow_multiple_responses": false,
    "show_progress_bar": true,
    "shuffle_fields": false,
    "confirmation_message": "Thank you for your response!",
    "redirect_url": null,
    "notify_on_response": true,
    "close_message": "This form is no longer accepting responses.",
    "require_login": false,
    "limit_responses": null
  }'::jsonb not null,

  -- Scheduling
  scheduled_open_at timestamptz,
  scheduled_close_at timestamptz,

  -- Protection
  password_hash text,

  -- Branding
  header_image_url text,
  logo_url text,

  -- Stats cache
  response_count int default 0 not null,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_forms_workspace on public.forms(workspace_id);
create index idx_forms_slug on public.forms(slug);
create index idx_forms_status on public.forms(status);

alter table public.forms enable row level security;

create policy "Workspace members can view forms" on public.forms
  for select using (is_workspace_member(workspace_id));

create policy "Editors can create forms" on public.forms
  for insert with check (is_workspace_member(workspace_id, 'editor'));

create policy "Editors can update forms" on public.forms
  for update using (is_workspace_member(workspace_id, 'editor'));

create policy "Editors can delete forms" on public.forms
  for delete using (is_workspace_member(workspace_id, 'editor'));

-- Public access for published forms by slug
create policy "Anyone can view published forms by slug" on public.forms
  for select using (status = 'published' and slug is not null);
