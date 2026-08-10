import { StatCard } from "@/shared/widgets/StatCard";
import { formatCurrency } from "@/shared/utils/currency";

interface InvoiceStatCardsProps {
  paidRevenue: number;
  paidCount: number;
  unpaidCount: number;
  cancelledCount: number;
  isLoading?: boolean;
}

export function InvoiceStatCards({
  paidRevenue,
  paidCount,
  unpaidCount,
  cancelledCount,
  isLoading = false,
}: InvoiceStatCardsProps) {
  const dash = isLoading ? "—" : undefined;

  return (
    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Doanh thu (Đã TT)"
        value={dash ?? formatCurrency(paidRevenue)}
        description="Tổng tiền đã thanh toán"
        tone="sunny-morning"
        valueTone="dark"
      />
      <StatCard
        title="Đã thanh toán"
        value={dash ?? paidCount}
        description="Hóa đơn hoàn tất"
        tone="happy-green"
        valueTone="white"
      />
      <StatCard
        title="Chưa thanh toán"
        value={dash ?? unpaidCount}
        description="Đang chờ thanh toán"
        tone="tempting-azure"
        valueTone="white"
      />
      <StatCard
        title="Đã hủy"
        value={dash ?? cancelledCount}
        description="Hóa đơn đã hủy"
        tone="midnight-bloom"
        valueTone="white"
      />
    </div>
  );
}
