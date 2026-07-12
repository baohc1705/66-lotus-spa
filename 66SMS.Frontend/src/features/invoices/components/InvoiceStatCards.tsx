import { Coins, FileCheck, Clock, Ban } from "lucide-react";
import { AdminStatCard } from "@/shared/components/AdminStatCard";

interface InvoiceStatCardsProps {
  paidRevenue: number;
  paidCount: number;
  unpaidCount: number;
  cancelledCount: number;
  isLoading: boolean;
}

export function InvoiceStatCards({
  paidRevenue,
  paidCount,
  unpaidCount,
  cancelledCount,
  isLoading,
}: InvoiceStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
      <AdminStatCard
        label="Doanh thu (Đã TT)"
        value={paidRevenue}
        icon={Coins}
        tone="gold"
        valueClass="text-adminGold-600"
        isLoading={isLoading}
        isCurrency
      />
      <AdminStatCard label="Đã thanh toán" value={paidCount} icon={FileCheck} tone="green" isLoading={isLoading} />
      <AdminStatCard label="Chưa thanh toán" value={unpaidCount} icon={Clock} tone="warning" isLoading={isLoading} />
      <AdminStatCard label="Đã hủy" value={cancelledCount} icon={Ban} tone="danger" isLoading={isLoading} />
    </div>
  );
}
