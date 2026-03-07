-- Ajouter des thèmes supplémentaires au design Brobroli basés sur les logos
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
  ('Brobroli Dynamique', true, '#F05E09', '#F0F4F8', '#162447', '#162447', 'Inter, system-ui, sans-serif', 12, 'waves'),
  ('Brobroli Épuré', true, '#162447', '#FFFFFF', '#1F2937', '#F05E09', 'Inter, system-ui, sans-serif', 4, 'none'),
  ('Brobroli Institutionnel', true, '#162447', '#F7F7F7', '#162546', '#162546', 'Georgia, serif', 2, 'lines'),
  ('Brobroli Éclat', true, '#162447', '#FFF3EB', '#F05E09', '#152346', 'Inter, system-ui, sans-serif', 16, 'topography'),
  ('Brobroli Océan', true, '#F05E09', '#1A2954', '#FFFFFF', '#F05E09', 'Inter, system-ui, sans-serif', 8, 'mesh')
ON CONFLICT DO NOTHING;
