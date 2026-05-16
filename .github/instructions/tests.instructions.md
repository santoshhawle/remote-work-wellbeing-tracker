---
applyTo: "**/__tests__/**,**/*.test.ts,**/*.test.tsx"
---

# Test Authoring Conventions

These rules apply whenever GitHub Copilot reads or writes test files in this project.

## Test Runner & Libraries

- **Client tests**: `vitest` + `@testing-library/react` + `@testing-library/jest-dom`
- **Custom hooks**: use `renderHook` from `@testing-library/react`
- **User interactions**: use `@testing-library/user-event` (not `fireEvent`)
- **Server tests**: none yet — use `vitest` with `supertest` if added

## Mandatory Coverage per Function/Component

Every new function or component **must** have at minimum:

1. **Happy path test** — the standard success case with expected output/behaviour
2. **Edge / error case test** — at least one of: empty input, null/undefined, auth failure, network error, boundary value

> If a test file exists, new tests must be added to it — do not create duplicates.

## Mocking Rules

- **All external dependencies** must be mocked in unit tests: API calls, `localStorage`, `sessionStorage`, timers (`vi.useFakeTimers()`), `Notification` API
- **Never make real HTTP requests** in unit or hook tests — mock `src/api.ts` at the module level
- **Context providers** must be wrapped with `renderWithProviders` or equivalent test utility
- Mock return values must match the actual type signatures — no `as any` shortcuts

## Naming Conventions

| What | Convention |
|------|-----------|
| Test files | `ComponentName.test.tsx` or `hookName.test.ts` |
| Test suites | `describe('ComponentName', () => { ... })` |
| Test cases | `it('should <expected behaviour>', () => { ... })` |
| Mock variables | `mock<DependencyName>` (e.g. `mockGetLogs`) |

## Forbidden in Test Files

- `console.log` — remove all debug logging before committing
- `expect(true).toBe(true)` — no vacuous passing tests
- `.only` / `.skip` on final committed tests
- Hardcoded user IDs, tokens, or passwords — use constants or `faker`-style helpers

## Assertion Style

- Prefer `@testing-library/jest-dom` matchers: `toBeInTheDocument()`, `toHaveTextContent()`, `toBeDisabled()`
- Prefer `screen.getByRole()` over `getByTestId()` for accessibility-aligned queries
- Use `waitFor()` / `findBy*` for async state changes — never `setTimeout` inside tests

## Coverage Targets (from verification-suite)

- Line coverage ≥ 80%
- Branch coverage ≥ 75%
- Every acceptance criterion in `docs/requirements.md` must have a corresponding test scenario
