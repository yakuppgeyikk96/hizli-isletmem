---
name: nextjs-review
description: Review Next.js App Router code for server-first architecture, performance, data fetching, caching, and routing best practices. Use when reviewing Next.js pages, layouts, server actions, route handlers, or middleware.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
---

# Next.js App Router Review

You are a Next.js expert reviewing App Router code. Review the file(s) provided in $ARGUMENTS for server-first architecture violations, performance issues, and misuse of Next.js features. The goal is a server-side heavy, lightweight, fast application.

---

## 1. Server-First Architecture (CRITICAL)

### 1.1 Default to Server Components
- Every component is a Server Component unless it explicitly needs interactivity.
- Never add `"use client"` to pages or layouts unless absolutely required.
- If only a small part of a page is interactive, extract that part into a separate Client Component.

### 1.2 Push `"use client"` to the leaf nodes
```tsx
// Bad — entire page is client
"use client";
export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const orders = useOrders(search);
  return <OrderTable orders={orders} />;
}

// Good — only the search input is client
// orders-page.tsx (Server Component)
export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <>
      <OrderSearch />          {/* Client Component */}
      <OrderTable orders={orders} />  {/* Server Component */}
    </>
  );
}
```

### 1.3 Fetch data in Server Components, not Client Components
- Never use `useEffect` + `fetch` for initial data loading.
- Server Components can directly call services, databases, or APIs.
- Client Components receive data via props from Server Components.

### 1.4 Never call internal API routes from Server Components
- Server Components run on the server — calling your own API route is an unnecessary network hop.
- Call the underlying function directly instead.
```tsx
// Bad — pointless round trip
export default async function Page() {
  const res = await fetch("http://localhost:3000/api/orders");
  const orders = await res.json();
}

// Good — direct call
export default async function Page() {
  const orders = await orderService.getAll();
}
```

### 1.5 Use Server Actions for mutations
- Use `"use server"` functions for form submissions and data mutations.
- Do not create API route handlers for simple CRUD operations.
- Server Actions eliminate client-side fetch boilerplate.
```tsx
// Good
async function createOrder(formData: FormData) {
  "use server";
  // validate, insert, revalidate
}
```

### 1.6 Authenticate Server Actions like API routes
- Every Server Action must verify the user session before proceeding.
- Never trust that the caller is authorized just because the UI showed a button.

---

## 2. Eliminating Waterfalls (CRITICAL)

### 2.1 Never chain sequential awaits for independent data
```tsx
// Bad — waterfall (each await waits for the previous)
export default async function DashboardPage() {
  const orders = await getOrders();
  const products = await getProducts();
  const stats = await getStats();
  return <Dashboard orders={orders} products={products} stats={stats} />;
}

// Good — parallel fetching
export default async function DashboardPage() {
  const [orders, products, stats] = await Promise.all([
    getOrders(),
    getProducts(),
    getStats(),
  ]);
  return <Dashboard orders={orders} products={products} stats={stats} />;
}
```

### 2.2 Use Suspense boundaries for independent sections
- Wrap each independent data-loading section in its own `<Suspense>`.
- This enables streaming — fast sections render first, slow sections load later.
```tsx
export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<OrdersSkeleton />}>
        <RecentOrders />
      </Suspense>
    </>
  );
}
```

### 2.3 Place Suspense boundary above the async component
- Suspense must wrap the component that does the awaiting, not be inside it.

### 2.4 Move `await` into the branch where it is actually used
```tsx
// Bad — always awaits even when not needed
async function OrderPage({ params }: Props) {
  const order = await getOrder(params.id);
  const canEdit = await checkPermission();
  if (!canEdit) return <ReadOnlyOrder order={order} />;
  return <EditableOrder order={order} />;
}

// Good — defer await
async function OrderPage({ params }: Props) {
  const orderPromise = getOrder(params.id);
  const canEdit = await checkPermission();
  const order = await orderPromise;
  if (!canEdit) return <ReadOnlyOrder order={order} />;
  return <EditableOrder order={order} />;
}
```

---

## 3. Bundle Size & Loading (HIGH)

### 3.1 Import directly, never from barrel files
```tsx
// Bad — pulls entire library into bundle
import { Button, Input } from "@repo/ui";

// Good — tree-shakeable
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
```

### 3.2 Use `next/dynamic` for heavy client components
- Charts, rich text editors, date pickers — load them lazily.
```tsx
const StatisticsChart = dynamic(() => import("./statistics-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

### 3.3 Defer third-party scripts
- Analytics, chat widgets, and tracking scripts must load after hydration.
```tsx
import Script from "next/script";
<Script src="https://analytics.example.com" strategy="afterInteractive" />
```

### 3.4 Use `next/image` for all images
- Automatic lazy loading, WebP conversion, responsive sizing, and CLS prevention.
- Set `priority` on above-the-fold images (LCP candidates).
```tsx
import Image from "next/image";
<Image src="/logo.png" alt="Logo" width={120} height={40} priority />
```

### 3.5 Use `next/font` for fonts
- Eliminates layout shift from font loading.
- Fonts are self-hosted — no external requests.
```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap" });
```

---

## 4. Routing & File Conventions (HIGH)

### 4.1 Use route groups for layout organization
- Group routes with `(group-name)` to share layouts without affecting the URL.
```
app/
  (auth)/
    giris/page.tsx      → /giris
    kayit/page.tsx      → /kayit
  (dashboard)/
    layout.tsx          → shared sidebar layout
    page.tsx            → /
    urunler/page.tsx    → /urunler
