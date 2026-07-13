import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  IndexCell,
  MutedCell,
  TextCell,
} from "@/shared/components/DataTable/tableCells";

import { SERVICE_CATEGORY_COLUMN_LABELS } from "./useActiveServiceCategoryColumns";
import { SERVICE_CATEGORY_PERM } from "../constants/serviceCategory.permissions";
import type { ServiceCategoryDto } from "../types/serviceCategory.types";

interface UseDeletedServiceCategoryColumnsParams {
  pageIndex: number;
  pageSize: number;
  onRestore: (item: ServiceCategoryDto) => void;
}

export function useDeletedServiceCategoryColumns({
  pageIndex,
  pageSize,
  onRestore,
}: UseDeletedServiceCategoryColumnsParams) {
  const cols = SERVICE_CATEGORY_COLUMN_LABELS;
  const perm = SERVICE_CATEGORY_PERM;

  return useMemo<ColumnDef<ServiceCategoryDto>[]>(
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
        accessorKey: "icon",
        header: cols.icon,
        cell: ({ row }) => {
          const icon = row.original.icon;
          return (
            <div className="w-9 h-9 rounded-lg bg-adminGold-600/10 flex items-center justify-center overflow-hidden">
              {icon ? (
                <img src={icon} alt="" className="w-9 h-9 object-cover" />
              ) : (
                <span className="text-xs text-adminGray-400">—</span>
              )}
            </div>
          );
        },
        size: 64,
        enableResizing: false,
      },
      {
        accessorKey: "imageUrl",
        header: cols.imageUrl,
        cell: ({ row }) => {
          const imageUrl = row.original.imageUrl;
          return (
            <div className="w-14 h-9 rounded-lg bg-adminGray-100 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-14 h-9 object-cover" />
              ) : (
                <span className="text-xs text-adminGray-400">—</span>
              )}
            </div>
          );
        },
        size: 80,
        enableResizing: false,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-adminInk truncate max-w-[180px] block">
            {row.original.name ?? "—"}
          </span>
        ),
        size: 200,
      },
      {
        accessorKey: "description",
        header: cols.description,
        cell: ({ row }) => <TextCell value={row.original.description} />,
        size: 300,
      },
      {
        accessorKey: "sortOrder",
        header: cols.sortOrder,
        cell: ({ row }) => <MutedCell value={row.original.sortOrder} />,
        size: 100,
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
