---
name: fastify-review
description: Review Fastify API code for architecture, performance, security, and best practice violations. Use when reviewing route handlers, plugins, hooks, or service files in a Fastify application.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
---

# Fastify Code Review

Review the Fastify file(s) provided in $ARGUMENTS for architecture, performance, security, and best practice violations. Apply every rule below strictly.

---

## 1. Route Design

### 1.1 Keep route handlers thin
- Route handlers must only parse input, call a service, and return the response.
- Business logic belongs in a separate service layer, not in the route handler.
```typescript
// Bad
app.post("/orders", async (request, reply) => {
  const order = request.body;
  const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const result = await db.insert(orders).values({ ...order, total });
  // ... more logic
  return result;
});

// Good
app.post("/orders", async (request, reply) => {
  const result = await orderService.create(request.body);
  return reply.status(201).send(result);
});
```

### 1.2 Always define request and response schemas
- Every route must have a JSON schema for `body`, `params`, `querystring`, and `response`.
- Response schemas prevent accidental data leaks and improve serialization performance via `fast-json-stringify`.
```typescript
// Bad
app.get("/users/:id", async (request) => { ... });

// Good
app.get("/users/:id", {
  schema: {
    params: paramsSchema,
    response: { 200: userResponseSchema },
  },
}, async (request) => { ... });
```

### 1.3 Use route prefixes for grouping
- Group related routes under a common prefix using `register` with `prefix` option.
```typescript
app.register(orderRoutes, { prefix: "/orders" });
app.register(productRoutes, { prefix: "/products" });
```

### 1.4 Use proper HTTP status codes
- `200` for successful GET/PUT, `201` for successful POST (resource created), `204` for successful DELETE.
- `400` for validation errors, `401` for unauthenticated, `403` for unauthorized, `404` for not found.
- Never return `200` for errors.

### 1.5 Use proper HTTP methods
- `GET` for reading, `POST` for creating, `PUT` for full update, `PATCH` for partial update, `DELETE` for removing.

---

## 2. Plugin Architecture

### 2.1 One plugin per concern
- Each plugin should handle a single responsibility (auth, database, routes for one domain).
- Never mix unrelated logic in the same plugin.

### 2.2 Use `fastify-plugin` only when breaking encapsulation is intentional
- By default, plugins are encapsulated (scoped). This is good.
- Only use `fastify-plugin` wrapper when you explicitly need to share decorators or hooks with parent/sibling contexts.
```typescript
// Scoped plugin (default, preferred)
export default async function orderRoutes(fastify: FastifyInstance) { ... }

// Shared plugin (only when needed, e.g., database decorator)
export default fp(async function dbPlugin(fastify: FastifyInstance) {
  fastify.decorate("db", drizzle(client));
});
```

### 2.3 Never register the same plugin twice without deduplication
- Use `fastify-plugin` with `{ name }` option to prevent duplicate registration.

---

## 3. Hooks and Lifecycle

### 3.1 Use hooks for cross-cutting concerns only
- Authentication, logging, request timing → hooks.
- Business logic → service layer, not hooks.

### 3.2 Always return `reply` in async hooks that send a response
```typescript
// Bad (causes "Reply already sent" errors)
app.addHook("onRequest", async (request, reply) => {
  if (!request.headers.authorization) {
    reply.status(401).send({ error: "Unauthorized" });
  }
});

// Good
app.addHook("onRequest", async (request, reply) => {
  if (!request.headers.authorization) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
});
```

### 3.3 Never modify responses in `onError` hook
- `onError` is read-only, for logging only.
- Use `setErrorHandler()` to modify error responses.

### 3.4 Understand hook execution order
- `onRequest` → `preParsing` → `preValidation` → `preHandler` → handler → `preSerialization` → `onSend` → `onResponse`
- Place auth checks in `onRequest`, not `preHandler`.

---

## 4. Decorators

