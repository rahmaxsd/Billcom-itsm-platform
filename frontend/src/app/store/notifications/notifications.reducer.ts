import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { AppNotification } from '../../core/models';
import * as N from './notifications.actions';
import { logout } from '../auth/auth.actions';

export interface NotificationsState { items: AppNotification[]; }

export const notificationsFeature = createFeature({
  name: 'notifications',
  reducer: createReducer<NotificationsState>(
    { items: [] },
    on(N.loaded, (_s, { items }) => ({ items })),
    on(N.received, (s, { item }) =>
      s.items.some((i) => i.id === item.id) ? s : { items: [item, ...s.items] }),
    on(N.markReadDone, (s, { id }) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
    })),
    on(N.clear, logout, () => ({ items: [] })),
  ),
  extraSelectors: ({ selectItems }) => ({
    selectUnread: createSelector(selectItems, (items) => items.filter((i) => !i.read).length),
  }),
});

export const { selectItems, selectUnread } = notificationsFeature;
