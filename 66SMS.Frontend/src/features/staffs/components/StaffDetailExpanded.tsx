import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";

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
import { GENDER_MAP } from "@/shared/constants/display.const";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { useGetAllRoles } from "@/features/auth/hooks/useGetAllRoles";
import type { RoleDTO } from "@/features/auth/types/auth.types";

import { STAFF_PERM } from "../constants/staff.permissions";
import { useStaffDetail } from "../hooks/useStaffs";
import type { StaffFullDto } from "../types/staff.types";
import { StaffServicesTab } from "./StaffServicesTab";

interface StaffDetailExpandedProps {
  staffId: number;
  onEdit?: (staff: StaffFullDto) => void;
  onAssignService?: (staff: StaffFullDto) => void;
}

export function StaffDetailExpanded({
  staffId,
  onEdit,
  onAssignService,
}: StaffDetailExpandedProps) {
  const { data: result, isLoading } = useStaffDetail(staffId);
  const staff = result?.data;
  const { data: rolesResult } = useGetAllRoles();
  const roles = rolesResult?.data ?? [];
  const [tabId, setTabId] = useState("info");
  const perm = STAFF_PERM;

  const roleLabel =
    roles.find((r: RoleDTO) => r.code === staff?.role)?.name ??
    staff?.role ??
    null;

  const tabs = useMemo(() => {
    if (!staff) return [];

    return [
      {
        id: "info",
        label: "Thông tin",
        content: (
          <>
            <TableDetailHeader
              icon={
                <FallbackImage
                  kind="ktv"
                  src={staff.avatarUrl}
                  alt={staff.fullName ?? ""}
                  className="h-full w-full object-cover"
                />
              }
              title={staff.fullName ?? "—"}
              subtitle={`Mã nhân viên: ${staff.code ?? "—"}`}
            />

            <TableDetailGrid cols={3}>
              <TableDetailField label="Số điện thoại" value={staff.phone} />
              <TableDetailField label="Số CMND/CCCD" value={staff.nationalId} />
              <TableDetailField
                label="Ngày bắt đầu làm việc"
                value={formatDisplayDate(staff.hireDate)}
              />
              <TableDetailField label="Vai trò" value={roleLabel} />
              <TableDetailField
                label="Chi nhánh làm việc"
                value={staff.salonName}
              />
              <TableDetailField label="Địa chỉ" value={staff.fullAddress} />
              <TableDetailField label="Tài khoản" value={staff.username} />
              <TableDetailField label="Email" value={staff.email} />
              <TableDetailField
                label="Giới tính"
                value={
                  GENDER_MAP[staff.gender ?? ""] ??
                  (staff.gender != null ? String(staff.gender) : null)
                }
              />
              <TableDetailField
                label="Ngày sinh"
                value={formatDisplayDate(staff.dateOfBirth)}
              />
            </TableDetailGrid>

            <TableDetailActions>
              <PermissionGate
                resource={perm.resource}
                action={perm.update}
                role={perm.role}
              >
                <Button
                  variant="admin"
                  size="sm"
                  className="mb-0"
                  onClick={() => onEdit?.(staff)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Cập nhật
                </Button>
              </PermissionGate>
            </TableDetailActions>
          </>
        ),
      },
      {
        id: "services",
        label: "Dịch vụ thực hiện",
        content: (
          <StaffServicesTab
            staffId={staffId}
            staffName={staff.fullName}
            onAssign={() => onAssignService?.(staff)}
          />
        ),
      },
    ];
  }, [staff, roleLabel, staffId, onEdit, onAssignService, perm]);

  if (isLoading) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">Đang tải chi tiết nhân viên...</p>
      </TableDetailExpanded>
    );
  }

  if (!staff) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">
          Không tìm thấy thông tin nhân viên
        </p>
      </TableDetailExpanded>
    );
  }

  return (
    <TableDetailExpanded maxHeightClass="max-h-100">
      <Tabs
        tabs={tabs}
        activeId={tabId}
        onChange={setTabId}
        variant="body"
        navClassName="mb-2"
      />
    </TableDetailExpanded>
  );
}
