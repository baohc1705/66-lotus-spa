import { Package, TrendingUp, Warehouse } from "lucide-react";
import { AdminStatCard } from "@/shared/components/AdminStatCard";

interface ProductStatCardsProps {
  totalProducts: number;
  activeProducts: number;
  totalStock: number;
  isLoading: boolean;
}

export function ProductStatCards({
  totalProducts,
  activeProducts,
  totalStock,
  isLoading,
}: ProductStatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <AdminStatCard label="Tổng số sản phẩm" value={totalProducts} icon={Package} tone="gold" isLoading={isLoading} />
      <AdminStatCard label="Sản phẩm đang kinh doanh" value={activeProducts} icon={TrendingUp} tone="green" isLoading={isLoading} />
      <AdminStatCard label="Tồn kho tổng" value={totalStock} icon={Warehouse} tone="gold" isLoading={isLoading} />
    </div>
  );
}
