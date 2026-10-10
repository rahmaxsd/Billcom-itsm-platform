import { createAction, props } from '@ngrx/store';
import { User } from '../../core/models';

export const login = createAction('[Auth] Login', props<{ email: string; password: string }>());
export const loginSuccess = createAction('[Auth] Login success', props<{ token: string; user: User }>());
export const loginFailure = createAction('[Auth] Login failure', props<{ error: string }>());
export const logout = createAction('[Auth] Logout');
