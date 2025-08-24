# Online Palengke - API Documentation

## Overview

Online Palengke is an open-source online marketplace connecting Dipolog City residents with local palengke vendors. The backend is built with Node.js, TypeScript, and Supabase.

**Project Type**: Backend API Service  
**Technology Stack**: Node.js, TypeScript, Supabase  
**License**: MIT  

## Table of Contents

1. [Getting Started](#getting-started)
2. [Configuration](#configuration)
3. [Public APIs](#public-apis)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [Usage Examples](#usage-examples)
7. [Development](#development)

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Supabase account and project
- Environment variables configured

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd online-palengke

# Install dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

## Configuration

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts      # Supabase client configuration
│   └── index.ts             # Main application entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── .env                     # Environment variables
```

### TypeScript Configuration

The project uses TypeScript with ES modules support:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Public APIs

### 1. Main Application Entry Point

**File**: `src/index.ts`

#### `main()` Function

**Type**: `async function`  
**Purpose**: Main application entry point that initializes the backend service

**Functionality**:
- Initializes the Online Palengke backend
- Tests Supabase database connection
- Establishes authentication session
- Provides health monitoring and logging
- Handles graceful shutdown

**Usage**:
```typescript
// Automatically called when the application starts
main().catch(console.error)
```

**Returns**: `Promise<void>`

**Error Handling**: 
- Logs connection failures
- Exits process with code 1 on database connection failure
- Provides helpful error messages for missing environment variables

#### Process Signal Handlers

**SIGINT Handler**: Graceful shutdown handler for the application
```typescript
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Online Palengke backend...')
  process.exit(0)
})
```

### 2. Supabase Configuration

**File**: `src/config/supabase.ts`

#### `supabase` Client

**Type**: `SupabaseClient`  
**Purpose**: Main Supabase client for database operations

**Configuration**:
- Automatically loads environment variables
- Validates required Supabase credentials
- Initializes connection to Supabase instance

**Usage**:
```typescript
import { supabase } from './config/supabase.js'

// Example: Get current session
const { data: { session }, error } = await supabase.auth.getSession()

// Example: Query data
const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

**Features**:
- Automatic environment variable loading
- Connection validation
- Error handling for missing credentials

#### `supabaseAdmin` Client

**Type**: `SupabaseClient | null`  
**Purpose**: Admin-level Supabase client for privileged operations

**Configuration**:
- Uses service role key for elevated permissions
- Only available if `SUPABASE_SERVICE_ROLE_KEY` is provided
- Falls back to `null` if admin key is not configured

**Usage**:
```typescript
import { supabaseAdmin } from './config/supabase.js'

if (supabaseAdmin) {
  // Perform admin operations
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
}
```

**Security Note**: This client has elevated permissions and should only be used for administrative tasks.

## Database Configuration

### Supabase Integration

The application integrates with Supabase for:
- **Authentication**: User management and session handling
- **Database**: Data storage and retrieval
- **Real-time**: Live updates and subscriptions
- **Storage**: File uploads and media management

### Connection Validation

The application automatically validates the Supabase connection on startup:
- Tests authentication session retrieval
- Verifies environment variable configuration
- Provides detailed error messages for troubleshooting

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Public anonymous key for client operations | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Environment File Setup

Create a `.env` file in the backend directory:

```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Usage Examples

### Basic Database Query

```typescript
import { supabase } from './config/supabase.js'

// Query vendors
async function getVendors() {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
  
  if (error) {
    console.error('Error fetching vendors:', error)
    return []
  }
  
  return data
}
```

### Authentication Check

```typescript
import { supabase } from './config/supabase.js'

// Check if user is authenticated
async function checkAuthStatus() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Auth error:', error)
    return false
  }
  
  return !!session
}
```

### Admin Operations

```typescript
import { supabaseAdmin } from './config/supabase.js'

// Perform admin operation
async function adminOperation() {
  if (!supabaseAdmin) {
    throw new Error('Admin client not configured')
  }
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('role', 'admin')
  
  if (error) {
    throw error
  }
  
  return data
}
```

## Development

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server with hot reload |
| `build` | `npm run build` | Build production version |
| `start` | `npm start` | Start production server |

### Development Server

```bash
npm run dev
```

The development server:
- Uses nodemon for automatic restarts
- Runs with TypeScript support
- Provides real-time logging
- Includes health monitoring every 30 seconds

### Building for Production

```bash
npm run build
npm start
```

### Dependencies

#### Production Dependencies

- `@supabase/supabase-js`: Supabase JavaScript client
- `dotenv`: Environment variable management

#### Development Dependencies

- `@types/node`: Node.js TypeScript definitions
- `nodemon`: Development server with auto-restart
- `ts-node`: TypeScript execution for development
- `typescript`: TypeScript compiler

## Error Handling

### Connection Errors

The application provides detailed error messages for common issues:

1. **Missing Environment Variables**: Clear instructions on required `.env` configuration
2. **Database Connection Failures**: Detailed logging of connection attempts
3. **Authentication Errors**: Proper error handling for auth operations

### Graceful Shutdown

The application handles process termination gracefully:
- Catches SIGINT signals
- Logs shutdown messages
- Exits cleanly

## Monitoring and Logging

### Health Monitoring

- Automatic health checks every 30 seconds
- Connection status logging
- Timestamp-based activity tracking

### Log Levels

- **Info**: Startup messages, connection success
- **Warning**: Non-critical issues
- **Error**: Connection failures, missing configuration
- **Debug**: Detailed operation information

## Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique keys for Supabase
- Rotate service role keys regularly

### Supabase Security

- Use Row Level Security (RLS) policies
- Implement proper authentication flows
- Validate user permissions before operations

## Future Enhancements

The current implementation provides a foundation for:

1. **Vendor Management APIs**: CRUD operations for vendors
2. **Product Catalog APIs**: Product listing and management
3. **Order Management**: Shopping cart and order processing
4. **User Authentication**: Complete auth flow implementation
5. **Real-time Updates**: Live inventory and order status updates

## Support and Contributing

### Getting Help

- Check the error logs for detailed information
- Verify environment variable configuration
- Ensure Supabase project is properly set up

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: Current as of project state  
**Version**: 1.0.0  
**Maintainer**: Online Palengke Team