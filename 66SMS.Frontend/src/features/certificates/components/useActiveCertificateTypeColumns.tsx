import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Badge } from "@/shared/components/ui/badge";
import { IndexCell } from "@/shared/components/DataTable/tableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CERTIFICATE_PERM } from "../constants/certificate.permissions";
import type { CertificateTypeDTO } from "../types/certificate.types";

export const CERTIFICATE_TYPE_COLUMN_LABELS = {
  code: "Mã",
  name: "Tên loại chứng chỉ",
  description: "Mô tả",
  status: "Trạng thái",
} as const;

interface UseActiveCertificateTypeColumnsParams {
  pageIndex: number;
  pageSize: number;
  onEdit: (item: CertificateTypeDTO) => void;
  onDelete: (item: CertificateTypeDTO) => void;
}

export function useActiveCertificateTypeColumns({
  pageIndex,
  pageSize,
  onEdit,
  onDelete,
}: UseActiveCertificateTypeColumnsParams) {
  const cols = CERTIFICATE_TYPE_COLUMN_LABELS;
  const perm = CERTIFICATE_PERM;

  return useMemo<ColumnDef<CertificateTypeDTO>[]>(
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
        accessorKey: "code",
        header: cols.code,
        cell: ({ row }) => (
          <span className="font-mono text-xs bg-adminGray-100 px-1.5 py-0.5 rounded text-adminInk font-medium">
            {row.original.code}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk">{row.original.name}</span>
        ),
        size: 250,
      },
      {
        accessorKey: "description",
        header: cols.description,
        cell: ({ row }) => (
          <span className="text-adminInk/70 text-xs">{row.original.description || "—"}</span>
        ),
        size: 280,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant="outline"
              className={
                s === 1
                  ? "bg-state-success-bg text-state-success-text border-state-success-border text-xs"
                  : "bg-state-neutral-bg text-state-neutral-text border-state-neutral-border text-xs"
              }
            >
              {s === 1 ? "Hoạt động" : "Tạm đóng"}
            </Badge>
          );
        },
        size: 110,
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
