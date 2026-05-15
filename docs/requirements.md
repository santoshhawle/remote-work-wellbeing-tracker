# Requirements: US-001 — Daily Check-in Reminder

**Jira Story:** [KAN-1](https://santoshhawle.atlassian.net/browse/KAN-1)
**Type:** Story
**Priority:** High
**Date Captured:** 2026-05-15
**Author:** Jira Requirements Capture
**Status:** Approved

---

## Overview

Remote team members need a reliable daily reminder to log their wellbeing so they build a consistent check-in habit. This story delivers a browser-based notification system with a user-configurable preferred time, controlled from a new Settings page. The scheduler runs client-side and suppresses notifications on days when the user has already checked in.

## Scope

### In Scope
- New Settings page with a notification opt-in/out toggle and preferred time picker
- Client-side scheduler (setTimeout/setInterval) to fire notifications at the configured time
- Check-in detection via localStorage flag (set when user checks in, cleared at midnight)
- Browser Notification API integration (permission requested on opt-in)
- Clicking the notification navigates directly to the Check-in page
- Suppression logic: no notification fires if the user has already checked in today
- Reminder time resolved using the user's local browser timezone

### Out of Scope
- Service Worker / true background push (works only while the browser tab is open)
- Server-side or FCM push notifications
- Email or SMS reminders
- Timezone configuration UI (browser timezone is used automatically)

## Functional Requirements

| # | Requirement | Source |
|---|-------------|--------|
| FR-1 | A new Settings page shall allow the user to opt in or out of daily check-in reminders | Jira / Clarification |
| FR-2 | The Settings page shall provide a time picker for the user's preferred reminder time (e.g., 9:00 AM) | Jira |
| FR-3 | Notification preferences (opt-in status and preferred time) shall persist across browser sessions | Clarification |
| FR-4 | The system shall request browser notification permission when the user opts in for the first time | Jira |
| FR-5 | A client-side scheduler shall fire a browser notification at the user's configured time, based on the local browser timezone | Jira / Clarification |
| FR-6 | No notification shall be fired if the user has already checked in on the current day | Jira |
| FR-7 | Check-in status for the current day shall be tracked via localStorage (set on check-in, cleared at midnight) | Clarification |
| FR-8 | Clicking the browser notification shall navigate the user to the Check-in page | Jira |

## Non-Functional Requirements

| # | Requirement | Category |
|---|-------------|----------|
| NFR-1 | Notification permission must be explicitly granted by the user before any notification is sent | Privacy / Security |

## Acceptance Criteria

- [ ] User can opt in to daily reminders from the Settings page; browser permission is requested on first opt-in
- [ ] User can opt out of daily reminders from the Settings page; no further notifications are sent
- [ ] User can choose their preferred reminder time via a time picker on the Settings page
- [ ] A browser notification fires at the configured time if the user has not yet checked in that day
- [ ] Clicking the notification navigates directly to the Check-in page
- [ ] No notification is sent if the user has already checked in today
- [ ] Settings persist after page refresh and re-login

## Dependencies

- Existing Check-in page (`/check-in` route) must be in place for notification deep-link
- Browser must support the Notifications API (graceful degradation required for unsupported browsers)

## Edge Cases & Assumptions

- If the user has not yet granted notification permission and opts in, the browser permission dialog is shown; if denied, the opt-in is reverted and the user is informed
- If the browser tab is closed at the scheduled time, no notification fires (client-side only — this is a known limitation, documented in scope)
- The localStorage flag is keyed per user per day (e.g., `checkin_done_<userId>_<YYYY-MM-DD>`) to avoid cross-user collisions on shared devices
- If the user changes their preferred time after the scheduled time has already passed for today, the next notification fires tomorrow at the new time
- Midnight reset of the localStorage check-in flag uses a client-side timeout scheduled to the next midnight

## Definition of Done

- All Acceptance Criteria pass via manual QA
- New Settings page is accessible from the main navigation
- No regressions on the existing Check-in page
