import { StatCard } from "@/shared/widgets/StatCard";

interface BookingPositionStatCardsProps {
  totalPositions: number;
  activePositions: number;
  maintenancePositions: number;
  isLoading?: boolean;
}

export function BookingPositionStatCards({
  totalPositions,
  activePositions,
  maintenancePositions,
  isLoading = false,
}: BookingPositionStatCardsProps) {
  const dash = isLoading ? "—" : undefined;

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        title="Tổng vị trí"
        value={dash ?? totalPositions}
        description="Giường / vị trí"
        tone="tempting-azure"
        valueTone="white"
      />
      <StatCard
        title="Đang hoạt động"
        value={dash ?? activePositions}
        description="Sẵn sàng dùng"
        tone="happy-green"
        valueTone="white"
      />
      <StatCard
        title="Bảo trì / tạm dừng"
        value={dash ?? maintenancePositions}
        description="Ngưng hoạt động"
        tone="sunny-morning"
        valueTone="dark"
      />
    </div>
  );
}
