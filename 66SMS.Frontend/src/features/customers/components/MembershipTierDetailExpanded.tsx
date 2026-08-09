import { Crown, Pencil } from "lucide-react";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import { useMembershipTierDetail } from "../hooks/useMembershipTiers";
import type { MembershipTierDto } from "../types/membershipTier.types";

interface MembershipTierDetailExpandedProps {
  tierId: number;
  onEdit?: (tier: MembershipTierDto) => void;
}

function tierStatusLabel(status: number) {
  if (status === 1) return "Hoạt động";
  if (status === 2) return "Tạm khóa";
  return "Ngưng hoạt động";
}

function tierStatusBadge(status: number) {
  if (status === 1) {
    return (
      <Badge variant="success" soft>
        {tierStatusLabel(status)}
      </Badge>
    );
  }
  if (status === 2) {
    return (
      <Badge variant="warning" soft>
        {tierStatusLabel(status)}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      {tierStatusLabel(status)}
    </Badge>
  );
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
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">Đang tải chi tiết loại thẻ...</p>
      </TableDetailExpanded>
    );
  }

  if (!tier) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">
          Không tìm thấy thông tin loại thẻ
        </p>
      </TableDetailExpanded>
    );
  }

  return (
    <TableDetailExpanded>
      <TableDetailHeader
        icon={<Crown className="h-5 w-5 text-kit-primary" />}
        title={tier.name}
        subtitle={tierStatusBadge(tier.status)}
      />

      <TableDetailGrid cols={4}>
        <TableDetailField
          label="Chi tiêu tối thiểu"
          value={formatCurrency(tier.minSpending)}
        />
        <TableDetailField
          label="Giảm giá (%)"
          value={`${tier.discountPercent ?? 0}%`}
        />
        <TableDetailField
          label="Hệ số điểm"
          value={`x${tier.pointMultiplier}`}
        />
        <TableDetailField
          label="Ngày tạo"
          value={formatDateTimeDisplay(tier.createdAt)}
        />
        <TableDetailField
          label="Quyền lợi chi tiết"
          value={tier.benefits || "Chưa cập nhật quyền lợi"}
        />
      </TableDetailGrid>

      <TableDetailActions>
        <PermissionGate resource={perm.resource} action={perm.update}>
          <Button
            variant="admin"
            size="sm"
            className="mb-0"
            onClick={() => onEdit?.(tier)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Chỉnh sửa
          </Button>
        </PermissionGate>
      </TableDetailActions>
    </TableDetailExpanded>
  );
}
