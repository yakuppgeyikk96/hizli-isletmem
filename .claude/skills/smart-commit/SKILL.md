---
name: smart-commit
description: Analyze current code changes, group them into logical commits, and create well-structured git commits. Use when the user wants to commit their work.
disable-model-invocation: true
---

# Smart Commit

Analyze all staged and unstaged changes in the repository, group them into logical commits, and create each commit with a clear, conventional message.

## Process

### Step 1: Analyze Changes
1. Run `git status` to see all changed, added, and deleted files.
2. Run `git diff` to see unstaged changes.
3. Run `git diff --cached` to see already staged changes.
4. Read changed files to understand what each change does.

### Step 2: Group Changes Logically
Group related changes into separate commits. Each commit should represent ONE logical unit of work.

**Grouping rules:**
- Schema/model changes → one commit
- Configuration/setup changes → one commit
- New feature files (route + service + schema for same feature) → one commit
- Styling/UI changes for the same component/page → one commit
- Documentation changes → one commit
- Dependency additions (package.json + lockfile) → one commit
- Test files → one commit with the feature they test, or separately if they cover multiple features

**Do NOT group:**
- Unrelated changes in the same commit
- Backend and frontend changes together (unless they are a single tightly-coupled feature)
- Config changes with feature code

### Step 3: Determine Commit Order
Commits should be ordered so the history makes sense:
1. Dependencies / config / setup first
2. Schema / model changes
3. Core logic / services
4. Routes / API endpoints
5. UI components / pages
6. Documentation
7. Fixes / cleanup

### Step 4: Present the Plan
Before committing, present the commit plan to the user:

```
Commit Plan:
  1. [type] short description
     Files: file1.ts, file2.ts
  2. [type] short description
     Files: file3.ts, file4.ts
```

**Wait for user approval before creating any commits.**

### Step 5: Create Commits
For each approved group:
1. Stage only the files for that commit: `git add <specific files>`
2. Create the commit with the message.
3. Verify with `git status` that the right files were committed.

## Commit Message Format

Use Conventional Commits format:

```
type(scope): short description
```

### Types
| Type | When to use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Build, config, dependencies, tooling |
| `docs` | Documentation changes |
| `style` | Formatting, styling (no logic change) |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |

### Scope
Use the affected area: `auth`, `orders`, `products`, `tables`, `payments`, `stats`, `ui`, `db`, `api`, `config`.

### Rules
- Message in lowercase (except proper nouns).
- No period at the end.
- Max 72 characters for the subject line.
- Use imperative mood: "add" not "added", "fix" not "fixed".
- Be specific: "add order creation endpoint" not "update code".
- **Never** add Co-Authored-By, Signed-off-by, or any trailer lines.

### Examples
```
feat(db): add user and business schemas
chore(api): configure fastify with typescript and autoload
feat(auth): add register endpoint with jwt token generation
style(ui): update sidebar navigation layout
fix(orders): prevent duplicate order creation for same table
refactor(payments): extract payment validation to service layer
docs: add database models documentation
chore: add drizzle-review and tailwind-review skills
```

## Safety Rules

- **Never** commit files that contain secrets (.env, credentials, API keys).
- **Never** use `git add .` or `git add -A`. Always add specific files.
- **Never** amend existing commits unless explicitly asked.
- **Never** force push.
- If a pre-commit hook fails, fix the issue and create a NEW commit.
- If there are no changes to commit, inform the user and stop.
