import { Role } from './models';

export function homeFor(role: Role): string {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'TECHNICIAN': return '/technician';
    default: return '/tickets';
  }
}
