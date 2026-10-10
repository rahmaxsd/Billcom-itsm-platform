export type Role = 'ADMIN' | 'TECHNICIAN' | 'USER';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type Priority = 'LOW' | 'NORMAL' | 'URGENT';
export type TicketScope = 'mine' | 'assigned' | 'all';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Category { id: number; name: string; }

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  category: string;
  requesterId: number;
  requesterName: string;
  assigneeId: number | null;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface AppNotification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  avgResolutionHours: number;
  resolutionRate: number;
  byCategory: Record<string, number>;
  byTechnician: Record<string, number>;
}

export interface LoginResponse { token: string; user: User; }

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: Priority;
  categoryId: number;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Ouvert',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Basse',
  NORMAL: 'Normale',
  URGENT: 'Urgente',
};

export const CATEGORY_LABEL: Record<string, string> = {
  HARDWARE: 'Matériel',
  NETWORK: 'Réseau',
  SOFTWARE: 'Logiciel',
  ACCESS: 'Accès',
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrateur',
  TECHNICIAN: 'Technicien',
  USER: 'Employé',
};

export function errorMessage(e: unknown): string {
  const err = e as { error?: { message?: string }; message?: string; status?: number };
  if (err?.status === 0) return 'Serveur injoignable';
  return err?.error?.message ?? err?.message ?? 'Une erreur est survenue';
}
