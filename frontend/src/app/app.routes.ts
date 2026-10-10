import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthService } from './core/auth.service';
import { authGuard, guestGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'tickets',
        data: { scope: 'mine', title: 'Mes tickets' },
        loadComponent: () => import('./pages/ticket-list.component').then(m => m.TicketListComponent),
      },
      {
        path: 'tickets/new',
        loadComponent: () => import('./pages/ticket-form.component').then(m => m.TicketFormComponent),
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./pages/ticket-detail.component').then(m => m.TicketDetailComponent),
      },
      {
        path: 'work',
        canActivate: [roleGuard('TECHNICIAN', 'ADMIN')],
        data: { scope: 'assigned', title: 'Tickets qui me sont assignés' },
        loadComponent: () => import('./pages/ticket-list.component').then(m => m.TicketListComponent),
      },
      {
        path: 'admin',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'admin/tickets',
        canActivate: [roleGuard('ADMIN')],
        data: { scope: 'all', title: 'Tous les tickets' },
        loadComponent: () => import('./pages/ticket-list.component').then(m => m.TicketListComponent),
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () => import('./pages/users.component').then(m => m.UsersComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: () => inject(AuthService).homeUrl() },
    ],
  },
  { path: '**', redirectTo: '' },
];
