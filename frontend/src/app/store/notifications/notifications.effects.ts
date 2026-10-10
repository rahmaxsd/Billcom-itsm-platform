import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, EMPTY, map, mergeMap, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import * as N from './notifications.actions';

@Injectable()
export class NotificationsEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(N.load),
      switchMap(() => this.api.notifications().pipe(
        map((items) => N.loaded({ items })),
        catchError(() => EMPTY),
      )),
    ));

  markRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(N.markRead),
      mergeMap(({ id }) => this.api.markRead(id).pipe(
        map(() => N.markReadDone({ id })),
        catchError(() => EMPTY),
      )),
    ));
}
