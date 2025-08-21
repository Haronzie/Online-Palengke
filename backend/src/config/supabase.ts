// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please check your .env file and ensure you have:')
  console.error('SUPABASE_URL=your_supabase_url')
  console.error('SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// For admin operations (if needed later)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

console.log('✅ Supabase connected successfully!')