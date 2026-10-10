import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { CATEGORY_LABEL, Category, PRIORITY_LABEL, Priority, errorMessage } from '../core/models';

@Component({
  selector: 'app-ticket-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-head"><div><h1>Nouveau ticket</h1>
      <p class="muted">Décrivez le problème : un technicien le prendra en charge.</p></div></section>

    <form class="card form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="title">Titre</label>
      <input id="title" formControlName="title" maxlength="200" placeholder="Ex. : le VPN refuse ma connexion" />
      @if (invalid('title')) { <p class="field-error">Le titre est obligatoire.</p> }

      <div class="row">
        <div>
          <label for="category">Catégorie</label>
          <select id="category" formControlName="categoryId">
            <option [ngValue]="null" disabled>Choisir…</option>
            @for (c of categories(); track c.id) { <option [ngValue]="c.id">{{ label(c.name) }}</option> }
          </select>
          @if (invalid('categoryId')) { <p class="field-error">Choisissez une catégorie.</p> }
        </div>
        <div>
          <label for="priority">Priorité</label>
          <select id="priority" formControlName="priority">
            @for (p of priorities; track p) { <option [value]="p">{{ priorityLabel[p] }}</option> }
          </select>
        </div>
      </div>

      <label for="description">Description</label>
      <textarea id="description" rows="6" formControlName="description"
                placeholder="Que s'est-il passé ? Depuis quand ? Quel message d'erreur ?"></textarea>
      @if (invalid('description')) { <p class="field-error">Ajoutez une description.</p> }

      @if (error()) { <p class="alert" role="alert">{{ error() }}</p> }

      <div class="actions">
        <a class="btn" routerLink="/tickets">Annuler</a>
        <button class="btn primary" type="submit" [disabled]="saving()">
          {{ saving() ? 'Envoi…' : 'Envoyer le ticket' }}
        </button>
      </div>
    </form>
  `,
})
export class TicketFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly categories = signal<Category[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly priorities: Priority[] = ['LOW', 'NORMAL', 'URGENT'];
  readonly priorityLabel = PRIORITY_LABEL;

  readonly form = this.fb.group({
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
    categoryId: this.fb.control<number | null>(null, Validators.required),
    priority: this.fb.nonNullable.control<Priority>('NORMAL'),
    description: this.fb.nonNullable.control('', Validators.required),
  });

  ngOnInit(): void {
    this.api.categories().subscribe({
      next: list => this.categories.set(list),
      error: e => this.error.set(errorMessage(e)),
    });
  }

  label(name: string): string { return CATEGORY_LABEL[name] ?? name; }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.api.createTicket({
      title: v.title.trim(),
      description: v.description.trim(),
      priority: v.priority,
      categoryId: v.categoryId as number,
    }).subscribe({
      next: t => this.router.navigate(['/tickets', t.id]),
      error: e => {
        this.saving.set(false);
        this.error.set(errorMessage(e));
      },
    });
  }
}
