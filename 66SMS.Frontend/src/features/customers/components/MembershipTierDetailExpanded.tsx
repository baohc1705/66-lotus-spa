import { CUSTOMER_PERM } from "@/features/customers/constants/customer.permissions";
import { useMembershipTierDetail } from "@/features/customers/hooks/useMembershipTiers";
import type { MembershipTierDto } from "@/features/customers/types/membershipTier.types";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tabs } from "@/shared/components/Tabs";
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
import { Crown, Pencil } from "lucide-react";
import { useState } from "react";

interface Props {
  tierId: number;
  onEdit?: (tier: MembershipTierDto) => void;
}

function tierStatusLabel(status?: number) {
  if (status === 1) return "Hoạt động";
  if (status === 2) return "Tạm khóa";
  return "Ngưng hoạt động";
}

function tierStatusBadge(status?: number) {
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

export function MembershipTierDetailExpanded({ tierId, onEdit }: Props) {
  const { data: result, isLoading } = useMembershipTierDetail(tierId);
  const tier = result?.data;
  const perm = CUSTOMER_PERM;
  const [tabId, setTabId] = useState("info");

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

  if (!tier) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="py-4 text-center text-sm text-kit-muted">
          Không tìm thấy thông tin hạng thành viên
        </p>
      </TableDetailExpanded>
    );
  }

  return (
    <TableDetailExpanded className="bg-kit-white" maxHeightClass="max-h-100">
      <Tabs
        variant="body"
        activeId={tabId}
        onChange={setTabId}
        navClassName="mb-2"
        tabs={[
          {
            id: "info",
            label: "Thông tin",
            content: (
              <>
                <TableDetailHeader
                  icon={<Crown className="h-5 w-5 text-kit-primary" />}
                  title={
                    <span className="flex flex-wrap items-center gap-2">
                      <span>{tier.name ?? "-"}</span>
                      {tierStatusBadge(tier.status)}
                    </span>
                  }
                  subtitle={`Mã: ${tier.code || "-"}`}
                />

                <TableDetailGrid cols={3}>
                  <TableDetailField label="Mã hạng" value={tier.code} />
                  <TableDetailField
                    label="Chi tiêu tối thiểu"
                    value={formatCurrency(tier.minSpending)}
                  />
                  <TableDetailField
                    label="Giảm giá (%)"
                    value={
                      tier.discountPercent != null
                        ? `${tier.discountPercent}%`
                        : "-"
                    }
                  />
                  <TableDetailField
                    label="Hệ số điểm"
                    value={
                      tier.pointMultiplier != null
                        ? `x${tier.pointMultiplier}`
                        : "-"
                    }
                  />
                  <TableDetailField
                    label="Trạng thái"
                    value={tierStatusLabel(tier.status)}
                  />
                  <TableDetailField
                    label="Ngày tạo"
                    value={formatDateTimeDisplay(tier.createdAt)}
                  />
                  <TableDetailField
                    label="Ngày cập nhật"
                    value={formatDateTimeDisplay(tier.updatedAt)}
                  />
                </TableDetailGrid>
              </>
            ),
          },
          {
            id: "benefits",
            label: "Quyền lợi",
            content: (
              <>
                {tier.benefits ? (
                  <p className="whitespace-pre-wrap text-sm text-kit-body">
                    {tier.benefits}
                  </p>
                ) : (
                  <p className="py-6 text-center text-sm text-kit-muted">
                    Chưa cập nhật quyền lợi
                  </p>
                )}
              </>
            ),
          },
        ]}
      />

      {onEdit ? (
        <TableDetailActions>
          <PermissionGate resource={perm.resource} action={perm.update}>
            <Button
              variant="admin"
              size="sm"
              className="mb-0"
              onClick={() => onEdit(tier)}
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
