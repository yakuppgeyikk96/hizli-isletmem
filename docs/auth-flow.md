# Authentication Flow

## Overview

JWT-based authentication with HTTP-only cookies. Access token for short-lived authorization, refresh token for session continuity. Refresh tokens are stored in the database to support invalidation.

## Token Strategy

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| Access token | 15 minutes | HTTP-only cookie | Authorize API requests |
| Refresh token | 7 days | HTTP-only cookie + DB | Renew access token |

### Cookie Configuration

```
httpOnly: true
secure: true (production)
sameSite: strict
path: / (access token), /auth/refresh (refresh token)
```

## Endpoints

### POST /auth/register

Creates a new business and its admin user.

**Input:** name, email, password, businessName, businessType

**Flow:**
1. Validate input (Zod)
2. Check if email already exists → 409 Conflict
3. Hash password with Argon2
4. Create business + user (admin role) in a single transaction
5. Generate access token + refresh token
6. Store refresh token in DB
7. Set both tokens as HTTP-only cookies
8. Return user + business data (no tokens in body)

### POST /auth/login

Authenticates an existing user.

**Input:** email, password

**Flow:**
1. Validate input (Zod)
2. Find user by email → 401 if not found
3. Check `isActive` → 401 if deactivated
4. Verify password with Argon2 → 401 if wrong
5. Generate access token + refresh token
6. Store refresh token in DB
7. Set both tokens as HTTP-only cookies
8. Return user + business data

### POST /auth/refresh

Renews an expired access token using a valid refresh token.

**Flow:**
1. Read refresh token from cookie → 401 if missing
2. Verify refresh token signature → 401 if invalid/expired
3. Find refresh token in DB → 401 if not found (revoked)
4. Check user `isActive` → 401 if deactivated
5. **Token rotation:** delete old refresh token from DB
6. Generate new access token + new refresh token
7. Store new refresh token in DB
8. Set both tokens as HTTP-only cookies

### POST /auth/logout

Ends the current session.

**Flow:**
1. Read refresh token from cookie
2. Delete refresh token from DB (if exists)
3. Clear both cookies
4. Return 200

## Token Payload

### Access Token (JWT)

```json
{
  "sub": "user-uuid",
  "businessId": "business-uuid",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token (JWT)

```json
{
  "sub": "user-uuid",
  "jti": "unique-token-id",
  "iat": 1234567890,
  "exp": 1235172690
}
```

The `jti` (JWT ID) is stored in the database and used for lookup/invalidation.

## Database: Refresh Tokens Table

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| userId | uuid | FK → users |
| tokenId | text | The `jti` from the JWT, unique |
| expiresAt | timestamp | Token expiration time |
| createdAt | timestamp | |

Expired tokens are periodically cleaned up. When a user logs out or a token is rotated, the corresponding row is deleted.

## Security Measures

### Password Hashing
- Algorithm: **Argon2id** (resistant to GPU and side-channel attacks)
- Library: `argon2` npm package

### Rate Limiting
- `/auth/login`: max 5 requests per minute per IP
- `/auth/register`: max 3 requests per minute per IP
- `/auth/refresh`: max 10 requests per minute per IP
- Implemented with `@fastify/rate-limit`

### Request Authentication
Every protected route reads the access token from the cookie and verifies it. The middleware:
1. Reads access token from cookie → 401 if missing
2. Verifies JWT signature and expiration → 401 if invalid
3. Checks user `isActive` in DB (can be cached briefly) → 401 if deactivated
4. Attaches `{ userId, businessId, role }` to the request

### Token Rotation
When a refresh token is used, it is **invalidated immediately** and a new one is issued. This prevents replay attacks — a stolen refresh token can only be used once.

### Deactivated Users
- When an admin deactivates a staff member (`isActive = false`), their existing access token works until it expires (max 15 min).
- On next refresh attempt, the refresh is denied because `isActive` is checked.
- For immediate revocation: admin can delete all refresh tokens for that user from DB.

## Future Enhancements (Not in MVP)

- **Password reset via email** — send a time-limited reset link
- **Active sessions list** — admin can see and revoke active sessions per user
- **Multi-device management** — users can see their own active devices
- **OAuth providers** — Google login for business owners
