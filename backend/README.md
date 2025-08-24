# Online Palengke Backend

A lightweight Node.js + TypeScript backend bootstrapped for the Online Palengke marketplace.

## Tech Stack

- Node.js (ESM)
- TypeScript
- Supabase (`@supabase/supabase-js`)
- dotenv

## Getting Started

1) Install dependencies
```bash
cd backend
npm install
```

2) Configure environment
```bash
cp .env.example .env
# Edit .env with your Supabase project credentials
```

3) Run in development
```bash
npm run dev
```

4) Build and run production build
```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for required variables. At minimum:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional for admin client)

## Project Structure

```
backend/
  src/
    config/
      supabase.ts     # Supabase clients (public + admin)
    index.ts          # Entry point / connectivity check
  API_REFERENCE.md    # Public API docs
  package.json
  tsconfig.json
```

## API Reference

See `API_REFERENCE.md` for detailed documentation and examples.