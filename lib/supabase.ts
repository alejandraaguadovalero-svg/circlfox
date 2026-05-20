/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || 'https://syajpjticjxeyjbwpemq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YWpwanRpY2p4ZXlqYndwZW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTkyMzYsImV4cCI6MjA5NDc5NTIzNn0.qrS2CCcSlSWY8qJgICyFPp8HwAJmfN3kG2NIf12BLFI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbProfile {
  id: string;
  name: string;
  age: number | null;
  city: string | null;
  bio: string | null;
  interests: string[];
  avatar_url: string | null;
}
