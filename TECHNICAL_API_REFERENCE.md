# Online Palengke - Technical API Reference

## Overview

This document provides a comprehensive technical reference for all public APIs, functions, and components in the Online Palengke backend codebase. It includes detailed function signatures, parameter descriptions, return types, and implementation details.

## Code Structure

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

## File: `src/index.ts`

### Exports

This file serves as the main entry point and does not export any functions or variables. It contains the application initialization logic.

### Functions

#### `main()`

**Signature**: `async function main(): Promise<void>`

**Description**: Main application entry point that initializes the Online Palengke backend service.

**Implementation Details**:
- Logs startup messages with emoji indicators
- Tests Supabase database connection via authentication session check
- Establishes health monitoring with 30-second intervals
- Provides comprehensive error handling and logging

**Internal Flow**:
1. **Startup Logging**: Displays branded startup messages
2. **Connection Test**: Attempts to retrieve Supabase auth session
3. **Success Handling**: Logs successful connection and readiness
4. **Health Monitoring**: Establishes periodic health check logging
5. **Error Handling**: Catches and logs any connection failures

**Error Handling**:
- Catches connection errors and logs detailed failure information
- Provides helpful troubleshooting tips for missing environment variables
- Exits process with code 1 on critical failures

**Dependencies**:
- `./config/supabase.js` - Supabase client instance
- `console.log/error` - Logging functions
- `setInterval` - Health monitoring timer
- `process.exit()` - Process termination

**Usage Example**:
```typescript
// Called automatically at startup
main().catch(console.error)
```

**Return Value**: `Promise<void>`

**Side Effects**:
- Logs to console
- Establishes health monitoring interval
- May terminate process on critical errors

### Event Handlers

#### SIGINT Handler

**Signature**: `process.on('SIGINT', callback)`

**Description**: Graceful shutdown handler for the application.

**Implementation**:
```typescript
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Online Palengke backend...')
  process.exit(0)
})
```

**Purpose**: Handles Ctrl+C termination gracefully by logging shutdown message and exiting cleanly.

**Return Value**: `undefined`

**Side Effects**: Terminates the Node.js process with exit code 0.

### Health Monitoring

**Implementation**: Uses `setInterval` to log health status every 30 seconds.

**Code**:
```typescript
setInterval(() => {
  console.log(`🔄 Backend running... ${new Date().toLocaleTimeString()}`)
}, 30000)
```

**Purpose**: Provides continuous feedback that the backend is operational during development.

**Interval**: 30,000 milliseconds (30 seconds)

**Log Format**: `🔄 Backend running... [current_time]`

## File: `src/config/supabase.ts`

### Exports

#### `supabase`

**Type**: `SupabaseClient`

**Description**: Main Supabase client instance for database operations.

**Configuration**:
- Automatically loads environment variables via `dotenv.config()`
- Validates required Supabase credentials
- Initializes connection to Supabase instance

**Environment Variables Required**:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Public anonymous key for client operations

**Validation Logic**:
```typescript
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please check your .env file and ensure you have:')
  console.error('SUPABASE_URL=your_supabase_url')
  console.error('SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}
```

**Initialization**:
```typescript
export const supabase = createClient(supabaseUrl, supabaseKey)
```

**Usage Examples**:
```typescript
// Authentication
const { data: { session }, error } = await supabase.auth.getSession()

// Database queries
const { data, error } = await supabase
  .from('vendors')
  .select('*')

// Real-time subscriptions
const subscription = supabase
  .channel('table_db_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

**Error Handling**: Exits process with code 1 if required environment variables are missing.

**Dependencies**:
- `@supabase/supabase-js` - Supabase client library
- `dotenv` - Environment variable management

#### `supabaseAdmin`

**Type**: `SupabaseClient | null`

**Description**: Admin-level Supabase client for privileged operations.

**Configuration**:
- Uses service role key for elevated permissions
- Only available if `SUPABASE_SERVICE_ROLE_KEY` is provided
- Falls back to `null` if admin key is not configured

**Environment Variables**:
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations (optional)

**Initialization**:
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null
```

