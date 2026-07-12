// Hook lọc menu sidebar theo role của user đang đăng nhập.
// Admin luôn thấy tất cả menu, các role khác chỉ thấy menu có allowedRoles chứa role của mình.
// Children không khai báo allowedRoles riêng sẽ kế thừa quyền từ parent.

import { useMemo } from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { MENU_GROUPS, type MenuGroup, type MenuItem } from "../constants/menu";

/** Kiểm tra user có ít nhất 1 role nằm trong danh sách allowedRoles hay không (case-insensitive). */
function matchesRole(userRoles: string[], allowedRoles: string[]): boolean {
  return allowedRoles.some((allowed: string) =>
    userRoles.some((r: string) => r.toLowerCase() === allowed.toLowerCase()),
  );
}

function filterMenuItem(item: MenuItem, roles: string[]): MenuItem | null {
  if (!item.allowedRoles || item.allowedRoles.length === 0) return null;
  if (!matchesRole(roles, item.allowedRoles)) return null;

  if (!item.children) return item;

  const filteredChildren = item.children.filter((child) => {
    if (!child.allowedRoles || child.allowedRoles.length === 0) return true;
    return matchesRole(roles, child.allowedRoles);
  });

  if (filteredChildren.length === 0) return null;
  return { ...item, children: filteredChildren };
}

export function useMenuByRole(): MenuGroup[] {
  const roles = useAuthStore((s) => s.user?.roles ?? []);

  return useMemo(() => {
    const isAdmin = roles.some((r: string) => r.toLowerCase() === "admin");
    if (isAdmin) return MENU_GROUPS;

    return MENU_GROUPS.map((group: MenuGroup) => {
      const items = group.items
        .map((item: MenuItem) => filterMenuItem(item, roles))
        .filter((item): item is MenuItem => item !== null);
      return { ...group, items };
    }).filter((group: MenuGroup) => group.items.length > 0);
  }, [roles]);
}
