import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { IndexCell, NameCell, TextCell } from "@/shared/tables/TableCells";
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
          <span className="rounded bg-kit-page px-1.5 py-0.5 font-mono text-xs font-medium text-kit-heading">
            {row.original.code}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 250,
      },
      {
        accessorKey: "description",
        header: cols.description,
        cell: ({ row }) => <TextCell value={row.original.description} />,
        size: 280,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => {
          const isActive = row.original.status === 1;
          return (
            <Badge variant={isActive ? "success" : "secondary"} soft>
              {isActive ? "Hoạt động" : "Tạm đóng"}
            </Badge>
          );
        },
        size: 110,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const cert = row.original;
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
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
            </div>
          );
        },
        size: 100,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, onEdit, onDelete, cols, perm],
  );
}
