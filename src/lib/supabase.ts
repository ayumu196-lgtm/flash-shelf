import { createClient } from '@supabase/supabase-js';

// Clean up the key if the user pasted it with the Japanese placeholder text
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseKey = rawKey.replace('ここにAnonKeyを貼', ''); // Remove the placeholder if present
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase Config. Please check .env file.');
  // We can return a mock or throw, but let's throw with a clearer message visible in console
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

