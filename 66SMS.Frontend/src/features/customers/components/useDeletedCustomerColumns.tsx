import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  DateTimeCell,
  IndexCell,
} from "@/shared/components/DataTable/tableCells";
import { TABLE_STYLES } from "@/shared/styles/table.styles";

import { CUSTOMER_COLUMN_LABELS } from "./useActiveCustomerColumns";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import type { CustomerDto } from "../types/customer.types";

const GENDER_MAP: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
};

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
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                {cust.avatarUrl ? (
                  <img
                    src={cust.avatarUrl}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-amber-600">
                    {(cust.fullName ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-semibold text-lotus-deep truncate max-w-[140px]">
                {cust.fullName ?? "—"}
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
          <span className="text-lotus-deep/80">{row.original.phone ?? "—"}</span>
        ),
        size: 110,
      },
      {
        accessorKey: "email",
        header: cols.email,
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">{row.original.email ?? "—"}</span>
        ),
        size: 180,
      },
      {
        accessorKey: "gender",
        header: cols.gender,
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
            {GENDER_MAP[row.original.gender ?? ""] ?? "—"}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: "loyaltyPoint",
        header: cols.loyaltyPoint,
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
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
              className={TABLE_STYLES.toolbarBtn}
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
