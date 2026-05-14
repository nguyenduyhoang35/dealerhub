# DealerHub — Project-Specific Rules

> **Authoritative for this repo.** Where this file disagrees with `tech-stack.md`, `project-structure.md`, or other generic rules — **this file wins**. Read it before suggesting a new dependency or refactor.

---

## Stack (actual, not aspirational)

| Layer | Choice | Notes |
|-------|--------|-------|
| **Framework** | **Next.js 16** (App Router) | Single app — admin + driver mobile-web + API in one Next project. Turbopack default for `dev` + `build`. |
| **Runtime** | **Node.js 24 LTS** | Per Next 16 defaults |
| **UI Library** | **React 19.2** | |
| **Component lib** | **Antd v6** (`antd`, `@ant-design/icons`, `@ant-design/nextjs-registry`) | Use Antd components first; do not introduce shadcn/Radix unless explicitly asked. |
| **Styling** | Tailwind CSS 3 + Antd | Tailwind for layout/utilities, Antd handles components. No CSS Modules / styled-components. |
| **Database** | **Supabase Postgres** (via `@supabase/supabase-js`) | NOT Prisma. Queries written with the Supabase JS client (`.from().select()` etc.). |
| **Auth** | **Custom PIN + cookie session** (`src/lib/auth.ts`) | Not NextAuth. Phone + 4-digit PIN, stored in `drivers` table, session id in `kho_session` cookie. |
| **State** | React `useState` + `fetch` | No TanStack Query, no Zustand. Keep it simple — direct API calls in components. |
| **Forms** | Antd `Form` | No react-hook-form / zod for form handling. |
| **Excel export** | `exceljs` | Server-side at `/api/export/*` |
| **Date** | `dayjs` | Antd's DatePicker uses dayjs adapter (Antd v6 default) |
| **Edge protection** | `src/proxy.ts` | Next 16 renamed `middleware.ts` → `proxy.ts`. Export name is `proxy`, not `middleware`. |
| **Language** | TypeScript 5.5 | Always TS. |
| **Package manager** | `npm` (with `package-lock.json`) | `package.json` declares `pnpm` as packageManager but lockfile is npm — npm is the working PM. |

### Avoid for this project (despite being in `tech-stack.md`)
- **Prisma / Drizzle** — using Supabase JS client directly
- **Express / Fastify** — we use Next App Router route handlers
- **BullMQ / Redis** — no queue/cache layer yet
- **NextAuth** — custom PIN cookie auth
- **TanStack Query / Zustand** — not in this project; if you genuinely need it, propose first
- **React Native / Expo** — DealerHub is web-only; the `/my-route` page is responsive mobile-web for drivers

---

## Folder Layout

