import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { IndexCell } from "@/shared/components/DataTable/TableCells";
import { CertificateStatusBadge, ExpiryBadge } from "./CertificateStatusBadge";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CERTIFICATE_PERM } from "../constants/certificate.permissions";
import type { StaffCertificateDTO } from "../types/certificate.types";

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
}

export function useActiveStaffCertificateColumns({
  pageIndex,
  pageSize,
  onEdit,
  onDelete,
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
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk">{row.original.staffName}</span>
        ),
        size: 160,
      },
      {
        accessorKey: "certificateName",
        header: cols.certificateName,
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-adminInk">{row.original.certificateName}</p>
            <p className="text-xs text-adminGray-600">{row.original.typeName}</p>
          </div>
        ),
        size: 220,
      },
      {
        accessorKey: "issuingOrganization",
        header: cols.issuingOrganization,
        cell: ({ row }) => (
          <span className="text-xs text-adminInk/80">{row.original.issuingOrganization}</span>
        ),
        size: 180,
      },
      {
        accessorKey: "issuedDate",
        header: cols.issuedDate,
        cell: ({ row }) => (
          <span className="text-xs text-adminInk/70">{formatDisplayDate(row.original.issuedDate)}</span>
        ),
        size: 110,
      },
      {
        accessorKey: "expiryDate",
        header: cols.expiryDate,
        cell: ({ row }) => <ExpiryBadge expiryDate={row.original.expiryDate ?? undefined} />,
        size: 160,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => <CertificateStatusBadge status={row.original.status} />,
        size: 130,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const cert = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4 mr-2" />{row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  <PermissionGate resource={perm.resource} action={perm.update}>
                    <DropdownMenuItem onClick={() => onEdit(cert)}>
                      <Pencil className="w-4 h-4 mr-2" />{COMMON_MSG.edit}
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate resource={perm.resource} action={perm.delete} role={perm.role}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(cert)}>
                      <Trash2 className="w-4 h-4 mr-2" />Xóa
                    </DropdownMenuItem>
                  </PermissionGate>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, onEdit, onDelete, cols, perm]
  );
}
