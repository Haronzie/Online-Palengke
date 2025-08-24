# Online Palengke - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts      # Supabase configuration
│   └── index.ts             # Main entry point
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
└── .env                     # Environment variables
```

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Optional (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📡 Available APIs

### Main Application
- **Entry Point**: `src/index.ts`
- **Main Function**: `main()` - Initializes backend service
- **Health Check**: Every 30 seconds during development

### Supabase Clients
- **`supabase`**: Main client for database operations
- **`supabaseAdmin`**: Admin client for privileged operations (if configured)

## 💻 Common Operations

### Database Query
```typescript
import { supabase } from './config/supabase.js'

// Basic query
const { data, error } = await supabase
  .from('table_name')
  .select('*')

// With filters
const { data, error } = await supabase
  .from('vendors')
  .select('*')
  .eq('city', 'Dipolog')
```

### Authentication Check
```typescript
import { supabase } from './config/supabase.js'

// Check current session
const { data: { session }, error } = await supabase.auth.getSession()

// Check if authenticated
const isAuthenticated = !!session
```

### Admin Operations
```typescript
import { supabaseAdmin } from './config/supabase.js'

if (supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('role', 'admin')
}
```

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm install` | Install dependencies |

## 🔍 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```bash
   ❌ Missing Supabase environment variables!
   # Check your .env file exists and contains required variables
   ```

2. **Database Connection Failed**
   ```bash
   ❌ Failed to connect to database
   # Verify Supabase project is active and keys are correct
   ```

3. **TypeScript Compilation Errors**
   ```bash
   # Ensure all dependencies are installed
   npm install
   
   # Check TypeScript version compatibility
   npx tsc --version
   ```

### Debug Steps

1. Check `.env` file exists and has correct variables
2. Verify Supabase project is active
3. Test network connectivity
4. Check console logs for detailed error messages

## 📊 Health Monitoring

During development, the backend logs health status every 30 seconds:

```
🔄 Backend running... 2:30:45 PM
🔄 Backend running... 2:31:15 PM
🔄 Backend running... 2:31:45 PM
```

## 🚪 Graceful Shutdown

Press `Ctrl+C` to gracefully shutdown the backend:

```
👋 Shutting down Online Palengke backend...
```

## 🔐 Security Notes

- Never commit `.env` files to version control
- Use strong, unique keys for Supabase
- Rotate service role keys regularly
- Implement Row Level Security (RLS) policies

## 📚 Dependencies

### Production
- `@supabase/supabase-js` - Supabase client
- `dotenv` - Environment variable management

### Development
- `@types/node` - Node.js TypeScript definitions
- `nodemon` - Auto-restart development server
- `ts-node` - TypeScript execution
- `typescript` - TypeScript compiler

## 🎯 Next Steps

The current implementation provides a foundation for:

1. **Vendor Management APIs** - CRUD operations for vendors
2. **Product Catalog APIs** - Product listing and management
3. **Order Management APIs** - Shopping cart and order processing
4. **User Authentication APIs** - Complete auth flow
5. **Real-time Features** - Live updates and notifications

## 📞 Getting Help

- Check console logs for detailed error information
- Verify environment variable configuration
- Ensure Supabase project is properly set up
- Review the full API documentation for detailed information

---

**Quick Reference Version**: 1.0.0  
**For detailed documentation, see**: `API_DOCUMENTATION.md` and `TECHNICAL_API_REFERENCE.md`