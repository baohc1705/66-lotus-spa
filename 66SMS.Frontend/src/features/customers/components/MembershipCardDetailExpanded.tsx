import { CreditCard, Pencil } from "lucide-react";
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
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import { useMembershipCardDetail } from "../hooks/useMembershipCards";
import type { MembershipCardDto } from "../types/membershipCard.types";

interface MembershipCardDetailExpandedProps {
  cardId: number;
  onEdit?: (card: MembershipCardDto) => void;
}

function cardStatusLabel(status: number) {
  if (status === 1) return "Hoạt động";
  if (status === 2) return "Hết hạn";
  if (status === 3) return "Đã thu hồi";
  return "Không rõ";
}

function cardStatusBadge(status: number) {
  if (status === 1) {
    return (
      <Badge variant="success" soft>
        {cardStatusLabel(status)}
      </Badge>
    );
  }
  if (status === 2) {
    return (
      <Badge variant="warning" soft>
        {cardStatusLabel(status)}
      </Badge>
    );
  }
  if (status === 3) {
    return (
      <Badge variant="danger" soft>
        {cardStatusLabel(status)}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      {cardStatusLabel(status)}
    </Badge>
  );
}

export function MembershipCardDetailExpanded({
  cardId,
  onEdit,
}: MembershipCardDetailExpandedProps) {
  const { data: result, isLoading } = useMembershipCardDetail(cardId);
  const card = result?.data;
  const perm = CUSTOMER_PERM;

  if (isLoading) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">
          Đang tải chi tiết thẻ thành viên...
        </p>
      </TableDetailExpanded>
    );
  }

  if (!card) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">
          Không tìm thấy thông tin thẻ thành viên
        </p>
      </TableDetailExpanded>
    );
  }

  return (
    <TableDetailExpanded>
      <TableDetailHeader
        icon={<CreditCard className="h-5 w-5 text-kit-primary" />}
        title={`Mã thẻ: ${card.cardCode}`}
        subtitle={cardStatusBadge(card.status)}
      />

      <TableDetailGrid cols={4}>
        <TableDetailField
          label="Khách hàng"
          value={card.customerName ?? "—"}
        />
        <TableDetailField label="Loại thẻ" value={card.tierName ?? "—"} />
        <TableDetailField
          label="Ngày cấp"
          value={card.issuedAt ? formatDisplayDate(card.issuedAt) : "—"}
        />
        <TableDetailField
          label="Ngày hết hạn"
          value={
            card.expiresAt ? formatDisplayDate(card.expiresAt) : "Vĩnh viễn"
          }
        />
      </TableDetailGrid>

      <TableDetailActions>
        <PermissionGate resource={perm.resource} action={perm.update}>
          <Button
            variant="admin"
            size="sm"
            className="mb-0"
            onClick={() => onEdit?.(card)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Chỉnh sửa
          </Button>
        </PermissionGate>
      </TableDetailActions>
    </TableDetailExpanded>
  );
}
