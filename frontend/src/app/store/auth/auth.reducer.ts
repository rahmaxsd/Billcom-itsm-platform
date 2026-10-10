import { createFeature, createReducer, on } from '@ngrx/store';
import { User } from '../../core/models';
import * as A from './auth.actions';

export interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const KEY = 'itsm.session';

export function loadSession(): { token: string; user: User } | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function saveSession(token: string, user: User) {
  try { localStorage.setItem(KEY, JSON.stringify({ token, user })); } catch { /* ignore */ }
}
export function clearSession() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

const saved = loadSession();
const initialState: AuthState = {
  token: saved?.token ?? null,
  user: saved?.user ?? null,
  loading: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(A.login, (s) => ({ ...s, loading: true, error: null })),
    on(A.loginSuccess, (s, { token, user }) => ({ ...s, token, user, loading: false, error: null })),
    on(A.loginFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(A.logout, () => ({ token: null, user: null, loading: false, error: null })),
  ),
});

export const { selectToken, selectUser, selectLoading, selectError } = authFeature;
