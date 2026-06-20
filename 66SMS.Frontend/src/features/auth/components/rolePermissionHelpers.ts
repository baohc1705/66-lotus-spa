import type { PermissionDTO } from '@/features/auth/types/auth.types';

export function groupByResource(permissions: PermissionDTO[]): Record<string, PermissionDTO[]> {
  const map: Record<string, PermissionDTO[]> = {};
  for (const p of permissions) {
    if (!map[p.resource]) map[p.resource] = [];
    map[p.resource].push(p);
  }
  return map;
}

const ACTION_ORDER = ['create', 'read', 'update', 'delete'];
export function getSortedActions(permissions: PermissionDTO[]): string[] {
  const acts = Array.from(new Set(permissions.map(p => p.action.toLowerCase())));
  return acts.sort((a, b) => {
    const ia = ACTION_ORDER.indexOf(a), ib = ACTION_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1; if (ib === -1) return -1;
    return ia - ib;
  });
}

// dùng inline style vì class động sẽ bị Tailwind purge
export const ROLE_COLORS = [
  { bg: '#3E7A3E', light: 'rgba(62,122,62,0.10)' },
  { bg: '#7A5C3E', light: 'rgba(122,92,62,0.10)' },
  { bg: '#3E5C7A', light: 'rgba(62,92,122,0.10)' },
  { bg: '#7A3E6B', light: 'rgba(122,62,107,0.10)' },
  { bg: '#5C7A3E', light: 'rgba(92,122,62,0.10)' },
];
