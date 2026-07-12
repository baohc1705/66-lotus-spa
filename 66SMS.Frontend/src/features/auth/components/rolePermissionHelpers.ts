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

// dùng CSS var để inline style không bị Tailwind purge
export const ROLE_COLORS = [
  { bg: 'var(--admin-green-600)', light: 'var(--admin-green-50)' },
  { bg: 'var(--admin-gold-700)', light: 'var(--admin-gold-100)' },
  { bg: 'var(--state-info-solid)', light: 'var(--state-info-bg)' },
  { bg: 'var(--state-warning-solid)', light: 'var(--state-warning-bg)' },
  { bg: 'var(--admin-green-700)', light: 'var(--admin-green-100)' },
];
