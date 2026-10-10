import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ROLE_LABEL } from '../core/models';
import { RealtimeService } from '../core/realtime.service';
import {
  NotificationsActions, notificationsFeature, selectUnreadCount,
} from '../store/notifications.store';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  template: `
    <header class="topbar">
      <a class="brand" routerLink="/">Billcom <span>ITSM</span></a>

      <nav aria-label="Navigation principale">
        <a routerLink="/tickets" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Mes tickets</a>
        <a routerLink="/tickets/new" routerLinkActive="active">Nouveau ticket</a>
        @if (role() === 'TECHNICIAN' || role() === 'ADMIN') {
          <a routerLink="/work" routerLinkActive="active">Assignés à moi</a>
        }
        @if (role() === 'ADMIN') {
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Tableau de bord</a>
          <a routerLink="/admin/tickets" routerLinkActive="active">Tous les tickets</a>
          <a routerLink="/admin/users" routerLinkActive="active">Utilisateurs</a>
        }
      </nav>

      <div class="who">
        <div class="bell-wrap">
          <button class="bell" type="button" (click)="panelOpen.set(!panelOpen())"
                  [attr.aria-expanded]="panelOpen()" aria-label="Notifications">
            Notifications
            @if (unread() > 0) { <span class="badge">{{ unread() }}</span> }
          </button>
          @if (panelOpen()) {
            <div class="panel" role="dialog" aria-label="Notifications">
              @for (n of notifications(); track n.id) {
                <button type="button" class="note" [class.unread]="!n.read" (click)="markRead(n.id)">
                  <span>{{ n.message }}</span>
                  <small>{{ n.createdAt | date: 'dd/MM HH:mm' }}</small>
                </button>
              } @empty {
                <p class="muted pad">Aucune notification.</p>
              }
            </div>
          }
        </div>
        <div class="me">
          <strong>{{ user()?.fullName }}</strong>
          <small>{{ roleLabel() }}</small>
        </div>
        <button class="btn ghost" type="button" (click)="auth.logout()">Déconnexion</button>
      </div>
    </header>

    <main class="page"><router-outlet /></main>

    @if (toast()) { <div class="toast" role="status">{{ toast() }}</div> }
  `,
})
export class ShellComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly store = inject(Store);
  private readonly realtime = inject(RealtimeService);

  readonly user = this.auth.user;
  readonly role = this.auth.role;
  readonly roleLabel = computed(() => (this.role() ? ROLE_LABEL[this.role()!] : ''));
  readonly notifications = this.store.selectSignal(notificationsFeature.selectItems);
  readonly unread = this.store.selectSignal(selectUnreadCount);
  private readonly lastReceived = this.store.selectSignal(notificationsFeature.selectLastReceived);

  readonly panelOpen = signal(false);
  readonly toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const n = this.lastReceived();
      if (!n) return;
      this.toast.set(n.message);
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => this.toast.set(null), 4500);
    });
  }

  ngOnInit(): void {
    this.store.dispatch(NotificationsActions.load());
    this.realtime.connect();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
    this.realtime.disconnect();
  }

  markRead(id: number): void {
    this.store.dispatch(NotificationsActions.markRead({ id }));
  }
}
