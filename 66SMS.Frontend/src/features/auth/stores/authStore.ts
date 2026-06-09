import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type UserDto } from '@/features/users/types/user.types';
import { parseJwt } from '@/features/auth/utils/jwt';

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: UserDto) => void;
  clearAuth: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setAccessToken: (token) => {
        set({ accessToken: token });
        const decoded = parseJwt(token);
        if (decoded) {
          const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
          const roles = roleClaim ? (Array.isArray(roleClaim) ? roleClaim : [roleClaim]) : [];
          
          const permClaim = decoded.permission;
          const permissions = permClaim ? (Array.isArray(permClaim) ? permClaim : [permClaim]) : [];

          const currentUser = get().user || ({} as UserDto);
          set({ user: { ...currentUser, roles, permissions } });
        }
      },

      setUser: (user) => set({ user }),

      clearAuth: () => set({ accessToken: null, user: null }),

      // Kiểm tra permission theo format "resource:action" giống backend
      hasPermission: (resource, action) => {
        const user = get().user;
        console.log(`[PermissionCheck] Resource: ${resource}, Action: ${action}`, { user });
        if (!user) return false;
        
        // Kiểm tra case-insensitive cho role admin
        const hasAdmin = user.roles?.some(r => r.toLowerCase() === 'admin');
        if (hasAdmin) {
           console.log(`[PermissionCheck] Granted via admin role bypass`);
           return true;
        }

        const permissions = user.permissions ?? [];
        const hasPerm = permissions.includes(`${resource}:${action}`);
        console.log(`[PermissionCheck] Exact permission match: ${hasPerm}`);
        return hasPerm;
      },

      hasRole: (role) => {
        const roles = get().user?.roles ?? [];
        const has = roles.some(r => r.toLowerCase() === role.toLowerCase());
        console.log(`[RoleCheck] Role requested: ${role}, User roles:`, roles, `=> ${has}`);
        return has;
      },
    }),
    {
      name: 'auth-storage',
      // Persist cả accessToken và user để giữ phiên đăng nhập (bao gồm permissions) sau khi F5
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    },
  ),
);