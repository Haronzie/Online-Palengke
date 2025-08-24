# Online Palengke Backend API Reference

This document covers all public APIs, functions, and components exposed by the backend codebase. It includes usage instructions and examples.

## Overview

The backend is a lightweight Node.js + TypeScript service that initializes Supabase clients and verifies connectivity. Public exports are provided from `src/config/supabase.ts`.

- Runtime: Node.js (ES Modules)
- Language: TypeScript
- Package manager: npm
- Entry point: `src/index.ts`

## Installation

```bash
cd backend
npm install
```

## Build and Run

- Development (watch + ts-node):
  ```bash
  npm run dev
  ```
- Build TypeScript to JavaScript:
  ```bash
  npm run build
  ```
- Start compiled build:
  ```bash
  npm start
  ```

## Environment Variables

The Supabase clients require the following environment variables (see `.env.example`):

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Public anon key used by user-facing operations
- `SUPABASE_SERVICE_ROLE_KEY` (optional): Service role key for privileged admin operations

Load these via a `.env` file at the project root of `backend/`.

---

## Modules

### `src/config/supabase.ts`

Initializes and exports Supabase clients.

#### Exports

- `supabase: SupabaseClient`
  - Authenticated client created using `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
  - Intended for standard application operations that do not require elevated privileges.

- `supabaseAdmin: SupabaseClient | null`
  - Conditionally created if `SUPABASE_SERVICE_ROLE_KEY` is defined.
  - Intended for privileged/admin tasks such as server-side data migrations or background jobs.
  - May be `null` when the service role key is not provided.

#### Behavior

- On startup, validates presence of `SUPABASE_URL` and `SUPABASE_ANON_KEY`. If missing, the process exits with an error.
- Logs a success message when the clients are initialized.

#### Usage Examples

Basic example using `supabase` to query a table:

```ts
import { supabase } from './config/supabase.js'

async function listVendors() {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')

  if (error) throw error
  return data
}
```

Using `supabase` auth to read the current session:

```ts
import { supabase } from './config/supabase.js'

async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}
```

Conditionally using `supabaseAdmin` for privileged operations:

```ts
import { supabaseAdmin } from './config/supabase.js'

async function deleteVendorPermanently(vendorId: string) {
  if (!supabaseAdmin) {
    throw new Error('supabaseAdmin is not configured. Set SUPABASE_SERVICE_ROLE_KEY.')
  }

  const { error } = await supabaseAdmin
    .from('vendors')
    .delete()
    .eq('id', vendorId)

  if (error) throw error
}
```

Errors should be handled at call sites to provide actionable messages to users or logs.

---

### `src/index.ts`

Entry point that validates connectivity and keeps the process alive in development.

- Reads current auth session via `supabase.auth.getSession()` to verify connectivity
- Logs status and keeps the process running in development with a periodic heartbeat
- Handles graceful shutdown on `SIGINT`

#### Example

```ts
import { supabase } from './config/supabase.js'

async function main() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  console.log('Connected, session:', !!session)
}

main().catch(console.error)
```

---

## Conventions

- All modules are ES Modules. When importing local files in TypeScript run via `ts-node/esm`, use the `.js` extension in import paths (as configured in the codebase).
- Prefer throwing errors and handling them at the call site. Avoid swallowing errors.
- Keep function names descriptive and avoid abbreviations.

## Versioning

- This API surface is minimal and may evolve as features are added (e.g., repositories, services, controllers). Keep this document updated as public exports change.