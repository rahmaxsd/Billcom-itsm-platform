import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ROLE_LABEL, Role, User, errorMessage } from '../core/models';

@Component({
  selector: 'app-users',
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <section class="page-head"><div><h1>Utilisateurs</h1>
      <p class="muted">{{ users().length }} compte(s)</p></div></section>

    <div class="two-col wide-left">
      <section class="card">
        <div class="table-wrap">
          <table class="tickets">
            <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Créé le</th></tr></thead>
            <tbody>
              @for (u of users(); track u.id) {
                <tr>
                  <td>{{ u.fullName }}</td><td>{{ u.email }}</td>
                  <td><span class="chip">{{ roleLabel[u.role] }}</span></td>
                  <td>{{ u.createdAt | date: 'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <form class="card form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h2>Créer un compte</h2>
        <label for="fullName">Nom complet</label>
        <input id="fullName" formControlName="fullName" />
        <label for="email">Adresse e-mail</label>
        <input id="email" type="email" formControlName="email" />
        <label for="password">Mot de passe (8 caractères minimum)</label>
        <input id="password" type="password" formControlName="password" autocomplete="new-password" />
        <label for="role">Rôle</label>
        <select id="role" formControlName="role">
          @for (r of roles; track r) { <option [value]="r">{{ roleLabel[r] }}</option> }
        </select>

        @if (error()) { <p class="alert" role="alert">{{ error() }}</p> }
        @if (done()) { <p class="ok" role="status">{{ done() }}</p> }
        <button class="btn primary block" type="submit" [disabled]="saving()">Créer le compte</button>
      </form>
    </div>
  `,
})
export class UsersComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly roleLabel = ROLE_LABEL;
  readonly roles: Role[] = ['USER', 'TECHNICIAN', 'ADMIN'];
  readonly users = signal<User[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly done = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: this.fb.nonNullable.control<Role>('USER'),
  });

  ngOnInit(): void { this.reload(); }

  private reload(): void {
    this.api.users().subscribe({ next: u => this.users.set(u), error: e => this.error.set(errorMessage(e)) });
  }

  submit(): void {
    this.error.set(null);
    this.done.set(null);
    if (this.form.invalid) {
      this.error.set('Vérifiez les champs : nom, e-mail valide et mot de passe de 8 caractères minimum.');
      return;
    }
    this.saving.set(true);
    this.api.createUser(this.form.getRawValue()).subscribe({
      next: u => {
        this.saving.set(false);
        this.done.set(`Compte créé pour ${u.fullName}.`);
        this.form.reset({ fullName: '', email: '', password: '', role: 'USER' });
        this.reload();
      },
      error: e => {
        this.saving.set(false);
        this.error.set(errorMessage(e));
      },
    });
  }
}
