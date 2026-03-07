-- Add form_header to field_type enum for header personalization block
-- (idempotent: IF NOT EXISTS)
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'form_header';
