import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  DateTimeCell,
  IndexCell,
} from "@/shared/components/DataTable/TableCells";

import { CUSTOMER_COLUMN_LABELS } from "./useActiveCustomerColumns";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import type { CustomerDto } from "../types/customer.types";
import { GENDER_MAP } from "@/shared/constants/display.const";

interface UseDeletedCustomerColumnsParams {
  pageIndex: number;
  pageSize: number;
  onRestore: (item: CustomerDto) => void;
}

export function useDeletedCustomerColumns({
  pageIndex,
  pageSize,
  onRestore,
}: UseDeletedCustomerColumnsParams) {
  const cols = CUSTOMER_COLUMN_LABELS;
  const perm = CUSTOMER_PERM;

  return useMemo<ColumnDef<CustomerDto>[]>(
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
        accessorKey: "fullName",
        header: cols.fullName,
        cell: ({ row }) => {
          const cust = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-adminGold-600/10 flex items-center justify-center shrink-0 overflow-hidden">
                {cust.avatarUrl ? (
                  <img
                    src={cust.avatarUrl}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-state-warning-text">
                    {(cust.fullName ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-adminInk truncate max-w-[140px]">
                {cust.fullName ?? "â€”"}
              </span>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "phone",
        header: cols.phone,
        cell: ({ row }) => (
          <span className="text-adminInk/80">
            {row.original.phone ?? "â€”"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "email",
        header: cols.email,
        cell: ({ row }) => (
          <span className="text-adminInk/70">
            {row.original.email ?? "â€”"}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "gender",
        header: cols.gender,
        cell: ({ row }) => (
          <span className="text-adminInk/70">
            {GENDER_MAP[row.original.gender ?? ""] ?? "â€”"}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: "loyaltyPoint",
        header: cols.loyaltyPoint,
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk">
            {row.original.loyaltyPoint ?? 0}
          </span>
        ),
        size: 80,
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
