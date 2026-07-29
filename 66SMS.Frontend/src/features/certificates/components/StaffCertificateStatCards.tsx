import { Shield, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { AdminStatCard } from "@/shared/components/AdminStatCard";

interface StaffCertificateStatCardsProps {
  totalCount: number;
  activeCount: number;
  expiredCount: number;
  pendingCount: number;
  isLoading: boolean;
}

export function StaffCertificateStatCards({
  totalCount,
  activeCount,
  expiredCount,
  pendingCount,
  isLoading,
}: StaffCertificateStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
      <AdminStatCard
        label="Tổng chứng chỉ"
        value={totalCount}
        icon={Shield}
        tone="gold"
        isLoading={isLoading}
      />
      <AdminStatCard
        label="Đang hoạt động"
        value={activeCount}
        icon={ShieldCheck}
        tone="green"
        isLoading={isLoading}
      />
      <AdminStatCard
        label="Hết hạn"
        value={expiredCount}
        icon={ShieldAlert}
        tone="danger"
        isLoading={isLoading}
      />
      <AdminStatCard
        label="Chờ xác minh"
        value={pendingCount}
        icon={Clock}
        tone="warning"
        isLoading={isLoading}
      />
    </div>
  );
}
