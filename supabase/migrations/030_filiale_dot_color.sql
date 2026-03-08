-- Add dot_color column for sidebar bullet color (independent from background color)
alter table public.filiales
  add column if not exists dot_color text default '#6366f1';
