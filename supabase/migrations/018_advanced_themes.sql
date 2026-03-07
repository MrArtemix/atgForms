-- Thèmes système avancés avec motifs complexes
-- (form_id null, is_system true)
-- Idempotent: skip rows that already exist (unique name + is_system)

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
  -- Motifs géométriques complexes
  ('Honeycomb', true, '#D97706', '#FFFBEB', '#78350F', '#F59E0B', 'Inter, system-ui, sans-serif', 12, 'hexagons'),
  ('Circuit Board', true, '#059669', '#ECFDF5', '#064E3B', '#10B981', 'JetBrains Mono, monospace', 6, 'circuit'),
  ('Topography', true, '#1E40AF', '#EFF6FF', '#1E3A8A', '#3B82F6', 'Inter, system-ui, sans-serif', 8, 'topography'),
  ('Waves', true, '#0D9488', '#CCFBF1', '#134E4A', '#2DD4BF', 'Inter, system-ui, sans-serif', 16, 'waves'),
  ('Crosshatch', true, '#7C3AED', '#F5F3FF', '#4C1D95', '#8B5CF6', 'Inter, system-ui, sans-serif', 10, 'crosshatch'),
  ('Diagonal Stripes', true, '#DC2626', '#FEF2F2', '#991B1B', '#EF4444', 'Inter, system-ui, sans-serif', 8, 'diagonal'),
  ('Mesh Gradient', true, '#6366F1', '#EEF2FF', '#312E81', '#818CF8', 'Inter, system-ui, sans-serif', 14, 'mesh'),
  ('Noise Texture', true, '#374151', '#F9FAFB', '#111827', '#6B7280', 'Inter, system-ui, sans-serif', 4, 'noise'),
  -- Variantes avancées avec grille / points
  ('Dot Matrix', true, '#2563EB', '#F0F9FF', '#1E3A8A', '#60A5FA', 'Inter, system-ui, sans-serif', 8, 'dots'),
  ('Blueprint', true, '#1E3A8A', '#E0F2FE', '#0C4A6E', '#0284C7', 'Inter, system-ui, sans-serif', 4, 'grid'),
  ('Line Art', true, '#4F46E5', '#EDE9FE', '#312E81', '#7C3AED', 'Inter, system-ui, sans-serif', 6, 'lines')
ON CONFLICT DO NOTHING;

