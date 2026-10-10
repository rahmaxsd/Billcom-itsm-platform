import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { createActionGroup, createFeature, createReducer, createSelector, emptyProps, on, props } from '@ngrx/store';
import { catchError, EMPTY, map, mergeMap, switchMap } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AppNotification } from '../core/models';
import { TicketsActions } from './tickets.store';

export const NotificationsActions = createActionGroup({
  source: 'Notifications',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ notifications: AppNotification[] }>(),
    'Received': props<{ notification: AppNotification }>(),
    'Mark Read': props<{ id: number }>(),
    'Mark Read Success': props<{ id: number }>(),
  },
});

interface NotificationsState {
  items: AppNotification[];
  lastReceived: AppNotification | null;
}

export const notificationsFeature = createFeature({
  name: 'notifications',
  reducer: createReducer<NotificationsState>(
    { items: [], lastReceived: null },
    on(NotificationsActions.loadSuccess, (state, { notifications }) => ({ ...state, items: notifications })),
    on(NotificationsActions.received, (state, { notification }) => ({
      lastReceived: notification,
      items: state.items.some(n => n.id === notification.id) ? state.items : [notification, ...state.items],
    })),
    on(NotificationsActions.markReadSuccess, (state, { id }) => ({
      ...state,
      items: state.items.map(n => (n.id === id ? { ...n, read: true } : n)),
    })),
  ),
});

export const selectUnreadCount = createSelector(
  notificationsFeature.selectItems,
  items => items.filter(n => !n.read).length,
);

export const loadNotifications = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(NotificationsActions.load),
      switchMap(() =>
        api.notifications().pipe(
          map(notifications => NotificationsActions.loadSuccess({ notifications })),
          catchError(() => EMPTY),
        ),
      ),
    ),
  { functional: true },
);

export const markRead = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(NotificationsActions.markRead),
      mergeMap(({ id }) =>
        api.markRead(id).pipe(
          map(() => NotificationsActions.markReadSuccess({ id })),
          catchError(() => EMPTY),
        ),
      ),
    ),
  { functional: true },
);

/** Une notification reçue signifie qu'un ticket a changé : on recharge la liste affichée. */
export const refreshOnNotification = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(NotificationsActions.received),
      map(() => TicketsActions.refresh()),
    ),
  { functional: true },
);
