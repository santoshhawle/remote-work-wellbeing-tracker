# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added — KAN-2: Export Wellbeing Logs as CSV (2026-05-18)

**Feature**: Authenticated users can export their personal wellbeing logs as a CSV file directly from the Dashboard. A date range selector (Last 7 / 30 / 90 days or custom range) is provided before download. The export is scoped strictly to the requesting user's data, capped at 1,000 rows, and produces a UTF-8 BOM CSV compatible with Excel, Google Sheets, and LibreOffice Calc.

#### New files
- `server/src/utils/csvSerialize.ts` — RFC 4180 CSV serializer with UTF-8 BOM, CSV injection neutralisation (`=+-@` prefix with `\t`), and proper quoting for fields containing commas/newlines
- `server/src/__tests__/csvSerialize.test.ts` — 10 unit tests for the CSV serializer
- `server/src/__tests__/logsExport.test.ts` — 10 integration tests for the export route (auth, date ranges, user isolation, empty range, semantic date validation)
- `server/vitest.config.ts` — Vitest configuration for server-side test execution
- `client/src/components/ExportControls.tsx` — React component with date range selector, loading/disabled state, inline error display, and WCAG AA labels
- `client/src/__tests__/api.test.ts` — 8 unit tests for `api.logs.exportCsv`
- `client/src/components/__tests__/ExportControls.test.tsx` — 12 component tests (rendering, preset/custom range, loading, error, empty date guard)
- `docs/requirements.md`, `docs/architecture.md`, `docs/design-review.md`, `docs/impl-plan.md`, `docs/code-review.md`, `docs/verification-report.md` — full SDLC paper trail

#### Modified files
- `server/src/routes/logs.ts` — added `GET /api/logs/export` route with JWT auth, `?days=N` / `?start=&end=` query params, semantic date validation (`isCalendarDate`), `LIMIT 1000 ORDER BY date DESC`, and `try/catch` error handling
- `client/src/api.ts` — added `api.logs.exportCsv()` using `fetch` + `Blob` + `URL.createObjectURL`; JWT sent in `Authorization` header only (never in URL)
- `client/src/pages/DashboardPage.tsx` — mounted `<ExportControls />` below the stats and chart sections

#### Bug fixes (found during code review)
- **F-1**: Date regex accepted semantically invalid dates (e.g. `2026-13-45`); fixed by adding `isCalendarDate()` calendar-aware validation — returns HTTP 400 for invalid dates
- **F-2**: `ExportControls` passed `{ start: '', end: '' }` to the server when custom preset selected with empty inputs; fixed by adding a client-side guard before any network call, with a clear user-facing error message

#### Test summary
- **99 tests, 0 failures** (20 server + 79 client)
- New-code coverage: `csvSerialize.ts` 100% | `ExportControls.tsx` 100% stmts / 92.85% branch | `exportCsv` method 100%

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
