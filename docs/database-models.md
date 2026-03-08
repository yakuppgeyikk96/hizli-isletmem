# Database Models

## Business

Represents a registered business (restaurant, cafe, etc.).

| Column    | Type                                              | Constraints      | Notes                         |
| --------- | ------------------------------------------------- | ---------------- | ----------------------------- |
| id        | uuid                                              | PK               |                               |
| name      | text                                              | not null         | e.g. "Cafe Mola"             |
| type      | enum(restaurant, cafe, bar, patisserie, other)    | not null         |                               |
| phone     | text                                              | nullable         | Can be filled later           |
| address   | text                                              | nullable         | Can be filled later           |
| currency  | text                                              | not null         | Default: 'TRY'               |
| createdAt | timestamp                                         | not null         |                               |
| updatedAt | timestamp                                         | not null         |                               |

## User

Represents a person who can log in to the dashboard. Every user belongs to a business.

| Column       | Type                                        | Constraints      | Notes                                      |
| ------------ | ------------------------------------------- | ---------------- | ------------------------------------------ |
| id           | uuid                                        | PK               |                                            |
| businessId   | uuid                                        | FK → businesses  |                                            |
| name         | text                                        | not null         | e.g. "Ahmet Yilmaz"                       |
| email        | text                                        | unique, not null | Unique across the entire system            |
| passwordHash | text                                        | not null         |                                            |
| role         | enum(admin, manager, waiter, cashier)       | not null         | First registered user gets admin role      |
| isActive     | boolean                                     | not null         | Default: true. Disable instead of delete.  |
| createdAt    | timestamp                                   | not null         |                                            |
| updatedAt    | timestamp                                   | not null         |                                            |

### Registration Flow

- Only business owners register through the signup page. This creates both a **Business** and a **User** (with `admin` role).
- Staff members (waiter, cashier, manager) are added by the admin from the dashboard. They log in with credentials set by the admin.

## Refresh Token

Stores active refresh tokens for JWT authentication. Enables token invalidation on logout, token rotation on refresh, and forced session termination by admin.

| Column    | Type      | Constraints              | Notes                                         |
| --------- | --------- | ------------------------ | --------------------------------------------- |
| id        | uuid      | PK                       |                                               |
| userId    | uuid      | FK → users, CASCADE      | All tokens deleted when user is deleted        |
| tokenId   | text      | unique, not null         | The `jti` claim from the JWT                  |
| expiresAt | timestamp | not null                 | Token expiration time. Used for cleanup.       |
| createdAt | timestamp | not null                 |                                               |

### Indexes

- `refresh_tokens_user_id_idx` — lookup tokens by user (logout all sessions, deactivate user)
- `refresh_tokens_token_id_idx` — lookup token by `jti` (refresh flow validation)
