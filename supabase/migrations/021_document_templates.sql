-- =====================================================
-- Document Templates (modèles de documents PDF)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  -- Layout definition as JSONB (header, sections, footer, colors, etc.)
  layout JSONB NOT NULL DEFAULT '{}',
  -- Link to a specific form (null = universal/system template)
  form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT false NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  use_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_doc_templates_category ON public.document_templates(category);
CREATE INDEX IF NOT EXISTS idx_doc_templates_form ON public.document_templates(form_id);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view system templates
CREATE POLICY "Anyone can view system doc templates" ON public.document_templates
  FOR SELECT USING (is_system = true);

-- Users can view their own templates
CREATE POLICY "Users can view own doc templates" ON public.document_templates
  FOR SELECT USING (auth.uid() = created_by);

-- Users can create templates
CREATE POLICY "Users can create doc templates" ON public.document_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update own doc templates" ON public.document_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own templates
CREATE POLICY "Users can delete own doc templates" ON public.document_templates
  FOR DELETE USING (auth.uid() = created_by);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_doc_templates_updated_at ON public.document_templates;
CREATE TRIGGER update_doc_templates_updated_at BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
