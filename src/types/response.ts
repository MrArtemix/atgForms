export interface FormResponse {
  id: string;
  form_id: string;
  respondent_id: string | null;
  respondent_email: string | null;
  respondent_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  started_at: string;
  completed_at: string | null;
  is_complete: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ResponseAnswer {
  id: string;
  response_id: string;
  field_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_date: string | null;
  value_time: string | null;
  value_json: unknown | null;
  created_at: string;
}

export interface ResponseWithAnswers extends FormResponse {
  answers: ResponseAnswer[];
}

export interface FormAnalytics {
  total_responses: number;
  complete_responses: number;
  incomplete_responses: number;
  avg_completion_time: number | null;
  responses_today: number;
  responses_this_week: number;
  responses_this_month: number;
  daily_responses: { date: string; count: number }[];
}

export interface FieldAnalytics {
  total_answers: number;
  distribution?: { value: string; count: number }[];
  average?: number;
  min?: number;
  max?: number;
  median?: number;
  filled?: number;
}
