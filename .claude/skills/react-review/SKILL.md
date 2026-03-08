---
name: react-review
description: Review React and Next.js code for component design, performance, hooks usage, and best practice violations. Use when reviewing .tsx or .jsx files for quality.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
---

# React Code Review

Review the React file(s) provided in $ARGUMENTS for component design, performance, hooks usage, and best practice violations. Apply every rule below strictly.

---

## 1. Component Design

### 1.1 One component per file
- Each file should export a single component.
- Co-located types, constants, and small helper functions are fine in the same file.

### 1.2 Maximum 150 lines per component file
- If a component file exceeds 150 lines, extract sub-components or custom hooks.

### 1.3 Use functional components only
- Never use class components.

### 1.4 Descriptive component names in PascalCase
```tsx
// Bad
export function Card() {}    // too generic
export function Comp1() {}   // meaningless

// Good
export function OrderSummaryCard() {}
export function ProductCategoryFilter() {}
```

### 1.5 Destructure props at the parameter level
```tsx
// Bad
function OrderCard(props: OrderCardProps) {
  return <div>{props.title}</div>;
}

// Good
function OrderCard({ title, status }: OrderCardProps) {
  return <div>{title}</div>;
}
```

### 1.6 Keep components pure
- A component should produce the same output for the same props.
- Never mutate props or external variables during render.

### 1.7 Prefer composition over prop sprawl
- If a component has more than 5 props, consider splitting it or using composition (children, render props, slots).
```tsx
// Bad — too many props
<Modal title="..." subtitle="..." icon="..." onClose={} onConfirm={} confirmText="..." cancelText="..." />

// Good — composition
<Modal onClose={}>
  <Modal.Header icon="...">Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer onConfirm={} confirmText="..." />
</Modal>
```

---

## 2. Hooks

### 2.1 Hooks must be at the top level
- Never call hooks inside loops, conditions, or nested functions.

### 2.2 Extract custom hooks for reusable logic
- If the same `useState` + `useEffect` combination appears in multiple components, extract it into a custom `use*` hook.
- Custom hooks must start with `use` prefix.

### 2.3 Keep hooks focused
- A custom hook should do one thing, just like a function.
- If a hook manages more than 3 state variables, split it.

### 2.4 Avoid unnecessary `useEffect`
- Do not use `useEffect` for derived state — compute it during render.
- Do not use `useEffect` to respond to events — use event handlers.
- Do not use `useEffect` to transform data for rendering — use `useMemo`.
```tsx
// Bad — derived state in useEffect
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// Good — compute during render
const fullName = `${firstName} ${lastName}`;

// Good — expensive computation
const sortedItems = useMemo(
  () => items.toSorted((a, b) => a.price - b.price),
  [items]
);
```

### 2.5 Always clean up effects
- Subscriptions, timers, and event listeners must be cleaned up in the return function.
```tsx
useEffect(() => {
  const handler = () => { ... };
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, []);
```

### 2.6 Handle async effects properly
- Never pass an async function directly to `useEffect`.
- Use an inner async function with abort/cleanup logic.
```tsx
// Bad
useEffect(async () => {
  const data = await fetchOrders();
  setOrders(data);
}, []);

// Good
useEffect(() => {
  let cancelled = false;
  async function load() {
    const data = await fetchOrders();
    if (!cancelled) setOrders(data);
  }
  load();
  return () => { cancelled = true; };
}, []);
```

### 2.7 Include all dependencies in dependency arrays
- Never suppress the exhaustive-deps ESLint rule.
- If a dependency causes infinite loops, restructure the code instead.

---

## 3. State Management

### 3.1 Keep state as local as possible
- Lift state up only when multiple siblings need it.
- Do not put everything in global state.

### 3.2 Use the right tool for state
| Need | Tool |
|------|------|
| Local UI state (open/close, input value) | `useState` |
| Complex local state with transitions | `useReducer` |
| Shared state across nearby components | Lift state + props |
| App-wide client state | Zustand or Context |
| Server data (fetch, cache, sync) | React Query / SWR |

### 3.3 Never store derived data in state
```tsx
// Bad
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((s, i) => s + i.price, 0));
}, [items]);

// Good
const [items, setItems] = useState([]);
const total = items.reduce((s, i) => s + i.price, 0);
```

### 3.4 Use functional updates for state based on previous value
```tsx
// Bad (may use stale state)
setCount(count + 1);

// Good
setCount(prev => prev + 1);
```

### 3.5 Avoid prop drilling beyond 2 levels
- If data passes through more than 2 intermediate components that don't use it, use Context or composition.

---

## 4. Performance

### 4.1 Do not prematurely optimize
- Only add `useMemo`, `useCallback`, or `React.memo` when you measure a real performance problem.
- Memoization has a cost — unnecessary memoization hurts readability.

### 4.2 When to use `React.memo`
- Components that render often with the same props (e.g., list items).
- Components that are expensive to render.
- Never wrap every component in `React.memo` by default.

