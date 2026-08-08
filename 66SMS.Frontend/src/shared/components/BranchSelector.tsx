import { useMemo, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";
import { useQuery } from "@tanstack/react-query";
import { staffSalonApi } from "@/features/staff_salons/api/staff-salon.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const triggerClass =
  "h-8 w-full rounded border border-white/25 bg-transparent px-3 py-1 text-xs text-white " +
  "hover:bg-transparent focus:bg-transparent focus:ring-0 data-[state=open]:bg-transparent";

export function BranchSelector() {
  const {
    user,
    hasRole,
    selectedSalonId,
    setSelectedSalonId,
    managedSalonId,
    mySalon,
  } = useAuthStore();
  const isAdmin = hasRole("Admin");

  const { data: allSalons = [], isLoading: isLoadingAllSalons } = useActiveSalons();

  const staffId = user?.staffInfo?.id;
  const { data: staffSalonsResult, isLoading: isLoadingStaffSalons } = useQuery({
    queryKey: ["staff-salons-assigned", staffId],
    queryFn: () =>
      staffSalonApi.getAll({
        staffId,
        status: 1,
        pageIndex: 1,
        pageSize: 100,
      }),
    enabled: !isAdmin && !!staffId,
  });

  const assignedSalons = useMemo(() => {
    if (isAdmin) return [];

    const list: Array<{ id: number; name: string }> = [];
    const seenIds = new Set<number>();

    (staffSalonsResult?.data?.items ?? []).forEach((item) => {
      if (item.salonId !== undefined && item.salonId !== null) {
        if (!seenIds.has(item.salonId)) {
          seenIds.add(item.salonId);
          list.push({
            id: item.salonId,
            name: item.salonName || `Chi nhánh #${item.salonId}`,
          });
        }
      }
    });

    if (list.length === 0 && managedSalonId) {
      list.push({
        id: managedSalonId,
        name: mySalon?.salonName || "Chi nhánh quản lý",
      });
    }

    return list;
  }, [isAdmin, staffSalonsResult, managedSalonId, mySalon?.salonName]);

  useEffect(() => {
    if (isAdmin) return;

    if (assignedSalons.length === 1) {
      const singleSalonId = assignedSalons[0].id;
      if (selectedSalonId !== singleSalonId) {
        setSelectedSalonId(singleSalonId);
      }
    } else if (assignedSalons.length > 1) {
      const isSelectedValid = assignedSalons.some((s) => s.id === selectedSalonId);
      if (!isSelectedValid) {
        setSelectedSalonId(assignedSalons[0].id);
      }
    } else if (managedSalonId) {
      if (selectedSalonId !== managedSalonId) {
        setSelectedSalonId(managedSalonId);
      }
    }
  }, [isAdmin, assignedSalons, selectedSalonId, setSelectedSalonId, managedSalonId]);

  const isLoading = isAdmin ? isLoadingAllSalons : isLoadingStaffSalons;

  if (isLoading) {
    return (
      <div className="flex h-8 w-full animate-pulse items-center justify-center gap-1.5 rounded border border-white/20 px-4 text-xs text-white/80">
        <MapPin className="size-3.5 shrink-0" />
        Đang tải...
      </div>
    );
  }

  if (isAdmin) {
    const value = selectedSalonId !== null ? selectedSalonId.toString() : "all";

    return (
      <Select
        value={value}
        onValueChange={(val: string) => {
          if (val === "all") setSelectedSalonId(null);
          else setSelectedSalonId(parseInt(val, 10));
        }}
      >
        <SelectTrigger className={triggerClass}>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3.5 shrink-0 opacity-80" />
            <SelectValue placeholder="Chọn chi nhánh" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            Tất cả chi nhánh
          </SelectItem>
          {allSalons.map((salon) => (
            <SelectItem key={salon.id} value={salon.id?.toString() ?? ""} className="text-xs">
              {salon.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (assignedSalons.length === 0) {
    return (
      <div className="flex h-8 w-full items-center gap-1.5 rounded border border-white/20 px-3 text-xs text-white/60">
        <MapPin className="size-3.5 shrink-0" />
        <span className="truncate">Chưa phân chi nhánh</span>
      </div>
    );
  }

  if (assignedSalons.length === 1) {
    return (
      <div className="flex h-8 w-full max-w-60 items-center gap-1.5 truncate rounded border border-white/25 px-3 text-xs text-white">
        <MapPin className="size-3.5 shrink-0 opacity-80" />
        <span className="truncate">{assignedSalons[0].name}</span>
      </div>
    );
  }

  const value = selectedSalonId !== null ? selectedSalonId.toString() : "";

  return (
    <Select
      value={value}
      onValueChange={(val: string) => setSelectedSalonId(parseInt(val, 10))}
    >
      <SelectTrigger className={triggerClass}>
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="size-3.5 shrink-0 opacity-80" />
          <SelectValue placeholder="Chọn chi nhánh" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {assignedSalons.map((salon) => (
          <SelectItem key={salon.id} value={salon.id.toString()} className="text-xs">
            {salon.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
