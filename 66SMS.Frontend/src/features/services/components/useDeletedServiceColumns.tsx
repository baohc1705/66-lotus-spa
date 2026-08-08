import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { FallbackImage } from "@/shared/components/FallbackImage";
import {
  DateTimeCell,
  IndexCell,
  MutedCell,
  NameCell,
} from "@/shared/tables/TableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { formatCurrency } from "@/shared/utils/currency";

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
              kind="service"
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
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 180,
      },
      {
        accessorKey: "categoryName",
        header: cols.categoryName,
        cell: ({ row }) => <MutedCell value={row.original.categoryName} />,
        size: 150,
      },
      {
        accessorKey: "sellingPrice",
        header: cols.sellingPrice,
        cell: ({ row }) => (
          <span className="text-sm font-bold text-kit-primary">
            {formatCurrency(row.original.sellingPrice)}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "durationMins",
        header: cols.durationMins,
        cell: ({ row }) => (
          <span className="text-kit-muted">
            {row.original.durationMins
              ? `${row.original.durationMins} phút`
              : "—"}
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
    [pageIndex, pageSize, onRestore, cols, perm],
  );
}
