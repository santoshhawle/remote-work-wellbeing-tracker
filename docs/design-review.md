# Design Review: US-001 — Daily Check-in Reminder

**Jira Story:** [KAN-1](https://santoshhawle.atlassian.net/browse/KAN-1)
**Date:** 2026-05-15
**Author:** Design Reviewer
**Status:** Approved

---

## Review Summary

Architecture reviewed against `docs/requirements.md` (8 FRs, 1 NFR) and `docs/architecture.md` (Status: Draft → Reviewed).

| Severity | Found | Resolved | Accepted As-Is |
|----------|-------|----------|----------------|
| Critical | 0 | — | — |
| High | 4 | 4 | 0 |
| Medium | 4 | 4 | 0 |
| Low | 1 | 0 | 1 |
| Info | 1 | 0 | 1 |

All High and Medium findings resolved. Architecture approved for implementation.

---

## Findings & Resolutions

### High Findings

| ID | Area | Finding | Resolution | Status |
|----|------|---------|------------|--------|
| H-1 | Requirements Coverage / Error Handling | `notificationService.ts` is a plain module with no React Router access. The original sequence diagram showed `navigate("/checkin")` being called from the notification `onclick`, which is architecturally impossible from a non-React context. | Architecture updated: notification `onclick` uses `window.focus()` + `window.location.href = '/checkin'` instead of `navigate()`. This is the correct, safe mechanism from outside the React tree. | ✅ Resolved |
| H-2 | Requirements Coverage | `client/src/pages/CheckInPage.tsx` was not listed in the "New Files / Changes Summary" table despite FR-7 requiring it to call `markCheckedInToday(userId)` after a successful log submission. Implementers would have missed this change. | `CheckInPage.tsx` added to the changes table as a file to modify (FR-7 hook). | ✅ Resolved |
| H-3 | Data Integrity | When the user saves updated settings in `SettingsPage`, the running scheduler `setTimeout` held the old target time. No mechanism existed to cancel and reschedule on settings change. | `NotificationContext` now exposes an `updateSettings(settings)` function. `SettingsPage` calls this instead of writing directly to storage. The context cancels the current `setTimeout` and reschedules with the new settings. | ✅ Resolved |
| H-4 | Data Integrity / Security | `NotificationContext` mounts at app root before `AuthContext` completes its async rehydration from localStorage. If the scheduler read `user` during this window, `userId` would be `null`, producing an incorrect localStorage key `wbt_checkin_done_null_<date>`. | The scheduler hook now waits for `AuthContext.isLoading === false` and `user !== null` before reading any localStorage key or scheduling any timeout. | ✅ Resolved |

---

### Medium Findings

| ID | Area | Finding | Resolution | Status |
|----|------|---------|------------|--------|
| M-1 | Error Handling | The architecture stated the feature "degrades gracefully" when `Notification` is not in `window`, but did not define the UI behaviour. Implementers had no guidance on what to render. | Architecture updated: `SettingsPage` checks `'Notification' in window` on mount. If false, the opt-in toggle is rendered as disabled with an inline message: "Browser notifications are not supported in this browser." | ✅ Resolved |
| M-2 | Error Handling | `localStorage` throws `SecurityError` in Safari private mode and when storage quota is exceeded. Neither `notificationStorage.ts` nor any caller defined a strategy for these errors. | Architecture updated: all reads/writes in `notificationStorage.ts` are wrapped in `try/catch`. Reads return safe defaults on error (`{ enabled: false, time: '09:00' }`). Writes return a `success: boolean`. Callers can use this to surface UI feedback. | ✅ Resolved |
| M-3 | Data Integrity | The midnight-reset `setTimeout` may fire late or not at all if the device sleeps across midnight. The stale previous-day flag would then suppress the morning notification incorrectly. | Architecture updated: on scheduler initialisation (and after each timeout fires), the scheduler compares the date in the stored check-in flag key against today's local date. If stale, it is cleared before evaluating suppression logic. Design Decision D-6 added. | ✅ Resolved |
| M-4 | Compliance & Privacy | `wbt_notif_settings` was not keyed per user. A second user logging in on the same browser would inherit the previous user's opt-in state. | Architecture updated: settings key is now `wbt_notif_settings_<userId>`. `AuthContext.logout()` calls `notificationStorage.clearUserData(userId)` to remove all user-scoped keys. `AuthContext.tsx` added to changes table. | ✅ Resolved |

---

### Low / Info Findings (Accepted As-Is)

| ID | Area | Finding | Decision |
|----|------|---------|----------|
| L-1 | Error Handling | Negative `setTimeout` delay if app starts after reminder time. | Resolved as part of D-7 — negative delay clamped to tomorrow. Added to architecture as Decision D-7. |
| I-1 | Observability | No explicit toast/error feedback component specified for all failure modes. | Accepted: `M-2` resolution (success boolean return) provides the hook. Implementer to use existing UI patterns for inline error messages. No dedicated observability infrastructure warranted for a client-only feature. |

---

## Requirements Coverage Matrix

| Requirement | Addressed in Architecture | Notes |
|-------------|--------------------------|-------|
| FR-1 — Settings opt-in/out | ✅ | `SettingsPage` + `NotificationContext.updateSettings()` |
| FR-2 — Time picker | ✅ | `SettingsPage` time input → `notificationStorage` |
| FR-3 — Persistent settings | ✅ | `wbt_notif_settings_<userId>` in localStorage |
| FR-4 — Request permission on opt-in | ✅ | `notificationService.requestPermission()` called by `SettingsPage` |
| FR-5 — Scheduler fires at configured time | ✅ | `useNotificationScheduler` + `setTimeout` |
| FR-6 — Suppress if already checked in | ✅ | `isCheckedInToday(userId)` guard in scheduler |
| FR-7 — Mark checked-in in localStorage | ✅ | `CheckInPage.tsx` calls `markCheckedInToday(userId)` (H-2 fix) |
| FR-8 — Click navigates to Check-in | ✅ | `window.location.href = '/checkin'` in service (H-1 fix) |
| NFR-1 — Explicit permission required | ✅ | Permission requested only on user opt-in; opt-in reverted if denied |

---

## Sign-Off Checklist

- [x] All FRs covered in component diagram and changes table
- [x] All NFRs addressed in Security Approach section
- [x] All High findings resolved
- [x] All Medium findings resolved
- [x] No unresolved Critical findings
- [x] Null user guard specified (H-4)
- [x] Settings reactivity path defined (H-3)
- [x] Notification click navigation mechanism specified (H-1)
- [x] CheckInPage modification listed (H-2)
- [x] Unsupported browser degradation specified (M-1)
- [x] localStorage error handling specified (M-2)
- [x] Sleep/hibernate desync handled (M-3)
- [x] Settings keyed per user, cleared on logout (M-4)
- [x] Negative scheduler delay clamped (L-1 → D-7)
- [x] Architecture `docs/architecture.md` updated to Status: Reviewed

**Architecture approved for Step 4 — Implementation Planning.**
