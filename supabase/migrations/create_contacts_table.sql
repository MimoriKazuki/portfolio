-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    inquiry_type TEXT NOT NULL DEFAULT 'other' CHECK (inquiry_type IN ('service', 'partnership', 'recruit', 'other')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed'))
);

-- Create index on status for filtering
CREATE INDEX idx_contacts_status ON public.contacts(status);

-- Create index on created_at for sorting
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);

-- Create index on inquiry_type for filtering
CREATE INDEX idx_contacts_inquiry_type ON public.contacts(inquiry_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all contacts
CREATE POLICY "Authenticated users can read all contacts" ON public.contacts
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert contacts
CREATE POLICY "Authenticated users can insert contacts" ON public.contacts
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update contacts
CREATE POLICY "Authenticated users can update contacts" ON public.contacts
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete contacts
CREATE POLICY "Authenticated users can delete contacts" ON public.contacts
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Create policy for anonymous users to insert contacts (for the contact form)
CREATE POLICY "Anonymous users can insert contacts" ON public.contacts
    FOR INSERT
    WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();