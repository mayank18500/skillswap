import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lqgowgtwxdzmpvvsoquj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZ293Z3R3eGR6bXB2dnNvcXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTQ2MDUsImV4cCI6MjA2Nzg3MDYwNX0.DkyV0tnaVJFNGrsWEQ8cn-idRnYKxZ_YkqrhvS2czEA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);