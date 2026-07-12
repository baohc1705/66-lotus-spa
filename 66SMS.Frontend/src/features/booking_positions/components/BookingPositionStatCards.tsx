import { Bed, CheckCircle2, Wrench } from "lucide-react";
import { AdminStatCard } from "@/shared/components/AdminStatCard";

interface BookingPositionStatCardsProps {
  totalPositions: number;
  activePositions: number;
  maintenancePositions: number;
  isLoading: boolean;
}

export function BookingPositionStatCards({
  totalPositions,
  activePositions,
  maintenancePositions,
  isLoading,
}: BookingPositionStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <AdminStatCard label="Tổng số giường / vị trí" value={totalPositions} icon={Bed} tone="gold" isLoading={isLoading} />
      <AdminStatCard label="Đang hoạt động" value={activePositions} icon={CheckCircle2} tone="green" isLoading={isLoading} />
      <AdminStatCard label="Đang bảo trì / tạm dừng" value={maintenancePositions} icon={Wrench} tone="warning" isLoading={isLoading} />
    </div>
  );
}
