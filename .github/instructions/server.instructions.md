---
applyTo: "server/src/**"
---

# Server Code Conventions

These rules apply whenever GitHub Copilot reads or writes files under `server/src/`.

## Tech Stack (do not deviate without user approval)

- **Runtime**: Node.js with TypeScript (`tsx` for dev, `tsc` for build)
- **Framework**: Express 4
- **Auth**: `jsonwebtoken` (JWT) + `bcryptjs` (password hashing)
- **DB**: SQLite via Node.js built-in `node:sqlite` (experimental)
- **Rate limiting**: `express-rate-limit`

## Security Rules (OWASP Top 10)

### Authentication & Authorisation (A01, A07)
- Every protected route **must** call the `auth` middleware from `src/middleware/auth.ts` before the handler
- Never return JWT tokens in response bodies beyond the initial login — only set them in `Authorization` headers
- Password fields must **always** be hashed with `bcryptjs` — never store or log plaintext passwords
- Auth failures must return `401` with a generic message (`"Invalid credentials"`) — no user enumeration

### Injection (A03)
- All SQL queries must use parameterised statements — never string-concatenate user input into queries
- Validate all route parameters, query strings, and request body fields before use

### Sensitive Data Exposure (A02)
- Never log: JWT tokens, passwords, full request bodies on auth routes, or any PII
- All secrets and config values must come from `process.env.*` — no hardcoded values
- `.env` files must never be committed (already in `.gitignore`)

### Security Misconfiguration (A05)
- CORS must be explicitly configured — no wildcard `*` origins in production
- Rate limiting must be applied to: `POST /auth/login`, `POST /auth/register`

## Input Validation Pattern

Validate at the route boundary before calling any business logic:

```typescript
// Required string field example
const value = req.body.fieldName;
if (!value || typeof value !== 'string' || value.trim().length === 0) {
  return res.status(400).json({ error: 'fieldName is required' });
}
```

## Error Handling

- All route handlers must be wrapped in try/catch
- On error, return appropriate HTTP status codes (400 bad request, 401 unauthorised, 403 forbidden, 404 not found, 500 server error)
- Never expose stack traces or internal error messages to clients in production
- Log server errors to stderr (`console.error`) — never to stdout

## File Structure

```
server/src/
  index.ts          — app bootstrap, middleware registration, server start
  database.ts       — SQLite connection and schema initialisation
  middleware/
    auth.ts         — JWT verification middleware
  routes/
    auth.ts         — POST /auth/login, POST /auth/register
    logs.ts         — wellbeing check-in log endpoints
    suggestions.ts  — suggestion endpoints
    team.ts         — team insights endpoints
    calendar.ts     — calendar endpoints
```

## Forbidden

- `console.log` in production handlers — use `console.error` for errors only
- Inline SQL strings without parameterisation
- Direct `process.exit()` calls inside route handlers
- `any` type without explicit justification comment
