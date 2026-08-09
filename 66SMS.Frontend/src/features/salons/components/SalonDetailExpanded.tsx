import { useState } from "react";
import { Pencil, Users } from "lucide-react";
import { Button } from "@/shared/elements/Button";
import { Nav, NavItem, NavLink } from "@/shared/elements/Nav";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { FallbackImage } from "@/shared/components/FallbackImage";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { SalonStaffPage } from "@/features/staff_salons/pages/SalonStaffPage";
import { useSalonDetail } from "../hooks/useSalons";
import { SALON_PERM } from "../constants/salon.permissions";
import type { SalonDTO } from "../types/salon.types";
import { SalonStatusBadge } from "./SalonStatusBadge";

interface SalonDetailExpandedProps {
  salonId: number;
  onEdit?: (salon: SalonDTO) => void;
}

export function SalonDetailExpanded({
  salonId,
  onEdit,
}: SalonDetailExpandedProps) {
  const { data: result, isLoading } = useSalonDetail(salonId);
  const salon = result?.data;
  const [tab, setTab] = useState<"info" | "staff">("info");

  if (isLoading) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">Đang tải chi tiết chi nhánh...</p>
      </TableDetailExpanded>
    );
  }

  if (!salon) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">
          Không tìm thấy thông tin chi nhánh
        </p>
      </TableDetailExpanded>
    );
  }

  return (
    <TableDetailExpanded maxHeightClass="max-h-100">
      <Nav pills className="mb-2">
        <NavItem>
          <NavLink active={tab === "info"} onClick={() => setTab("info")}>
            Thông tin chung
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={tab === "staff"} onClick={() => setTab("staff")}>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Nhân viên
            </span>
          </NavLink>
        </NavItem>
      </Nav>

      {tab === "info" ? (
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
            <TableDetailField label="Ngày làm việc" value={salon.workingDays} />
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

          <TableDetailActions>
            <PermissionGate
              resource={SALON_PERM.resource}
              action={SALON_PERM.update}
            >
              <Button
                variant="admin"
                size="sm"
                className="mb-0"
                onClick={() => onEdit?.(salon)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Cập nhật
              </Button>
            </PermissionGate>
          </TableDetailActions>
        </>
      ) : (
        <SalonStaffPage salonId={salonId} />
      )}
    </TableDetailExpanded>
  );
}
