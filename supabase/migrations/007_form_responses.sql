create table if not exists public.form_responses (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  respondent_id uuid references public.profiles(id) on delete set null,
  respondent_email text,
  respondent_name text,
  ip_address inet,
  user_agent text,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  is_complete boolean default false not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

create index idx_responses_form on public.form_responses(form_id);
create index idx_responses_created on public.form_responses(created_at);

alter table public.form_responses enable row level security;

create policy "Workspace members can view responses" on public.form_responses
  for select using (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id))
  );

create policy "Anyone can create responses for published forms" on public.form_responses
  for insert with check (
    exists (select 1 from public.forms f where f.id = form_id and f.status = 'published')
  );

create policy "Editors can delete responses" on public.form_responses
  for delete using (
    exists (select 1 from public.forms f where f.id = form_id and is_workspace_member(f.workspace_id, 'editor'))
  );
