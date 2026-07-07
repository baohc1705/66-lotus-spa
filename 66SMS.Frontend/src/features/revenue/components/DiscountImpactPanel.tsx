import { Tag, Percent, Gift, Trophy } from "lucide-react";
import { formatCurrency } from "@/shared/utils/currency";

interface DiscountImpactPanelProps {
  data?: {
    manual: number;
    membership: number;
    loyalty: number;
    promotion: number;
    totalPercent: number;
  };
  isLoading: boolean;
}

export function DiscountImpactPanel({ data, isLoading }: DiscountImpactPanelProps) {
  if (isLoading || !data) {
    return (
      <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30 h-[280px] flex flex-col justify-between">
        <div className="h-5 w-48 bg-stone-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="h-16 bg-stone-100 rounded animate-pulse" />
          <div className="h-16 bg-stone-100 rounded animate-pulse" />
          <div className="h-16 bg-stone-100 rounded animate-pulse" />
          <div className="h-16 bg-stone-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const { manual, membership, loyalty, promotion, totalPercent } = data;
  const totalDiscount = manual + membership + loyalty + promotion;

  const discountItems = [
    {
      label: "Giảm giá thủ công",
      value: manual,
      icon: Tag,
      color: "text-lotus-gold bg-lotus-gold/10",
      description: "Nhân viên giảm trực tiếp",
    },
    {
      label: "Ưu đãi thẻ thành viên",
      value: membership,
      icon: Trophy,
      color: "text-lotus-accent bg-lotus-surface",
      description: "Theo hạng VIP của khách",
    },
    {
      label: "Điểm thưởng tích lũy",
      value: loyalty,
      icon: Percent,
      color: "text-lotus-leaf bg-lotus-leaf/10",
      description: "Quy đổi điểm thành tiền",
    },
    {
      label: "Khuyến mãi & Mã giảm",
      value: promotion,
      icon: Gift,
      color: "text-lotus-rose bg-lotus-rose-light",
      description: "Chiến dịch Marketing áp dụng",
    },
  ];

  return (
    <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30 flex flex-col h-[280px]">
      <div>
        <h3 className="font-sans text-lotus-admin-lg font-bold text-lotus-deep">
          Tác Động Giảm Giá & Ưu Đãi
        </h3>
        <p className="text-lotus-admin-base text-lotus-stone mt-0.5">
          Xem xét các lý do làm giảm doanh thu tiềm năng trong kỳ
        </p>
      </div>

      <div className="mt-4 flex flex-col flex-1 justify-between">
        <div className="flex justify-between items-baseline mb-3">
          <div className="flex flex-col">
            <span className="text-lotus-admin-xs text-stone-400 font-bold uppercase tracking-wider">Tổng tiền giảm trừ</span>
            <span className="text-sm font-bold text-lotus-deep">{formatCurrency(totalDiscount)}</span>
          </div>
          <span className="text-lotus-admin-base font-bold text-lotus-rose bg-lotus-rose-light px-2.5 py-1 rounded-admin border border-lotus-rose/10">
            Giảm {totalPercent}% doanh số gộp
          </span>
        </div>

        {/* 2x2 Grid of Discount Types */}
        <div className="grid grid-cols-2 gap-3">
          {discountItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="p-2.5 rounded-admin bg-white/40 border border-stone-100 flex gap-2.5 items-start hover:bg-white/80 transition-colors"
              >
                <div className={`w-7.5 h-7.5 rounded-admin shrink-0 flex items-center justify-center ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-lotus-admin-xs font-bold text-lotus-deep truncate block">
                    {item.label}
                  </span>
                  <span className="text-lotus-admin-md font-bold text-lotus-deep block mt-0.5">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-lotus-admin-xs text-stone-400 font-medium block truncate">
                    {item.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
