---
name: ts-review
description: Review TypeScript code for clean code violations, type safety issues, and performance problems. Use when reviewing .ts or .tsx files for quality.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
---

# TypeScript Code Review

Review the TypeScript file(s) provided in $ARGUMENTS for clean code violations, type safety issues, and performance problems. Apply every rule below strictly.

---

## 1. Type Safety

### 1.1 Never use `any`
- Use `unknown` when the type is truly uncertain, then narrow with type guards.
- Use generics when the type varies but follows a pattern.
- The only acceptable `any` is in third-party type declarations you cannot control.

### 1.2 Explicit return types on exported functions
- Every exported function and method must have an explicit return type.
- Private/internal helper functions may rely on inference.

### 1.3 Prefer `unknown` over `any` in catch blocks
```typescript
// Bad
catch (error: any) { console.log(error.message); }

// Good
catch (error: unknown) {
  if (error instanceof Error) { console.log(error.message); }
}
```

### 1.4 Use discriminated unions over optional fields
```typescript
// Bad
type Result = { data?: string; error?: string; };

// Good
type Result = { status: "success"; data: string } | { status: "error"; error: string };
```

### 1.5 Use `as const` for literal values
- Prefer `as const` over manual literal union types when defining constant sets.

### 1.6 Avoid type assertions (`as`)
- Use type guards or discriminated unions instead of `as` casts.
- `as` is only acceptable when interfacing with untyped external APIs.

### 1.7 Use `readonly` for immutable data
- Mark arrays, tuples, and object properties as `readonly` when they should not be mutated.

---

## 2. Naming Conventions

### 2.1 Variables and functions: `camelCase`
```typescript
const totalAmount = 100;
function getActiveOrders() {}
```

### 2.2 Types, interfaces, enums, classes: `PascalCase`
```typescript
type BusinessType = "restaurant" | "cafe";
interface CreateUserInput {}
```

### 2.3 Constants (module-level true constants): `UPPER_SNAKE_CASE`
```typescript
const MAX_RETRY_COUNT = 3;
const DEFAULT_CURRENCY = "TRY";
```

### 2.4 Boolean variables: use `is/has/can/should` prefix
```typescript
const isActive = true;
const hasPermission = false;
const canEdit = true;
```

### 2.5 Files: `kebab-case`
```
order-item.ts, auth-middleware.ts, create-user.ts
```

### 2.6 No abbreviations unless universally known
```typescript
// Bad: const usr, const btn, const mgr
// Good: const user, const button, const manager
// OK: const id, const url, const api
```

### 2.7 No meaningless names
- Never use `data`, `info`, `temp`, `item`, `obj`, `result` as standalone variable names.
- Always be specific: `userData` -> `activeUsers`, `item` -> `orderItem`.

---

## 3. Functions

### 3.1 Single Responsibility
- A function must do exactly one thing. If you can describe it with "and", split it.

### 3.2 Maximum 25 lines per function body
- If a function exceeds 25 lines, it must be broken into smaller functions.

### 3.3 Maximum 3 parameters
- If more than 3 parameters are needed, use an options object.
```typescript
// Bad
function createUser(name: string, email: string, role: string, businessId: string) {}

// Good
function createUser(input: CreateUserInput) {}
```

### 3.4 Early return (guard clauses)
- Avoid deep nesting. Return early for error/edge cases.
```typescript
// Bad
function process(user: User | null) {
  if (user) {
    if (user.isActive) {
      // ...deep logic
    }
  }
}

// Good
function process(user: User | null) {
  if (!user) return;
  if (!user.isActive) return;
  // ...logic at top level
}
```

### 3.5 No side effects in pure functions
- Functions that compute values should not modify external state.

### 3.6 Use async/await over .then() chains
```typescript
// Bad
fetchUser().then(user => fetchOrders(user.id)).then(orders => process(orders));

// Good
const user = await fetchUser();
const orders = await fetchOrders(user.id);
process(orders);
```

---

## 4. Files and Structure

### 4.1 Maximum 200 lines per file
- If a file exceeds 200 lines, split it into logical modules.

### 4.2 No barrel exports (index.ts re-exports)
- Always import directly from the source file.
```typescript
// Bad
import { users } from "./schema";

// Good
import { users } from "./schema/user";
```

### 4.3 One concept per file
- A file should contain one model, one service, one route handler, etc.
- Related types can live in the same file as the thing they describe.

### 4.4 Imports order
1. Node built-in modules (`node:path`, `node:fs`)
2. External packages (`fastify`, `drizzle-orm`)
3. Internal packages (`@repo/db`)
4. Relative imports (`./utils`)

---

## 5. Error Handling

### 5.1 Never silently swallow errors
```typescript
// Bad
catch (error) {}

// Good
catch (error: unknown) {
  logger.error("Failed to create user", { error });
  throw new AppError("USER_CREATE_FAILED");
}
```

### 5.2 Use custom error types
- Create domain-specific error classes instead of throwing plain `Error`.

### 5.3 Validate at boundaries only
- Validate user input and external API responses.
- Do not add redundant validation for internal function calls.

---

## 6. Performance

### 6.1 Avoid unnecessary object/array copies
- Do not spread objects or arrays when not needed.

### 6.2 Use `Promise.all` for independent async operations
```typescript
// Bad (sequential, slow)
const users = await getUsers();
const products = await getProducts();

// Good (parallel, fast)
const [users, products] = await Promise.all([getUsers(), getProducts()]);
```

### 6.3 Avoid redundant type annotations
- Let TypeScript infer types for local variables when the type is obvious from the right-hand side.
```typescript
// Bad (redundant)
const name: string = "hello";
const count: number = 5;

// Good (inferred)
const name = "hello";
const count = 5;
```

### 6.4 Prefer `Map`/`Set` over plain objects for dynamic key collections
- Use `Map` when keys are dynamic or when you need ordered iteration.
- Use `Set` when you need unique values.

### 6.5 Avoid deeply nested generics
- If a type requires more than 2 levels of generic nesting, extract intermediate types.

---

## 7. General

### 7.1 No magic numbers or strings
```typescript
// Bad
if (role === "admin") {}
if (retryCount > 3) {}

// Good
const ADMIN_ROLE = "admin" as const;
const MAX_RETRY_COUNT = 3;
if (role === ADMIN_ROLE) {}
if (retryCount > MAX_RETRY_COUNT) {}
```

### 7.2 No commented-out code
- Delete it. Git has the history.

### 7.3 Comments explain "why", not "what"
```typescript
// Bad: Increment count by 1
count++;

// Good: Retry once more because the payment gateway occasionally times out
count++;
```

### 7.4 No duplicate code
- If the same logic appears 3+ times, extract it into a function.
- 2 occurrences can stay if the duplication is trivial.

### 7.5 Prefer `const` over `let`, never use `var`
- Use `let` only when reassignment is necessary.

---

## Output Format

For each issue found, report:

- **File**: file path and line number
- **Severity**: Error | Warning | Info
- **Rule**: rule number (e.g. 1.1, 3.2)
- **Issue**: what is wrong
- **Fix**: suggested code change (before/after)

At the end, provide a summary:
- Total issues found (by severity)
- Top 3 most violated rules
- Overall assessment (Clean / Needs Work / Major Issues)
