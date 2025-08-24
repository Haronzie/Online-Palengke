# Online Palengke Backend API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Getting Started](#getting-started)
4. [Configuration](#configuration)
5. [Database Client](#database-client)
6. [API Reference](#api-reference)
7. [Usage Examples](#usage-examples)
8. [Error Handling](#error-handling)
9. [Development](#development)

## Overview

The Online Palengke Backend is a Node.js TypeScript application that serves as the backend infrastructure for connecting Dipolog City residents with local palengke (marketplace) vendors. Built with Supabase for real-time database operations and authentication.

### Key Features

- 🏪 **Marketplace Management**: Connect vendors with customers
- 📱 **Real-time Operations**: Powered by Supabase real-time capabilities
- 🔐 **Authentication & Authorization**: Built-in user management
- 🌐 **TypeScript Support**: Full type safety and modern development experience
- 🔧 **Environment-based Configuration**: Flexible deployment options

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Environment Management**: dotenv
- **Development Tools**: nodemon, ts-node

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Set up environment variables (see [Configuration](#configuration))
5. Start the development server:

```bash
npm run dev
```

## Configuration

### Environment Variables

The application requires the following environment variables to be set in a `.env` file:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (optional) | ❌ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Example .env file

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anonymous_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Database Client

### Supabase Configuration (`src/config/supabase.ts`)

This module provides configured Supabase clients for database operations.

#### Exports

##### `supabase`

Main Supabase client for standard operations.

**Type**: `SupabaseClient`

**Usage**:
```typescript
import { supabase } from './config/supabase.js'

// Example usage
const { data, error } = await supabase
  .from('vendors')
  .select('*')
```

##### `supabaseAdmin`

Admin Supabase client with elevated privileges (optional).

**Type**: `SupabaseClient | null`

**Usage**:
```typescript
import { supabaseAdmin } from './config/supabase.js'

if (supabaseAdmin) {
  // Admin operations
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
}
```

#### Configuration Features

- **Environment Validation**: Automatically validates required environment variables
- **Error Handling**: Graceful error handling with descriptive messages
- **Admin Client**: Optional admin client for elevated operations
- **Connection Testing**: Built-in connection verification

## API Reference

### Main Application (`src/index.ts`)

The main application entry point that initializes the backend service.

#### Functions

##### `main()`

Initializes the Online Palengke backend application.

**Type**: `async function main(): Promise<void>`

**Description**: 
- Establishes database connection
- Validates Supabase configuration
- Starts the backend service
- Implements graceful shutdown handling

**Features**:
- Database connection testing
- Health check logging (every 30 seconds)
- Graceful shutdown on SIGINT
- Error handling with descriptive messages

**Example Usage**:
```typescript
// The main function is automatically called when the application starts
// It handles all initialization and keeps the service running
```

**Error Handling**:
- Validates database connection on startup
- Exits with code 1 if connection fails
- Provides helpful error messages for troubleshooting

## Usage Examples

### Basic Database Operations

```typescript
import { supabase } from './config/supabase.js'

// Create a new vendor
async function createVendor(vendorData: any) {
  const { data, error } = await supabase
    .from('vendors')
    .insert(vendorData)
    .select()
  
  if (error) throw error
  return data
}

// Fetch all products
async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendor:vendors(name, location)
    `)
  
  if (error) throw error
  return data
}

// Real-time subscription
function subscribeToOrders() {
  return supabase
    .channel('orders')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('Order update:', payload)
      }
    )
    .subscribe()
}
```

### Authentication Examples

```typescript
import { supabase } from './config/supabase.js'

// User registration
async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  
  if (error) throw error
  return data
}

// User login
async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

// Get current user
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) throw error
  return user
}
```

### Admin Operations (Optional)

```typescript
import { supabaseAdmin } from './config/supabase.js'

// List all users (admin only)
async function getAllUsers() {
  if (!supabaseAdmin) {
    throw new Error('Admin client not configured')
  }
  
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) throw error
  return data
}

// Delete user (admin only)
async function deleteUser(userId: string) {
  if (!supabaseAdmin) {
    throw new Error('Admin client not configured')
  }
  
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) throw error
}
```

## Error Handling

### Common Error Patterns

```typescript
import { supabase } from './config/supabase.js'

// Standard error handling pattern
async function safeOperation() {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
    
    if (error) {
      console.error('Database error:', error.message)
      throw new Error(`Operation failed: ${error.message}`)
    }
    
    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    throw error
  }
}

// Error handling with retry logic
async function operationWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
      
      if (error) throw error
      return data
      
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw new Error(`Operation failed after ${maxRetries} attempts`)
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}
```

### Environment Configuration Errors

The application automatically validates environment variables and provides helpful error messages:

```bash
❌ Missing Supabase environment variables!
Please check your .env file and ensure you have:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

## Development

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start production server

### Development Features

- **Hot Reload**: Automatic restart on file changes using nodemon
- **TypeScript Support**: Full TypeScript compilation and type checking
- **ESM Modules**: Modern ES module support
- **Environment Validation**: Automatic validation of required configurations

### Logging

The application provides comprehensive logging:

- ✅ Startup confirmation
- 🔄 Health check status (every 30 seconds)
- ❌ Error messages with context
- 👋 Graceful shutdown messages

### Database Schema Recommendations

Based on the marketplace nature, consider implementing these tables:

```sql
-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  contact_info JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  image_urls TEXT[],
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id),
  vendor_id UUID REFERENCES vendors(id),
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

For more information or support, please refer to the [Supabase Documentation](https://supabase.com/docs) or open an issue in the project repository.