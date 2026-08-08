import { StatCard } from "@/shared/widgets/StatCard";

interface BookingRoomStatCardsProps {
  totalRooms: number;
  availablePositions: number;
  inServicePositions: number;
  isLoading?: boolean;
}

export function BookingRoomStatCards({
  totalRooms,
  availablePositions,
  inServicePositions,
  isLoading = false,
}: BookingRoomStatCardsProps) {
  const dash = isLoading ? "—" : undefined;

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        title="Tổng phòng"
        value={dash ?? totalRooms}
        description="Phòng dịch vụ"
        tone="midnight-bloom"
        valueTone="white"
      />
      <StatCard
        title="Vị trí trống"
        value={dash ?? availablePositions}
        description="Sẵn sàng nhận khách"
        tone="happy-green"
        valueTone="white"
      />
      <StatCard
        title="Đang phục vụ"
        value={dash ?? inServicePositions}
        description="Vị trí đang dùng"
        tone="sunny-morning"
        valueTone="dark"
      />
    </div>
  );
}
