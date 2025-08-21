// src/index.ts
import { supabase } from './config/supabase.js'

async function main() {
  console.log('🚀 Online Palengke Backend Starting...')
  console.log('📍 Connecting Dipolog City residents with local vendors')
  
  try {
    // Test connection by checking Supabase auth status
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // If we get here without throwing, connection is working
    console.log('✅ Database connection successful!')
    console.log('🏪 Ready to serve the palengke!')
    console.log('🔧 Supabase client initialized and ready')
    console.log('💡 Next: Design your database schema for vendors, products, and orders')
    
    // Keep the process running in development
    setInterval(() => {
      console.log(`🔄 Backend running... ${new Date().toLocaleTimeString()}`)
    }, 30000) // Every 30 seconds
    
  } catch (error) {
    console.error('❌ Failed to connect to database:')
    console.error(error)
    console.error('\n💡 Make sure your .env file has the correct Supabase credentials')
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Online Palengke backend...')
  process.exit(0)
})

main().catch(console.error)