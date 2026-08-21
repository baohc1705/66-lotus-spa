import { useAuthStore } from "@/features/auth/stores/authStore";
import { MENU_GROUPS, type MenuGroup, type MenuItem } from "../constants/menu";

function matchesRole(userRoles: string[], allowedRoles: string[]): boolean {
  for (let index = 0; index < allowedRoles.length; index++) {
    const allowed = allowedRoles[index].toLowerCase();
    for (let roleIndex = 0; roleIndex < userRoles.length; roleIndex++) {
      if (userRoles[roleIndex].toLowerCase() === allowed) return true;
    }
  }
  return false;
}

function filterMenuItem(item: MenuItem, roles: string[]): MenuItem | null {
  if (!item.allowedRoles || item.allowedRoles.length === 0) return null;
  if (!matchesRole(roles, item.allowedRoles)) return null;

  if (!item.children) return item;

  const filteredChildren = [];
  for (let index = 0; index < item.children.length; index++) {
    const child = item.children[index];
    if (!child.allowedRoles || child.allowedRoles.length === 0) {
      filteredChildren.push(child);
      continue;
    }
    if (matchesRole(roles, child.allowedRoles)) {
      filteredChildren.push(child);
    }
  }

  if (filteredChildren.length === 0) return null;
  return { ...item, children: filteredChildren };
}

export function useMenuByRole(): MenuGroup[] {
  const roles = useAuthStore((s) => s.user?.roles ?? []);

  const isAdmin = roles.some((r: string) => r.toLowerCase() === "admin");
  if (isAdmin) return MENU_GROUPS;

  const result: MenuGroup[] = [];
  for (let index = 0; index < MENU_GROUPS.length; index++) {
    const group = MENU_GROUPS[index];
    const items: MenuItem[] = [];
    for (let itemIndex = 0; itemIndex < group.items.length; itemIndex++) {
      const filtered = filterMenuItem(group.items[itemIndex], roles);
      if (filtered) items.push(filtered);
    }
    if (items.length > 0) {
      result.push({ ...group, items });
    }
  }
  return result;
}
