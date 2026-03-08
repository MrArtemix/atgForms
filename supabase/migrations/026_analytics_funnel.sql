-- Analytics funnel: count respondents per page
create or replace function public.get_form_funnel(target_form_id uuid)
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'page_id', fp.id,
      'page_title', fp.title,
      'sort_order', fp.sort_order,
      'respondents_count', coalesce(counts.cnt, 0)
    )
    order by fp.sort_order
  ) into result
  from public.form_pages fp
  left join lateral (
    select count(distinct ra.response_id) as cnt
    from public.response_answers ra
    inner join public.form_fields ff on ff.id = ra.field_id
    where ff.page_id = fp.id
  ) counts on true
  where fp.form_id = target_form_id;

  return coalesce(result, '[]'::jsonb);
end;
$$ language plpgsql security definer stable;

-- Extend daily_responses from 30 to 90 days
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
        where form_id = target_form_id and created_at >= current_date - interval '90 days'
        group by created_at::date
      ) daily
    )
  ) into result
  from public.form_responses
  where form_id = target_form_id;

  return result;
end;
$$ language plpgsql security definer stable;
