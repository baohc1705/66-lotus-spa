import { StaffSalonPage } from "@/features/salons/pages/StaffSalonPage";
import { SalonStatusBadge } from "@/features/salons/components/SalonStatusBadge";
import { SALON_PERM } from "@/features/salons/constants/salon.permissions";
import { useSalonDetail } from "@/features/salons/hooks/useSalons";
import type { SalonFullDto } from "@/features/salons/types/salon.types";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface Props {
  salonId: number;
  onEdit?: (salon: SalonFullDto) => void;
}

export function SalonDetailExpanded({ salonId, onEdit }: Props) {
  const { data: result, isLoading } = useSalonDetail(salonId);
  const salon = result?.data;
  const perm = SALON_PERM;
  const [tabId, setTabId] = useState("info");

  if (isLoading) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="text-sm text-kit-muted">Đang tải chi tiết chi nhánh...</p>
      </TableDetailExpanded>
    );
  }

  if (!salon) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="text-sm text-kit-muted">
          Không tìm thấy thông tin chi nhánh
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
            label: "Thông tin chung",
            content: (
              <>
                <TableDetailHeader
                  icon={
                    <FallbackImage
                      kind="salon"
                      src={salon.imageUrl}
                      alt={salon.name ?? ""}
                      className="h-full w-full object-cover"
                    />
                  }
                  title={
                    <span className="inline-flex items-center gap-2">
                      {salon.name ?? "—"}
                      <span className="text-xs font-medium text-kit-muted">
                        {salon.code}
                      </span>
                    </span>
                  }
                  subtitle={<SalonStatusBadge status={salon.status} />}
                />

                <TableDetailGrid cols={3}>
                  <TableDetailField label="Số điện thoại" value={salon.phone} />
                  <TableDetailField label="Email" value={salon.email} />
                  <TableDetailField label="Mã số thuế" value={salon.taxCode} />
                  <TableDetailField
                    label="Ngày làm việc"
                    value={salon.workingDays}
                  />
                  <TableDetailField
                    label="Thứ tự hiển thị"
                    value={salon.sortOrder?.toString()}
                  />
                  <TableDetailField
                    label="Địa chỉ"
                    value={
                      salon.fullAddress ? (
                        <div className="space-y-1">
                          <p className="truncate">{salon.fullAddress}</p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.fullAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-kit-primary hover:underline"
                          >
                            Xem trên Google Maps
                          </a>
                        </div>
                      ) : undefined
                    }
                  />
                </TableDetailGrid>

                {salon.description ? (
                  <TableDetailField label="Mô tả" value={salon.description} />
                ) : null}
              </>
            ),
          },
          {
            id: "staff",
            label: "Nhân viên",
            content: <StaffSalonPage salonId={salonId} />,
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
              onClick={() => onEdit(salon)}
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
