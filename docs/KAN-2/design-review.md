# Design Review: Export Wellbeing Logs as CSV

**Story ID:** KAN-2
**Date:** 2026-05-18
**Author:** Design Reviewer
**Status:** Approved

---

## Review Scope

| Document Reviewed | Version |
|-------------------|---------|
| `docs/architecture.md` | commit 9798f96 |
| `docs/requirements.md` | commit 2f22559 |

---

## Findings

| # | Area | Finding | Severity | Resolution |
|---|------|---------|----------|-----------|
| F-1 | Error Handling | No client-side error state defined for a failed export (server 500, network timeout). `ExportControls` had no `catch` path — the user would silently receive nothing. | **High** | **Fixed** — `ExportControls` wraps `api.logs.exportCsv()` in `try/catch`; renders inline error message on failure; re-enables Export button in `finally` block. Added to architecture as D-6. |
| F-2 | Error Handling | No server-side `try/catch` around the export route handler. A DB failure would propagate to the global error handler and potentially leak stack trace details. | **High** | **Fixed** — Route handler wrapped in `try/catch`; errors logged server-side; response is `500 { error: 'Export failed' }` with no stack trace forwarded. Added to architecture as D-6. |
| F-3 | Security | Custom date range validation does not address `start > end`. Produces empty SQL result silently instead of a `400`. | **Medium** | **Deferred** — Noted in implementation plan; implementer must validate `start <= end` and return `400`. |
| F-4 | Security | Behaviour when both `?days=N` and `?start=&end=` are provided simultaneously is unspecified. | **Medium** | **Deferred** — Noted in implementation plan; `start`/`end` takes precedence when both are present. |
| F-5 | Compatibility | No UTF-8 BOM (`\uFEFF`). Microsoft Excel on Windows will display non-ASCII `notes` as mojibake without it. | **Medium** | **Deferred** — Noted in implementation plan; implementer must prepend BOM to CSV response. |
| F-6 | Accessibility | WCAG 2.1 AA requirements for `ExportControls` not enumerated in architecture. | **Medium** | **Deferred** — Noted in implementation plan: `aria-label` on button, `<label>` on date inputs, keyboard-accessible date picker. |
| F-7 | Observability | No server-side logging specified for the export endpoint. | **Medium** | **Deferred** — Noted in implementation plan; implementer logs `[export] user=<id> rows=<n>` on success and `[export] error=<msg>` on failure. |
| F-8 | Memory Leak | `URL.createObjectURL` used without a corresponding `URL.revokeObjectURL`. Object URLs persist until page unload. | **Medium** | **Deferred** — Noted in implementation plan; `revokeObjectURL` must be called after the download anchor click. |
| F-9 | Simplification | Architecture proposes a DB JOIN to obtain `name`/`email`, but these are already available in `req.user` from the JWT payload, making the JOIN unnecessary. | **Medium** | **Deferred** — Noted in implementation plan; use `req.user.name` and `req.user.email` directly; no JOIN required. |
| F-10 | Compliance | No audit trail for personal data exports (GDPR Article 30 recommendation). | **Low** | **Accepted / Deferred** — Out of scope for this story; recommended as a future audit-logging story. |
| F-11 | Testability | Direct `db` import in route handlers limits unit test isolation. | **Low** | **Accepted** — Existing tests use an in-memory DB fixture pattern which is sufficient; no architecture change needed. |

---

## Summary

| Severity | Count | Fixed | Deferred / Accepted |
|----------|-------|-------|---------------------|
| Critical | 0 | — | — |
| High | 2 | 2 | 0 |
| Medium | 7 | 0 | 7 |
| Low | 2 | 0 | 2 |

All **Critical** and **High** findings are resolved. Architecture may proceed to implementation.

---

## Architecture Changes Made

The following changes were applied to `docs/architecture.md` as a result of this review:

- **Status** updated from `Draft` → `Reviewed`
- **D-6 added** — Explicit error handling for client (`ExportControls` try/catch + inline error UI) and server (route `try/catch` + `500` response, no stack trace leak)

---

## Deferred Items for Implementation Plan

The following medium/low findings are not architecture blockers but **must be addressed during implementation**:

1. **F-3** — Validate `start <= end`; return `400` if violated
2. **F-4** — When both `?days` and `?start`/`?end` provided, `start`/`end` takes precedence
3. **F-5** — Prepend UTF-8 BOM (`\uFEFF`) to CSV response body
4. **F-6** — `aria-label` on Export button; `<label>` on date inputs; keyboard-accessible date picker
5. **F-7** — Log `[export] user=<id> rows=<n>` on success; `[export] error=<msg>` on failure
6. **F-8** — Call `URL.revokeObjectURL(url)` after triggering the download anchor click
7. **F-9** — Use `req.user.name` / `req.user.email` from JWT payload; remove DB JOIN

---

## Sign-off Checklist

- [x] All Critical findings resolved
- [x] All High findings resolved
- [x] Architecture document updated (Status: Reviewed)
- [x] Deferred items captured for implementation plan
- [x] Design review document committed
- [x] User approved proceeding to implementation planning
