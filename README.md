# Online Palengke 🏪

**Open-source online marketplace connecting Dipolog City residents with local palengke vendors.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Overview

Online Palengke is a modern digital marketplace designed to bridge the gap between traditional Filipino wet markets (palengke) and the digital age. Our platform empowers local vendors in Dipolog City to reach customers online while preserving the authentic palengke experience.

### 🎯 Mission

To digitize and modernize the traditional palengke experience while supporting local vendors and providing convenient access to fresh, local products for residents of Dipolog City.

## ✨ Features

- 🏪 **Vendor Management**: Complete vendor registration and profile management
- 📱 **Product Catalog**: Rich product listings with images and descriptions
- 🛒 **Order Management**: End-to-end order processing and tracking
- 🔐 **Authentication**: Secure user registration and login system
- 📊 **Real-time Updates**: Live order status and inventory updates
- 💰 **Payment Integration**: Ready for multiple payment methods
- 🌐 **Multi-platform**: Backend API ready for web and mobile clients

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 7.0.0 or higher
- **Supabase** account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-palengke
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Verify installation**
   You should see:
   ```
   🚀 Online Palengke Backend Starting...
   📍 Connecting Dipolog City residents with local vendors
   ✅ Database connection successful!
   🏪 Ready to serve the palengke!
   ```

## 📚 Documentation

### 📖 Comprehensive Guides

- **[Setup Guide](docs/SETUP.md)** - Complete installation and configuration
- **[API Documentation](docs/API.md)** - Detailed API reference and examples
- **[Environment Variables](docs/ENVIRONMENT.md)** - Configuration management
- **[Usage Examples](docs/EXAMPLES.md)** - Code snippets and integration examples

### 🏗️ Architecture

```
online-palengke/
├── backend/                 # Node.js TypeScript backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   └── supabase.ts # Database client setup
│   │   └── index.ts        # Main application entry
│   ├── package.json        # Dependencies and scripts
│   └── tsconfig.json       # TypeScript configuration
├── docs/                   # Comprehensive documentation
│   ├── API.md             # API reference
│   ├── SETUP.md           # Setup instructions
│   ├── ENVIRONMENT.md     # Environment configuration
│   └── EXAMPLES.md        # Usage examples
└── README.md              # This file
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **Environment**: dotenv for configuration management
- **Development**: nodemon + ts-node for hot reload

### Key Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.55.0",
    "dotenv": "^17.2.1"
  },
  "devDependencies": {
    "@types/node": "^24.3.0",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.2"
  }
}
```

## 🗃️ Database Schema

### Core Tables

- **vendors** - Vendor profiles and information
- **products** - Product catalog with pricing and inventory
- **orders** - Order management and tracking
- **order_items** - Individual items within orders
- **profiles** - Extended user profile information

### Example Schema
```sql
-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations key | ❌ |
| `NODE_ENV` | Environment mode | ❌ |
| `PORT` | Server port | ❌ |

### Example Configuration
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=development
PORT=3000
```

## 🚀 API Usage

### Quick Example

```typescript
import { supabase } from './config/supabase.js'

// Get all vendors
const { data: vendors, error } = await supabase
  .from('vendors')
  .select('*')
  .eq('is_active', true)

// Create a new product
const { data: product, error } = await supabase
  .from('products')
  .insert({
    vendor_id: 'vendor-uuid',
    name: 'Fresh Tomatoes',
    price: 25.00,
    category: 'Vegetables'
  })
```

### Authentication
```typescript
// Register new user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword'
})

// Login user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server

# Utilities
npm run type-check   # TypeScript type checking
npm run lint         # Code linting (if configured)
```

### Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **nodemon** automatically restarts the server
3. **Check logs** for errors or confirmations
4. **Test API endpoints** using your preferred tool
5. **Commit changes** when ready

### Health Monitoring

The application provides real-time health information:

```
🔄 Backend running... 3:45:30 PM
✅ Database connection successful!
🏪 Ready to serve the palengke!
```

## 🚀 Deployment

### Deployment Options

1. **Railway** - Recommended for quick deployment
2. **Heroku** - Traditional PaaS option
3. **DigitalOcean App Platform** - Scalable cloud deployment
4. **AWS/GCP/Azure** - Enterprise-grade infrastructure

### Production Setup

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
3. **Deploy to your chosen platform**
4. **Configure SSL and domain**

### Example Deployment (Railway)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Write tests** for new functionality
5. **Submit a pull request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code style
- Include proper error handling

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use descriptive variable and function names
- Include JSDoc comments for public APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team** - Core application development
- **Community Contributors** - Feature enhancements and bug fixes
- **Local Vendors** - Real-world testing and feedback

## 🙏 Acknowledgments

- **Dipolog City Local Government** - Support for digital transformation
- **Local Palengke Vendors** - Inspiration and feedback
- **Supabase Team** - Excellent backend-as-a-service platform
- **Open Source Community** - Tools and libraries that make this possible

## 📞 Support

### Getting Help

- **Documentation**: Check our comprehensive [docs](docs/) folder
- **GitHub Issues**: Report bugs or request features
- **Community**: Join discussions and get support

### Contact

- **Email**: [Your contact email]
- **GitHub**: [Your GitHub profile]
- **Website**: [Project website if applicable]

---

**Made with ❤️ for the Dipolog City community**

*Bringing traditional Filipino markets into the digital age while preserving their authentic character and supporting local vendors.*
