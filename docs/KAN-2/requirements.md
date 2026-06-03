# Requirements: Export Wellbeing Logs as CSV

**Story ID:** KAN-2
**Date:** 2026-05-18
**Author:** Jira Requirements Capture
**Status:** Approved

---

## Overview

Authenticated users need the ability to export their personal wellbeing log entries as a CSV file directly from the Dashboard. The export must be scoped strictly to the requesting user's data, support a configurable date range, and be downloadable via the browser.

---

## Scope

### In Scope
- New `GET /api/logs/export` server endpoint returning a CSV file download
- "Export" button added to the Dashboard page
- Date range selector (Last 7 / 30 / 90 days, custom range)
- CSV columns: `date`, `mood`, `energy`, `focus`, `notes`, `work_hours`, `name`, `email`
- Authentication enforcement — users can only export their own data
- Row cap of 1,000 records (most recent returned if exceeded)
- Empty-range export returns a headers-only CSV (no error)

### Out of Scope
- Admin/manager bulk exports across multiple users
- PDF or Excel export formats
- Scheduled/automated exports (e.g. email delivery)
- Export of data from other SDLC pipeline stories

---

## Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | An "Export" button on the Dashboard page triggers a CSV download of the authenticated user's wellbeing logs |
| FR-2 | Before exporting, the user can select a date range: **Last 7 days**, **Last 30 days**, **Last 90 days**, or a **custom date range** |
| FR-3 | The exported CSV must include the following columns in order: `date`, `mood`, `energy`, `focus`, `notes`, `work_hours`, `name`, `email` |
| FR-4 | A new server endpoint `GET /api/logs/export` returns a CSV file with the header `Content-Disposition: attachment; filename="wellbeing-logs.csv"` |
| FR-5 | The export is scoped strictly to the authenticated user — no cross-user data may appear in the response |
| FR-6 | Export is capped at 1,000 rows; if the date range contains more records, the most recent 1,000 are returned |
| FR-7 | If no logs exist for the selected date range, the endpoint returns a valid CSV file containing only the header row (no error, no empty body) |

---

## Non-Functional Requirements

| ID    | Category       | Requirement |
|-------|----------------|-------------|
| NFR-1 | Security       | The `GET /api/logs/export` endpoint must require a valid auth token; unauthenticated requests must receive `HTTP 401` |
| NFR-2 | Security       | Data isolation must be enforced server-side; client-supplied user IDs must not be trusted for scoping |
| NFR-3 | Performance    | Export response must be generated within 2 seconds for up to 1,000 rows |
| NFR-4 | Accessibility  | The Export button and date range selector must follow WCAG 2.1 AA guidelines (keyboard navigable, labelled) |
| NFR-5 | Compatibility  | The downloaded CSV must open correctly in Microsoft Excel, Google Sheets, and LibreOffice Calc |

---

## Acceptance Criteria

- [ ] **AC-1:** Clicking the "Export" button on the Dashboard downloads a file with a `.csv` extension
- [ ] **AC-2:** The CSV file contains the header row: `date,mood,energy,focus,notes,work_hours,name,email`
- [ ] **AC-3:** Rows in the CSV match only the logs within the selected date range for the authenticated user
- [ ] **AC-4:** Selecting a custom date range filters the exported records to only that range
- [ ] **AC-5:** Exporting when no logs exist in the selected range produces a headers-only CSV (no error state, no empty body)
- [ ] **AC-6:** A request to `GET /api/logs/export` without a valid auth token receives `HTTP 401`
- [ ] **AC-7:** The exported CSV contains no records belonging to any user other than the authenticated requestor

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Existing `authenticate` middleware (`server/src/middleware/auth.ts`) | Internal | Reused for endpoint authentication |
| Existing wellbeing logs database table/schema | Internal | Source data for export |
| `GET /api/logs` route pattern | Internal | New export route follows existing logs route conventions |
| Dashboard page (`client/src/pages/DashboardPage.tsx`) | Internal | UI entry point for export trigger |

---

## Edge Cases & Assumptions

| # | Edge Case / Assumption |
|---|------------------------|
| 1 | If the selected date range exceeds 1,000 rows, the most recent 1,000 records are returned without error; no pagination is required |
| 2 | Empty date range (no logs) returns a valid headers-only CSV — the client does not show an error |
| 3 | The `notes` field may contain commas and newlines; the CSV encoder must properly quote such fields |
| 4 | Date values in the CSV are formatted as `YYYY-MM-DD` (ISO 8601) |
| 5 | The custom date range is inclusive of both the start and end dates |
| 6 | Server uses the authenticated user's identity from the JWT token — the client does not pass a user ID in the query |
| 7 | The feature is not available to unauthenticated users; no guest export is supported |

---

## Definition of Done

- [ ] `GET /api/logs/export` endpoint implemented, authenticated, and returns valid CSV
- [ ] Date range filtering (Last 7 / 30 / 90 / custom) works correctly
- [ ] "Export" button and date range selector added to the Dashboard page
- [ ] All 7 Acceptance Criteria (AC-1 through AC-7) pass
- [ ] Unit tests added for the export endpoint (happy path + at least two edge cases)
- [ ] Unit tests added for the client-side export trigger
- [ ] No `console.log` or debug statements in production code
- [ ] Linting passes with no errors
- [ ] `docs/requirements.md` committed and status set to `Approved`
