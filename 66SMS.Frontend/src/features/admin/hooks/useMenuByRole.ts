// Hook lọc menu sidebar theo role của user đang đăng nhập.
// Admin luôn thấy tất cả menu, các role khác chỉ thấy menu có allowedRoles chứa role của mình.
// Children không khai báo allowedRoles riêng sẽ kế thừa quyền từ parent.

import { useMemo } from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { MENU_ITEMS, type MenuItem } from "../constants/menu";

/** Kiểm tra user có ít nhất 1 role nằm trong danh sách allowedRoles hay không (case-insensitive). */
function matchesRole(userRoles: string[], allowedRoles: string[]): boolean {
  return allowedRoles.some((allowed: string) =>
    userRoles.some((r: string) => r.toLowerCase() === allowed.toLowerCase()),
  );
}

export function useMenuByRole(): MenuItem[] {
  const roles = useAuthStore((s) => s.user?.roles ?? []);

  return useMemo(() => {
    // Admin luôn thấy toàn bộ menu
    const isAdmin = roles.some((r: string) => r.toLowerCase() === "admin");
    if (isAdmin) return MENU_ITEMS;

    return (
      MENU_ITEMS.filter((item: MenuItem) => {
        // Menu không khai báo allowedRoles → chỉ Admin thấy
        if (!item.allowedRoles || item.allowedRoles.length === 0) return false;
        return matchesRole(roles, item.allowedRoles);
      })
        .map((item: MenuItem) => {
          // Nếu không có children → giữ nguyên
          if (!item.children) return item;

          // Lọc children theo allowedRoles riêng; nếu child không khai báo → kế thừa parent
          const filteredChildren = item.children.filter((child) => {
            if (!child.allowedRoles || child.allowedRoles.length === 0)
              return true;
            return matchesRole(roles, child.allowedRoles);
          });

          return { ...item, children: filteredChildren };
        })
        // Loại bỏ menu parent nếu toàn bộ children bị lọc hết
        .filter((item: MenuItem) => {
          if (!item.children) return true;
          return item.children.length > 0;
        })
    );
  }, [roles]);
}
