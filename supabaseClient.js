import { createClient } from '@supabase/supabase-js';

// Reemplazá con tus credenciales de Supabase
const supabaseUrl = 'https://ksqwemerqysrjqwftnkr.supabase.co';
const supabaseKey = 'sb_publishable_iTHJEcRnoaq-DNIqrJgl0w_pOyYM1DF';

export const supabase = createClient(supabaseUrl, supabaseKey);

