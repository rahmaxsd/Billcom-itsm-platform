import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import {
  CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL, Ticket, TicketScope, TicketStatus, User,
} from '../core/models';
import { TicketsActions, ticketsFeature } from '../store/tickets.store';

type StatusFilter = TicketStatus | 'ALL';

@Component({
  selector: 'app-ticket-list',
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    <section class="page-head">
      <div>
        <h1>{{ title }}</h1>
        <p class="muted">{{ filtered().length }} ticket(s) affiché(s)</p>
      </div>
      <div class="actions">
        @if (scope === 'mine') { <a class="btn primary" routerLink="/tickets/new">Nouveau ticket</a> }
        @if (scope === 'all') {
          <button class="btn" type="button" (click)="exportCsv()">Exporter (CSV, ouvre dans Excel)</button>
          <button class="btn" type="button" (click)="print()">Imprimer / PDF</button>
        }
      </div>
    </section>

    <div class="filters" role="group" aria-label="Filtrer par statut">
      @for (f of filters; track f.value) {
        <button type="button" class="filter" [class.on]="filter() === f.value" (click)="filter.set(f.value)">
          {{ f.label }} <span>{{ countFor(f.value) }}</span>
        </button>
      }
    </div>

    @if (error()) { <p class="alert" role="alert">{{ error() }}</p> }

    @if (loading()) {
      <p class="muted">Chargement…</p>
    } @else if (!filtered().length) {
      <div class="empty">
        <p>{{ emptyText() }}</p>
        @if (scope === 'mine') { <a class="btn primary" routerLink="/tickets/new">Créer mon premier ticket</a> }
      </div>
    } @else {
      <div class="table-wrap">
        <table class="tickets">
          <thead>
            <tr>
              <th>N°</th><th>Titre</th><th>Catégorie</th><th>Priorité</th><th>Statut</th>
              @if (scope !== 'mine') { <th>Demandeur</th> }
              @if (scope !== 'assigned') { <th>Technicien</th> }
              <th>Créé le</th>
              @if (scope === 'assigned') { <th>Action</th> }
            </tr>
          </thead>
          <tbody>
            @for (t of filtered(); track t.id) {
              <tr [class]="'p-' + t.priority">
                <td>#{{ t.id }}</td>
                <td><a [routerLink]="['/tickets', t.id]" class="title-link">{{ t.title }}</a></td>
                <td>{{ category(t.category) }}</td>
                <td><span [class]="'chip pr-' + t.priority">{{ priorityLabel[t.priority] }}</span></td>
                <td><span [class]="'chip st-' + t.status">{{ statusLabel[t.status] }}</span></td>
                @if (scope !== 'mine') { <td>{{ t.requesterName }}</td> }
                @if (scope === 'all') {
                  <td>
                    <select class="inline" [ngModel]="t.assigneeId" (ngModelChange)="assign(t, $event)"
                            [attr.aria-label]="'Assigner le ticket ' + t.id">
                      <option [ngValue]="null">Non assigné</option>
                      @for (u of technicians(); track u.id) { <option [ngValue]="u.id">{{ u.fullName }}</option> }
                    </select>
                  </td>
                } @else if (scope === 'mine') {
                  <td>{{ t.assigneeName ?? 'Pas encore assigné' }}</td>
                }
                <td>{{ t.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                @if (scope === 'assigned') {
                  <td>
                    @if (t.status === 'OPEN') {
                      <button class="btn small primary" type="button" (click)="take(t)">Prendre en charge</button>
                    } @else if (t.status === 'IN_PROGRESS') {
                      <button class="btn small" type="button" (click)="resolve(t)">Marquer résolu</button>
                    } @else {
                      <span class="muted">Terminé</span>
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class TicketListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly scope = this.route.snapshot.data['scope'] as TicketScope;
  readonly title = this.route.snapshot.data['title'] as string;
  readonly statusLabel = STATUS_LABEL;
  readonly priorityLabel = PRIORITY_LABEL;

  readonly tickets = this.store.selectSignal(ticketsFeature.selectItems);
  readonly loading = this.store.selectSignal(ticketsFeature.selectLoading);
  readonly error = this.store.selectSignal(ticketsFeature.selectError);
  readonly technicians = signal<User[]>([]);
  readonly filter = signal<StatusFilter>('ALL');

  readonly filters: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'OPEN', label: STATUS_LABEL.OPEN },
    { value: 'IN_PROGRESS', label: STATUS_LABEL.IN_PROGRESS },
    { value: 'RESOLVED', label: STATUS_LABEL.RESOLVED },
  ];

  readonly filtered = computed(() => {
    const f = this.filter();
    return f === 'ALL' ? this.tickets() : this.tickets().filter(t => t.status === f);
  });

  readonly emptyText = computed(() =>
    this.filter() !== 'ALL' ? 'Aucun ticket avec ce statut.'
      : this.scope === 'assigned' ? "Aucun ticket ne vous est assigné pour l'instant."
      : this.scope === 'all' ? "Aucun ticket n'a encore été créé."
      : "Vous n'avez pas encore créé de ticket.");

  ngOnInit(): void {
    this.store.dispatch(TicketsActions.load({ scope: this.scope }));
    if (this.scope === 'all') this.api.technicians().subscribe(list => this.technicians.set(list));
  }

  category(name: string): string { return CATEGORY_LABEL[name] ?? name; }

  countFor(f: StatusFilter): number {
    return f === 'ALL' ? this.tickets().length : this.tickets().filter(t => t.status === f).length;
  }

  assign(t: Ticket, technicianId: number | null): void {
    if (technicianId === null || technicianId === t.assigneeId) return;
    this.store.dispatch(TicketsActions.assign({ id: t.id, technicianId }));
  }

  take(t: Ticket): void { this.store.dispatch(TicketsActions.take({ id: t.id })); }

  resolve(t: Ticket): void {
    this.store.dispatch(TicketsActions.changeStatus({ id: t.id, status: 'RESOLVED' }));
  }

  print(): void { window.print(); }

  exportCsv(): void {
    const esc = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['N°', 'Titre', 'Catégorie', 'Priorité', 'Statut', 'Demandeur', 'Technicien', 'Créé le', 'Résolu le'];
    const rows = this.filtered().map(t => [
      t.id, t.title, this.category(t.category), PRIORITY_LABEL[t.priority], STATUS_LABEL[t.status],
      t.requesterName, t.assigneeName, t.createdAt, t.resolvedAt,
    ]);
    const csv = [head, ...rows].map(r => r.map(esc).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
