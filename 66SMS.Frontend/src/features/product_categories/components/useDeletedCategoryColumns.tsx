import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  IndexCell,
  MutedCell,
  NameCell,
  TextCell,
} from "@/shared/components/DataTable/TableCells";

import { CATEGORY_COLUMN_LABELS } from "./useActiveCategoryColumns";
import { PRODUCT_CATEGORY_PERM } from "../constants/productCategory.permissions";
import type { ProductCategoryDto } from "../types/productCategory.types";

interface UseDeletedCategoryColumnsParams {
  pageIndex: number;
  pageSize: number;
  onRestore: (item: ProductCategoryDto) => void;
}

export function useDeletedCategoryColumns({
  pageIndex,
  pageSize,
  onRestore,
}: UseDeletedCategoryColumnsParams) {
  const cols = CATEGORY_COLUMN_LABELS;
  const perm = PRODUCT_CATEGORY_PERM;

  return useMemo<ColumnDef<ProductCategoryDto>[]>(
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
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => <NameCell value={row.original.name} />,
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
