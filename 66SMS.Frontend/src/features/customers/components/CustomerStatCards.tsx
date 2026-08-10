import { StatCard } from "@/shared/widgets/StatCard";

interface CustomerStatCardsProps {
  totalCustomers: number;
  activeCustomers: number;
  totalPoints: number;
  walkInCustomers: number;
  isLoading: boolean;
}

export function CustomerStatCards({
  totalCustomers,
  activeCustomers,
  totalPoints,
  walkInCustomers,
  isLoading,
}: CustomerStatCardsProps) {
  const dash = isLoading ? "—" : undefined;

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
      <StatCard
        title="Tổng số khách hàng"
        value={dash ?? totalCustomers}
        description="Trong danh sách"
        tone="midnight-bloom"
        valueTone="white"
      />
      <StatCard
        title="Khách hàng hoạt động"
        value={dash ?? activeCustomers}
        description="Trạng thái hoạt động"
        tone="happy-green"
        valueTone="white"
      />
      <StatCard
        title="Tổng điểm tích lũy"
        value={dash ?? totalPoints}
        description="Điểm loyalty"
        tone="sunny-morning"
        valueTone="dark"
      />
      <StatCard
        title="Khách vãng lai (Walk-in)"
        value={dash ?? walkInCustomers}
        description="Nguồn Walk-in"
        tone="love-kiss"
        valueTone="white"
      />
    </div>
  );
}
