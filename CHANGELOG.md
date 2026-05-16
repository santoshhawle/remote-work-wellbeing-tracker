# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added — chore(ci): Husky git hooks, commitlint, and Copilot instructions (2026-05-15)

**Infrastructure**: Adds the full hooks layer for the Agentic SDLC Pipeline — three Husky git hooks (commit-msg, pre-commit, pre-push), a commitlint configuration, four scoped GitHub Copilot instruction files, and a GitHub Actions CI workflow. Enforces code quality standards and commit conventions defined in `.github/instructions/sdlc.instructions.md`.

#### New files
- `.husky/commit-msg` — validates commit messages via commitlint (`<type>(<scope>): <desc>` format)
- `.husky/pre-commit` — blocks `console.log` in production code, detects hardcoded secrets, runs `tsc --noEmit` on client and server
- `.husky/pre-push` — blocks direct pushes to `main`, runs full client test suite (59 tests)
- `commitlint.config.cjs` — SDLC-scoped type/scope enums (feat, fix, docs, test, refactor, chore)
- `.github/instructions/docs.instructions.md` — enforces SDLC document header, status lifecycle, no placeholder text
- `.github/instructions/tests.instructions.md` — enforces happy path + edge case coverage, mocking rules, naming conventions
- `.github/instructions/server.instructions.md` — enforces auth middleware, parameterised SQL, no secrets, rate limiting
- `.github/instructions/client.instructions.md` — enforces all HTTP via `src/api.ts`, TypeScript strict, React hooks rules
- `.github/workflows/ci.yml` — CI jobs: client (tsc + vitest), server (tsc), commitlint on PRs
- `package.json` / `package-lock.json` — adds `husky` and `@commitlint/cli` + `@commitlint/config-conventional` dev deps

---

### Added — KAN-1: US-001 Daily Check-in Reminder (2026-05-15)

**Feature**: Daily browser push notification system with a user-configurable reminder time, opt-in/out toggle, and automatic suppression once the user has checked in for the day.

#### New files
- `client/src/services/notificationStorage.ts` — localStorage CRUD for notification settings and daily check-in flag, with per-user keying and try/catch error handling
- `client/src/services/notificationService.ts` — Browser Notifications API wrapper (zero React dependencies); `onclick` navigates to `/checkin` via `window.location.href`
- `client/src/hooks/useNotificationScheduler.ts` — React hook that owns the `setTimeout` scheduler lifecycle; handles auth guard, stale-date cleanup, suppression, midnight reset, and settings reactivity
- `client/src/contexts/NotificationContext.tsx` — React Context provider hosting the scheduler; exposes `settings` and `updateSettings()` globally
- `client/src/pages/SettingsPage.tsx` — `/settings` route UI with opt-in toggle (`role="switch"`), time picker (`<input type="time">`), unsupported-browser degradation, and immediate auto-save on toggle
- `client/src/test/setup.ts` — Vitest test setup file (`@testing-library/jest-dom`)
- `client/src/services/__tests__/notificationStorage.test.ts` — 17 unit tests
- `client/src/services/__tests__/notificationService.test.ts` — 11 unit tests
- `client/src/hooks/__tests__/useNotificationScheduler.test.ts` — 13 unit tests
- `client/src/contexts/__tests__/NotificationContext.test.tsx` — 6 integration tests
- `client/src/contexts/__tests__/AuthContext.test.tsx` — 3 integration tests
- `client/src/pages/__tests__/SettingsPage.test.tsx` — 5 integration tests
- `client/src/pages/__tests__/CheckInPage.test.tsx` — 4 integration tests
- `docs/requirements.md`, `docs/architecture.md`, `docs/design-review.md`, `docs/impl-plan.md`, `docs/code-review.md`, `docs/verification-report.md` — full SDLC paper trail

#### Modified files
- `client/src/App.tsx` — added `<NotificationProvider>` wrapper and `/settings` route inside `PrivateRoute`
- `client/src/components/Header.tsx` — added Settings nav link (`/settings`)
- `client/src/pages/CheckInPage.tsx` — calls `markCheckedInToday(user.id)` after successful log submission
- `client/src/contexts/AuthContext.tsx` — calls `clearUserData(user.id)` in `logout()` to clean up notification data on sign-out
- `client/vite.config.ts` — added Vitest configuration block (`jsdom`, `globals`, `setupFiles`)
- `client/package.json` — added `test`/`test:watch` scripts and Vitest/testing-library devDependencies
- `.gitignore` — added `client/coverage/` exclusion

#### Bug fixes (found during code review)
- **R-01**: `notificationStorage.todayDate()` was returning UTC date (`toISOString().slice(0,10)`); fixed to use local `getFullYear/getMonth/getDate` — affected users in UTC+ timezones
- **R-02**: Settings page toggle did not auto-persist on opt-out; scheduler kept running until next explicit Save — fixed to call `updateSettings()` immediately
- **R-03**: Missing tests for `markCheckedInToday` call path (CheckInPage) and `clearUserData` call path (AuthContext logout) — added

#### Test summary
- **59 tests, 0 failures** across 7 test files
- Statement coverage: **93.98%** | Branch: **90.26%** | Lines: **95.00%**