```

### 4.2 Use `loading.tsx` for page-level loading states
- Next.js automatically wraps the page in a Suspense boundary with `loading.tsx` as fallback.
- Prefer this over manual Suspense for top-level page loading.

### 4.3 Use `error.tsx` for error boundaries
- Every route segment should have an `error.tsx` for graceful error handling.
- `error.tsx` must be a Client Component (`"use client"`).

### 4.4 Use `not-found.tsx` for 404 pages
- Call `notFound()` from Server Components when a resource doesn't exist.

### 4.5 Keep layouts lean
- Layouts persist across navigations and do not re-render.
- Never put data that changes per-page in a layout.
- Never put `"use client"` on a layout unless the entire layout needs interactivity.

### 4.6 Always provide `default.tsx` for parallel routes
- Missing `default.tsx` causes 404 on hard navigation.

---

## 5. Caching & Revalidation (HIGH)

### 5.1 Understand the caching layers
| Layer | What it caches | How to invalidate |
|-------|---------------|-------------------|
| Request Memoization | Same fetch in same render | Automatic (per-request) |
| Data Cache | fetch() responses | `revalidateTag()`, `revalidatePath()` |
| Full Route Cache | Static page HTML | `revalidatePath()`, `revalidateTag()` |
| Router Cache | Client-side route segments | `router.refresh()`, `revalidatePath()` |

### 5.2 Always revalidate after mutations
```tsx
"use server";
async function createProduct(data: FormData) {
  await db.insert(products).values(parsed);
  revalidatePath("/urunler");  // invalidate cache
}
```

### 5.3 Use `revalidateTag` for granular cache invalidation
- Tag your fetches and invalidate by tag instead of path for precision.

### 5.4 Use `React.cache()` for per-request deduplication
```tsx
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  return session?.user;
});
// Call getCurrentUser() in multiple Server Components — only executes once per request.
```

### 5.5 Do not disable caching without reason
- `cache: "no-store"` or `export const dynamic = "force-dynamic"` should only be used for truly dynamic data.
- Most pages in a dashboard app can use ISR (`revalidate: 60`).

---

## 6. Server Actions Best Practices (MEDIUM-HIGH)

### 6.1 One file per domain for Server Actions
```
actions/
  product.actions.ts
  order.actions.ts
  auth.actions.ts
```

### 6.2 Always validate input with Zod
```tsx
"use server";
const schema = z.object({ name: z.string().min(1), price: z.number().positive() });

async function createProduct(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };
  // proceed
}
```

### 6.3 Return structured responses
```tsx
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### 6.4 Use `useActionState` for form state management
```tsx
"use client";
import { useActionState } from "react";

function CreateProductForm() {
  const [state, action, isPending] = useActionState(createProduct, null);
  return (
    <form action={action}>
      {state?.error && <p>{state.error}</p>}
      <button disabled={isPending}>Save</button>
    </form>
  );
}
```

### 6.5 Use `useOptimistic` for instant UI feedback
- Update the UI immediately before the server responds.
- Roll back if the server action fails.

### 6.6 Use `after()` for non-blocking operations
```tsx
import { after } from "next/server";

async function createOrder(data: FormData) {
  "use server";
  const order = await db.insert(orders).values(parsed).returning();
  after(async () => {
    await sendNotification(order);
    await logAnalytics("order_created", order.id);
  });
  revalidatePath("/siparisler");
  return { success: true, data: order };
}
```

---

## 7. Middleware (MEDIUM)

### 7.1 Keep middleware fast and lightweight
- Middleware runs on every request — it must be fast.
- Only use it for: auth redirects, locale detection, feature flags, rate limiting headers.

### 7.2 Never do heavy computation in middleware
- No database queries, no API calls, no complex logic.
- Read from cookies/headers, redirect or rewrite — nothing else.

### 7.3 Use `matcher` to limit middleware scope
```tsx
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

## 8. Metadata & SEO (MEDIUM)

### 8.1 Export metadata from every page
```tsx
export const metadata: Metadata = {
  title: "Ürünler | Hızlı İşletmem",
  description: "Ürünlerinizi yönetin",
};
```

### 8.2 Use `title.template` in root layout
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: "Hızlı İşletmem", template: "%s | Hızlı İşletmem" },
};
```

### 8.3 Set `metadataBase` in root layout
```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://hizliisletmem.com"),
};
```

### 8.4 Add `robots.ts` and `sitemap.ts` files
- Auto-generate and serve at `/robots.txt` and `/sitemap.xml`.

---

## 9. Project Structure (MEDIUM)

### 9.1 Co-locate components with their routes
```
app/(dashboard)/urunler/
  page.tsx                → the page
  product-table.tsx       → component used only by this page
  product-filter.tsx      → component used only by this page
```

### 9.2 Shared components go in a `components/` directory or `@repo/ui`
- If a component is used by multiple routes, put it in `components/` or the shared UI package.

### 9.3 Separate server and client utilities
```
lib/
  server/              → server-only code (db, auth, services)
  client/              → client-only code (hooks, browser utils)
```

### 9.4 Use `server-only` and `client-only` packages
```tsx
import "server-only";  // Throws build error if imported in a Client Component

export async function getSecretData() { ... }
```

---

## Output Format

For each issue found, report:

- **File**: file path and line number
- **Severity**: Critical | Error | Warning | Info
- **Rule**: rule number (e.g. 1.1, 2.2)
- **Issue**: what is wrong
- **Impact**: performance degradation, increased bundle size, waterfall, security risk, etc.
- **Fix**: suggested code change (before/after)

At the end, provide a summary:
- Total issues found (by severity)
- Estimated bundle size impact (if applicable)
- Server vs Client component ratio
- Top 3 most critical issues
- Overall assessment (Server-First & Fast / Needs Work / Client-Heavy)
