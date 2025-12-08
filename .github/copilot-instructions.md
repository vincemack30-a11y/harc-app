**Repository Overview**

- **What it is:** A small React app built with Vite and Tailwind that uses Supabase for persistence and Vercel serverless endpoints for production. See `package.json`, `vite.config.js`, and `vercel.json`.
- **Where logic lives:** client UI in `src/` (pages in `src/pages/`), shared state in `src/context/`, local dev API fallbacks in `src/api.js`, server endpoints in `api/`.

**Key Patterns & Architecture**

- **Local vs. Production data flow:** `src/api.js` uses `localStorage` (keys: `harcOrderLog`, `harcIntakeRequests`) when running on `localhost`; in production it calls the server endpoints under `/api/*` (see `api/orders.js`, `api/intake.js`).
- **Supabase usage:** Client and some server code use Supabase. The client creates a client in `src/supabaseClient.js` using `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Ensure those env vars are set locally and in Vercel.
- **Global state:** `src/context/AppContext.jsx` is the single source for cart, selected cooler, and order submission helpers. Pages consume it via `useAppContext()`.
- **Routing:** Client-side routing is React Router in `src/App.jsx` with routes for customer flow (`/`, `/menu`, `/cart`), intake (`/intake`), and staff tools (`/staff`, `/manager`).

**Developer Workflows**

- Start dev server: `npm run dev` (uses Vite HMR). Build: `npm run build`. Preview production build locally: `npm run preview`.
- Env vars: put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` for local dev (see `src/supabaseClient.js`). Without them, the client logs a warning and some features will fail.
- Local testing: to exercise order/intake flows without Supabase, run on `localhost` and the app will use `localStorage` via `src/api.js`.
- Deploy: project expects static frontend + serverless endpoints (Vercel). `vercel.json` rewrites all paths to `/` and server endpoints are in `api/`.

**Project-specific Conventions & Notes**

- `localStorage` keys: `harcOrderLog` and `harcIntakeRequests` (see `src/api.js`). Use these keys when seeding or inspecting local test data.
- Context provider duplication: `AppContextProvider` is wrapped in both `src/main.jsx` and again inside `src/App.jsx`. Be mindful when changing provider initialization to avoid double-wrapping.
- Table schemas (Supabase): ingestion code expects tables named `orders` and `intake_requests` (fields used in `src/intake.js`, `src/context/AppContext.jsx`, and `api/*.js`). Align column names like `cooler_id`, `phone`, `needs_primary_care`, and `items`.
- Old code: `old-pages/` contains legacy implementations—use only as reference.

**Integration & Troubleshooting**

- If server endpoints fail to find `supabase` (some `api/*.js` call `supabase` without an import), ensure your deployment or function wrapper provides the client or add an explicit import from `src/supabaseClient.js`.
- To inspect submitted orders locally: open DevTools → Application → Local Storage and look for `harcOrderLog`.
- For quick sampling of UI/state: `src/data.js` exports `COOLERS` and `MENU` used across pages; modify there for visible changes without DB.

**Examples (quick reference)**

- Submit an order in prod flow: client -> POST `/api/orders` (implemented by `api/orders.js`) -> Supabase `orders` table.
- Submit intake in dev: call `createIntakeRequest()` in `src/api.js` on `localhost` -> saved to `localStorage` under `harcIntakeRequests`.

**If you're an AI coding assistant**

- Prioritize small, localized changes: modify `src/*` and `api/*` files in isolation. When touching data shape, update both client (`src/context/AppContext.jsx`, `src/intake.js`) and server (`api/*.js`) sides.
- Before changing persistence, check `src/api.js` local fallback logic and `src/supabaseClient.js` env usage. Add or update tests by exercising localStorage flows first.
- When adding server code, follow the existing serverless pattern (files in `api/`) and keep responses JSON-shaped (`{ ok: true, data }` or `{ ok: false, error }`) to match `src/api.js` expectations.

If anything important about deployment or environment is missing, tell me which area you want documented (local dev, Vercel config, or Supabase schema) and I’ll expand this file.
