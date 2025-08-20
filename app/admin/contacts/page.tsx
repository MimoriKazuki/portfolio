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
  
  // フォームからの問い合わせを取得
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  // 資料請求を取得（document情報も含む）
  const { data: documentRequests, error: requestsError } = await supabase
    .from('document_requests')
    .select(`
      *,
      document:documents (
        id,
        title
      )
    `)
    .order('created_at', { ascending: false })

  if (contactsError) {
    console.error('Error fetching contacts:', contactsError)
    // If table doesn't exist, set empty array
    if (contactsError.code === '42P01') {
      console.warn('Contacts table does not exist. Please create it using the SQL above.')
    }
  }

  if (requestsError) {
    console.error('Error fetching document requests:', requestsError)
  }

  // 両方のデータを統合して渡す
  return <ContactsClient 
    contacts={contacts || []} 
    documentRequests={documentRequests || []}
  />
}