import { Pencil, Crown, Percent, HandCoins } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { useMembershipTierDetail } from "../hooks/useMembershipTiers";
import type { MembershipTierDto } from "../types/membershipTier.types";
import { formatCurrency } from "@/shared/utils/currency";
import { CUSTOMER_PERM } from "../constants/customer.permissions";

const STATUS_MAP: Record<number, string> = {
  0: "Ngưng hoạt động",
  1: "Hoạt động",
  2: "Tạm khóa",
};

interface MembershipTierDetailExpandedProps {
  tierId: number;
  onEdit?: (tier: MembershipTierDto) => void;
}

export function MembershipTierDetailExpanded({
  tierId,
  onEdit,
}: MembershipTierDetailExpandedProps) {
  const { data: result, isLoading } = useMembershipTierDetail(tierId);
  const tier = result?.data;
  const perm = CUSTOMER_PERM;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-adminGray-50/30">
        <Skeleton className="w-48 h-6" />
        <div className="grid grid-cols-2 gap-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!tier) {
    return (
      <div className="p-6 text-center text-adminGray-600 text-sm bg-adminGray-50/30">
        Không tìm thấy thông tin loại thẻ
      </div>
    );
  }

  return (
    <div className="bg-adminGray-50/30 w-full overflow-hidden p-6 border-t border-adminGray-100/50">
      <div className="flex flex-col gap-5">
        {/* Header info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-state-warning-bg flex items-center justify-center shrink-0 shadow-sm border border-state-warning-border/50">
            <Crown className="w-6 h-6 text-adminGold-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-adminInk truncate">
              {tier.name}
            </h3>
            <p className="text-xs font-medium text-adminGray-600 mt-0.5">
              Trạng thái:{" "}
              <span
                className={
                  tier.status === 1 ? "text-adminGreen-600" : "text-state-warning-text"
                }
              >
                {STATUS_MAP[tier.status] ?? "Không rõ"}
              </span>
            </p>
          </div>
        </div>

        {/* Grid info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DetailCard
            icon={HandCoins}
            label="Chi tiêu tối thiểu"
            value={formatCurrency(tier.minSpending)}
          />
          <DetailCard
            icon={Percent}
            label="Giảm giá (%)"
            value={`${tier.discountPercent ?? 0}%`}
          />
          <DetailCard
            icon={Crown}
            label="Hệ số điểm"
            value={`x${tier.pointMultiplier}`}
          />
          <div className="flex flex-col">
            <p className="text-xs font-medium text-adminGray-600 mb-1">
              Ngày tạo
            </p>
            <p className="text-sm text-adminInk font-medium">
              {tier.createdAt || "—"}
            </p>
          </div>
        </div>

        {/* Benefits & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 pt-4 border-t border-adminGray-100/80">
          <div className="flex-1">
            <p className="text-xs font-medium text-adminGray-600 mb-1">
              Quyền lợi chi tiết
            </p>
            <p className="text-sm text-adminInk whitespace-pre-wrap">
              {tier.benefits || "Chưa cập nhật quyền lợi"}
            </p>
          </div>
          <PermissionGate resource={perm.resource} action={perm.update}>
            <Button
              variant="admin"
              size="sm"
              onClick={() => onEdit?.(tier)}
              className="bg-adminGreen-600 hover:opacity-90 text-white shadow-sm h-8 px-4 text-sm gap-1.5 rounded-md transition-opacity shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              Chỉnh sửa
            </Button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-lg p-3 border border-adminGray-100 shadow-sm flex items-start gap-3">
      <div className="w-8 h-8 rounded-md bg-adminGray-50 flex items-center justify-center shrink-0 text-adminGray-600">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-adminGray-600 truncate mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-adminInk truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
