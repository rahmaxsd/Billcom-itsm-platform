import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { homeFor } from '../../core/routing';
import * as A from './auth.actions';
import { clearSession, saveSession } from './auth.reducer';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.login),
      switchMap(({ email, password }) =>
        this.api.login(email, password).pipe(
          map((r) => A.loginSuccess({ token: r.token, user: r.user })),
          catchError((e: HttpErrorResponse) =>
            of(A.loginFailure({
              error: e.status === 401 ? 'Email ou mot de passe incorrect' : 'Serveur injoignable, réessayez',
            }))),
        )),
    ));

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.loginSuccess),
      tap(({ token, user }) => {
        saveSession(token, user);
        this.router.navigateByUrl(homeFor(user.role));
      }),
    ), { dispatch: false });

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.logout),
      tap(() => {
        clearSession();
        this.router.navigateByUrl('/login');
      }),
    ), { dispatch: false });
}
