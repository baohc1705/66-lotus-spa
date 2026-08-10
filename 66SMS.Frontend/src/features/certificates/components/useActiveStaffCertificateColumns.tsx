import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Button } from "@/shared/elements/Button";
import { IndexCell, NameCell, TextCell } from "@/shared/tables/TableCells";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { CERTIFICATE_PERM } from "../constants/certificate.permissions";
import type { StaffCertificateDTO } from "../types/certificate.types";
import { CertificateStatusBadge, ExpiryBadge } from "./CertificateStatusBadge";

export const STAFF_CERTIFICATE_COLUMN_LABELS = {
  staffName: "Nhân viên",
  certificateName: "Chứng chỉ",
  issuingOrganization: "Tổ chức cấp",
  issuedDate: "Ngày cấp",
  expiryDate: "Hết hạn",
  status: "Trạng thái",
} as const;

interface UseActiveStaffCertificateColumnsParams {
  pageIndex: number;
  pageSize: number;
  onEdit: (item: StaffCertificateDTO) => void;
  onDelete: (item: StaffCertificateDTO) => void;
  onApprove?: (item: StaffCertificateDTO) => void;
  isApproving?: boolean;
  submitMode?: boolean;
}

export function useActiveStaffCertificateColumns({
  pageIndex,
  pageSize,
  onEdit,
  onDelete,
  onApprove,
  isApproving = false,
  submitMode = false,
}: UseActiveStaffCertificateColumnsParams) {
  const cols = STAFF_CERTIFICATE_COLUMN_LABELS;
  const perm = CERTIFICATE_PERM;

  return useMemo<ColumnDef<StaffCertificateDTO>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <IndexCell
            pageIndex={pageIndex}
            pageSize={pageSize}
            rowIndex={row.index}
          />
        ),
        size: 50,
        enableResizing: false,
      },
      {
        accessorKey: "staffName",
        header: cols.staffName,
        cell: ({ row }) => <NameCell value={row.original.staffName} />,
        size: 160,
      },
      {
        accessorKey: "certificateName",
        header: cols.certificateName,
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-kit-heading">
              {row.original.certificateName}
            </p>
            <p className="text-xs text-kit-muted">{row.original.typeName}</p>
          </div>
        ),
        size: 220,
      },
      {
        accessorKey: "issuingOrganization",
        header: cols.issuingOrganization,
        cell: ({ row }) => (
          <TextCell value={row.original.issuingOrganization} />
        ),
        size: 180,
      },
      {
        accessorKey: "issuedDate",
        header: cols.issuedDate,
        cell: ({ row }) => (
          <span className="text-xs text-kit-muted">
            {formatDisplayDate(row.original.issuedDate)}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "expiryDate",
        header: cols.expiryDate,
        cell: ({ row }) => (
          <ExpiryBadge expiryDate={row.original.expiryDate ?? undefined} />
        ),
        size: 160,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => (
          <CertificateStatusBadge status={row.original.status} />
        ),
        size: 130,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const cert = row.original;
          const expanded = row.getIsExpanded();

          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip text={expanded ? "Đóng chi tiết" : "Xem chi tiết"}>
                <Button
                  size="icon-sm"
                  variant="outline-info"
                  className="mb-0 mr-0"
                  onClick={() => row.toggleExpanded()}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
              {!submitMode ? (
                <PermissionGate resource={perm.resource} action={perm.update}>
                  <Tooltip text="Sửa">
                    <Button
                      size="icon-sm"
                      variant="outline-primary"
                      className="mb-0 mr-0"
                      onClick={() => onEdit(cert)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Tooltip>
                </PermissionGate>
              ) : null}
              {!submitMode ? (
                <PermissionGate
                  resource={perm.resource}
                  action={perm.delete}
                  role={perm.role}
                >
                  <Tooltip text="Xóa">
                    <Button
                      size="icon-sm"
                      variant="outline-danger"
                      className="mb-0 mr-0"
                      onClick={() => onDelete(cert)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </Tooltip>
                </PermissionGate>
              ) : null}
            </div>
          );
        },
        size: 150,
        enableResizing: false,
      },
    ],
    [
      pageIndex,
      pageSize,
      onEdit,
      onDelete,
      onApprove,
      isApproving,
      submitMode,
      cols,
      perm,
    ],
  );
}
