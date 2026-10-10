import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import {
  CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL, Ticket, TicketComment, TicketStatus, errorMessage,
} from '../core/models';
import { NotificationsActions } from '../store/notifications.store';

@Component({
  selector: 'app-ticket-detail',
  imports: [DatePipe, RouterLink, ReactiveFormsModule],
  template: `
    <a class="back" routerLink="/tickets">← Retour aux tickets</a>

    @if (error() && !ticket()) { <p class="alert" role="alert">{{ error() }}</p> }

    @if (ticket(); as t) {
      <section class="page-head">
        <div>
          <h1>#{{ t.id }} · {{ t.title }}</h1>
          <p class="muted">
            Créé le {{ t.createdAt | date: 'dd/MM/yyyy HH:mm' }} par {{ t.requesterName }}
          </p>
        </div>
        <div class="chips">
          <span [class]="'chip pr-' + t.priority">{{ priorityLabel[t.priority] }}</span>
          <span [class]="'chip st-' + t.status">{{ statusLabel[t.status] }}</span>
        </div>
      </section>

      <div class="detail-grid">
        <article class="card">
          <h2>Description</h2>
          <p class="prewrap">{{ t.description }}</p>
        </article>

        <aside class="card facts">
          <h2>Informations</h2>
          <dl>
            <dt>Catégorie</dt><dd>{{ category(t.category) }}</dd>
            <dt>Technicien</dt><dd>{{ t.assigneeName ?? 'Pas encore assigné' }}</dd>
            <dt>Dernière mise à jour</dt><dd>{{ t.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</dd>
            @if (t.resolvedAt) { <dt>Résolu le</dt><dd>{{ t.resolvedAt | date: 'dd/MM/yyyy HH:mm' }}</dd> }
          </dl>

          @if (canTake()) {
            <button class="btn primary block" type="button" [disabled]="busy()" (click)="take()">Prendre en charge</button>
          }
          @if (canChangeStatus()) {
            <div class="status-actions">
              @for (s of nextStatuses(); track s.value) {
                <button class="btn block" type="button" [disabled]="busy()" (click)="setStatus(s.value)">{{ s.label }}</button>
              }
            </div>
          }
          @if (error()) { <p class="alert" role="alert">{{ error() }}</p> }
        </aside>
      </div>

      <section class="card comments">
        <h2>Commentaires ({{ comments().length }})</h2>
        @for (c of comments(); track c.id) {
          <div class="comment">
            <div class="meta"><strong>{{ c.authorName }}</strong><small>{{ c.createdAt | date: 'dd/MM/yyyy HH:mm' }}</small></div>
            <p class="prewrap">{{ c.content }}</p>
          </div>
        } @empty {
          <p class="muted">Aucun commentaire pour l'instant.</p>
        }

        <form [formGroup]="commentForm" (ngSubmit)="addComment()" novalidate>
          <label for="comment">Ajouter un commentaire</label>
          <textarea id="comment" rows="3" formControlName="content" placeholder="Votre message…"></textarea>
          <div class="actions">
            <button class="btn primary" type="submit" [disabled]="busy() || commentForm.invalid">Publier</button>
          </div>
        </form>
      </section>
    } @else if (!error()) {
      <p class="muted">Chargement…</p>
    }
  `,
})
export class TicketDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusLabel = STATUS_LABEL;
  readonly priorityLabel = PRIORITY_LABEL;
  readonly ticket = signal<Ticket | null>(null);
  readonly comments = signal<TicketComment[]>([]);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);
  private id = 0;

  readonly commentForm = this.fb.nonNullable.group({ content: ['', Validators.required] });

  private readonly isAdmin = computed(() => this.auth.role() === 'ADMIN');
  private readonly isAssignee = computed(() => {
    const t = this.ticket();
    return !!t && t.assigneeId !== null && t.assigneeId === this.auth.user()?.id;
  });

  readonly canTake = computed(() => {
    const t = this.ticket();
    return !!t && this.auth.role() === 'TECHNICIAN' && t.status !== 'RESOLVED'
      && (t.assigneeId === null || this.isAssignee()) && t.status === 'OPEN';
  });
  readonly canChangeStatus = computed(() => this.isAdmin() || this.isAssignee());
  readonly nextStatuses = computed(() => {
    const status = this.ticket()?.status;
    const all: { value: TicketStatus; label: string }[] = [
      { value: 'IN_PROGRESS', label: 'Passer en cours' },
      { value: 'RESOLVED', label: 'Marquer résolu' },
      { value: 'OPEN', label: 'Rouvrir' },
    ];
    return all.filter(s => s.value !== status);
  });

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
    this.actions$
      .pipe(ofType(NotificationsActions.received), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  category(name: string): string { return CATEGORY_LABEL[name] ?? name; }

  private load(): void {
    this.api.ticket(this.id).subscribe({
      next: t => this.ticket.set(t),
      error: e => this.error.set(errorMessage(e)),
    });
    this.api.comments(this.id).subscribe({ next: c => this.comments.set(c), error: () => undefined });
  }

  take(): void { this.run(this.api.take(this.id)); }
  setStatus(status: TicketStatus): void { this.run(this.api.changeStatus(this.id, status)); }

  private run(call: ReturnType<ApiService['take']>): void {
    this.busy.set(true);
    this.error.set(null);
    call.subscribe({
      next: t => { this.ticket.set(t); this.busy.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.busy.set(false); },
    });
  }

  addComment(): void {
    const content = this.commentForm.getRawValue().content.trim();
    if (!content) return;
    this.busy.set(true);
    this.api.addComment(this.id, content).subscribe({
      next: c => {
        this.comments.update(list => [...list, c]);
        this.commentForm.reset();
        this.busy.set(false);
      },
      error: e => { this.error.set(errorMessage(e)); this.busy.set(false); },
    });
  }
}
