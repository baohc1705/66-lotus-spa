import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type UserDto } from "@/features/users/types/user.types";
import type { StaffSalonDTO } from "@/features/staff_salons/types/staff-salon.types";
import type { TokenResponseDTO } from "@/features/auth/types/auth.types";
import { applyTokenResponse } from "@/features/auth/utils/mapTokenProfile";

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  managedSalonId: number | null;
  selectedSalonId: number | null;
  mySalon: StaffSalonDTO | null;
  isAuthReady: boolean;
  setAuthReady: (ready: boolean) => void;
  setSession: (data: TokenResponseDTO) => void;
  setUser: (user: UserDto) => void;
  setMySalon: (salon: StaffSalonDTO | null) => void;
  clearAuth: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
  setSelectedSalonId: (id: number | null) => void;
  getEffectiveSalonId: () => number | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      managedSalonId: null,
      selectedSalonId: null,
      mySalon: null,
      isAuthReady: false,

      setAuthReady: (ready) => set({ isAuthReady: ready }),

      setSession: (data) => {
        const session = applyTokenResponse(data);
        const salonId = session.managedSalonId;
        set({
          accessToken: session.accessToken,
          user: session.user,
          managedSalonId: salonId,
          mySalon: salonId
            ? {
                staffId: data.userProfile.staffProfile?.staffId,
                salonId,
              }
            : null,
        });
      },

      setUser: (user) => set({ user }),

      setMySalon: (salon) => set({ mySalon: salon }),

      clearAuth: () => {
        set({
          accessToken: null,
          user: null,
          managedSalonId: null,
          selectedSalonId: null,
          mySalon: null,
        });
        sessionStorage.removeItem("auth-session");
        localStorage.removeItem("auth-storage");
      },

      setSelectedSalonId: (id) => set({ selectedSalonId: id }),

      getEffectiveSalonId: () => {
        const state = get();
        if (state.managedSalonId) return state.managedSalonId;
        if (state.mySalon?.salonId) return state.mySalon.salonId;
        return state.selectedSalonId;
      },

      hasPermission: (resource, action) => {
        const user = get().user;
        if (!user) return false;

        const hasAdmin = user.roles?.some((r) => r.toLowerCase() === "admin");
        if (hasAdmin) return true;

        const permissions = user.permissions ?? [];
        return permissions.includes(`${resource}:${action}`);
      },

      hasRole: (role) => {
        const roles = get().user?.roles ?? [];
        return roles.some((r) => r.toLowerCase() === role.toLowerCase());
      },
    }),
    {
      name: "auth-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        managedSalonId: state.managedSalonId,
        mySalon: state.mySalon,
        selectedSalonId: state.selectedSalonId,
      }),
    },
  ),
);
