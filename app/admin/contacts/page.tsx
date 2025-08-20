import { createClient } from '@/app/lib/supabase/server'
import ContactsClient from './ContactsClient'

/*
  If contacts table doesn't exist, run this SQL in Supabase SQL Editor:

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

  -- Enable RLS
  ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

  -- Create policy for anonymous users to insert (for contact form)
  CREATE POLICY "Anyone can insert contacts" ON public.contacts
      FOR INSERT WITH CHECK (true);

  -- Create policy for authenticated users to manage
  CREATE POLICY "Authenticated users can manage contacts" ON public.contacts
      FOR ALL USING (auth.role() = 'authenticated');
*/

export default async function AdminContactsPage() {
  const supabase = await createClient()
  
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    
    // If table doesn't exist, return empty array
    if (error.code === '42P01') {
      console.warn('Contacts table does not exist. Please create it using the SQL above.')
      return <ContactsClient contacts={[]} />
    }
  }

  return <ContactsClient contacts={contacts || []} />
}