import { useEffect } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useActiveSalons } from "@/features/salons/hooks/useSalons";
import { useQuery } from "@tanstack/react-query";
import { staffSalonApi } from "@/features/salons/api/staffSalon.api";
import { Dropdown, type DropdownItem } from "@/shared/elements/Dropdown";

type BranchSelectorProps = {
  variant?: "dark" | "light";
};

type SalonOption = {
  id: number;
  name: string;
};

const loadingClassByVariant = {
  dark: "border-white/20 text-white/80",
  light: "border-kit text-kit-muted bg-kit-page",
};

const emptyClassByVariant = {
  dark: "border-white/20 text-white/60",
  light: "border-kit text-kit-muted bg-kit-page",
};

const singleClassByVariant = {
  dark: "border-white/25 text-white",
  light: "border-kit text-kit-heading bg-kit-page",
};

function getAssignedSalons(
  isAdmin: boolean,
  staffSalonsResult:
    | {
        data?: {
          items?: Array<{ salonId?: number | null; salonName?: string | null }>;
        };
      }
    | undefined,
  managedSalonId: number | null,
  managedSalonName: string | undefined,
): SalonOption[] {
  if (isAdmin) return [];

  const list: SalonOption[] = [];
  const seenIds = new Set<number>();
  const items = staffSalonsResult?.data?.items ?? [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.salonId === undefined || item.salonId === null) continue;
    if (seenIds.has(item.salonId)) continue;
    seenIds.add(item.salonId);
    list.push({
      id: item.salonId,
      name: item.salonName || "Chi nhánh #" + item.salonId,
    });
  }

  if (list.length === 0 && managedSalonId) {
    list.push({
      id: managedSalonId,
      name: managedSalonName || "Chi nhánh quản lý",
    });
  }

  return list;
}

function findSalonName(
  salons: SalonOption[],
  salonId: number | null,
): string | null {
  if (salonId === null) return null;
  for (let index = 0; index < salons.length; index++) {
    if (salons[index].id === salonId) return salons[index].name;
  }
  return null;
}

function BranchDropdownTrigger({ label }: { label: string }) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1">
      <span className="min-w-0 truncate whitespace-nowrap">{label}</span>
      <ChevronDown className="size-3.5 shrink-0 opacity-80" />
    </span>
  );
}

const dropdownClassName =
  "mb-0! mr-0! block w-full min-w-0 max-w-full " +
  "[&>button]:flex [&>button]:w-full [&>button]:max-w-full " +
  "[&>button]:min-w-0 [&>button]:justify-between [&>button]:overflow-hidden";

export function BranchSelector({ variant = "dark" }: BranchSelectorProps) {
  const {
    user,
    hasRole,
    selectedSalonId,
    setSelectedSalonId,
    managedSalonId,
    mySalon,
  } = useAuthStore();
  const isAdmin = hasRole("Admin");
  const dropdownVariant =
    variant === "dark" ? "outline-light" : "outline-secondary";

  const { data: allSalons = [], isLoading: isLoadingAllSalons } =
    useActiveSalons();

  const staffId = user?.staffInfo?.id;
  const { data: staffSalonsResult, isLoading: isLoadingStaffSalons } = useQuery(
    {
      queryKey: ["staff-salons-assigned", staffId],
      queryFn: () =>
        staffSalonApi.getAll({
          staffId,
          status: 1,
          pageIndex: 1,
          pageSize: 100,
        }),
      enabled: !isAdmin && !!staffId,
    },
  );

  const assignedSalons = getAssignedSalons(
    isAdmin,
    staffSalonsResult,
    managedSalonId,
    mySalon?.salonName,
  );

  useEffect(() => {
    if (isAdmin) return;

    if (assignedSalons.length === 1) {
      const singleSalonId = assignedSalons[0].id;
      if (selectedSalonId !== singleSalonId) {
        setSelectedSalonId(singleSalonId);
      }
      return;
    }

    if (assignedSalons.length > 1) {
      let isSelectedValid = false;
      for (let index = 0; index < assignedSalons.length; index++) {
        if (assignedSalons[index].id === selectedSalonId) {
          isSelectedValid = true;
          break;
        }
      }
      if (!isSelectedValid) {
        setSelectedSalonId(assignedSalons[0].id);
      }
      return;
    }

    if (managedSalonId && selectedSalonId !== managedSalonId) {
      setSelectedSalonId(managedSalonId);
    }
  }, [
    isAdmin,
    assignedSalons,
    selectedSalonId,
    setSelectedSalonId,
    managedSalonId,
  ]);

  const isLoading = isAdmin ? isLoadingAllSalons : isLoadingStaffSalons;

  if (isLoading) {
    return (
      <div
        className={
          "flex h-8 w-full animate-pulse items-center justify-center gap-1.5 rounded px-4 text-xs " +
          loadingClassByVariant[variant]
        }
      >
        <MapPin className="size-3.5 shrink-0" />
        Đang tải...
      </div>
    );
  }

  if (isAdmin) {
    const adminOptions: SalonOption[] = [];
    for (let index = 0; index < allSalons.length; index++) {
      const salon = allSalons[index];
      if (salon.id === undefined || salon.id === null) continue;
      adminOptions.push({
        id: salon.id,
        name: salon.name || "Chi nhánh #" + salon.id,
      });
    }

    const selectedName =
      findSalonName(adminOptions, selectedSalonId) ?? "Tất cả chi nhánh";

    const items: DropdownItem[] = [
      {
        type: "item",
        label: "Tất cả chi nhánh",
        onClick: () => setSelectedSalonId(null),
      },
    ];

    for (let index = 0; index < adminOptions.length; index++) {
      const salon = adminOptions[index];
      items.push({
        type: "item",
        label: salon.name,
        onClick: () => setSelectedSalonId(salon.id),
      });
    }

    return (
      <Dropdown
        className={dropdownClassName}
        variant={dropdownVariant}
        size="sm"
        label={selectedName}
        trigger={<BranchDropdownTrigger label={selectedName} />}
        items={items}
      />
    );
  }

  if (assignedSalons.length === 0) {
    return (
      <div
        className={
          "flex h-8 w-full items-center gap-1.5 rounded px-3 text-xs " +
          emptyClassByVariant[variant]
        }
      >
        <MapPin className="size-3.5 shrink-0" />
        <span className="truncate">Chưa phân chi nhánh</span>
      </div>
    );
  }

  if (assignedSalons.length === 1) {
    return (
      <div
        className={
          "flex h-8 w-full max-w-60 items-center gap-1.5 truncate rounded px-3 text-xs " +
          singleClassByVariant[variant]
        }
      >
        <MapPin className="size-3.5 shrink-0 opacity-80" />
        <span className="truncate">{assignedSalons[0].name}</span>
      </div>
    );
  }

  const selectedName =
    findSalonName(assignedSalons, selectedSalonId) ?? assignedSalons[0].name;

  const items: DropdownItem[] = [];
  for (let index = 0; index < assignedSalons.length; index++) {
    const salon = assignedSalons[index];
    items.push({
      type: "item",
      label: salon.name,
      onClick: () => setSelectedSalonId(salon.id),
    });
  }

  return (
    <Dropdown
      className={dropdownClassName}
      variant={dropdownVariant}
      size="sm"
      label={selectedName}
      trigger={<BranchDropdownTrigger label={selectedName} />}
      items={items}
    />
  );
}
