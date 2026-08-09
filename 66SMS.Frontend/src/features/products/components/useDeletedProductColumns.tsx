import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { FallbackImage } from "@/shared/components/FallbackImage";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { DateTimeCell, TextCell } from "@/shared/tables/TableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { formatCurrency } from "@/shared/utils/currency";

import { PRODUCT_COLUMN_LABELS } from "./useActiveProductColumns";
import { PRODUCT_PERM } from "../constants/product.permissions";
import type { ProductDto } from "../types/product.types";

interface UseDeletedProductColumnsParams {
  onRestore: (item: ProductDto) => void;
}

export function useDeletedProductColumns({
  onRestore,
}: UseDeletedProductColumnsParams) {
  const cols = PRODUCT_COLUMN_LABELS;
  const perm = PRODUCT_PERM;

  return useMemo<ColumnDef<ProductDto>[]>(
    () => [
      {
        accessorKey: "code",
        header: cols.code,
        cell: ({ row }) => (
          <Badge variant="secondary" soft>
            {row.original.code ?? "—"}
          </Badge>
        ),
        size: 100,
      },
      {
        id: "imageUrl",
        accessorKey: "imageUrl",
        header: cols.imageUrl,
        cell: ({ row }) => (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
            <FallbackImage
              kind="product"
              src={row.original.imageUrl}
              alt=""
              className="h-10 w-10 object-cover"
            />
          </div>
        ),
        size: 72,
        enableResizing: false,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => (
          <span className="font-medium text-kit-heading">
            {row.original.name ?? "—"}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "categoryName",
        header: cols.categoryName,
        cell: ({ row }) => <TextCell value={row.original.categoryName} />,
        size: 140,
      },
      {
        accessorKey: "sellingPrice",
        header: cols.sellingPrice,
        cell: ({ row }) => (
          <span className="text-sm font-bold text-kit-primary">
            {formatCurrency(row.original.sellingPrice)}
          </span>
        ),
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
