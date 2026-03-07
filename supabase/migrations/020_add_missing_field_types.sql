-- =====================================================
-- Add missing field types to the field_type enum
-- The frontend defines 39 field types but the DB enum
-- only had the original 18. This adds the 21 missing.
-- =====================================================

ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'datetime';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'month';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'week';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'color';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'password';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'search';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'nps';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'yes_no';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'image_choice';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'image_upload';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'richtext';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'video_embed';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'google_places';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'calculation';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'hidden';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'html_snippet';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'timer';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'consent_checkbox';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'form_header';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'divider';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'spacer';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'columns_2';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'columns_3';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'columns_4';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'image';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'video';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'accordion';
