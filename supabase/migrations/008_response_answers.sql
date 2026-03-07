create table if not exists public.response_answers (
  id uuid default gen_random_uuid() primary key,
  response_id uuid references public.form_responses(id) on delete cascade not null,
  field_id uuid references public.form_fields(id) on delete cascade not null,

  -- Flexible value storage
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_date date,
  value_time time,
  value_json jsonb,  -- for arrays (multiple choice), matrix answers, file uploads

  created_at timestamptz default now() not null
);

create index idx_answers_response on public.response_answers(response_id);
create index idx_answers_field on public.response_answers(field_id);

alter table public.response_answers enable row level security;

create policy "Workspace members can view answers" on public.response_answers
  for select using (
    exists (
      select 1 from public.form_responses r
      join public.forms f on f.id = r.form_id
      where r.id = response_id and is_workspace_member(f.workspace_id)
    )
  );

create policy "Anyone can create answers for published forms" on public.response_answers
  for insert with check (
    exists (
      select 1 from public.form_responses r
      join public.forms f on f.id = r.form_id
      where r.id = response_id and f.status = 'published'
    )
  );
