import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoginResponse, Role, User } from './models';

const TOKEN_KEY = 'itsm_token';
const USER_KEY = 'itsm_user';

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
  } catch { /* stockage indisponible */ }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(read(TOKEN_KEY));
  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => !!this.token() && !!this.user());
  readonly role = computed<Role | null>(() => this.user()?.role ?? null);

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        write(TOKEN_KEY, res.token);
        write(USER_KEY, JSON.stringify(res.user));
        this.token.set(res.token);
        this.user.set(res.user);
      }),
    );
  }

  logout(): void {
    write(TOKEN_KEY, null);
    write(USER_KEY, null);
    this.token.set(null);
    this.user.set(null);
    this.router.navigateByUrl('/login');
  }

  homeUrl(): string {
    switch (this.role()) {
      case 'ADMIN': return '/admin';
      case 'TECHNICIAN': return '/work';
      default: return '/tickets';
    }
  }

  private readUser(): User | null {
    const raw = read(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as User; } catch { return null; }
  }
}
