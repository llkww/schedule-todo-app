---
name: secure-fullstack-review
description: Use when implementing or reviewing authentication, authorization, validation, environment variables, Git hygiene, API security, and other security-sensitive full-stack code.
---

# Secure Full-Stack Review Skill

Use this skill whenever building or reviewing:

- authentication
- authorization
- password handling
- validation
- database access
- environment variables
- CORS
- rate limiting
- error handling
- logging
- Git commits
- GitHub push
- sensitive file checks

The goal is to ensure the application is safe enough for a course project emphasizing security and engineering quality.

---

## 1. Password security

Never store plaintext passwords.

Use one of:

- bcrypt
- argon2

Requirements:

- hash passwords before storing
- use a reasonable cost factor
- verify passwords using the library's secure comparison method
- never return password hashes to the frontend
- never log passwords
- never include passwords in error messages
- never commit test data containing real passwords

Registration must store only `passwordHash`.

Login must compare submitted password with stored hash.

Password change should require:

- old password
- new password
- confirm new password

---

## 2. Authentication

Use JWT or secure session-based authentication.

If using JWT:

- JWT secret must come from environment variables
- do not hardcode JWT secret
- set token expiration
- validate token on every protected route
- handle expired token gracefully
- do not expose internal token verification errors

If using cookies:

- use httpOnly where possible
- use sameSite
- use secure in production
- consider CSRF protection
- document the strategy in README

If using localStorage:

- document the XSS risk in README
- do not store anything except the token
- never store password, passwordHash, or secrets

Authentication errors should be generic.

For login failure, use a message such as:

```text
Invalid email or password
```

Do not reveal whether the email exists.

---

## 3. Authorization

Every user-owned resource must be scoped by `userId`.

User-owned resources include:

- schedules
- tags
- schedule-tag relationships
- user settings
- audit logs

Rules:

- never trust frontend-only authorization
- always verify ownership on the backend
- read queries must include `userId`
- update queries must verify `userId`
- delete queries must verify `userId`
- users must not access other users' schedules or tags
- users must not attach another user's tag to their schedule

Safe examples:

- `findFirst({ where: { id, userId } })`
- `updateMany({ where: { id, userId }, data })`
- service-level ownership checks before mutation

Unsafe examples:

- `findUnique({ where: { id } })` without ownership check
- updating by id only
- deleting by id only
- trusting userId from request body

Use authenticated user ID from token/session, not from client-submitted body.

---

## 4. Input validation

All API inputs must be validated on the backend.

Use:

- Zod
- Joi
- Valibot
- or equivalent schema validation

Validate:

- email format
- password length and complexity
- username length
- title non-empty
- title max length
- description max length
- date validity
- start/end/due time consistency where practical
- importance enum
- urgency enum
- status enum
- tag name non-empty
- tag name max length
- tag color format
- page and pageSize
- sort fields
- sort direction
- search query length

Reject unknown or invalid enum values.

Do not let invalid values reach the database.

Frontend validation improves UX but does not replace backend validation.

---

## 5. API response safety

Use consistent response format.

Success example:

```json
{
  "success": true,
  "data": {},
  "message": "success"
}
```

Error example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

Rules:

- do not return stack traces to frontend
- do not leak Prisma internals
- do not leak JWT errors
- do not leak SQL or database paths
- do not return passwordHash
- do not return secrets
- use reasonable HTTP status codes

Suggested status codes:

- 200 for successful read/update
- 201 for successful create
- 204 or 200 for successful delete
- 400 for validation errors
- 401 for unauthenticated
- 403 for forbidden
- 404 for not found
- 409 for conflict
- 429 for rate limited
- 500 for unexpected server error

---

## 6. SQL injection prevention

Use Prisma or parameterized queries.

Do not build raw SQL from user input.

Avoid:

- string concatenation for SQL
- raw query with unsanitized input
- dynamic orderBy using unchecked fields

If dynamic sorting is implemented, whitelist allowed sort fields.

