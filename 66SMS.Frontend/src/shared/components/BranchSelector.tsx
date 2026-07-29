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
  
  const { data: allSalons = [], isLoading: isLoadingAllSalons } = useActiveSalons();

  const staffId = user?.staffInfo?.id;
  const { data: staffSalonsResult, isLoading: isLoadingStaffSalons } = useQuery({
    queryKey: ["staff-salons-assigned", staffId],
    queryFn: () => staffSalonApi.getAll({ staffId, status: 1, pageIndex: 1, pageSize: 100 }),
    enabled: !isAdmin && !!staffId,
  });

  // Salon được gán (role không phải Admin)
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
    
    // Không có gán thì dùng managedSalonId
    if (list.length === 0 && managedSalonId) {
      list.push({
        id: managedSalonId,
        name: mySalon?.salonName || "Chi nhánh quản lý"
      });
    }
    
    return list;
  }, [isAdmin, staffSalonsResult, managedSalonId, mySalon?.salonName]);

  // Tự chọn salon theo role
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
      <div className="animate-pulse bg-transparent h-8 w-full rounded-[4px] border border-white/20 flex items-center justify-center text-xs text-white/80 font-normal px-4">
        <MapPin className="w-3.5 h-3.5 text-white/80 shrink-0 mr-1.5 animate-bounce" />
        Đang tải...
      </div>
    );
  }

  // Admin: chọn tất cả / từng chi nhánh
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
          <SelectTrigger className="w-full !bg-transparent hover:!bg-transparent focus:!bg-transparent data-[state=open]:!bg-transparent !text-white border border-white/25 h-8 py-1 rounded-[4px] text-xs font-normal focus:ring-0 focus:ring-offset-0 [&_svg]:!text-white/80">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-white/80 shrink-0" />
              <SelectValue placeholder="Chọn chi nhánh" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs font-medium focus:bg-adminGray-50/50">
              Tất cả chi nhánh
            </SelectItem>
            {allSalons.map((salon) => (
              <SelectItem
                key={salon.id}
                value={salon.id?.toString() ?? ""}
                className="text-xs font-medium focus:bg-adminGray-50/50"
              >
                {salon.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Role khác Admin
  if (assignedSalons.length === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-transparent rounded-[4px] border border-white/20 h-8 w-full text-white/60">
        <MapPin className="w-3.5 h-3.5 text-white/60 shrink-0" />
        <span className="text-xs font-normal truncate">Chưa phân chi nhánh</span>
      </div>
    );
  }

  if (assignedSalons.length === 1) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-transparent rounded-[4px] border border-white/25 h-8 w-full max-w-[240px] truncate text-white">
        <MapPin className="w-3.5 h-3.5 text-white/80 shrink-0" />
        <span className="text-xs font-normal truncate">{assignedSalons[0].name}</span>
      </div>
    );
  }

  // Nhiều chi nhánh: dropdown
  const value = selectedSalonId !== null ? selectedSalonId.toString() : "";
  const handleValueChange = (val: string) => {
    setSelectedSalonId(parseInt(val, 10));
  };

  return (
    <div className="flex items-center gap-1.5 w-full">
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full !bg-transparent hover:!bg-transparent focus:!bg-transparent data-[state=open]:!bg-transparent !text-white border border-white/25 h-8 py-1 rounded-[4px] text-xs font-normal focus:ring-0 focus:ring-offset-0 [&_svg]:!text-white/80">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-white/80 shrink-0" />
            <SelectValue placeholder="Chọn chi nhánh" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {assignedSalons.map((salon) => (
            <SelectItem
              key={salon.id}
              value={salon.id.toString()}
              className="text-xs font-medium focus:bg-adminGray-50/50"
            >
              {salon.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
