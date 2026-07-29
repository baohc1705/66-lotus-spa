import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Ban, Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import {
  IndexCell,
  PriceCell,
  DateTimeCell,
} from "@/shared/components/DataTable/TableCells";
import { INVOICE_PERM } from "../constants/invoice.permissions";
import {
  INVOICE_STATUS,
  PAYMENT_METHOD,
  type InvoiceDto,
} from "../types/invoice.types";

export const INVOICE_COLUMN_LABELS = {
  invoiceCode: "Mã HĐ",
  customerName: "Khách hàng",
  totalAmount: "Tổng tiền",
  paymentMethod: "Hình thức",
  status: "Trạng thái",
  issuedAt: "Ngày lập",
} as const;

const STATUS_MAP: StatusMap = {
  "0": { label: "Nháp", variant: "outline" },
  "1": { label: "Chưa TT", variant: "warning" },
  "2": { label: "Đã TT", variant: "success", dot: true },
  "3": { label: "Đã hủy", variant: "error" },
  "4": { label: "Hoàn tiền", variant: "outline" },
};

const PAYMENT_LABEL: Record<number, string> = {
  [PAYMENT_METHOD.CASH]: "Tiền mặt",
  [PAYMENT_METHOD.BANK_TRANSFER]: "Chuyển khoản",
  [PAYMENT_METHOD.WALLET]: "Ví",
  [PAYMENT_METHOD.VNPAY]: "VNPay",
};

interface UseActiveInvoiceColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onCancel: (id: number) => void;
}

export function useActiveInvoiceColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
  onCancel,
}: UseActiveInvoiceColumnsParams) {
  const cols = INVOICE_COLUMN_LABELS;
  const perm = INVOICE_PERM;

  return useMemo<ColumnDef<InvoiceDto>[]>(
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
        accessorKey: "invoiceCode",
        header: () => (
          <SortableColumnHeader
            label={cols.invoiceCode}
            column="code"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-adminGray-600">
            {row.original.invoiceCode ?? "—"}
          </span>
        ),
        size: 170,
      },
      {
        accessorKey: "customerName",
        header: cols.customerName,
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold text-adminInk truncate max-w-[180px]">
              {row.original.customerName ?? "Khách vãng lai"}
            </p>
            {row.original.customerPhone && (
              <p className="text-xs text-adminGray-600">
                {row.original.customerPhone}
              </p>
            )}
          </div>
        ),
        size: 200,
      },
      {
        accessorKey: "totalAmount",
        header: () => (
          <SortableColumnHeader
            label={cols.totalAmount}
            column="total"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => <PriceCell value={row.original.totalAmount} />,
        size: 130,
      },
      {
        accessorKey: "paymentMethod",
        header: cols.paymentMethod,
        cell: ({ row }) => (
          <span className="text-xs text-adminGray-600">
            {PAYMENT_LABEL[row.original.paymentMethod ?? 0] ?? "—"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => (
          <StatusBadge
            status={String(row.original.status ?? 1)}
            statusMap={STATUS_MAP}
          />
        ),
        size: 110,
      },
      {
        accessorKey: "issuedAt",
        header: () => (
          <SortableColumnHeader
            label={cols.issuedAt}
            column="issued_at"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => <DateTimeCell value={row.original.issuedAt} />,
        size: 150,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const inv = row.original;
          const canCancel =
            inv.status !== INVOICE_STATUS.CANCELLED &&
            inv.status !== INVOICE_STATUS.REFUNDED;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  {canCancel && inv.id && (
                    <PermissionGate
                      resource={perm.resource}
                      action={perm.update}
                    >
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onCancel(inv.id!)}
                      >
                        <Ban className="w-4 h-4" /> Hủy hóa đơn
                      </DropdownMenuItem>
                    </PermissionGate>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, orderBy, isDescending, onSort, onCancel, cols, perm],
  );
}
