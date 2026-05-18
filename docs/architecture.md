# Architecture: Export Wellbeing Logs as CSV

**Story ID:** KAN-2
**Date:** 2026-05-18
**Author:** Architecture Designer
**Status:** Draft

---

## 1. Architecture Style

**Retained: Monolithic MVC (Express REST API + React SPA)**

The existing application is a single Express server (MVC pattern) backed by SQLite, consumed by a React/Vite SPA. The export feature is a pure additive slice — a new route on the existing logs router plus new UI on the Dashboard. There is no justification for introducing a separate service, queue, or serverless function for a synchronous, sub-1,000-row, single-user download. Staying in the monolith eliminates deployment complexity and reuses all existing middleware.

---

## 2. Component Diagram

```mermaid
graph TD
    subgraph Browser["Browser (React SPA)"]
        A[DashboardPage.tsx]
        B[ExportControls component]
        C[api.logs.exportCsv()]
        D[BlobDownloader utility]
    end

    subgraph Server["Express Server"]
        E[GET /api/logs/export]
        F[authenticate middleware]
        G[ExportQueryValidator]
        H[LogsRepository — SQLite query]
        I[csvSerialize helper]
    end

    subgraph DB["SQLite — wellbeing.db"]
        J[(wellbeing_logs)]
        K[(users)]
    end

    A --> B
    B -->|date range selection| C
    C -->|fetch + Bearer token| E
    E --> F
    F -->|req.user.id| G
    G --> H
    H -->|JOIN users| J
    H --> K
    H --> I
    I -->|CSV string| E
    E -->|Content-Disposition: attachment| D
    D -->|URL.createObjectURL| A
```

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Client framework | React 18 + TypeScript (Vite) | Already in use; no new dependency |
| Client HTTP | `fetch` + `Blob` + `URL.createObjectURL` | Keeps JWT in `Authorization` header; avoids exposing token in URL query string |
| Client UI | Tailwind CSS + existing component patterns | Consistent look; no new UI library |
| Server framework | Express 5 + TypeScript | Already in use |
| Server auth | Existing `authenticate` JWT middleware | Reuse; zero new code for auth |
| CSV serialization | Inline RFC 4180 encoder (no new npm package) | Fixed 8-column schema; no dependency overhead; correctly handles `notes` with commas/newlines |
| Database | Node.js 22 built-in `node:sqlite` | Already in use; `LIMIT`/`ORDER BY` for row cap |
| Rate limiting | Existing global `express-rate-limit` (200 req / 15 min) | Already covers the new endpoint |

---

## 4. Data Flow

```mermaid
sequenceDiagram
    actor User
    participant Dashboard as DashboardPage
    participant ExportControls
    participant API as api.logs.exportCsv()
    participant Server as GET /api/logs/export
    participant Auth as authenticate middleware
    participant DB as SQLite

    User->>Dashboard: Clicks "Export" button
    Dashboard->>ExportControls: Opens date range selector
    User->>ExportControls: Selects range (e.g. Last 30 days)
    ExportControls->>API: exportCsv({ days: 30 })
    API->>Server: GET /api/logs/export?days=30\nAuthorization: Bearer <token>
    Server->>Auth: Validate JWT
    Auth-->>Server: req.user = { id, email, name }
    Server->>Server: Validate & sanitise query params
    Server->>DB: SELECT logs JOIN users WHERE user_id=? AND date>=? ORDER BY date DESC LIMIT 1000
    DB-->>Server: rows[]
    Server->>Server: csvSerialize(rows)
    Server-->>API: 200 text/csv\nContent-Disposition: attachment; filename="wellbeing-logs.csv"
    API->>API: response.blob() → URL.createObjectURL
    API->>Dashboard: Triggers anchor click → browser download
    Dashboard-->>User: wellbeing-logs.csv downloaded
```

---

## 5. External Services

No external services are required. This feature is entirely self-contained.

| Category | Service | Notes |
|----------|---------|-------|
| Auth provider | JWT (self-signed, existing) | No third-party IdP |
| Storage | Local SQLite file (`data/wellbeing.db`) | No cloud DB |
| Push / notifications | None | N/A |
| CSV library | None (inline encoder) | No third-party package |

---

## 6. Security Approach

| Concern | Approach |
|---------|----------|
| Authentication | `authenticate` middleware on the new route — identical to all other `/api/logs/*` routes; returns `401` if token missing or invalid |
| Authorization / data isolation | `WHERE user_id = req.user!.id` — user identity always sourced from the verified JWT payload, never from query parameters |
| Input validation | `start` / `end` date params validated against `/^\d{4}-\d{2}-\d{2}$/` regex before use in SQL; `days` param clamped to `[1, 365]` (integer) |
| SQL injection | Parameterised queries via `db.prepare(...).all(userId, ...)` — no string interpolation |
| CSV injection | Fields beginning with `=`, `+`, `-`, or `@` are prefixed with a tab character to neutralise spreadsheet formula injection |
| Token exposure | JWT sent in `Authorization: Bearer` header only — never in the URL (avoids server logs / referrer leakage) |
| Rate limiting | Existing global limiter (200 req / 15 min) covers the export endpoint |
| Secrets | `JWT_SECRET` already loaded from `process.env`; no new secrets introduced |

---

## 7. Key Design Decisions

### D-1: Extend `server/src/routes/logs.ts` (not a new file)

**Rationale:** Export is logically a read variant of the logs resource. Co-locating it with other log routes keeps cohesion. The entire route file is already `router.use(authenticate)`-protected.

**Trade-off:** Slightly longer file — acceptable; still under ~120 lines after the addition.

---

### D-2: `fetch` + `Blob` download on the client (not `<a href>` with token in URL)

**Rationale:** Embedding a JWT in a URL query string exposes it in browser history, server access logs, and referrer headers. Using `fetch` keeps the token in the `Authorization` header.

**Trade-off:** Slightly more client code than `window.open`; however, this is the only secure approach.

---

### D-3: Inline RFC 4180 CSV encoder (no `csv-stringify` dependency)

**Rationale:** The schema is fixed at 8 known columns. A ~10-line function correctly handles quoting and newline escaping inside the `notes` field. Adding an npm dependency for this is unnecessary.

**Trade-off:** Manual encoder must be unit-tested. If the schema grows significantly, migrating to `csv-stringify` later is straightforward.

---

### D-4: Date range via query params `?days=N` (preset) or `?start=&end=` (custom)

**Rationale:** Mirrors the existing `GET /api/logs?days=30` pattern. Presets cover the majority of use cases; custom covers the rest. Both are validated server-side before reaching the database.

**Trade-off:** Two distinct param shapes require a small branching validation block, but this is simple and explicit.

---

### D-5: `LIMIT 1000 ORDER BY date DESC` enforced in SQL

**Rationale:** Pushing the row cap into the query is the most efficient approach — the database does the work without materialising the full result set in Node.js memory.

**Trade-off:** Users are silently capped without a warning in v1. A `X-Export-Truncated: true` response header is noted as a future enhancement.
