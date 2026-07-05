import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  DateTimeCell,
  IndexCell,
  MutedCell,
  NameCell,
} from "@/shared/components/DataTable/tableCells";
import { TABLE_STYLES } from "@/shared/styles/table.styles";

import { SERVICE_COLUMN_LABELS } from "./useActiveServiceColumns";
import { SERVICE_PERM } from "../constants/service.permissions";
import type { ServiceDTO } from "../types/service.types";

interface UseDeletedServiceColumnsParams {
  pageIndex: number;
  pageSize: number;
  onRestore: (item: ServiceDTO) => void;
}

function formatPrice(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function useDeletedServiceColumns({
  pageIndex,
  pageSize,
  onRestore,
}: UseDeletedServiceColumnsParams) {
  const cols = SERVICE_COLUMN_LABELS;
  const perm = SERVICE_PERM;

  return useMemo<ColumnDef<ServiceDTO>[]>(
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
          <span className="font-mono text-xs px-2 py-1 bg-stone-100 rounded text-stone-600">
            {row.original.code ?? "—"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 200,
      },
      {
        accessorKey: "categoryName",
        header: cols.categoryName,
        cell: ({ row }) => <MutedCell value={row.original.categoryName} />,
        size: 150,
      },
      {
        accessorKey: "costPrice",
        header: cols.costPrice,
        cell: ({ row }) => (
          <span className="text-stone-600 font-medium">
            {formatPrice(row.original.costPrice)}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "sellingPrice",
        header: cols.sellingPrice,
        cell: ({ row }) => (
          <span className="text-lotus-deep font-medium">
            {formatPrice(row.original.sellingPrice)}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "durationMins",
        header: cols.durationMins,
        cell: ({ row }) => (
          <span className="text-stone-600">
            {row.original.durationMins ? `${row.original.durationMins} phút` : "—"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "updatedAt",
        header: "Ngày xóa",
        cell: ({ row }) => <DateTimeCell value={row.original.updatedAt} />,
        size: 140,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <PermissionGate
            resource={perm.resource}
            action={perm.update}
            role={perm.role}
          >
            <Button
              variant="outline"
              size="sm"
              className={TABLE_STYLES.toolbarBtn}
              onClick={() => onRestore(row.original)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {COMMON_MSG.restore}
            </Button>
          </PermissionGate>
        ),
        size: 120,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, onRestore, cols, perm],
  );
}
