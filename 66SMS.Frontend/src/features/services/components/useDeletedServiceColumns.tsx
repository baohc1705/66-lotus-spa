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
  PriceCell,
} from "@/shared/components/DataTable/tableCells";

import { SERVICE_COLUMN_LABELS } from "./useActiveServiceColumns";
import { SERVICE_PERM } from "../constants/service.permissions";
import type { ServiceDto } from "../types/service.types";

interface UseDeletedServiceColumnsParams {
  pageIndex: number;
  pageSize: number;
  onRestore: (item: ServiceDto) => void;
}

export function useDeletedServiceColumns({
  pageIndex,
  pageSize,
  onRestore,
}: UseDeletedServiceColumnsParams) {
  const cols = SERVICE_COLUMN_LABELS;
  const perm = SERVICE_PERM;

  return useMemo<ColumnDef<ServiceDto>[]>(
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
          <span className="font-mono text-xs px-2 py-1 bg-adminGray-100 rounded text-adminGray-600">
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
        cell: ({ row }) => <PriceCell value={row.original.costPrice} />,
        size: 110,
      },
      {
        accessorKey: "sellingPrice",
        header: cols.sellingPrice,
        cell: ({ row }) => <PriceCell value={row.original.sellingPrice} />,
        size: 110,
      },
      {
        accessorKey: "durationMins",
        header: cols.durationMins,
        cell: ({ row }) => (
          <span className="text-adminGray-600">
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
              className="lotus-admin-table-toolbar-btn"
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
