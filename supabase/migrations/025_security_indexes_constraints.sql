-- Migration 025: Add missing indexes, constraints, system_role column, and atomic increment function
-- This migration addresses critical performance and security gaps identified in the codebase audit.

-- ============================================================================
-- 1. MISSING INDEXES (Critical for query performance)
-- ============================================================================

-- Workspace lookups by filiale
CREATE INDEX IF NOT EXISTS idx_workspaces_filiale_id
  ON public.workspaces(filiale_id)
  WHERE filiale_id IS NOT NULL;

-- "Find all workspaces for a user" — currently does full table scan
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id
  ON public.workspace_members(user_id);

-- "Find all holdings for a user"
CREATE INDEX IF NOT EXISTS idx_holding_members_user_id
  ON public.holding_members(user_id);

-- "Find all filiales for a user"
CREATE INDEX IF NOT EXISTS idx_filiale_members_user_id
  ON public.filiale_members(user_id);

-- Analytics queries: responses by form + date range
CREATE INDEX IF NOT EXISTS idx_form_responses_form_created
  ON public.form_responses(form_id, created_at);

-- Form lookups by slug (used for public form access)
CREATE INDEX IF NOT EXISTS idx_forms_slug
  ON public.forms(slug)
  WHERE slug IS NOT NULL;

-- Form fields sorted by page + sort order
CREATE INDEX IF NOT EXISTS idx_form_fields_page_sort
  ON public.form_fields(page_id, sort_order);

-- ============================================================================
-- 2. CHECK CONSTRAINTS (Data integrity)
-- ============================================================================

-- Prevent negative response counts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_response_count_nonnegative'
  ) THEN
    ALTER TABLE public.forms
      ADD CONSTRAINT check_response_count_nonnegative CHECK (response_count >= 0);
  END IF;
END $$;

-- Ensure sort_order is non-negative on pages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_pages_sort_order'
  ) THEN
    ALTER TABLE public.form_pages
      ADD CONSTRAINT check_pages_sort_order CHECK (sort_order >= 0);
  END IF;
END $$;

-- Ensure sort_order is non-negative on fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_fields_sort_order'
  ) THEN
    ALTER TABLE public.form_fields
      ADD CONSTRAINT check_fields_sort_order CHECK (sort_order >= 0);
  END IF;
END $$;

-- ============================================================================
-- 3. SYSTEM_ROLE COLUMN ON PROFILES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'system_role'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN system_role text NOT NULL DEFAULT 'member';

    ALTER TABLE public.profiles
      ADD CONSTRAINT check_system_role
      CHECK (system_role IN ('super_admin', 'filiale_admin', 'project_manager', 'member'));
  END IF;
END $$;

-- ============================================================================
-- 4. ATOMIC INCREMENT FUNCTION (Prevents race conditions)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_use_count(
  table_name text,
  row_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF table_name = 'templates' THEN
    UPDATE public.templates SET use_count = use_count + 1 WHERE id = row_id;
  ELSIF table_name = 'document_templates' THEN
    UPDATE public.document_templates SET use_count = use_count + 1 WHERE id = row_id;
  ELSE
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;
END;
$$;
