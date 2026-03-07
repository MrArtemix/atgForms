-- Ajouter des thèmes spécifiques au design Brobroli
-- (form_id null, is_system true)

INSERT INTO public.form_themes (
  name,
  is_system,
  primary_color,
  background_color,
  text_color,
  accent_color,
  font_family,
  border_radius,
  background_pattern
) VALUES
  ('Brobroli Officiel', true, '#162447', '#F7F7F7', '#162546', '#F05E09', 'Inter, system-ui, sans-serif', 8, 'none'),
  ('Brobroli Contraste', true, '#F05E09', '#FFFFFF', '#162447', '#162447', 'Inter, system-ui, sans-serif', 8, 'dots'),
  ('Brobroli Sombre', true, '#162447', '#162447', '#FFFFFF', '#F05E09', 'Inter, system-ui, sans-serif', 12, 'circuit')
ON CONFLICT DO NOTHING;
