-- Add service_type column to contacts table
-- This column stores the selected training program when inquiry_type is 'service'

ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS service_type TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.contacts.service_type IS 'Selected training program when inquiry_type is service. Values: comprehensive-ai-training, ai-writing-training, ai-video-training, ai-coding-training, practical-ai-training, ai-talent-development, other-service';
