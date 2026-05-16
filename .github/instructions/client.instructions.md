---
applyTo: "client/src/**"
---

# Client Code Conventions

These rules apply whenever GitHub Copilot reads or writes files under `client/src/`.

## Tech Stack (do not deviate without user approval)

- **UI**: React 18 + TypeScript (strict mode)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: lucide-react
- **Build**: Vite
- **Tests**: Vitest + @testing-library/react

## No Debug Statements

`console.log` is **forbidden** in all production source files.  
Use `console.error` only for genuine error boundaries if needed.

## TypeScript Strict Rules

- **No implicit `any`** — all variables, parameters, and return types must be explicitly typed or correctly inferred
- **No type assertions (`as X`)** without a justification comment explaining why it is safe
- **No `@ts-ignore` / `@ts-expect-error`** without a comment referencing a known issue
- All shared types live in `src/types.ts` — do not redefine existing types locally

## HTTP Calls — Single Entry Point

**All** API calls must go through `src/api.ts`.  
Never use inline `fetch()` calls inside components, pages, hooks, or contexts.

```typescript
// CORRECT
import { getLogs } from '../api';
const logs = await getLogs(token);

// FORBIDDEN
const logs = await fetch('/api/logs', { headers: { Authorization: `Bearer ${token}` } });
```

## Environment Variables

- Never hardcode API base URLs — use `import.meta.env.VITE_API_URL` or the configured base in `src/api.ts`
- Never commit `.env` files — use `.env.example` for documentation

## React Hooks Rules

- Follow the Rules of Hooks: no conditional hook calls, no hooks inside loops or nested functions
- Custom hooks must be prefixed with `use` and live in `src/hooks/`
- **Never duplicate auth state** — always consume `AuthContext` via `useContext(AuthContext)`
- **Never duplicate notification state** — always consume `NotificationContext`

## Component Structure

```
src/
  api.ts              — all HTTP calls, typed request/response
  types.ts            — all shared TypeScript interfaces and types
  App.tsx             — router setup, context providers
  main.tsx            — React DOM mount
  components/         — reusable, stateless-first UI components
  contexts/           — React Context providers (AuthContext, NotificationContext)
  hooks/              — custom React hooks (useNotificationScheduler, etc.)
  pages/              — route-level components (one per route)
  services/           — non-React business logic (notificationService, notificationStorage)
```

## State Management Rules

- Prefer local `useState` for UI-only state
- Use Context only for truly cross-cutting state (auth, notifications)
- Do not put derived data in state — compute it inline or with `useMemo`

## Accessibility (WCAG AA)

- All interactive elements must have an accessible label (`aria-label`, `aria-labelledby`, or visible text)
- Form inputs must have associated `<label>` elements
- Focus management must be logical after navigation and modal open/close
- Colour contrast must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)

## Forbidden

- Inline `fetch()` outside `src/api.ts`
- `console.log` statements
- `any` type without justification comment
- Hardcoded strings that should come from `import.meta.env.*`
- Direct DOM manipulation (`document.getElementById`, etc.) — use React refs
