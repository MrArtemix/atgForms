-- Duplicate a form with all its pages, fields, and theme
create or replace function public.duplicate_form(source_form_id uuid, new_workspace_id uuid default null)
returns uuid as $$
declare
  new_form_id uuid;
  source_form record;
  page_mapping jsonb := '{}'::jsonb;
  old_page_id uuid;
  new_page_id uuid;
begin
  select * into source_form from public.forms where id = source_form_id;

  if source_form is null then
    raise exception 'Form not found';
  end if;

  -- Create new form
  insert into public.forms (workspace_id, created_by, title, description, settings, status)
  values (
    coalesce(new_workspace_id, source_form.workspace_id),
    auth.uid(),
    source_form.title || ' (Copy)',
    source_form.description,
    source_form.settings,
    'draft'
  )
  returning id into new_form_id;

  -- Copy pages
  for old_page_id, new_page_id in
    insert into public.form_pages (form_id, title, description, sort_order)
    select new_form_id, title, description, sort_order
    from public.form_pages where form_id = source_form_id
    returning (select fp.id from public.form_pages fp where fp.form_id = source_form_id and fp.sort_order = form_pages.sort_order limit 1), id
  loop
    page_mapping := page_mapping || jsonb_build_object(old_page_id::text, new_page_id::text);
  end loop;

  -- Copy fields with page mapping
  insert into public.form_fields (form_id, page_id, type, label, description, placeholder, required, sort_order, validation_rules, options, field_config)
  select new_form_id,
    (page_mapping->>ff.page_id::text)::uuid,
    ff.type, ff.label, ff.description, ff.placeholder, ff.required, ff.sort_order,
    ff.validation_rules, ff.options, ff.field_config
  from public.form_fields ff
  where ff.form_id = source_form_id;

  -- Copy theme
  insert into public.form_themes (form_id, name, primary_color, background_color, text_color, accent_color, font_family, heading_font_family, font_size_base, border_radius, field_spacing, page_max_width, custom_css)
  select new_form_id, name, primary_color, background_color, text_color, accent_color, font_family, heading_font_family, font_size_base, border_radius, field_spacing, page_max_width, custom_css
  from public.form_themes where form_id = source_form_id;

  return new_form_id;
end;
$$ language plpgsql security definer;

-- Get form analytics
create or replace function public.get_form_analytics(target_form_id uuid)
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total_responses', count(*),
    'complete_responses', count(*) filter (where is_complete = true),
    'incomplete_responses', count(*) filter (where is_complete = false),
    'avg_completion_time', extract(epoch from avg(completed_at - started_at) filter (where completed_at is not null)),
    'responses_today', count(*) filter (where created_at::date = current_date),
    'responses_this_week', count(*) filter (where created_at >= date_trunc('week', current_date)),
    'responses_this_month', count(*) filter (where created_at >= date_trunc('month', current_date)),
    'daily_responses', (
      select jsonb_agg(jsonb_build_object('date', d, 'count', c) order by d)
      from (
        select created_at::date as d, count(*) as c
        from public.form_responses
        where form_id = target_form_id and created_at >= current_date - interval '30 days'
        group by created_at::date
      ) daily
    )
  ) into result
  from public.form_responses
  where form_id = target_form_id;

  return result;
end;
$$ language plpgsql security definer stable;

-- Get field-level analytics
create or replace function public.get_field_analytics(target_field_id uuid)
returns jsonb as $$
declare
  result jsonb;
  field_rec record;
begin
  select * into field_rec from public.form_fields where id = target_field_id;

  if field_rec.type in ('single_choice', 'multiple_choice', 'dropdown') then
    select jsonb_build_object(
      'total_answers', count(*),
      'distribution', (
        select jsonb_agg(jsonb_build_object('value', v, 'count', c))
        from (
          select coalesce(value_text, elem::text) as v, count(*) as c
          from public.response_answers ra
          left join lateral jsonb_array_elements_text(ra.value_json) as elem on true
          where ra.field_id = target_field_id
          group by coalesce(value_text, elem::text)
          order by c desc
        ) dist
      )
    ) into result
    from public.response_answers where field_id = target_field_id;
  elsif field_rec.type in ('number', 'rating', 'linear_scale') then
    select jsonb_build_object(
      'total_answers', count(*),
      'average', avg(value_number),
      'min', min(value_number),
      'max', max(value_number),
      'median', percentile_cont(0.5) within group (order by value_number)
    ) into result
    from public.response_answers where field_id = target_field_id and value_number is not null;
  else
    select jsonb_build_object(
      'total_answers', count(*),
      'filled', count(*) filter (where value_text is not null and value_text != '')
    ) into result
    from public.response_answers where field_id = target_field_id;
  end if;

  return coalesce(result, '{}'::jsonb);
end;
$$ language plpgsql security definer stable;

-- Increment response count
create or replace function public.increment_response_count()
returns trigger as $$
begin
  update public.forms set response_count = response_count + 1 where id = new.form_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_response_created
  after insert on public.form_responses
  for each row execute function public.increment_response_count();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at();
create trigger update_workspaces_updated_at before update on public.workspaces for each row execute function public.update_updated_at();
create trigger update_forms_updated_at before update on public.forms for each row execute function public.update_updated_at();
create trigger update_form_pages_updated_at before update on public.form_pages for each row execute function public.update_updated_at();
create trigger update_form_fields_updated_at before update on public.form_fields for each row execute function public.update_updated_at();
create trigger update_form_themes_updated_at before update on public.form_themes for each row execute function public.update_updated_at();
create trigger update_templates_updated_at before update on public.templates for each row execute function public.update_updated_at();
