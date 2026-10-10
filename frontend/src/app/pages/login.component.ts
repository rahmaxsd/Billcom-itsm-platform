import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errorMessage } from '../core/models';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <main class="login">
      <section class="login-side" aria-hidden="true">
        <p class="brand-mark">Billcom <span>ITSM</span></p>
        <h2>Chaque demande a un propriétaire et un état.</h2>
        <p>Créez un ticket, suivez son avancement, recevez une notification dès qu'il change.</p>
      </section>

      <section class="login-card">
        <h1>Connexion</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label for="email">Adresse e-mail</label>
          <input id="email" type="email" formControlName="email" autocomplete="username" />

          <label for="password">Mot de passe</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />

          @if (error()) { <p class="alert" role="alert">{{ error() }}</p> }

          <button class="btn primary block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>
        <p class="hint">Compte de démonstration : admin&#64;billcom.com</p>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.error.set('Saisissez votre e-mail et votre mot de passe.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl(this.auth.homeUrl()),
      error: e => {
        this.loading.set(false);
        this.error.set(errorMessage(e));
      },
    });
  }
}