### 4.3 When to use `useMemo`
- Expensive computations (sorting, filtering large arrays).
- Referential identity for objects/arrays passed as props to memoized children.
- Not for simple string concatenation or basic arithmetic.

### 4.4 When to use `useCallback`
- Functions passed as props to `React.memo`-wrapped children.
- Functions used as dependencies in other hooks.
- Not for every function — only when identity matters.

### 4.5 Avoid creating objects/arrays/functions in JSX
```tsx
// Bad — new object every render
<UserCard style={{ marginTop: 10 }} />
<List items={items.filter(i => i.isActive)} />

// Good
const cardStyle = useMemo(() => ({ marginTop: 10 }), []);
const activeItems = useMemo(() => items.filter(i => i.isActive), [items]);
<UserCard style={cardStyle} />
<List items={activeItems} />
```

### 4.6 Use `key` properly in lists
- Always use stable, unique IDs as keys.
- Never use array index as key if the list can be reordered, filtered, or items added/removed.
```tsx
// Bad
{orders.map((order, index) => <OrderRow key={index} order={order} />)}

// Good
{orders.map(order => <OrderRow key={order.id} order={order} />)}
```

### 4.7 Lazy load heavy components
```tsx
const StatisticsChart = lazy(() => import("./statistics-chart"));
```

---

## 5. Server & Client Components (Next.js)

### 5.1 Default to Server Components
- Every component is a Server Component unless it needs interactivity.
- Only add `"use client"` when the component uses browser APIs, event handlers, or hooks.

### 5.2 Push `"use client"` to the leaves
- Mark the smallest interactive piece as client, not the whole page.
```tsx
// Bad — entire page is client
"use client";
export default function OrdersPage() { ... }

// Good — only the interactive part is client
// orders-page.tsx (Server Component)
export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrderList orders={orders} />;
}
// order-list.tsx (Client Component)
"use client";
export function OrderList({ orders }: Props) { /* interactive */ }
```

### 5.3 Fetch data in Server Components
- Never call APIs from Client Components if the data can be fetched on the server.
- Server Components can directly access the database or call services.

### 5.4 Props crossing the boundary must be serializable
- No functions, classes, or Dates as props from Server to Client Components.
- Convert dates to ISO strings, use IDs instead of object references.

### 5.5 Pass Server Components as children to Client Components
```tsx
// Client wrapper
"use client";
export function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return isOpen ? <aside>{children}</aside> : null;
}

// Server parent
export default function Layout() {
  return (
    <Sidebar>
      <NavigationMenu />  {/* This stays a Server Component */}
    </Sidebar>
  );
}
```

---

## 6. Patterns and Anti-Patterns

### 6.1 Never use `dangerouslySetInnerHTML` without sanitization
- If absolutely necessary, sanitize with a library like DOMPurify first.

### 6.2 Use error boundaries
- Wrap independent UI sections with error boundaries to prevent full-page crashes.

### 6.3 Handle loading and error states
- Every async operation should have loading, error, and empty states.
```tsx
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (orders.length === 0) return <EmptyState />;
return <OrderList orders={orders} />;
```

### 6.4 Use `Suspense` for async boundaries
```tsx
<Suspense fallback={<OrderTableSkeleton />}>
  <OrderTable />
</Suspense>
```

### 6.5 Prefer controlled components for forms
- Use controlled inputs with state for form fields.
- For complex forms, use a form library (React Hook Form, or Next.js Server Actions with `useActionState`).

### 6.6 Do not use `useEffect` for event-driven logic
```tsx
// Bad
useEffect(() => {
  if (isSubmitted) {
    sendAnalytics();
    showToast("Saved!");
  }
}, [isSubmitted]);

// Good — in the event handler
async function handleSubmit() {
  await saveOrder();
  sendAnalytics();
  showToast("Saved!");
}
```

---

## 7. Accessibility

### 7.1 Use semantic HTML elements
- `<button>` for actions, `<a>` for navigation, `<input>` for input.
- Never use `<div onClick>` as a button.

### 7.2 All interactive elements must be keyboard accessible
- Clickable elements must respond to Enter/Space keys.

### 7.3 Images must have `alt` text
- Decorative images use `alt=""`, meaningful images describe content.

### 7.4 Form inputs must have labels
```tsx
// Bad
<input type="text" placeholder="Search..." />

// Good
<label htmlFor="search">Search</label>
<input id="search" type="text" />
```

---

## Output Format

For each issue found, report:

- **File**: file path and line number
- **Severity**: Error | Warning | Info
- **Rule**: rule number (e.g. 2.4, 5.2)
- **Issue**: what is wrong
- **Fix**: suggested code change (before/after)

At the end, provide a summary:
- Total issues found (by severity)
- Top 3 most violated rules
- Overall assessment (Clean / Needs Work / Major Issues)
