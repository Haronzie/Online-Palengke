# Online-Palengke

Open-source online marketplace connecting Dipolog City residents with local palengke vendors. Built with React Native + Supabase.

## 📚 Documentation

This project includes comprehensive documentation for all public APIs, functions, and components:

- **[📖 API Documentation](API_DOCUMENTATION.md)** - Complete API overview with examples and usage instructions
- **[🔧 Technical API Reference](TECHNICAL_API_REFERENCE.md)** - Detailed technical specifications and implementation details
- **[⚡ Quick Reference Guide](QUICK_REFERENCE.md)** - Developer quick reference for daily development tasks

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # Optional
```

## 🏗️ Project Structure

```
├── backend/                 # Backend API service
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   └── supabase.ts # Supabase client setup
│   │   └── index.ts        # Main application entry point
│   ├── package.json        # Dependencies and scripts
│   └── tsconfig.json       # TypeScript configuration
├── API_DOCUMENTATION.md     # Complete API documentation
├── TECHNICAL_API_REFERENCE.md # Technical API specifications
├── QUICK_REFERENCE.md      # Developer quick reference
└── README.md               # This file
```

## 🛠️ Technology Stack

- **Backend**: Node.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

## 📡 Available APIs

### Core Services
- **Database Operations**: Full CRUD operations via Supabase client
- **Authentication**: User session management and validation
- **Real-time Updates**: Live data synchronization
- **File Storage**: Media upload and management

### Public Exports
- **`supabase`**: Main Supabase client for database operations
- **`supabaseAdmin`**: Admin client for privileged operations (if configured)

## 🔧 Development

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server with hot reload |
| `build` | `npm run build` | Build TypeScript to JavaScript |
| `start` | `npm start` | Start production server |

### Health Monitoring

During development, the backend provides:
- Automatic health checks every 30 seconds
- Connection status logging
- Graceful shutdown handling

## 🔐 Security Features

- Environment variable validation
- Supabase Row Level Security (RLS) support
- Admin client isolation
- Secure credential management

## 🎯 Roadmap

The current implementation provides a foundation for:

1. **Vendor Management** - CRUD operations for vendors
2. **Product Catalog** - Product listing and management
3. **Order Management** - Shopping cart and order processing
4. **User Authentication** - Complete auth flow implementation
5. **Real-time Features** - Live inventory and order status updates

## 📖 Getting Started

1. **Read the Documentation**: Start with the [Quick Reference Guide](QUICK_REFERENCE.md)
2. **Set Up Environment**: Configure your Supabase credentials
3. **Start Development**: Use `npm run dev` to begin development
4. **Explore APIs**: Review the [API Documentation](API_DOCUMENTATION.md) for detailed examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- Check the [documentation](API_DOCUMENTATION.md) for detailed information
- Review console logs for error details
- Verify environment variable configuration
- Ensure Supabase project is properly set up

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Project Version**: 1.0.0  
**Last Updated**: Current as of project state  
**Maintainer**: Online Palengke Team