**Usage Examples**:
```typescript
// Check if admin client is available
if (supabaseAdmin) {
  // Perform admin operations
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('role', 'admin')
} else {
  console.log('Admin client not configured')
}
```

**Security Considerations**:
- Has elevated permissions beyond regular user access
- Should only be used for administrative tasks
- Requires careful permission management

**Dependencies**:
- `@supabase/supabase-js` - Supabase client library
- Environment variable `SUPABASE_SERVICE_ROLE_KEY`

### Internal Functions

#### Environment Loading

**Implementation**: Uses `dotenv.config()` to automatically load `.env` file variables.

**Code**:
```typescript
import dotenv from 'dotenv'
dotenv.config()
```

**Purpose**: Automatically loads environment variables from `.env` file into `process.env`.

### Error Handling

#### Missing Environment Variables

**Detection**: Checks for required environment variables before client initialization.

**Error Message**:
```
❌ Missing Supabase environment variables!
Please check your .env file and ensure you have:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

**Action**: Exits process with code 1 to prevent invalid client initialization.

#### Success Confirmation

**Message**: `✅ Supabase connected successfully!`

**Purpose**: Confirms successful client initialization and connection.

## Type Definitions

### Supabase Client Types

The application uses Supabase's built-in TypeScript types:

- `SupabaseClient`: Main client type for database operations
- `AuthResponse`: Authentication response type
- `Session`: User session type
- `PostgrestError`: Database error type

### Environment Variable Types

```typescript
// Inferred from process.env
const supabaseUrl: string | undefined = process.env.SUPABASE_URL
const supabaseKey: string | undefined = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY
```

## Dependencies

### Production Dependencies

#### `@supabase/supabase-js`

**Version**: `^2.55.0`

**Purpose**: Official Supabase JavaScript client library.

**Features**:
- Database operations (CRUD)
- Authentication management
- Real-time subscriptions
- File storage operations
- Row Level Security support

**Usage**: Core dependency for all Supabase operations.

#### `dotenv`

**Version**: `^17.2.1`

**Purpose**: Environment variable management.

**Features**:
- Automatic `.env` file loading
- Environment variable parsing
- Development environment support

**Usage**: Loads configuration from `.env` files.

### Development Dependencies

#### `@types/node`

**Version**: `^24.3.0`

**Purpose**: TypeScript definitions for Node.js.

**Usage**: Provides type information for Node.js built-in modules.

#### `nodemon`

**Version**: `^3.1.10`

**Purpose**: Development server with automatic restart.

**Usage**: Monitors file changes and restarts the development server.

#### `ts-node`

**Version**: `^10.9.2`

**Purpose**: TypeScript execution for development.

**Usage**: Allows running TypeScript files directly without compilation.

#### `typescript`

**Version**: `^5.9.2`

**Purpose**: TypeScript compiler.

**Usage**: Compiles TypeScript to JavaScript for production builds.

## Build Configuration

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Key Settings**:
- **target**: ES2020 for modern JavaScript features
- **module**: ESNext for ES modules support
- **strict**: Enables strict type checking
- **outDir**: Output directory for compiled JavaScript
- **rootDir**: Source directory for TypeScript files

### Package Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec \"node --loader ts-node/esm\" src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**Script Details**:
- **dev**: Development server with TypeScript support and auto-restart
- **build**: Compiles TypeScript to JavaScript
- **start**: Runs the compiled production build

## Error Codes and Exit Status

### Process Exit Codes

- **0**: Normal termination (graceful shutdown)
- **1**: Error termination (missing configuration, connection failure)

### Common Error Scenarios

1. **Missing Environment Variables**: Exit code 1
2. **Database Connection Failure**: Exit code 1
3. **Graceful Shutdown**: Exit code 0

## Performance Characteristics

### Memory Usage

- **Base Memory**: Minimal overhead for Node.js process
- **Supabase Client**: Lightweight client with connection pooling
- **Health Monitoring**: Negligible memory impact from logging

### CPU Usage

- **Idle State**: Minimal CPU usage during health monitoring
- **Database Operations**: CPU usage scales with query complexity
- **Startup**: Brief CPU spike during initialization and connection test

### Network Usage

- **Health Monitoring**: No network activity
- **Database Operations**: Network usage scales with data transfer
- **Connection**: Initial connection establishment

## Security Considerations

### Environment Variables

- **Never commit `.env` files** to version control
- **Use strong, unique keys** for Supabase
- **Rotate service role keys** regularly
- **Validate environment variables** at startup

### Supabase Security

- **Row Level Security (RLS)**: Implement proper access policies
- **Authentication**: Use secure authentication flows
- **Permission Validation**: Always validate user permissions
- **Service Role Key**: Keep admin keys secure and limited

### Network Security

- **HTTPS Only**: Ensure all connections use HTTPS
- **API Key Protection**: Never expose keys in client-side code
- **CORS Configuration**: Configure proper CORS policies

## Testing and Validation

### Connection Testing

The application automatically tests the Supabase connection on startup:

```typescript
const { data: { session }, error } = await supabase.auth.getSession()
```

**Test Purpose**: Validates that environment variables are correct and Supabase is accessible.

**Success Criteria**: No error thrown during session retrieval.

**Failure Handling**: Process termination with detailed error logging.

### Health Monitoring

**Implementation**: Periodic logging every 30 seconds.

**Purpose**: Provides continuous feedback during development.

**Production Note**: Health monitoring is primarily for development; production deployments may use different monitoring strategies.

## Deployment Considerations

### Environment Setup

1. **Set Environment Variables**: Configure all required Supabase credentials
2. **Build Process**: Run `npm run build` to compile TypeScript
3. **Start Command**: Use `npm start` to run the compiled version
4. **Process Management**: Use PM2, Docker, or similar for production

### Production Modifications

- **Remove Health Monitoring**: Disable or modify health monitoring for production
- **Logging**: Implement proper logging infrastructure
- **Monitoring**: Add production-grade monitoring and alerting
- **Security**: Ensure all security best practices are implemented

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check `.env` file exists and contains required variables
   - Verify variable names match exactly
   - Ensure no extra spaces or quotes

2. **Database Connection Failures**
   - Verify Supabase project is active
   - Check network connectivity
   - Validate API keys are correct

3. **TypeScript Compilation Errors**
   - Ensure all dependencies are installed
   - Check TypeScript version compatibility
   - Verify `tsconfig.json` configuration

### Debug Information

The application provides detailed logging for troubleshooting:

- **Startup Messages**: Clear indication of initialization steps
- **Connection Status**: Success/failure of database connection
- **Error Details**: Specific error messages and suggestions
- **Health Status**: Continuous operation confirmation

## Future API Extensions

### Planned Functionality

1. **Vendor Management APIs**
   - CRUD operations for vendor profiles
   - Vendor authentication and authorization
   - Vendor rating and review systems

2. **Product Catalog APIs**
   - Product listing and search
   - Category management
   - Inventory tracking

3. **Order Management APIs**
   - Shopping cart operations
   - Order processing and fulfillment
   - Payment integration

4. **User Management APIs**
   - User registration and authentication
   - Profile management
   - Order history

5. **Real-time Features**
   - Live inventory updates
   - Order status notifications
   - Chat and messaging systems

### API Design Patterns

- **RESTful Design**: Follow REST principles for resource management
- **Error Handling**: Consistent error response format
- **Validation**: Input validation and sanitization
- **Authentication**: JWT-based authentication with Supabase
- **Rate Limiting**: API rate limiting for abuse prevention

---

**Document Version**: 1.0.0  
**Last Updated**: Current as of project state  
**Maintainer**: Online Palengke Development Team