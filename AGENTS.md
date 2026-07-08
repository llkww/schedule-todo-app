# AGENTS.md

This repository is a full-stack Schedule Todo App project.

Before starting any implementation, read `PROJECT_PROMPT.md` carefully and follow it as the primary project specification.

The project must be developed as a real runnable application, not as pseudo-code, mock-only pages, or incomplete examples.

---

## 1. Primary task file

Always treat `PROJECT_PROMPT.md` as the source of truth for:

- project scope
- feature requirements
- Git requirements
- GitHub remote repository
- security requirements
- UI requirements
- testing requirements
- README requirements
- final delivery format

If there is any conflict between a short user message and `PROJECT_PROMPT.md`, follow the latest explicit user instruction. Otherwise, follow `PROJECT_PROMPT.md`.

---

## 2. Repository rules

Use Git throughout development.

Make focused commits after each meaningful development phase.

Do not make only one final commit.

Recommended commit message style:

- `chore: initialize project structure`
- `feat: implement secure user authentication`
- `feat: implement schedule management APIs`
- `feat: build design system and reusable UI components`
- `feat: build schedule management UI`
- `security: harden validation authentication and headers`
- `test: add core backend and frontend tests`
- `docs: complete project documentation`

Before each commit:

1. Check changed files.
2. Ensure no sensitive files are staged.
3. Keep the commit focused.

Before final push:

1. Run `git status`.
2. Confirm `.gitignore` is correct.
3. Confirm no secrets, local databases, logs, or build artifacts are staged.
4. Confirm tests and basic startup commands work when possible.

---

## 3. GitHub remote

The GitHub remote repository is:

```text
https://github.com/llkww/schedule-todo-app.git
```

Use this remote only after the project has been implemented, checked, committed, and verified.

Commands expected near the end:

```bash
git remote add origin https://github.com/llkww/schedule-todo-app.git
git branch -M main
git push -u origin main
```

If `origin` already exists, run:

```bash
git remote -v
```

Then verify the remote URL before changing anything.

Never blindly overwrite a remote.

---

## 4. Credential safety

Never ask the user for:

- GitHub password
- Personal Access Token
- SSH private key
- verification code
- browser cookie
- any secret credential

If `git push` requires authentication, stop and tell the user to authenticate locally.

If Git commit fails because `user.name` or `user.email` is not configured, stop and tell the user to configure Git locally.

Do not invent or store credentials.

---

## 5. Files that must not be committed

Do not commit:

- `.env`
- `.env.local`
- real secrets
- passwords
- tokens
- private keys
- GitHub credentials
- `node_modules`
- `dist`
- `build`
- `coverage`
- logs
- local sensitive database files
- generated cache files
- temporary export files

Create and maintain a correct `.gitignore`.

Provide `.env.example`, but never commit the real `.env`.

---

## 6. Engineering quality

Prioritize:

- correctness
- security
- maintainability
- clear architecture
- TypeScript type safety
- consistent formatting
- clear naming
- modular frontend components
- modular backend services
- reusable validation
- centralized error handling
- consistent API responses
- polished UI

Avoid:

- giant files
- repeated logic
- untyped `any` overuse
- fake implementations
- empty functions
- large TODO blocks
- unused code
- console logs containing sensitive information
- UI pages that only look like raw HTML

---

## 7. Frontend quality rules

The frontend should look like a modern SaaS productivity tool.

Use the `modern-saas-ui` skill when designing or reviewing UI.

Required frontend qualities:

- modern, clean, minimal interface
- unified design tokens
- reusable UI components
- consistent spacing
- consistent typography
- consistent color system
- loading, empty, error, success states
- responsive layout
- accessible form labels
- keyboard-visible focus states
- good hover and active states
- polished cards, buttons, dialogs, badges, and filters

Do not leave pages with browser-default styling.

Do not only make the dashboard polished while leaving other pages rough.

---

## 8. Backend security rules

Use the `secure-fullstack-review` skill when implementing or reviewing:

- authentication
- authorization
- password handling
- validation
- CORS
- rate limiting
- environment variables
- sensitive file checks
- Git push safety

Required backend qualities:

- passwords are hashed using bcrypt or argon2
- JWT/session secrets come from environment variables
- protected routes require authentication
- user-owned resources are scoped by `userId`
- users cannot read, modify, or delete other users' resources
- all API inputs are validated
- database queries use Prisma or parameterized queries
- errors are returned in a unified format
- stack traces are not returned to the frontend
- logs do not contain passwords, tokens, or secrets

---

## 9. Testing rules

Add meaningful tests where practical.

At minimum, cover:

- registration
- login
- protected route access
- schedule CRUD
- tag CRUD
- ownership isolation
- validation failures
- invalid enum rejection
- frontend form validation
- core page rendering

Before final delivery, run available test commands.

If some tests cannot be run because of environment limitations, clearly explain what was not run and why.

---

## 10. README rules

The final README must explain:

- project overview
- features
- tech stack
- project structure
- installation
- environment variables
- database migration
- seed data
- startup commands
- test commands
- API endpoints
- security design
- UI design
- Git commit summary
- GitHub repository
- common issues
- future improvements

README commands must match actual `package.json` scripts.

---

## 11. Final delivery response

At the end, provide a clear summary including:

1. project completion status
2. implemented features
3. security measures
4. engineering quality measures
5. UI completion notes
6. responsive design notes
7. accessibility notes
8. test status
9. startup commands
10. database initialization commands
11. Git commit summary
12. GitHub remote URL
13. whether push succeeded
14. if push failed, exact reason and commands the user should run
15. remaining improvements

Be precise. Do not claim a command passed unless it was actually run successfully.