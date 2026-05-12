-- Create storage bucket for column audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('column-audio', 'column-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for column audio bucket
CREATE POLICY "Enable read access for column audio" ON storage.objects
FOR SELECT USING (bucket_id = 'column-audio');

CREATE POLICY "Enable upload for column audio" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'column-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Enable update for column audio" ON storage.objects
FOR UPDATE WITH CHECK (bucket_id = 'column-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Enable delete for column audio" ON storage.objects
FOR DELETE USING (bucket_id = 'column-audio' AND auth.role() = 'authenticated');