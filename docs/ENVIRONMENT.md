# Environment Variables Documentation

## Table of Contents

1. [Overview](#overview)
2. [Required Variables](#required-variables)
3. [Optional Variables](#optional-variables)
4. [Environment Templates](#environment-templates)
5. [Security Best Practices](#security-best-practices)
6. [Deployment Environments](#deployment-environments)
7. [Troubleshooting](#troubleshooting)

## Overview

The Online Palengke backend uses environment variables for configuration management. This approach provides:

- 🔒 **Security**: Sensitive data stays out of source code
- 🌍 **Flexibility**: Different configurations per environment
- 📦 **Portability**: Easy deployment across platforms
- 🔧 **Maintainability**: Centralized configuration management

## Required Variables

These environment variables **must** be set for the application to run:

### `SUPABASE_URL`

**Description**: Your Supabase project URL  
**Type**: String (URL)  
**Required**: ✅ Yes  
**Example**: `https://abcdefghijklmnop.supabase.co`

**How to obtain**:
1. Go to your Supabase dashboard
2. Navigate to **Settings** → **General**
3. Copy the **Project URL**

```env
SUPABASE_URL=https://your-project-id.supabase.co
```

### `SUPABASE_ANON_KEY`

**Description**: Supabase anonymous/public key for client-side operations  
**Type**: String (JWT Token)  
**Required**: ✅ Yes  
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**How to obtain**:
1. Go to your Supabase dashboard
2. Navigate to **Settings** → **API**
3. Copy the **anon public** key

```env
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjc4OTc4NDAwLCJleHAiOjE5OTQ1NTQ0MDB9.signature
```

## Optional Variables

These variables are optional but provide additional functionality:

### `SUPABASE_SERVICE_ROLE_KEY`

**Description**: Supabase service role key for server-side admin operations  
**Type**: String (JWT Token)  
**Required**: ❌ No (but recommended for admin features)  
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**How to obtain**:
1. Go to your Supabase dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2Nzg5Nzg0MDAsImV4cCI6MTk5NDU1NDQwMH0.signature
```

**⚠️ Security Warning**: This key has admin privileges. Never expose it in client-side code.

### `NODE_ENV`

**Description**: Node.js environment mode  
**Type**: String  
**Default**: `development`  
**Options**: `development`, `production`, `test`

```env
NODE_ENV=development
```

### `PORT`

**Description**: Port number for the server to listen on  
**Type**: Integer  
**Default**: `3000`  
**Range**: `1024-65535` (recommended: `3000-8080`)

```env
PORT=3000
```

### `LOG_LEVEL`

**Description**: Logging verbosity level  
**Type**: String  
**Default**: `info`  
**Options**: `error`, `warn`, `info`, `debug`

```env
LOG_LEVEL=info
```

### `DEBUG`

**Description**: Enable debug mode for detailed logging  
**Type**: Boolean  
**Default**: `false`  
**Options**: `true`, `false`

```env
DEBUG=false
```

## Environment Templates

### Development Environment (.env.development)

```env
# Supabase Configuration
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=your_development_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_development_service_role_key

# Development Settings
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DEBUG=true

# Optional Development Tools
HOT_RELOAD=true
ENABLE_CORS=true
```

### Production Environment (.env.production)

```env
# Supabase Configuration
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Production Settings
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
DEBUG=false

# Production Security
ENABLE_CORS=false
TRUST_PROXY=true
```

### Testing Environment (.env.test)

```env
# Supabase Configuration (Test Database)
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_ANON_KEY=your_test_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_test_service_role_key

# Test Settings
NODE_ENV=test
PORT=3001
LOG_LEVEL=error
DEBUG=false

# Test-specific
RUN_MIGRATIONS=true
CLEAR_DB_ON_START=true
```

### Example .env file

```env
# ==============================================
# Online Palengke Backend Configuration
# ==============================================

# Supabase Database Configuration
# Get these from: https://app.supabase.com/project/_/settings/api
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3ODk3ODQwMCwiZXhwIjoxOTk0NTU0NDAwfQ.signature

# Optional: For admin operations (user management, etc.)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjc4OTc4NDAwLCJleHAiOjE5OTQ1NTQ0MDB9.signature

# Application Configuration
NODE_ENV=development
PORT=3000

# Logging Configuration
LOG_LEVEL=info
DEBUG=false

# ==============================================
# Additional Configuration (Optional)
# ==============================================

# Database Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10

# Session Configuration
SESSION_SECRET=your-secret-session-key
SESSION_TIMEOUT=3600000

# API Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf

# External Service APIs
SENDGRID_API_KEY=your_sendgrid_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## Security Best Practices

### 1. Never Commit .env Files

Add `.env*` to your `.gitignore`:

```gitignore
# Environment files
.env
.env.local
.env.development
.env.production
.env.test
*.env
```

### 2. Use Different Keys Per Environment

- **Development**: Use development Supabase project
- **Staging**: Use staging Supabase project  
- **Production**: Use production Supabase project

### 3. Rotate Keys Regularly

```bash
# Generate new keys in Supabase Dashboard
# Update environment variables
# Restart applications
# Revoke old keys
```

### 4. Validate Environment Variables

The application automatically validates required variables:

```typescript
// src/config/supabase.ts
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please check your .env file and ensure you have:')
  console.error('SUPABASE_URL=your_supabase_url')
  console.error('SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}
```

### 5. Use Secrets Management in Production

#### Heroku

```bash
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
```

#### Railway

```bash
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_ANON_KEY=your_key
```

#### Docker

```bash
docker run -e SUPABASE_URL=your_url -e SUPABASE_ANON_KEY=your_key app
```

## Deployment Environments

### Local Development

```bash
# Create .env file
cp .env.example .env

# Edit with your credentials
nano .env

# Start development server
npm run dev
```

### CI/CD Pipelines

```yaml
# GitHub Actions example
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  NODE_ENV: test
```

### Docker Deployment

```dockerfile
# Dockerfile
ENV NODE_ENV=production
ENV PORT=3000

# docker-compose.yml
environment:
  - SUPABASE_URL=${SUPABASE_URL}
  - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
  - NODE_ENV=production
```

### Cloud Platforms

#### Vercel

```bash
# vercel.json
{
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

#### Netlify

```toml
# netlify.toml
[build.environment]
  NODE_ENV = "production"
  
[context.production.environment]
  SUPABASE_URL = "https://your-prod-project.supabase.co"
```

## Troubleshooting

### Common Environment Issues

#### 1. Variables Not Loading

**Problem**: Environment variables are undefined

**Solutions**:
```bash
# Check if .env file exists
ls -la .env

# Verify file format (no spaces around =)
cat .env

# Ensure dotenv is properly configured
import 'dotenv/config'
```

#### 2. Wrong Environment

**Problem**: Using development keys in production

**Solutions**:
```bash
# Check current environment
echo $NODE_ENV

# Verify loaded variables (hide sensitive data)
node -e "console.log('URL:', process.env.SUPABASE_URL?.substring(0, 20) + '...')"
```

#### 3. Key Format Issues

**Problem**: Invalid JWT token format

**Solutions**:
```bash
# Check key length (should be ~300+ characters)
echo $SUPABASE_ANON_KEY | wc -c

# Verify JWT format (should start with eyJ)
echo $SUPABASE_ANON_KEY | head -c 10
```

#### 4. Permission Errors

**Problem**: Service role key not working

**Solutions**:
1. Verify you're using the service_role key, not anon
2. Check Supabase project permissions
3. Ensure key hasn't expired
4. Try regenerating the key

### Environment Validation Script

Create a validation script to check your environment:

```typescript
// scripts/validate-env.ts
import dotenv from 'dotenv'

dotenv.config()

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
]

const optionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NODE_ENV',
  'PORT'
]

console.log('🔍 Validating environment variables...\n')

// Check required variables
let hasErrors = false
for (const varName of requiredVars) {
  const value = process.env[varName]
  if (!value) {
    console.error(`❌ Missing required variable: ${varName}`)
    hasErrors = true
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
  }
}

// Check optional variables
for (const varName of optionalVars) {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value}`)
  } else {
    console.warn(`⚠️  Optional variable not set: ${varName}`)
  }
}

if (hasErrors) {
  console.error('\n❌ Environment validation failed')
  process.exit(1)
} else {
  console.log('\n✅ Environment validation passed')
}
```

Run with:
```bash
npx ts-node scripts/validate-env.ts
```

### Debug Environment Loading

Add this to your main application for debugging:

```typescript
// Debug environment loading
console.log('🔧 Environment Debug Info:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
```

---

## Next Steps

1. **Set up your environment variables** using the templates above
2. **Validate your configuration** with the validation script
3. **Test different environments** (development, staging, production)
4. **Implement secrets management** for production deployments
5. **Document any custom variables** your application requires

For more information, see:
- [Setup Guide](./SETUP.md)
- [API Documentation](./API.md)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/environment-variables)