### 4.1 Never decorate with mutable reference types directly
```typescript
// Bad (shared across all requests — data leaks!)
fastify.decorateRequest("user", {});

// Good (set per request)
fastify.decorateRequest("user", null);
fastify.addHook("onRequest", async (request) => {
  request.user = await authenticate(request);
});
```

### 4.2 Always type your decorators
```typescript
declare module "fastify" {
  interface FastifyRequest {
    user: User | null;
  }
}
```

---

## 5. Validation and Serialization

### 5.1 Use Zod or TypeBox for schema definitions
- Define schemas with Zod (or TypeBox) and convert to JSON Schema for Fastify.
- This gives both runtime validation and TypeScript types from a single source.

### 5.2 Customize validation error responses
- Default validation errors expose internal schema details.
- Use `setErrorHandler()` to sanitize validation error messages.
```typescript
fastify.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: error.message,
    });
  }
  // ... handle other errors
});
```

### 5.3 Always define response schemas
- Without response schema, Fastify uses `JSON.stringify()` (slow) and may leak sensitive fields.
- With response schema, Fastify uses `fast-json-stringify` (fast) and only serializes declared fields.

---

## 6. Error Handling

### 6.1 Use `@fastify/sensible` for standard HTTP errors
```typescript
// Bad
reply.status(404).send({ error: "Not found" });

// Good
throw fastify.httpErrors.notFound("Order not found");
```

### 6.2 Use a centralized error handler
- Register a global `setErrorHandler()` that handles all error types consistently.
- Return a consistent error response shape.
```typescript
type ErrorResponse = {
  error: string;    // machine-readable error code
  message: string;  // human-readable message
};
```

### 6.3 Never expose stack traces in production
- Check `process.env.NODE_ENV` and omit stack traces in production responses.

### 6.4 Log errors with context
- Always include request ID, route, and relevant identifiers when logging errors.

---

## 7. Performance

### 7.1 Use response schemas for fast serialization
- `fast-json-stringify` with schemas is 2-3x faster than `JSON.stringify()`.

### 7.2 Use `reply.send()` instead of `return` for streams
- For streaming responses, always use `reply.send(stream)`.

### 7.3 Avoid blocking the event loop
- Never use synchronous operations (fs.readFileSync, crypto.pbkdf2Sync) in route handlers.
- Offload CPU-intensive work to worker threads.

### 7.4 Use connection pooling for database
- Never create a new database connection per request.
- Use a shared pool configured as a Fastify decorator.

---

## 8. Security

### 8.1 Enable CORS properly
- Use `@fastify/cors` with explicit origin whitelist, never `origin: true` in production.

### 8.2 Rate limit sensitive endpoints
- Use `@fastify/rate-limit` on auth endpoints (login, register, password reset).

### 8.3 Use helmet for security headers
- Register `@fastify/helmet` for standard security headers.

### 8.4 Never trust user input
- Always validate with schemas. Never use `request.body` fields directly in SQL or shell commands.

### 8.5 Sanitize logs
- Never log passwords, tokens, or other sensitive data.
- Redact sensitive fields before logging request bodies.

---

## 9. Project Structure

### 9.1 Organize by domain, not by type
```
// Bad
routes/
  user.ts
  order.ts
services/
  user.ts
  order.ts

// Good
modules/
  user/
    user.route.ts
    user.service.ts
    user.schema.ts
  order/
    order.route.ts
    order.service.ts
    order.schema.ts
```

### 9.2 Separate concerns into layers
- **Route layer**: HTTP concerns (request/response, status codes)
- **Service layer**: Business logic (no HTTP awareness)
- **Data layer**: Database queries (no business logic)

### 9.3 Keep plugin registration in app.ts
- `app.ts` should only register plugins and routes, nothing else.

---

## Output Format

For each issue found, report:

- **File**: file path and line number
- **Severity**: Error | Warning | Info
- **Rule**: rule number (e.g. 1.1, 5.3)
- **Issue**: what is wrong
- **Fix**: suggested code change (before/after)

At the end, provide a summary:
- Total issues found (by severity)
- Top 3 most violated rules
- Overall assessment (Clean / Needs Work / Major Issues)
