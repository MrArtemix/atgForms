export interface FormTheme {
  id: string;
  form_id: string | null;
  name: string;
  is_system: boolean;
  primary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string | null;
  error_color: string | null;
  success_color: string | null;
  font_family: string;
  heading_font_family: string | null;
  font_size_base: number | null;
  border_radius: number | null;
  field_spacing: number | null;
  page_max_width: number | null;
  background_image_url: string | null;
  background_pattern:
    | 'none'
    | 'dots'
    | 'lines'
    | 'grid'
    | 'hexagons'
    | 'circuit'
    | 'topography'
    | 'waves'
    | 'crosshatch'
    | 'diagonal'
    | 'mesh'
    | 'noise'
    | null;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
}
