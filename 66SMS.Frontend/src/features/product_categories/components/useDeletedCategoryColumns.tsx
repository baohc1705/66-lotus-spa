import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/elements/Button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { MutedCell, NameCell, TextCell } from "@/shared/tables/TableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";

import { CATEGORY_COLUMN_LABELS } from "./useActiveCategoryColumns";
import { PRODUCT_CATEGORY_PERM } from "../constants/productCategory.permissions";
import type { ProductCategoryDto } from "../types/productCategory.types";

interface UseDeletedCategoryColumnsParams {
  onRestore: (item: ProductCategoryDto) => void;
}

export function useDeletedCategoryColumns({
  onRestore,
}: UseDeletedCategoryColumnsParams) {
  const cols = CATEGORY_COLUMN_LABELS;
  const perm = PRODUCT_CATEGORY_PERM;

  return useMemo<ColumnDef<ProductCategoryDto>[]>(
    () => [
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
