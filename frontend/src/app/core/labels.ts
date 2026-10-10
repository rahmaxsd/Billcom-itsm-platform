export const LABELS = {
  status: { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Résolu' } as Record<string, string>,
  priority: { LOW: 'Basse', NORMAL: 'Normale', URGENT: 'Urgente' } as Record<string, string>,
  category: { HARDWARE: 'Matériel', NETWORK: 'Réseau', SOFTWARE: 'Logiciel', ACCESS: 'Accès' } as Record<string, string>,
  role: { ADMIN: 'Administrateur', TECHNICIAN: 'Technicien', USER: 'Employé' } as Record<string, string>,
};

export function label(kind: keyof typeof LABELS, key: string | null | undefined): string {
  if (!key) return '';
  return LABELS[kind][key] ?? key;
}
