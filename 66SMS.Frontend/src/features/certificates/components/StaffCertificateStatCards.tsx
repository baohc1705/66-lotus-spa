import { StatCard } from "@/shared/widgets/StatCard";

interface StaffCertificateStatCardsProps {
  totalCount: number;
  activeCount: number;
  expiredCount: number;
  pendingCount: number;
  isLoading?: boolean;
}

export function StaffCertificateStatCards({
  totalCount,
  activeCount,
  expiredCount,
  pendingCount,
  isLoading = false,
}: StaffCertificateStatCardsProps) {
  const dash = isLoading ? "—" : undefined;

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
      <StatCard
        title="Tổng chứng chỉ"
        value={dash ?? totalCount}
        description="Tất cả chứng chỉ"
        tone="midnight-bloom"
        valueTone="white"
      />
      <StatCard
        title="Đang hiệu lực"
        value={dash ?? activeCount}
        description="Còn hạn sử dụng"
        tone="happy-green"
        valueTone="white"
      />
      <StatCard
        title="Hết hạn"
        value={dash ?? expiredCount}
        description="Đã quá hạn"
        tone="tempting-azure"
        valueTone="white"
      />
      <StatCard
        title="Chờ xác minh"
        value={dash ?? pendingCount}
        description="Chưa xác nhận"
        tone="sunny-morning"
        valueTone="dark"
      />
    </div>
  );
}
