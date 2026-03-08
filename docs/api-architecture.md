# API Architecture

## Versioning

All API routes are prefixed with `/api/v1`. Example: `POST /api/v1/auth/register`.

## Layered Architecture

```
Client Request
  → Route (HTTP concerns: method, path, schema binding)
    → Handler (parse input, call service, return response)
      → Service (business logic, validation, orchestration)
        → Repository (database queries only)
          → Database
```

### Layer Responsibilities

| Layer | Does | Does NOT |
|-------|------|----------|
| **Route** | Define path, method, attach schemas, bind handler | Contain any logic |
| **Handler** | Parse request, call service, map response, set status code | Contain business logic or DB queries |
| **Service** | Business rules, orchestration, transactions, call repositories | Know about HTTP (status codes, headers, cookies) |
| **Repository** | Database queries (select, insert, update, delete) | Contain business logic or HTTP concerns |

## Dependency Injection

Uses Fastify's native plugin + decorator system with the **factory pattern** for testability.

### Factory Pattern

```typescript
// auth.service.ts
function buildAuthService(deps: { userRepository: UserRepository }) {
  return {
    async register(input: RegisterInput) {
      // uses deps.userRepository
    },
  };
}
```

### Wiring in Fastify Plugin

```typescript
// auth.plugin.ts
export default async function authPlugin(fastify: FastifyInstance) {
  const userRepository = buildUserRepository(fastify.db);
  const authService = buildAuthService({ userRepository });
  fastify.decorate("authService", authService);
}
```

### Testing

```typescript
// auth.service.test.ts
const service = buildAuthService({
  userRepository: mockUserRepository,
});
```

No external DI library needed. Dependencies are explicit and mockable.

## Model / DTO Separation

### Models

Database models live in `@repo/db` (Drizzle schema inferred types). These are internal — never exposed to clients.

### DTOs (Data Transfer Objects)

DTOs live in `@repo/shared` and are defined as Zod schemas. Two categories:

- **Request DTOs**: What the client sends (e.g. `RegisterInput`)
- **Response DTOs**: What the client receives (e.g. `UserResponse`)

### Mappers

Mappers convert between DB models and DTOs. They live in the service or handler layer.

```
Client → [Request DTO] → Handler → Service → Repository → DB Model → DB
DB → DB Model → Repository → Service → [Mapper] → Response DTO → Handler → Client
```

Example: `toUserResponse(dbUser)` strips `passwordHash` and flattens relations.

## Shared Package (`@repo/shared`)

Contains code shared between `apps/api` and `apps/hizli-isletmem-panel`:

```
packages/shared/
  src/
    schemas/       → Zod validation schemas (register-input.ts, login-input.ts)
    types/         → Inferred TypeScript types from Zod schemas
    constants/     → Shared enums, error codes, config values
```

Both backend (Fastify route validation) and frontend (form validation) use the same Zod schemas as the single source of truth.

## File Naming Convention (API)

```
modules/
  auth/
    auth.route.ts         → Route definitions (path, method, schema)
    auth.handler.ts       → Request handlers
    auth.service.ts       → Business logic (factory function)
    auth.mapper.ts        → DB model ↔ DTO mappers
  user/
    user.route.ts
    user.handler.ts
    user.service.ts
    user.repository.ts
    user.mapper.ts
```

Repositories are shared across services when needed (e.g. `userRepository` used in both auth and user modules).
