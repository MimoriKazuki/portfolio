-- Drop status column from contacts table
-- This column is no longer used in the application

ALTER TABLE public.contacts
DROP COLUMN IF EXISTS status;