```
kho/
├── .claude/                           # AI agent config (this folder)
├── scripts/
│   └── seed.ts                        # Supabase seed (run: npm run seed)
├── src/
│   ├── proxy.ts                       # Edge auth gate (Next 16 — was middleware.ts)
│   ├── lib/
│   │   ├── auth.ts                    # currentUser(), login(), logout() — async cookies()
│   │   ├── db.ts                      # Supabase client factory
│   │   ├── format.ts                  # fmtVND, STATUS_LABEL, vndInputProps
│   │   └── excel.ts                   # exceljs builders
│   └── app/                           # App Router
│       ├── layout.tsx                 # Root; gates on currentUser
│       ├── AppShell.tsx               # Layout wrapper (sider + header + content)
│       ├── NavBar.tsx                 # MobileTopBar + DesktopSider (named exports)
│       ├── FormDrawer.tsx             # Reusable responsive create/edit drawer
│       ├── AntdProvider.tsx           # Antd ConfigProvider
│       ├── globals.css
│       ├── page.tsx                   # Dashboard
│       ├── login/page.tsx
│       ├── agents/page.tsx            # CRUD đại lý (card list on mobile)
│       ├── products/page.tsx          # CRUD sản phẩm
│       ├── drivers/page.tsx           # CRUD tài khoản (admin + driver)
│       ├── orders/page.tsx            # Create/list/edit đơn hàng
│       ├── routes/page.tsx            # Lên tuyến — assign drivers to orders
│       ├── my-route/page.tsx          # Driver mobile flow
│       └── api/
│           ├── auth/{login,logout,me}/route.ts
│           ├── agents/route.ts        + /[id]/route.ts
│           ├── products/route.ts      + /[id]/route.ts
│           ├── drivers/route.ts       + /[id]/route.ts
│           ├── orders/route.ts        + /[id]/route.ts
│           ├── routes/assign/route.ts
│           ├── stats/route.ts         # Dashboard aggregate
│           └── export/{agents,products,orders,delivery-slip}/route.ts
├── next.config.js                     # Empty config — Turbopack auto
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

### File-naming conventions in this repo
- App Router files: `page.tsx`, `route.ts`, `layout.tsx` (Next conventions)
- Other tsx components: **PascalCase** (`AppShell.tsx`, `FormDrawer.tsx`) — not kebab-case
- Library modules: **lowercase** (`auth.ts`, `format.ts`, `db.ts`)
- API route directories: lowercase kebab plural (`agents`, `products`, `delivery-slip`)

---

## Next 16 specifics (critical)

1. **Async request APIs everywhere:**
   ```ts
   // ❌ Old (Next 14)
   export function GET(req, { params }: { params: { id: string } }) { params.id }
   const c = cookies().get('x')

   // ✅ Next 16
   export async function GET(req, props: { params: Promise<{ id: string }> }) {
     const params = await props.params
   }
   const c = (await cookies()).get('x')
   ```

2. **`src/proxy.ts`, not `src/middleware.ts`.** Export `proxy`, not `middleware`. The deprecation warning will fire otherwise.

3. **Turbopack is default** — do not add `--turbo` flags or `experimental.turbo` config.

4. **Server Components by default** — only mark `"use client"` when you need state/effects/event handlers. Most pages here need it because Antd Form/Modal/Drawer require client.

5. **Avoid `unstable_cache`** — if caching is needed, migrate to Next 16 Cache Components (`'use cache'` + `cacheLife` / `cacheTag`). Currently the app has no cache layer; don't add one unless asked.

---

## Auth model

- `drivers` table holds both admins (`role: 'admin'`) and drivers (`role: 'driver'`).
- Login: `phone` + 4-digit `pin` (plaintext compare for now — flagged TODO in security review).
- Session: `kho_session` cookie = driver id (httpOnly, sameSite=lax, 30 days).
- `proxy.ts` redirects unauthenticated requests to `/login`; API returns `401`.
- After login: admin → `/`, driver → `/my-route`.

**Security audit notes (open):**
- PIN stored plaintext in DB — should bcrypt/argon2 hash.
- No rate limiting on `/api/auth/login` — should add basic IP throttle.
- Cookie has no `secure` flag — fine for dev, must be true in prod.

---

## API conventions in this project

- All API routes return JSON. Error shape: `{ "error": "<vi-VN message>" }`, success: `{ "ok": true }` or the entity directly.
- `[id]` params are `string` from the URL → `Number(params.id)` for DB queries.
- `proxy.ts` enforces auth except `/login`, `/api/auth/login`, `/api/auth/*`.
- For mutations, default to `POST` for create, `PUT` for full update, `PATCH` for partial, `DELETE` for delete.

---

## UI conventions in this project

- **Vietnamese user-facing copy.** Variable/identifier/comment names stay in English where reasonable.
- **Mobile-first responsive.** Each list page (`agents`, `products`, `drivers`, `orders`) uses `Grid.useBreakpoint()` to render **Card stack on mobile, Antd Table on desktop**.
- **Create/edit forms** open in `<FormDrawer>` ([`src/app/FormDrawer.tsx`](src/app/FormDrawer.tsx)) — right-side drawer on desktop, bottom-sheet (full height via `100dvh`) on mobile.
- **Header pattern:** title `hidden sm:block` (mobile gets the page title from `MobileTopBar`), action buttons in `Space wrap` with abbreviated labels (`<span className="sm:hidden">Thêm</span>`).
- **Money formatting:** `fmtVND()` from `src/lib/format.ts` — VND with `vi-VN` grouping. Inputs use `vndInputProps` (Antd InputNumber formatter).
- **Statuses:** `pending | delivering | delivered | cancelled` — labels + tag colors via `STATUS_LABEL` and `STATUS_TAG` in `src/lib/format.ts`.

---

## Testing

No test framework wired yet. When introducing tests:
- **Default:** Vitest + Testing Library (the generic stack recommendation).
- **Don't** add Jest — Next 16 + Turbopack works smoother with Vitest.
- API routes: integration tests hitting a Supabase test branch (use `mcp__supabase__create_branch`).

---

## Deployment

Target is Vercel (per session context). When deploying:
- Use `vercel:deploy` skill for prod / preview.
- Env vars live in Vercel — pull locally with `vercel env pull .env.local`.
- The Supabase project URL + keys must be set as Vercel env vars before first deploy.
- No `vercel.json` / `vercel.ts` yet — Next 16 defaults are sufficient.

---

## When in doubt

- **Adding a dependency?** Check this file first, then `tech-stack.md`. If the new dep replaces something here (e.g., proposing Prisma over Supabase JS, or NextAuth over the custom cookie), **stop and ask** — that's an architecture decision, not a code change.
- **Asked to "refactor"?** Don't change the stack. Refactor within the current libraries.
- **Found a sync `params` or `cookies()`?** Migrate it to async per Next 16 (codemod was already run, so finding one means it was added after the upgrade).
