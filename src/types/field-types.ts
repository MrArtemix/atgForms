export type FieldType =
  // Basic Text
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'month'
  | 'week'
  | 'color'
  | 'password'
  | 'search'
  
  // Choice
  | 'single_choice'
  | 'multiple_choice'
  | 'dropdown'
  | 'linear_scale'
  | 'rating'
  | 'matrix'
  | 'nps'
  | 'yes_no'
  | 'image_choice'
  
  // Advanced
  | 'file_upload'
  | 'image_upload'
  | 'signature'
  | 'richtext'
  | 'video_embed'
  | 'google_places'
  | 'calculation'
  | 'hidden'
  | 'html_snippet'
  | 'timer'
  | 'consent_checkbox'
  
  // Layout
  | 'section_header'
  | 'form_header'
  | 'paragraph_text'
  | 'divider'
  | 'spacer'
  | 'columns_2'
  | 'columns_3'
  | 'columns_4'
  | 'image'
  | 'video'
  | 'accordion';

export type FieldCategory = 'basic' | 'choice' | 'advanced' | 'layout' | 'media' | 'verification';

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  color?: string;
}

export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixColumn {
  id: string;
  label: string;
}

export interface ValidationRules {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  pattern_message?: string;
  max_file_size?: number; // in bytes
  allowed_file_types?: string[];
  max_files?: number;
}

export interface FieldConfig {
  // Number
  min?: number;
  max?: number;
  step?: number;

  // Text
  rows?: number;

  // Linear scale
  scale_min?: number;
  scale_max?: number;
  scale_min_label?: string;
  scale_max_label?: string;

  // Rating
  rating_max?: number;
  rating_icon?: 'star' | 'heart' | 'thumbsup';

  // Matrix
  matrix_rows?: MatrixRow[];
  matrix_columns?: MatrixColumn[];
  matrix_allow_multiple?: boolean;

  // File upload
  max_file_size?: number;
  allowed_file_types?: string[];
  max_files?: number;

  // Date/Time
  date_format?: string;
  time_format?: '12h' | '24h';

  // Section header
  header_size?: 'h2' | 'h3' | 'h4';

  // Form header (personnalisation en-tête)
  header_image_url?: string;
  header_style?: 'default' | 'image' | 'gradient' | 'pattern';
  header_pattern?: 'dots' | 'grid' | 'lines' | 'waves' | 'mesh' | 'diagonal';
  header_height?: 'medium' | 'large' | 'hero';

  // Timer
  duration_seconds?: number;

  // Consent checkbox
  consent_text?: string;

  // Spacer
  spacer_size?: number;

  // Image/Video
  image_url?: string;
  image_alt?: string;
  video_url?: string;

  // Accordion
  accordion_title?: string;
  accordion_content?: string;
}

export interface FormField {
  id: string;
  form_id: string;
  page_id: string;
  type: FieldType;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  sort_order: number;
  validation_rules: ValidationRules;
  options: FieldOption[];
  field_config: FieldConfig;
  conditional_logic: import('./conditional-logic').ConditionalLogic | null;
  created_at: string;
  updated_at: string;
}

export interface FieldTypeConfig {
  type: FieldType;
  label: string;
  icon: string; // Lucide icon name
  category: FieldCategory;
  description: string;
  hasOptions: boolean;
  hasValidation: boolean;
  defaultConfig: Partial<FieldConfig>;
  defaultValidation: Partial<ValidationRules>;
}