Allowed schedule sort fields may include:

- createdAt
- updatedAt
- startTime
- dueTime
- importance
- urgency
- status

Validate sort direction:

- asc
- desc

---

## 7. XSS prevention

React escapes text by default. Preserve that safety.

Rules:

- do not use `dangerouslySetInnerHTML`
- do not render user input as HTML
- limit string lengths
- sanitize or reject suspicious HTML if rich text is ever added
- show error messages as text
- do not put user input into raw HTML

Frontend should treat all user-generated content as untrusted.

---

## 8. CORS and CSRF

CORS rules:

- do not use unrestricted wildcard for credentialed requests
- restrict origin using environment variable such as `FRONTEND_ORIGIN`
- document allowed origins in `.env.example`
- set allowed methods intentionally

If using cookie authentication:

- evaluate CSRF risk
- use sameSite cookies
- consider CSRF token if necessary

If using Authorization header with Bearer token:

- CSRF risk is lower than cookie-based auth
- still configure CORS carefully

---

## 9. Rate limiting

Protect sensitive endpoints.

At minimum, rate limit:

- login
- register
- password change

Use a simple middleware such as express-rate-limit.

Login failure should not reveal whether email exists.

Rate limit response should use HTTP 429.

---

## 10. Security headers

Use helmet or equivalent.

Enable reasonable defaults.

Ensure the app does not intentionally disable security headers without reason.

---

## 11. Environment variables

Use `.env` for local development.

Commit only `.env.example`.

Required examples may include:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_ORIGIN="http://localhost:5173"
```

Rules:

- never commit real `.env`
- never hardcode secrets
- fail fast or warn clearly when required env vars are missing
- README must explain env setup

---

## 12. Logging

Logs must not include:

- passwords
- password hashes
- tokens
- secrets
- private keys
- full Authorization headers
- sensitive database content

Development logs may include high-level request information, but avoid sensitive values.

Production-style errors should be concise.

---

## 13. Git hygiene

Before every commit:

```bash
git status
```

Check staged files.

Do not commit:

- `.env`
- `.env.local`
- secrets
- tokens
- private keys
- passwords
- `node_modules`
- `dist`
- `build`
- `coverage`
- logs
- local sensitive database files

Maintain `.gitignore`.

Before final push:

1. run tests when possible
2. run lint/type check when available
3. run `git status`
4. confirm remote URL
5. push only after checking credentials are not needed in prompt

Never ask the user for GitHub password, token, SSH private key, or verification code.

---

## 14. GitHub push safety

The target remote is:

```text
https://github.com/llkww/schedule-todo-app.git
```

Near final delivery, expected commands:

```bash
git remote add origin https://github.com/llkww/schedule-todo-app.git
git branch -M main
git push -u origin main
```

If `origin` already exists:

```bash
git remote -v
```

Verify before changing.

If push requires authentication, stop and tell the user:

```text
GitHub authentication is required. Please authenticate locally, then rerun git push.
```

Do not request credentials.

---

## 15. Security tests

Add or verify tests for:

- password is hashed
- login works with correct password
- login fails with wrong password
- unauthenticated requests are rejected
- user cannot access another user's schedule
- user cannot modify another user's schedule
- user cannot delete another user's schedule
- user cannot access another user's tag
- invalid importance is rejected
- invalid urgency is rejected
- empty title is rejected
- duplicate tag under same user is rejected
- duplicate email registration is rejected

Where full automated tests are not practical, document the manual verification.

---

## 16. Final security review checklist

Before final delivery, report:

1. password hashing method
2. authentication method
3. token/session expiration strategy
4. protected route strategy
5. ownership isolation strategy
6. validation library and coverage
7. SQL injection prevention approach
8. XSS prevention approach
9. CORS policy
10. rate limiting
11. security headers
12. sensitive file protection
13. `.env.example` status
14. known remaining security limitations

Do not claim security is complete unless these items are addressed.