# Online Palengke – Backend Documentation

## Overview
The Online Palengke backend is a lightweight TypeScript project that connects the client application to a Supabase Postgres database.  
It currently exposes two *public* exports that you can import into other modules or micro-services:

1. **`supabase`** – a regular Supabase JavaScript client authenticated with the anonymous (public) key.
2. **`supabaseAdmin`** – an *optional* elevated client that is authenticated with the Supabase **service-role** key (only available when the environment variable `SUPABASE_SERVICE_ROLE_KEY` is present).

All other logic lives inside `src/index.ts` which simply starts the process and proves that the database connection works.  
As the project grows, new features (for example product CRUD endpoints, order workflows, authentication hooks, etc.) should export their own functions from the `src/` tree and be documented in the same style presented here.

---

## Project Structure
```
backend/
├── DOCUMENTATION.md          ← YOU ARE HERE 🍃
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              ← Entry point (bootstraps the backend)
│   └── config/
│       └── supabase.ts       ← Supabase client factory & exports
└── …
```

## Installation & Setup
1. **Clone repo & install dependencies**
   ```bash
   git clone https://github.com/your-org/online-palengke.git
   cd online-palengke/backend
   npm install
   ```
2. **Create an `.env` file** (copy `.env.example` when it is added later) and add the following keys that you obtain from your Supabase dashboard:
   ```env
   SUPABASE_URL= https://your-project.supabase.co
   SUPABASE_ANON_KEY= public-anon-key
   # Optional – only for server-side admin tasks
   SUPABASE_SERVICE_ROLE_KEY= service-role-key
   ```
3. **Run in development**
   ```bash
   npm run dev
   ```
   The script launches `nodemon` which in turn executes
   ```bash
   node --loader ts-node/esm src/index.ts
   ```

4. **Build for production**
   ```bash
   npm run build   # compiles TypeScript → JS into /dist
   npm start       # runs node dist/index.js
   ```

---

## Public API Surface
### 1. `supabase` _(default client)_
*Location*: `src/config/supabase.ts`
```ts
import { supabase } from './config/supabase.js'

// Example – fetch all products
const { data, error } = await supabase
  .from('products')
  .select('*')
```
Notes:
• Uses the **anon** key – safe for client-side or public server calls.  
• Rate-limited and permission-checked according to your RLS policies in Supabase.

### 2. `supabaseAdmin` _(service-role client)_
*Location*: `src/config/supabase.ts`
```ts
import { supabaseAdmin } from './config/supabase.js'

if (!supabaseAdmin) {
  throw new Error('Service-role key not found – admin client unavailable')
}

// Example – delete a product permanently (bypass RLS)
const { error } = await supabaseAdmin
  .from('products')
  .delete()
  .eq('id', someProductId)
```
Notes:
• Only defined when `SUPABASE_SERVICE_ROLE_KEY` exists.  
• **Never** expose this key to the frontend; keep it in secure server-side environments (e.g. Cloud Functions, CI/CD, servers).

---

## Entry Point – `src/index.ts`
The file boots the backend, checks that Supabase credentials are valid, and keeps the Node.js process alive (handy during local development and for preview deployments).

```ts
async function main() {
  console.log('🚀 Online Palengke Backend Starting...')
  // 1. Perform a trivial auth call to verify connection
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  console.log('✅ Database connection successful!')

  // 2. Keep process alive in dev so we see heartbeat logs
  setInterval(() => {
    console.log(`🔄 Backend running... ${new Date().toLocaleTimeString()}`)
  }, 30_000)
}

main().catch(err => {
  console.error('❌ Failed to start Online Palengke backend')
  console.error(err)
  process.exit(1)
})
```

---

## Extending the Backend
When you add new features, follow these guidelines so that documentation remains consistent:
1. **Export** the feature’s main functions/classes from the file where they are defined.
2. Include a `JSDoc`/`TSDoc` comment on every *public* symbol.
3. Update **this document** under *Public API Surface* with:
   • The new export’s name and path.
   • A short description (1-2 sentences).  
   • At least one runnable code snippet demonstrating usage.

---

## License
[MIT](https://opensource.org/licenses/MIT) – see `LICENSE` file for details.