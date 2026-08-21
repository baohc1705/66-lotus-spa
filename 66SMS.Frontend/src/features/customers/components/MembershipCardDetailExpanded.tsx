import { CUSTOMER_PERM } from "@/features/customers/constants/customer.permissions";
import { useMembershipCardDetail } from "@/features/customers/hooks/useMembershipCards";
import type { MembershipCardDto } from "@/features/customers/types/membershipCard.types";
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
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";
import { CreditCard, Pencil } from "lucide-react";

interface Props {
  cardId: number;
  onEdit?: (card: MembershipCardDto) => void;
}

function cardStatusLabel(status?: number) {
  if (status === 1) return "Hoạt động";
  if (status === 2) return "Hết hạn";
  if (status === 3) return "Đã thu hồi";
  return "Không rõ";
}

function cardStatusBadge(status?: number) {
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

export function MembershipCardDetailExpanded({ cardId, onEdit }: Props) {
  const { data: result, isLoading } = useMembershipCardDetail(cardId);
  const card = result?.data;
  const perm = CUSTOMER_PERM;

  if (isLoading) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <div className="flex items-center gap-3 pb-2">
          <div className="h-11 w-11 animate-pulse rounded-lg bg-kit-page" />
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-kit-page" />
            <div className="h-3 w-32 animate-pulse rounded bg-kit-page" />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="h-24 animate-pulse rounded bg-kit-page" />
          <div className="h-24 animate-pulse rounded bg-kit-page" />
        </div>
      </TableDetailExpanded>
    );
  }

  if (!card) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="py-4 text-center text-sm text-kit-muted">
          Không tìm thấy thông tin thẻ thành viên
        </p>
      </TableDetailExpanded>
    );
  }

  let expiresAtValue = "Vĩnh viễn";
  if (card.expiresAt) {
    expiresAtValue = formatDateTimeDisplay(card.expiresAt);
  }

  return (
    <TableDetailExpanded className="bg-kit-white" maxHeightClass="max-h-100">
      <TableDetailHeader
        icon={<CreditCard className="h-5 w-5 text-kit-primary" />}
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span>{card.cardCode ?? "-"}</span>
            {cardStatusBadge(card.status)}
          </span>
        }
        subtitle={`Khách hàng: ${card.customerName || "-"}`}
      />

      <TableDetailGrid cols={3}>
        <TableDetailField label="Khách hàng" value={card.customerName} />
        <TableDetailField label="Loại thẻ" value={card.tierName} />
        <TableDetailField
          label="Trạng thái"
          value={cardStatusLabel(card.status)}
        />
        <TableDetailField
          label="Ngày cấp"
          value={formatDateTimeDisplay(card.issuedAt)}
        />
        <TableDetailField label="Ngày hết hạn" value={expiresAtValue} />
        <TableDetailField
          label="Ngày tạo"
          value={formatDateTimeDisplay(card.createdAt)}
        />
        <TableDetailField
          label="Ngày cập nhật"
          value={formatDateTimeDisplay(card.updatedAt)}
        />
      </TableDetailGrid>

      {onEdit ? (
        <TableDetailActions>
          <PermissionGate resource={perm.resource} action={perm.update}>
            <Button
              variant="admin"
              size="sm"
              className="mb-0"
              onClick={() => onEdit(card)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Cập nhật
            </Button>
          </PermissionGate>
        </TableDetailActions>
      ) : null}
    </TableDetailExpanded>
  );
}
