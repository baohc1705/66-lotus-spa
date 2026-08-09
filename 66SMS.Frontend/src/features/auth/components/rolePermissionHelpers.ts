import type { PermissionDTO } from '@/features/auth/types/auth.types';

export function groupByResource(permissions: PermissionDTO[]): Record<string, PermissionDTO[]> {
  const map: Record<string, PermissionDTO[]> = {};
  for (const permission of permissions) {
    if (!map[permission.resource]) map[permission.resource] = [];
    map[permission.resource].push(permission);
  }
  return map;
}

const ACTION_ORDER = ['create', 'read', 'update', 'delete'];

export function getSortedActions(permissions: PermissionDTO[]): string[] {
  const actions = Array.from(
    new Set(permissions.map((permission: PermissionDTO) => permission.action.toLowerCase())),
  );
  return actions.sort((actionA: string, actionB: string) => {
    const indexA = ACTION_ORDER.indexOf(actionA);
    const indexB = ACTION_ORDER.indexOf(actionB);
    if (indexA === -1 && indexB === -1) return actionA.localeCompare(actionB);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export const ROLE_COLORS = [
  { bg: 'var(--kit-primary)', light: 'var(--kit-soft-primary-bg)' },
  { bg: 'var(--kit-success)', light: 'var(--kit-soft-success-bg)' },
  { bg: 'var(--kit-info)', light: 'var(--kit-soft-info-bg)' },
  { bg: 'var(--kit-warning)', light: 'var(--kit-soft-warning-bg)' },
  { bg: 'var(--kit-alt)', light: 'var(--kit-soft-alternate-bg)' },
];
