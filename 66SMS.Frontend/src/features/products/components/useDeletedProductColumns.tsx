import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw, Package } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  DateTimeCell,
  IndexCell,
  PriceCell,
  TextCell,
} from "@/shared/components/DataTable/tableCells";

import { PRODUCT_COLUMN_LABELS } from "./useActiveProductColumns";
import { PRODUCT_PERM } from "../constants/product.permissions";
import type { ProductDto } from "../types/product.types";

interface UseDeletedProductColumnsParams {
  pageIndex: number;
  pageSize: number;
  onRestore: (item: ProductDto) => void;
}



export function useDeletedProductColumns({
  pageIndex,
  pageSize,
  onRestore,
}: UseDeletedProductColumnsParams) {
  const cols = PRODUCT_COLUMN_LABELS;
  const perm = PRODUCT_PERM;

  return useMemo<ColumnDef<ProductDto>[]>(
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
          <span className="text-adminInk/80 font-medium">
            {row.original.code ?? "—"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-adminGray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {prod.imageUrl ? (
                  <img
                    src={prod.imageUrl}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <Package className="w-4 h-4 text-adminGray-400" />
                )}
              </div>
              <span className="text-sm font-semibold text-adminInk truncate max-w-[180px]">
                {prod.name ?? "—"}
              </span>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "categoryName",
        header: cols.categoryName,
        cell: ({ row }) => <TextCell value={row.original.categoryName} />,
        size: 120,
      },
      {
        accessorKey: "sellingPrice",
        header: cols.sellingPrice,
        cell: ({ row }) => <PriceCell value={row.original.sellingPrice} />,
        size: 120,
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
