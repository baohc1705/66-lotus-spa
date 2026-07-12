import { MapPin } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useSalonDetail } from "@/features/salons/hooks/useSalons";

export function SalonScopeIndicator() {
  const managedSalonId = useAuthStore((s) => s.managedSalonId);
  const { data: salonResult } = useSalonDetail(managedSalonId);
  const salonName = salonResult?.data?.name;

  if (!managedSalonId) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-state-info-border bg-state-info-bg px-3 py-2 text-sm text-state-info-text">
      <MapPin className="h-4 w-4 shrink-0" />
      <span>
        Đang xem dữ liệu chi nhánh:{" "}
        <span className="font-medium">{salonName ?? `#${managedSalonId}`}</span>
      </span>
    </div>
  );
}
