import { useState, useMemo } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  User,
  Scissors,
  Contact,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useGetAllRoles } from "@/features/auth/hooks/useGetAllRoles";
import { useAdminStaffs } from "../hooks/useStaffs";

interface StaffCategorySidebarProps {
  selectedRole: string | null;
  onSelectRole: (role: string | null) => void;
  salonId: number | null;
}

function getRoleIcon(roleName: string): LucideIcon {
  const r = roleName.toLowerCase();
  if (r.includes("admin") || r.includes("quản trị")) return ShieldCheck;
  if (r.includes("manager") || r.includes("quản lý")) return Shield;
  if (r.includes("tech") || r.includes("kỹ thuật viên") || r.includes("thợ")) return Scissors;
  if (r.includes("receptionist") || r.includes("lễ tân")) return Contact;
  return User;
}

export function StaffCategorySidebar({
  selectedRole,
  onSelectRole,
  salonId,
}: StaffCategorySidebarProps) {
  const [searchText, setSearchText] = useState("");

  const { data: rolesResult, isLoading: isLoadingRoles } = useGetAllRoles();

  const roles = useMemo(
    () => rolesResult?.data ?? [],
    [rolesResult?.data],
  );

  // Fetch all staff members in the salon without role filter for counting
  const { data: countStaffsResult } = useAdminStaffs({
    pageIndex: 1,
    pageSize: 10000,
    salonId,
  });

  const countStaffs = useMemo(() => {
    return countStaffsResult?.data?.items ?? [];
  }, [countStaffsResult]);

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of countStaffs) {
      if (s.role) {
        // Tên vai trò thường được lưu ở StaffDto.role dưới dạng chuỗi (ví dụ "Admin", "Technician")
        const key = s.role.toLowerCase();
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return map;
  }, [countStaffs]);

  const totalCount = countStaffs.length;

  const filteredRoles = useMemo(() => {
    if (!searchText.trim()) return roles;
    const lower = searchText.toLowerCase();
    return roles.filter((r) =>
      (r.name ?? "").toLowerCase().includes(lower),
    );
  }, [roles, searchText]);

  return (
    <aside className="w-2/12 shrink-0 flex flex-col h-full bg-white rounded overflow-hidden">
      {/* Search */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-adminGray-400 pointer-events-none" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm vai trò..."
            className="lotus-admin-sidebar-search"
          />
        </div>
      </div>

      {/* Category list */}
      <nav className="flex-1 flex-col h-full overflow-y-auto custom-scrollbar px-2 pb-2 space-y-0.5">
        {/* Tất cả vai trò */}
        <button
          type="button"
          onClick={() => onSelectRole(null)}
          className={`lotus-admin-sidebar-item ${
            selectedRole === null
              ? "bg-adminGreen-100 text-adminGreen-600 font-semibold border-l-[3px] border-adminGreen-600"
              : "text-adminInk/70 hover:bg-adminGreen-50 hover:text-adminGreen-600 border-l-[3px] border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Users
              className={`w-4 h-4 shrink-0 ${
                selectedRole === null ? "text-adminGreen-600" : "text-adminGray-400"
              }`}
            />
            <span className="truncate">Tất cả vai trò</span>
          </div>
          <span
            className={`lotus-admin-sidebar-badge ${
              selectedRole === null
                ? "bg-adminGreen-600/20 text-adminGreen-600"
                : "bg-adminGray-100 text-adminGray-600"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {isLoadingRoles ? (
          <div className="space-y-1 px-1 mt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-7 bg-adminGray-100/50 rounded animate-pulse"
              />
            ))}
          </div>
        ) : (
          filteredRoles.map((role) => {
            const isActive = selectedRole?.toLowerCase() === role.name?.toLowerCase();
            const count = role.name ? (countMap.get(role.name.toLowerCase()) ?? 0) : 0;
            const Icon = getRoleIcon(role.name ?? "");
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelectRole(role.name ?? null)}
                className={`lotus-admin-sidebar-item group ${
                  isActive
                    ? "bg-adminGreen-100 text-adminGreen-600 font-semibold border-l-[3px] border-adminGreen-600"
                    : "text-adminInk/70 hover:bg-adminGreen-50 hover:text-adminGreen-600 border-l-[3px] border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? "text-adminGreen-600"
                        : "text-adminGray-400 group-hover:text-adminGray-600"
                    }`}
                  />
                  <span className="truncate">{role.name ?? "—"}</span>
                </div>
                <span
                  className={`lotus-admin-sidebar-badge ${
                    isActive
                      ? "bg-adminGreen-600/20 text-adminGreen-600"
                      : "bg-adminGray-100 text-adminGray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}
