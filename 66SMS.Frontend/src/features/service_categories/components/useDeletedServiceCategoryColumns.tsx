import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/elements/Button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { MutedCell, NameCell, TextCell } from "@/shared/tables/TableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";

import { SERVICE_CATEGORY_COLUMN_LABELS } from "./useActiveServiceCategoryColumns";
import { SERVICE_CATEGORY_PERM } from "../constants/serviceCategory.permissions";
import type { ServiceCategoryDto } from "../types/serviceCategory.types";

interface UseDeletedServiceCategoryColumnsParams {
  onRestore: (item: ServiceCategoryDto) => void;
}

export function useDeletedServiceCategoryColumns({
  onRestore,
}: UseDeletedServiceCategoryColumnsParams) {
  const cols = SERVICE_CATEGORY_COLUMN_LABELS;
  const perm = SERVICE_CATEGORY_PERM;

  return useMemo<ColumnDef<ServiceCategoryDto>[]>(
    () => [
      {
        accessorKey: "icon",
        header: cols.icon,
        cell: ({ row }) => {
          const icon = row.original.icon;
          return (
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
              {icon ? (
                <img src={icon} alt="" className="h-9 w-9 object-cover" />
              ) : (
                <span className="text-xs text-kit-muted">—</span>
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
            <div className="flex h-9 w-14 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-9 w-14 object-cover" />
              ) : (
                <span className="text-xs text-kit-muted">—</span>
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
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 200,
      },
      {
        accessorKey: "description",
        header: cols.description,
        cell: ({ row }) => <TextCell value={row.original.description} />,
        size: 280,
      },
      {
        accessorKey: "sortOrder",
        header: cols.sortOrder,
        cell: ({ row }) => <MutedCell value={row.original.sortOrder} />,
        size: 100,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <PermissionGate
            resource={perm.resource}
            action={perm.update}
            role={perm.role}
          >
            <Tooltip text={COMMON_MSG.restore}>
              <Button
                size="icon-sm"
                variant="outline-success"
                className="mb-0 mr-0"
                onClick={() => onRestore(row.original)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </PermissionGate>
        ),
        size: 80,
        enableResizing: false,
      },
    ],
    [onRestore, cols, perm],
  );
}
