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

export function BranchSelector() {
  const { user, hasRole, selectedSalonId, setSelectedSalonId, managedSalonId, mySalon } = useAuthStore();
  const isAdmin = hasRole("Admin");
  
  // 1. Fetch all salons (only for Admin)
  const { data: allSalons = [], isLoading: isLoadingAllSalons } = useActiveSalons();

  // 2. Fetch assigned salons (for non-Admin: Manager, Staff, Receptionist)
  const staffId = user?.staffInfo?.id;
  const { data: staffSalonsResult, isLoading: isLoadingStaffSalons } = useQuery({
    queryKey: ["staff-salons-assigned", staffId],
    queryFn: () => staffSalonApi.getAll({ staffId, status: 1, pageIndex: 1, pageSize: 100 }),
    enabled: !isAdmin && !!staffId,
  });

  // Memoize assigned salons list for non-Admins
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
            name: item.salonName || `Chi nhánh #${item.salonId}`
          });
        }
      }
    });
    
    // Fallback if empty but managedSalonId is set
    if (list.length === 0 && managedSalonId) {
      list.push({
        id: managedSalonId,
        name: mySalon?.salonName || "Chi nhánh quản lý"
      });
    }
    
    return list;
  }, [isAdmin, staffSalonsResult, managedSalonId, mySalon?.salonName]);

  // Auto-selection logic based on roles
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
      <div className="animate-pulse bg-lotus-leaf/10 h-10 w-full rounded-admin border border-lotus-leaf/20 flex items-center justify-center text-xs text-lotus-leaf font-medium px-4">
        <MapPin className="w-3.5 h-3.5 text-lotus-leaf shrink-0 mr-1.5 animate-bounce" />
        Đang tải chi nhánh...
      </div>
    );
  }

  // Admin select logic
  if (isAdmin) {
    const value = selectedSalonId !== null ? selectedSalonId.toString() : "all";

    const handleValueChange = (val: string) => {
      if (val === "all") {
        setSelectedSalonId(null);
      } else {
        setSelectedSalonId(parseInt(val, 10));
      }
    };

    return (
      <div className="flex items-center gap-1.5 w-full">
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full bg-lotus-leaf/10 hover:bg-lotus-leaf/15 text-lotus-leaf border border-lotus-leaf/20 h-10 py-1.5 text-xs font-semibold focus:ring-lotus-leaf/20">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-lotus-leaf shrink-0" />
              <SelectValue placeholder="Chọn chi nhánh" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs font-medium focus:bg-lotus-cream/50">
              Tất cả chi nhánh
            </SelectItem>
            {allSalons.map((salon) => (
              <SelectItem
                key={salon.id}
                value={salon.id?.toString() ?? ""}
                className="text-xs font-medium focus:bg-lotus-cream/50"
              >
                {salon.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Non-Admin (Manager, Staff, Receptionist) select logic
  if (assignedSalons.length === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-admin border border-stone-200 h-10 w-full text-stone-400">
        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span className="text-xs font-medium truncate">Chưa phân chi nhánh</span>
      </div>
    );
  }

  if (assignedSalons.length === 1) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-lotus-leaf/10 rounded-admin border border-lotus-leaf/20 h-10 w-full max-w-[240px] truncate shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-lotus-leaf shrink-0" />
        <span className="text-xs font-semibold text-lotus-leaf truncate">{assignedSalons[0].name}</span>
      </div>
    );
  }

  // Multiple assigned salons dropdown
  const value = selectedSalonId !== null ? selectedSalonId.toString() : "";
  const handleValueChange = (val: string) => {
    setSelectedSalonId(parseInt(val, 10));
  };

  return (
    <div className="flex items-center gap-1.5 w-full">
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full bg-lotus-leaf/10 hover:bg-lotus-leaf/15 text-lotus-leaf border border-lotus-leaf/20 h-10 py-1.5 text-xs font-semibold focus:ring-lotus-leaf/20">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-lotus-leaf shrink-0" />
            <SelectValue placeholder="Chọn chi nhánh" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {assignedSalons.map((salon) => (
            <SelectItem
              key={salon.id}
              value={salon.id.toString()}
              className="text-xs font-medium focus:bg-lotus-cream/50"
            >
              {salon.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
