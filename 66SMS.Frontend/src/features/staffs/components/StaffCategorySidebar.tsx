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
import { Badge } from "@/shared/elements/Badge";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import { Input } from "@/shared/forms/Input";
import { useGetAllRoles } from "@/features/auth/hooks/useGetAllRoles";
import type { RoleDTO } from "@/features/auth/types/auth.types";
import { useAdminStaffs } from "../hooks/useStaffs";
import type { StaffDto } from "../types/staff.types";

interface StaffCategorySidebarProps {
  selectedRole: string | null;
  onSelectRole: (roleCode: string | null) => void;
  salonId: number | null;
}

function getRoleIcon(role: RoleDTO): LucideIcon {
  const key = `${role.code ?? ""} ${role.name ?? ""}`.toLowerCase();
  if (key.includes("admin") || key.includes("quản trị")) return ShieldCheck;
  if (key.includes("manager") || key.includes("quản lý")) return Shield;
  if (key.includes("tech") || key.includes("kỹ thuật") || key.includes("thợ"))
    return Scissors;
  if (key.includes("reception") || key.includes("lễ tân")) return Contact;
  return User;
}

export function StaffCategorySidebar({
  selectedRole,
  onSelectRole,
  salonId,
}: StaffCategorySidebarProps) {
  const [searchText, setSearchText] = useState("");

  const { data: rolesResult, isLoading: isLoadingRoles } = useGetAllRoles();
  const roles = useMemo(() => rolesResult?.data ?? [], [rolesResult?.data]);

  const { data: countStaffsResult } = useAdminStaffs({
    pageIndex: 1,
    pageSize: 10000,
    salonId,
  });

  const countStaffs = useMemo(
    () => countStaffsResult?.data?.items ?? [],
    [countStaffsResult],
  );

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of countStaffs) {
      const staff: StaffDto = s;
      if (staff.role) {
        const key = staff.role.toLowerCase();
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return map;
  }, [countStaffs]);

  const totalCount = countStaffs.length;

  const filteredRoles = useMemo(() => {
    if (!searchText.trim()) return roles;
    const lower = searchText.toLowerCase();
    return roles.filter(
      (r: RoleDTO) =>
        (r.name ?? "").toLowerCase().includes(lower) ||
        (r.code ?? "").toLowerCase().includes(lower),
    );
  }, [roles, searchText]);

  return (
    <div className="flex w-56 shrink-0 flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 z-10 h-3.5 w-3.5 -translate-y-1/2 text-kit-muted" />
        <Input
          type="text"
          inputSize="sm"
          value={searchText}
          onChange={(e: { target: { value: string } }) =>
            setSearchText(e.target.value)
          }
          placeholder="Tìm vai trò..."
          className="h-9 pl-8"
        />
      </div>

      <ListGroup className="mb-0 max-h-96 overflow-y-auto">
        <ListGroupItem
          action
          active={selectedRole === null}
          onClick={() => onSelectRole(null)}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span className="truncate">Tất cả vai trò</span>
          </span>
          <Badge variant={selectedRole === null ? "light" : "secondary"} pill>
            {totalCount}
          </Badge>
        </ListGroupItem>

        {isLoadingRoles
          ? Array.from({ length: 4 }).map((_, i: number) => (
              <ListGroupItem key={i} disabled>
                <span className="h-4 w-28 animate-pulse rounded bg-kit-page" />
                <span className="h-4 w-6 animate-pulse rounded-full bg-kit-page" />
              </ListGroupItem>
            ))
          : filteredRoles.map((role: RoleDTO) => {
              const roleCode = role.code ?? "";
              const isActive =
                selectedRole?.toLowerCase() === roleCode.toLowerCase();
              const count = roleCode
                ? (countMap.get(roleCode.toLowerCase()) ?? 0)
                : 0;
              const Icon = getRoleIcon(role);
              return (
                <ListGroupItem
                  key={role.id}
                  action
                  active={isActive}
                  onClick={() => onSelectRole(roleCode || null)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{role.name ?? "—"}</span>
                  </span>
                  <Badge variant={isActive ? "light" : "secondary"} pill>
                    {count}
                  </Badge>
                </ListGroupItem>
              );
            })}
      </ListGroup>
    </div>
  );
}
