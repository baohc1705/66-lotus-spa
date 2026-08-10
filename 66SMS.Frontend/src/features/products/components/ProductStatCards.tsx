import { StatCard } from "@/shared/widgets/StatCard";

interface ProductStatCardsProps {
  totalProducts: number;
  activeProducts: number;
  totalStock: number;
  isLoading?: boolean;
}

export function ProductStatCards({
  totalProducts,
  activeProducts,
  totalStock,
  isLoading = false,
}: ProductStatCardsProps) {
  const dash = isLoading ? "—" : undefined;

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
      <StatCard
        title="Tổng sản phẩm"
        value={dash ?? totalProducts}
        description="Trong danh sách"
        tone="midnight-bloom"
        valueTone="white"
      />
      <StatCard
        title="Đang kinh doanh"
        value={dash ?? activeProducts}
        description="Trạng thái hoạt động"
        tone="happy-green"
        valueTone="white"
      />
      <StatCard
        title="Tồn kho tổng"
        value={dash ?? totalStock}
        description="Số lượng còn lại"
        tone="tempting-azure"
        valueTone="white"
      />
    </div>
  );
}
