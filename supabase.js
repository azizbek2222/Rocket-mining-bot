// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Supabase URL va anon/public key
const supabaseUrl = 'https://cqjilskroiylmunpavjy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxamlsc2tyb2l5bG11bnBhdmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjExNTgsImV4cCI6MjA3OTI5NzE1OH0.e8wFwakbu9R0iE6bxCc0kguZkUT3T89y9RV-36iP3uE' // Dashboard → Settings → API → anon key

export const supabase = createClient(supabaseUrl, supabaseKey)
