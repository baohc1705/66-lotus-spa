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
  PriceCell,
} from "@/shared/components/DataTable/tableCells";

import { SERVICE_COLUMN_LABELS } from "./useActiveServiceColumns";
import { SERVICE_PERM } from "../constants/service.permissions";
import type { ServiceListDto } from "../types/service.types";

interface UseDeletedServiceColumnsParams {
  pageIndex: number;
  pageSize: number;
  onRestore: (item: ServiceListDto) => void;
}

export function useDeletedServiceColumns({
  pageIndex,
  pageSize,
  onRestore,
}: UseDeletedServiceColumnsParams) {
  const cols = SERVICE_COLUMN_LABELS;
  const perm = SERVICE_PERM;

  return useMemo<ColumnDef<ServiceListDto>[]>(
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
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-adminGold-600/10 flex items-center justify-center shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-state-warning-text">
                    {(item.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-adminInk truncate max-w-[140px]">
                {item.name ?? "—"}
              </span>
            </div>
          );
        },
        size: 220,
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
