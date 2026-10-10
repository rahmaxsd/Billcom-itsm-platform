import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { CATEGORY_LABEL, Stats, errorMessage } from '../core/models';

interface Bar { label: string; value: number; pct: number; }

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <section class="page-head">
      <div><h1>Tableau de bord</h1><p class="muted">Vue d'ensemble de l'activité du support IT.</p></div>
      <div class="actions"><a class="btn" routerLink="/admin/tickets">Gérer les tickets</a></div>
    </section>

    @if (error()) { <p class="alert" role="alert">{{ error() }}</p> }

    @if (stats(); as s) {
      <section class="kpis" aria-label="Indicateurs clés">
        <div class="kpi"><span>Tickets au total</span><strong>{{ s.total }}</strong></div>
        <div class="kpi st-OPEN"><span>Ouverts</span><strong>{{ s.open }}</strong></div>
        <div class="kpi st-IN_PROGRESS"><span>En cours</span><strong>{{ s.inProgress }}</strong></div>
        <div class="kpi st-RESOLVED"><span>Résolus</span><strong>{{ s.resolved }}</strong></div>
        <div class="kpi"><span>Temps moyen de résolution</span><strong>{{ s.avgResolutionHours }} h</strong></div>
        <div class="kpi"><span>Taux de résolution</span><strong>{{ s.resolutionRate }} %</strong></div>
      </section>

      <div class="two-col">
        <section class="card">
          <h2>Tickets par catégorie</h2>
          @for (b of byCategory(); track b.label) {
            <div class="bar-row"><span>{{ b.label }}</span>
              <div class="bar"><i [style.width.%]="b.pct"></i></div><b>{{ b.value }}</b></div>
          } @empty { <p class="muted">Aucune donnée pour l'instant.</p> }
        </section>

        <section class="card">
          <h2>Tickets par technicien</h2>
          @for (b of byTechnician(); track b.label) {
            <div class="bar-row"><span>{{ b.label }}</span>
              <div class="bar"><i [style.width.%]="b.pct"></i></div><b>{{ b.value }}</b></div>
          } @empty { <p class="muted">Aucun ticket assigné pour l'instant.</p> }
        </section>
      </div>
    } @else if (!error()) {
      <p class="muted">Chargement…</p>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly stats = signal<Stats | null>(null);
  readonly error = signal<string | null>(null);

  readonly byCategory = computed(() =>
    this.bars(this.stats()?.byCategory ?? {}, k => CATEGORY_LABEL[k] ?? k));
  readonly byTechnician = computed(() => this.bars(this.stats()?.byTechnician ?? {}, k => k));

  ngOnInit(): void {
    this.api.stats().subscribe({
      next: s => this.stats.set(s),
      error: e => this.error.set(errorMessage(e)),
    });
  }

  private bars(data: Record<string, number>, label: (k: string) => string): Bar[] {
    const max = Math.max(1, ...Object.values(data));
    return Object.entries(data)
      .map(([k, value]) => ({ label: label(k), value, pct: (value / max) * 100 }))
      .sort((a, b) => b.value - a.value);
  }
}
