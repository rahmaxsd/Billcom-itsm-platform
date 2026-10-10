import { createAction, props } from '@ngrx/store';
import { AppNotification } from '../../core/models';

export const load = createAction('[Notifications] Load');
export const loaded = createAction('[Notifications] Loaded', props<{ items: AppNotification[] }>());
export const received = createAction('[Notifications] Received', props<{ item: AppNotification }>());
export const markRead = createAction('[Notifications] Mark read', props<{ id: number }>());
export const markReadDone = createAction('[Notifications] Mark read done', props<{ id: number }>());
export const clear = createAction('[Notifications] Clear');
