# Online Palengke Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Environment Configuration](#environment-configuration)
5. [Supabase Setup](#supabase-setup)
6. [Development Environment](#development-environment)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 7.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Text Editor**: VS Code recommended

### Check Your Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

### Accounts & Services

- **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
- **GitHub Account**: For code repository access (if applicable)

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd online-palengke

# Navigate to backend
cd backend

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your Supabase credentials
nano .env
```

### 3. Start Development Server

```bash
# Start the backend
npm run dev
```

You should see:
```
🚀 Online Palengke Backend Starting...
📍 Connecting Dipolog City residents with local vendors
✅ Database connection successful!
🏪 Ready to serve the palengke!
```

## Detailed Setup

### 1. Project Structure

After cloning, your project structure should look like:

```
online-palengke/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env (you'll create this)
├── docs/
│   ├── API.md
│   └── SETUP.md
└── README.md
```

### 2. Backend Dependencies Installation

```bash
cd backend

# Install production dependencies
npm install @supabase/supabase-js dotenv

# Install development dependencies
npm install --save-dev @types/node nodemon ts-node typescript
```

### 3. TypeScript Configuration

The project includes a pre-configured `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Environment Configuration

### 1. Create .env File

Create a `.env` file in the `backend` directory:

```bash
# In the backend directory
touch .env
```

### 2. Required Environment Variables

Add the following variables to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Development Settings
NODE_ENV=development
PORT=3000
```

### 3. Environment Variable Descriptions

| Variable | Purpose | Where to Find |
|----------|---------|---------------|
| `SUPABASE_URL` | Your Supabase project URL | Project Settings → General → Project URL |
| `SUPABASE_ANON_KEY` | Public API key for client operations | Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for server operations | Project Settings → API → service_role (secret) |

### 4. Security Notes

- ⚠️ **Never commit `.env` files** to version control
- 🔒 **Keep service role keys secure** - they have admin privileges
- 🔑 **Rotate keys regularly** in production environments

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `online-palengke`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users (Philippines: Southeast Asia)

### 2. Get Your Project Credentials

1. Navigate to **Settings** → **API**
2. Copy the following:
   - **Project URL**
   - **anon public** key
   - **service_role** key (for admin operations)

### 3. Recommended Database Schema

Create the following tables in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT,
  image_urls TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Create indexes for better performance
CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (examples)
-- Vendors can only see and modify their own data
CREATE POLICY "Vendors can view own data" ON vendors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert own data" ON vendors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Products are publicly readable, but only vendors can modify their own
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Vendors can manage own products" ON products
  FOR ALL USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );
```

### 4. Enable Authentication

1. Go to **Authentication** → **Settings**
2. Configure your authentication providers:
   - **Email**: Enable email authentication
   - **Social**: Optional (Google, Facebook, etc.)
3. Set up email templates if needed

## Development Environment

### 1. Start Development Server

```bash
# In the backend directory
npm run dev
```

The server will start with:
- **Hot reload**: Automatic restart on file changes
- **TypeScript compilation**: Real-time type checking
- **Health monitoring**: Status updates every 30 seconds

### 2. Development Scripts

```bash
# Start development server
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Linting (if configured)
npm run lint
```

### 3. Recommended VS Code Extensions

- **TypeScript Hero**: Auto-import and organization
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Supabase**: Supabase integration
- **Thunder Client**: API testing

### 4. Development Workflow

1. **Make changes** to TypeScript files
2. **nodemon** automatically restarts the server
3. **Check logs** for any errors
4. **Test API endpoints** using Thunder Client or Postman
5. **Commit changes** using Git

## Production Deployment

### 1. Build for Production

```bash
# Build the TypeScript code
npm run build

# The compiled JavaScript will be in the dist/ folder
```

### 2. Environment Variables for Production

Create a production `.env` file with:

```env
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
PORT=3000
```

### 3. Deployment Options

#### Option 1: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option 2: Heroku

```bash
# Install Heroku CLI and login
heroku create online-palengke-backend

# Set environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key

# Deploy
git push heroku main
```

#### Option 3: DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
3. Set environment variables in the dashboard

### 4. Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] Health checks implemented
- [ ] Logging configured
- [ ] Error monitoring setup
- [ ] Backup strategy in place

## Troubleshooting

### Common Issues

#### 1. "Missing Supabase environment variables!"

**Problem**: Environment variables not loaded

**Solution**:
```bash
# Check if .env file exists
ls -la .env

# Verify file contents
cat .env

# Ensure variables are properly formatted (no spaces around =)
SUPABASE_URL=https://your-project.supabase.co
```

#### 2. "Module not found" errors

**Problem**: Dependencies not installed

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript compilation errors

**Problem**: Type errors preventing startup

**Solution**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix the reported errors or update types
npm install --save-dev @types/node
```

#### 4. Database connection failed

**Problem**: Can't connect to Supabase

**Solution**:
1. Verify your Supabase URL and keys
2. Check if your Supabase project is active
3. Ensure your network allows HTTPS connections
4. Try creating a new Supabase project if issues persist

#### 5. Port already in use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Debug Mode

Enable debug logging by setting:

```bash
# In your .env file
DEBUG=true
LOG_LEVEL=debug
```

### Getting Help

1. **Check the logs**: Server logs provide detailed error information
2. **Supabase Dashboard**: Monitor database performance and logs
3. **GitHub Issues**: Report bugs and request features
4. **Supabase Community**: Get help at [community.supabase.com](https://community.supabase.com)

### Performance Monitoring

Monitor your application with:

```typescript
// Add to your main application
console.log(`🔄 Backend running... ${new Date().toLocaleTimeString()}`)
console.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`)
```

---

## Next Steps

After completing the setup:

1. **Test the connection** by running the development server
2. **Create your first vendor** using the Supabase dashboard
3. **Build API endpoints** for your mobile app
4. **Set up the React Native frontend** (if applicable)
5. **Deploy to production** when ready

For detailed API documentation, see [API.md](./API.md).