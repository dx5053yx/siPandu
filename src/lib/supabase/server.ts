import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerKey, getSupabaseUrl } from './config';

export function getSupabaseServerClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseServerKey = getSupabaseServerKey();

  if (!supabaseUrl || !supabaseServerKey) {
    throw new Error('Supabase belum dikonfigurasi.');
  }

  return createClient(supabaseUrl, supabaseServerKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
