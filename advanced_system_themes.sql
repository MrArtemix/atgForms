-- Advanced system themes (complex patterns + custom CSS)
-- Copy/paste this file into Supabase SQL editor and run.
-- Note: relies on existing table public.form_themes (see migrations/006_form_themes.sql)
-- This script is idempotent for these theme names (delete + insert).

DO $$
BEGIN
  DELETE FROM public.form_themes
  WHERE is_system = true
    AND name IN (
      'Aurora Mesh',
      'Cyber Circuit',
      'Atlas Topography',
      'Honeycomb Luxe',
      'Blueprint Pro',
      'Velvet Diagonal',
      'Noir Noise',
      'Ocean Waves Pro'
    );
END $$;

INSERT INTO public.form_themes (
  name,
  is_system,
  primary_color,
  background_color,
  text_color,
  accent_color,
  font_family,
  border_radius,
  background_pattern,
  custom_css
) VALUES
  (
    'Aurora Mesh',
    true,
    '#6366F1',
    '#F8FAFF',
    '#111827',
    '#22C55E',
    'Inter, system-ui, sans-serif',
    16,
    'mesh',
    $css$
/* Aurora Mesh: fond mesh + carte légèrement "glass" */
.form-page-wrap {
  background: radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--form-pattern-color, #6366F1) 14%, transparent) 0%, transparent 55%),
    radial-gradient(circle at 82% 78%, color-mix(in srgb, #22C55E 12%, transparent) 0%, transparent 55%),
    linear-gradient(165deg, #ffffff 0%, #f5f3ff 45%, #eff6ff 100%);
}
.form-page-card {
  background: color-mix(in srgb, #ffffff 82%, transparent);
  border-color: color-mix(in srgb, var(--form-pattern-color, #6366F1) 25%, #e5e7eb);
  box-shadow: 0 18px 55px -30px color-mix(in srgb, var(--form-pattern-color, #6366F1) 40%, transparent);
  backdrop-filter: blur(10px);
}
.form-field-group {
  background: color-mix(in srgb, #ffffff 92%, #f5f3ff);
}
$css$
  ),
  (
    'Cyber Circuit',
    true,
    '#10B981',
    '#071B14',
    '#E5FFF6',
    '#22C55E',
    'JetBrains Mono, ui-monospace, monospace',
    10,
    'circuit',
    $css$
/* Cyber Circuit: dark pro, accents néon */
.form-page-wrap {
  background: radial-gradient(circle at 25% 15%, rgba(16,185,129,0.14) 0%, transparent 50%),
    radial-gradient(circle at 75% 85%, rgba(34,197,94,0.10) 0%, transparent 55%),
    linear-gradient(160deg, #071B14 0%, #03100C 100%);
}
.form-page-card {
  background: rgba(3,16,12,0.65);
  border-color: rgba(16,185,129,0.30);
  box-shadow: 0 0 0 1px rgba(16,185,129,0.18), 0 24px 80px -55px rgba(16,185,129,0.65);
  backdrop-filter: blur(10px);
}
.form-field-group {
  background: rgba(7,27,20,0.55);
  border-color: rgba(16,185,129,0.22);
}
$css$
  ),
  (
    'Atlas Topography',
    true,
    '#1E40AF',
    '#F2F7FF',
    '#0B1B3A',
    '#3B82F6',
    'Inter, system-ui, sans-serif',
    14,
    'topography',
    $css$
/* Atlas: topographie + carte nette */
.form-page-wrap {
  background: linear-gradient(180deg, #f2f7ff 0%, #eef2ff 60%, #ffffff 100%);
}
.form-page-card {
  border-color: color-mix(in srgb, var(--form-pattern-color, #1E40AF) 22%, #e5e7eb);
  box-shadow: 0 16px 50px -40px rgba(30,64,175,0.55);
}
.form-page-title-block {
  background: color-mix(in srgb, var(--form-pattern-color, #1E40AF) 10%, transparent) !important;
}
$css$
  ),
  (
    'Honeycomb Luxe',
    true,
    '#D97706',
    '#FFFBEB',
    '#451A03',
    '#F59E0B',
    'Inter, system-ui, sans-serif',
    18,
    'hexagons',
    $css$
/* Honeycomb: chaleureux + ombres douces */
.form-page-wrap {
  background: radial-gradient(circle at 20% 25%, rgba(245,158,11,0.18) 0%, transparent 55%),
    radial-gradient(circle at 80% 75%, rgba(217,119,6,0.14) 0%, transparent 55%),
    linear-gradient(165deg, #fff7ed 0%, #fffbeb 55%, #ffffff 100%);
}
.form-page-card {
  border-color: rgba(217,119,6,0.22);
  box-shadow: 0 18px 60px -45px rgba(217,119,6,0.65);
}
$css$
  ),
  (
    'Blueprint Pro',
    true,
    '#1E3A8A',
    '#E0F2FE',
    '#082F49',
    '#0284C7',
    'Inter, system-ui, sans-serif',
    8,
    'grid',
    $css$
/* Blueprint: look "plan" (grid + glow) */
.form-page-wrap {
  background: linear-gradient(180deg, #e0f2fe 0%, #eff6ff 50%, #ffffff 100%);
}
.form-page-card {
  border-color: rgba(2,132,199,0.25);
  box-shadow: 0 18px 55px -45px rgba(2,132,199,0.75);
}
$css$
  ),
  (
    'Velvet Diagonal',
    true,
    '#DB2777',
    '#FFF1F2',
    '#500724',
    '#F43F5E',
    'Inter, system-ui, sans-serif',
    20,
    'diagonal',
    $css$
/* Velvet: diagonales + card "soft" */
.form-page-wrap {
  background: radial-gradient(circle at 20% 30%, rgba(244,63,94,0.14) 0%, transparent 55%),
    radial-gradient(circle at 80% 70%, rgba(219,39,119,0.10) 0%, transparent 55%),
    linear-gradient(160deg, #fff1f2 0%, #fdf2f8 55%, #ffffff 100%);
}
.form-page-card {
  border-color: rgba(219,39,119,0.20);
  box-shadow: 0 18px 65px -52px rgba(219,39,119,0.8);
}
$css$
  ),
  (
    'Noir Noise',
    true,
    '#A3A3A3',
    '#0B0B10',
    '#F4F4F5',
    '#71717A',
    'Inter, system-ui, sans-serif',
    10,
    'noise',
    $css$
/* Noir: minimal dark + texture */
.form-page-wrap {
  background: radial-gradient(circle at 25% 20%, rgba(113,113,122,0.12) 0%, transparent 55%),
    linear-gradient(180deg, #0b0b10 0%, #09090b 100%);
}
.form-page-card {
  background: rgba(9,9,11,0.65);
  border-color: rgba(244,244,245,0.12);
  box-shadow: 0 20px 80px -65px rgba(244,244,245,0.25);
  backdrop-filter: blur(10px);
}
.form-field-group {
  background: rgba(9,9,11,0.45);
  border-color: rgba(244,244,245,0.10);
}
$css$
  ),
  (
    'Ocean Waves Pro',
    true,
    '#0EA5E9',
    '#F0F9FF',
    '#0C4A6E',
    '#38BDF8',
    'Inter, system-ui, sans-serif',
    16,
    'waves',
    $css$
/* Ocean: vagues + profondeur */
.form-page-wrap {
  background: radial-gradient(circle at 20% 25%, rgba(56,189,248,0.22) 0%, transparent 55%),
    radial-gradient(circle at 80% 75%, rgba(14,165,233,0.16) 0%, transparent 60%),
    linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 55%, #ffffff 100%);
}
.form-page-card {
  border-color: rgba(14,165,233,0.22);
  box-shadow: 0 18px 60px -50px rgba(14,165,233,0.7);
}
$css$
  );

