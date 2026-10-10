import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import {
  loadNotifications, markRead, notificationsFeature, refreshOnNotification,
} from './store/notifications.store';
import {
  assignTicket, changeStatus, loadTickets, refreshTickets, takeTicket, ticketsFeature,
} from './store/tickets.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore(),
    provideState(ticketsFeature),
    provideState(notificationsFeature),
    provideEffects({
      loadTickets, refreshTickets, changeStatus, takeTicket, assignTicket,
      loadNotifications, markRead, refreshOnNotification,
    }),
  ],
};
