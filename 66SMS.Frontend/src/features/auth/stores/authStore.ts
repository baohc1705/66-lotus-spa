import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type UserDto } from '@/shared/types/user.types';

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

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user }),

      clearAuth: () => set({ accessToken: null, user: null }),

      // Kiểm tra permission theo format "resource:action" giống backend
      hasPermission: (resource, action) => {
        const permissions = get().user?.permissions ?? [];
        console.log(permissions);
        return permissions.includes(`${resource}:${action}`);
      },

      hasRole: (role) => {
        const roles = get().user?.roles ?? [];
        return roles.includes(role);
      },
    }),
    {
      name: 'auth-storage',
      // Chỉ persist accessToken, không persist user (lấy lại từ /me)
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
);