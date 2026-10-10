import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, createActionGroup, createFeature, createReducer, emptyProps, on, props } from '@ngrx/store';
import { catchError, filter, map, of, switchMap, withLatestFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Ticket, TicketScope, TicketStatus, errorMessage } from '../core/models';

export const TicketsActions = createActionGroup({
  source: 'Tickets',
  events: {
    'Load': props<{ scope: TicketScope }>(),
    'Refresh': emptyProps(),
    'Load Success': props<{ tickets: Ticket[] }>(),
    'Load Failure': props<{ error: string }>(),
    'Change Status': props<{ id: number; status: TicketStatus }>(),
    'Take': props<{ id: number }>(),
    'Assign': props<{ id: number; technicianId: number }>(),
    'Update Success': props<{ ticket: Ticket }>(),
    'Action Failure': props<{ error: string }>(),
  },
});

interface TicketsState {
  items: Ticket[];
  scope: TicketScope | null;
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = { items: [], scope: null, loading: false, error: null };

export const ticketsFeature = createFeature({
  name: 'tickets',
  reducer: createReducer(
    initialState,
    on(TicketsActions.load, (state, { scope }): TicketsState => ({
      ...state,
      scope,
      items: state.scope === scope ? state.items : [],
      loading: state.scope !== scope || state.items.length === 0,
      error: null,
    })),
    on(TicketsActions.loadSuccess, (state, { tickets }): TicketsState => ({ ...state, items: tickets, loading: false })),
    on(TicketsActions.loadFailure, TicketsActions.actionFailure, (state, { error }): TicketsState => ({
      ...state, loading: false, error,
    })),
    on(TicketsActions.updateSuccess, (state, { ticket }): TicketsState => ({
      ...state,
      error: null,
      items: state.items.map(t => (t.id === ticket.id ? ticket : t)),
    })),
  ),
});

export const loadTickets = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(TicketsActions.load),
      switchMap(({ scope }) =>
        api.tickets(scope).pipe(
          map(tickets => TicketsActions.loadSuccess({ tickets })),
          catchError(e => of(TicketsActions.loadFailure({ error: errorMessage(e) }))),
        ),
      ),
    ),
  { functional: true },
);

export const refreshTickets = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(TicketsActions.refresh),
      withLatestFrom(store.select(ticketsFeature.selectScope)),
      filter(([, scope]) => scope !== null),
      map(([, scope]) => TicketsActions.load({ scope: scope as TicketScope })),
    ),
  { functional: true },
);

export const changeStatus = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(TicketsActions.changeStatus),
      switchMap(({ id, status }) =>
        api.changeStatus(id, status).pipe(
          map(ticket => TicketsActions.updateSuccess({ ticket })),
          catchError(e => of(TicketsActions.actionFailure({ error: errorMessage(e) }))),
        ),
      ),
    ),
  { functional: true },
);

export const takeTicket = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(TicketsActions.take),
      switchMap(({ id }) =>
        api.take(id).pipe(
          map(ticket => TicketsActions.updateSuccess({ ticket })),
          catchError(e => of(TicketsActions.actionFailure({ error: errorMessage(e) }))),
        ),
      ),
    ),
  { functional: true },
);

export const assignTicket = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(TicketsActions.assign),
      switchMap(({ id, technicianId }) =>
        api.assign(id, technicianId).pipe(
          map(ticket => TicketsActions.updateSuccess({ ticket })),
          catchError(e => of(TicketsActions.actionFailure({ error: errorMessage(e) }))),
        ),
      ),
    ),
  { functional: true },
);
