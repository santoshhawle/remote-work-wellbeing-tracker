import type {
  AuthResponse,
  CalendarResponse,
  CreateLogData,
  RegisterData,
  Suggestion,
  TeamInsights,
  User,
  WellbeingLog,
} from './types';

const BASE = '/api';

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = localStorage.getItem('wbt_token');

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data: unknown = await res.json();

  if (!res.ok) {
    // Auto-clear stale token on 401
    if (res.status === 401) {
      localStorage.removeItem('wbt_token');
      localStorage.removeItem('wbt_user');
      window.location.href = '/login';
    }
    throw new Error((data as { error?: string }).error ?? 'Request failed');
  }

  return data as T;
}

// ─── Exported API surface ─────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>('POST', '/auth/login', { email, password }),
    register: (data: RegisterData) =>
      request<AuthResponse>('POST', '/auth/register', data),
  },

  logs: {
    getToday: () => request<WellbeingLog | null>('GET', '/logs/today'),
    getAll: (days = 30) =>
      request<WellbeingLog[]>('GET', `/logs?days=${days}`),
    create: (data: CreateLogData) =>
      request<WellbeingLog>('POST', '/logs', data),
  },

  suggestions: {
    get: () => request<Suggestion[]>('GET', '/suggestions'),
  },

  team: {
    getInsights: (days = 30) =>
      request<TeamInsights>('GET', `/team/insights?days=${days}`),
  },

  calendar: {
    getSuggestions: () =>
      request<CalendarResponse>('GET', '/calendar/suggestions'),
  },

  health: {
    check: () => request<{ status: string }>('GET', '/health'),
  },
} as const;

// Helper – strip stored auth
export function clearAuth() {
  localStorage.removeItem('wbt_token');
  localStorage.removeItem('wbt_user');
}

// Helper – store user (called by AuthContext)
export function storeAuth(token: string, user: User) {
  localStorage.setItem('wbt_token', token);
  localStorage.setItem('wbt_user', JSON.stringify(user));
}
