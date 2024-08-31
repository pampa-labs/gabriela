import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmbsxuyrcdssywxawbyg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYnN4dXlyY2Rzc3l3eGF3YnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwNjc3NjMsImV4cCI6MjA0MDY0Mzc2M30.6jE7mdXhasosX2y0DYeJ7YzwjRMBdPfQyqOdvDgrnls'

export const supabase = createClient(supabaseUrl, supabaseKey)