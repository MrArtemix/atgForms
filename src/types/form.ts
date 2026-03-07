import { FieldType, FormField } from './field-types';
import { FormTheme } from './theme';

export type FormStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface FormSettings {
  allow_multiple_responses: boolean;
  show_progress_bar: boolean;
  shuffle_fields: boolean;
  confirmation_message: string;
  redirect_url: string | null;
  notify_on_response: boolean;
  close_message: string;
  require_login: boolean;
  limit_responses: number | null;
}

export interface Form {
  id: string;
  workspace_id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  slug: string | null;
  status: FormStatus;
  settings: FormSettings;
  scheduled_open_at: string | null;
  scheduled_close_at: string | null;
  password_hash: string | null;
  header_image_url: string | null;
  logo_url: string | null;
  response_count: number;
  created_at: string;
  updated_at: string;
}

export interface FormPage {
  id: string;
  form_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FormWithDetails extends Form {
  pages: FormPage[];
  fields: FormField[];
  theme: FormTheme | null;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  form_definition: {
    pages: FormPage[];
    fields: FormField[];
    theme: Partial<FormTheme> | null;
  };
  is_system: boolean;
  created_by: string | null;
  use_count: number;
  created_at: string;
  updated_at: string;
}
