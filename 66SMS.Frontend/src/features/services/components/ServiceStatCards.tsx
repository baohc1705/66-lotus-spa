import { StatCard } from "@/shared/widgets/StatCard";

// Giải thích:
// 4 thẻ thống kê phía trên bảng dịch vụ
interface Props {
  totalServices: number;
  activeServices: number;
  servicesWithImage: number;
  avgDurationMins: number;
  isLoading?: boolean;
}

export function ServiceStatCards({
  totalServices,
  activeServices,
  //servicesWithImage,
  avgDurationMins,
  isLoading = false,
}: Props) {
  const dash = isLoading ? "—" : undefined;

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
      <StatCard
        title="Tổng dịch vụ"
        value={dash ?? totalServices}
        description="Trong danh sách"
        tone="midnight-bloom"
        valueTone="white"
      />
      <StatCard
        title="Đang kinh doanh"
        value={dash ?? activeServices}
        description="Trạng thái hoạt động"
        tone="happy-green"
        valueTone="white"
      />
      {/* <StatCard
        title="Có hình ảnh"
        value={dash ?? servicesWithImage}
        description="Đã gắn ảnh"
        tone="tempting-azure"
        valueTone="white"
      /> */}
      <StatCard
        title="Thời lượng TB"
        value={dash ?? avgDurationMins}
        description="Phút / dịch vụ"
        tone="sunny-morning"
        valueTone="dark"
      />
    </div>
  );
}
