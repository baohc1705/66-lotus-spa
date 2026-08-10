import { StatCard } from "@/shared/widgets/StatCard";
import { formatCurrency } from "@/shared/utils/currency";

interface StaffStatCardsProps {
  totalStaffs: number;
  activeStaffs: number;
  inactiveStaffs: number;
  avgSalary: number;
  isLoading?: boolean;
}

export function StaffStatCards({
  totalStaffs,
  activeStaffs,
  inactiveStaffs,
  avgSalary,
  isLoading = false,
}: StaffStatCardsProps) {
  const dash = isLoading ? "—" : undefined;

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
      <StatCard
        title="Tổng nhân viên"
        value={dash ?? totalStaffs}
        description="Trong danh sách"
        tone="midnight-bloom"
        valueTone="white"
      />
      <StatCard
        title="Đang làm việc"
        value={dash ?? activeStaffs}
        description="Trạng thái hoạt động"
        tone="happy-green"
        valueTone="white"
      />
      <StatCard
        title="Tạm nghỉ"
        value={dash ?? inactiveStaffs}
        description="Tạm ngưng làm việc"
        tone="tempting-azure"
        valueTone="white"
      />
      <StatCard
        title="Lương cơ bản TB"
        value={dash ?? (avgSalary > 0 ? formatCurrency(avgSalary) : "—")}
        description="Trung bình trang hiện tại"
        tone="sunny-morning"
        valueTone="dark"
      />
    </div>
  );
}
