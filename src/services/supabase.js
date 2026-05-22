import { createClient } from '@supabase/supabase-js';
import { safeStorage } from './safeStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: safeStorage
      }
    });
  }
} catch (e) {
  console.error("Critical: Failed to initialize Supabase client safely:", e);
}

export const supabase = supabaseInstance;
export default supabase;
