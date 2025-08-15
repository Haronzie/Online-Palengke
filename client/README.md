# Online Palengke Frontend

A modern React 19 + Vite + TypeScript application for the Online Palengke marketplace platform.

## 🚀 Tech Stack

- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **React Icons** - Popular icon library
- **ESLint + Prettier** - Code linting and formatting

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18.0 or higher)
- **npm** (version 9.0 or higher)

## 🛠️ Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 🏃‍♂️ Development

### Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` with hot module replacement (HMR) enabled.

### Other development commands:

- **Type checking**: `npm run type-check`
- **Linting**: `npm run lint`
- **Fix linting issues**: `npm run lint:fix`

## 🏗️ Building for Production

### Build the application:
```bash
npm run build
```

This will:
1. Run TypeScript compilation (`tsc`)
2. Build the project with Vite optimizations
3. Output files to the `build` directory

### Preview production build:
```bash
npm run preview
```

## 🧪 Testing

### Run tests:
```bash
npm run test
```

### Run tests with UI:
```bash
npm run test:ui
```

## 🌍 Environment Variables

Create a `.env` file in the client directory for environment-specific variables:

```env
VITE_API_URL=http://localhost:3002/api
VITE_APP_TITLE=Online Palengke
```

**Note**: All environment variables for the frontend must be prefixed with `VITE_` to be accessible in the browser.

## 📁 Project Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── api.ts          # API configuration and endpoints
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── pages/          # Page components
│   ├── assets/         # Images, fonts, etc.
│   ├── styles/         # Global styles
│   ├── main.tsx        # Application entry point
│   ├── App.tsx         # Main App component
│   └── vite-env.d.ts   # Vite environment types
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

## 🎯 Key Features

- **Modern React 19** with latest features and optimizations
- **Strict TypeScript** configuration for type safety
- **Fast development** with Vite's HMR
- **Responsive design** with Tailwind CSS
- **Authentication** with JWT tokens
- **Protected routes** and user management
- **Product catalog** with search and filtering
- **Shopping cart** and wishlist functionality
- **Order management** system

## 🔧 Path Aliases

The project is configured with path aliases for cleaner imports:

```typescript
import { Button } from '@/components/Button'
import { AuthProvider } from '@/contexts/AuthContext'
import HomePage from '@/pages/Home'
```

Available aliases:
- `@/` → `src/`
- `@/components/` → `src/components/`
- `@/pages/` → `src/pages/`
- `@/contexts/` → `src/contexts/`
- `@/assets/` → `src/assets/`
- `@/styles/` → `src/styles/`

## 📦 Build Output

The production build includes:
- **Code splitting** for optimal loading
- **Tree shaking** to remove unused code
- **Asset optimization** (images, CSS, JS)
- **Source maps** for debugging
- **Modern ES modules** for better performance

## 🚀 Deployment

The built application is static and can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Deploy the `build` folder
- **GitHub Pages**: Use the build output
- **AWS S3**: Upload the build folder

## 🤝 Contributing

1. Follow the TypeScript strict mode guidelines
2. Use ESLint and Prettier for code formatting
3. Ensure all tests pass before committing
4. Follow the existing component structure and naming conventions

## 📚 Learn More

- [React 19 Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## 🔄 Migration Notes

This project was migrated from Create React App to Vite + TypeScript while preserving all existing functionality and design. Key changes include:

- Replaced `react-scripts` with Vite for faster builds
- Converted all JavaScript files to TypeScript
- Updated build and development scripts
- Migrated environment variables to Vite's `import.meta.env`
- Enhanced ESLint and Prettier configuration for TypeScript

The visual design and user experience remain exactly the same as the original CRA application.