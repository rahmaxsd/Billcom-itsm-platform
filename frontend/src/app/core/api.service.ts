import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AppNotification, Category, CreateTicketPayload, CreateUserPayload, Stats,
  Ticket, TicketComment, TicketScope, TicketStatus, User,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  tickets(scope: TicketScope) {
    const url = scope === 'mine' ? '/api/tickets/mine'
      : scope === 'assigned' ? '/api/tickets/assigned'
      : '/api/tickets';
    return this.http.get<Ticket[]>(url);
  }
  ticket(id: number) { return this.http.get<Ticket>(`/api/tickets/${id}`); }
  createTicket(body: CreateTicketPayload) { return this.http.post<Ticket>('/api/tickets', body); }
  changeStatus(id: number, status: TicketStatus) {
    return this.http.patch<Ticket>(`/api/tickets/${id}/status`, { status });
  }
  take(id: number) { return this.http.patch<Ticket>(`/api/tickets/${id}/take`, {}); }
  assign(id: number, technicianId: number) {
    return this.http.patch<Ticket>(`/api/tickets/${id}/assign`, { technicianId });
  }

  categories() { return this.http.get<Category[]>('/api/categories'); }

  comments(ticketId: number) { return this.http.get<TicketComment[]>(`/api/tickets/${ticketId}/comments`); }
  addComment(ticketId: number, content: string) {
    return this.http.post<TicketComment>(`/api/tickets/${ticketId}/comments`, { content });
  }

  notifications() { return this.http.get<AppNotification[]>('/api/notifications'); }
  markRead(id: number) { return this.http.patch<AppNotification>(`/api/notifications/${id}/read`, {}); }

  stats() { return this.http.get<Stats>('/api/admin/stats'); }
  users() { return this.http.get<User[]>('/api/admin/users'); }
  technicians() { return this.http.get<User[]>('/api/admin/technicians'); }
  createUser(body: CreateUserPayload) { return this.http.post<User>('/api/admin/users', body); }
}
