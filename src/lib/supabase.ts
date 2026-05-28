import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvtafumkmxlywinepkmy.supabase.co';

const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dGFmdW1rbXhseXdpbmVwa215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTg0MjYsImV4cCI6MjA5NDc3NDQyNn0.V33Ub-fkEDZjT1Wu9EH5WOs9zyGvKI54SO5bFyMnZd8';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);