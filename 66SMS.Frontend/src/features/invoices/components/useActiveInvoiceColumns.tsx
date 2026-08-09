import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Eye } from "lucide-react";

import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  DateTimeCell,
  IndexCell,
  MutedSmallCell,
  NameCell,
  PriceCell,
  TextCell,
} from "@/shared/tables/TableCells";

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

const PAYMENT_LABEL: Record<number, string> = {
  [PAYMENT_METHOD.CASH]: "Tiền mặt",
  [PAYMENT_METHOD.BANK_TRANSFER]: "Chuyển khoản",
  [PAYMENT_METHOD.WALLET]: "Ví",
  [PAYMENT_METHOD.VNPAY]: "VNPay",
};

function statusBadge(status: number | null | undefined) {
  if (status === INVOICE_STATUS.DRAFT) {
    return (
      <Badge variant="secondary" soft>
        Nháp
      </Badge>
    );
  }
  if (status === INVOICE_STATUS.UNPAID) {
    return (
      <Badge variant="warning" soft>
        Chưa TT
      </Badge>
    );
  }
  if (status === INVOICE_STATUS.PAID) {
    return (
      <Badge variant="success" soft>
        Đã TT
      </Badge>
    );
  }
  if (status === INVOICE_STATUS.CANCELLED) {
    return (
      <Badge variant="danger" soft>
        Đã hủy
      </Badge>
    );
  }
  if (status === INVOICE_STATUS.REFUNDED) {
    return (
      <Badge variant="secondary" soft>
        Hoàn tiền
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      —
    </Badge>
  );
}

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
        cell: ({ row }) => <NameCell value={row.original.invoiceCode} />,
        size: 170,
      },
      {
        accessorKey: "customerName",
        header: cols.customerName,
        cell: ({ row }) => (
          <div className="leading-5">
            <NameCell value={row.original.customerName ?? "Khách vãng lai"} />
            {row.original.customerPhone ? (
              <MutedSmallCell value={row.original.customerPhone} />
            ) : null}
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
          <TextCell
            value={PAYMENT_LABEL[row.original.paymentMethod ?? 0] ?? null}
          />
        ),
        size: 110,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => statusBadge(row.original.status),
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
        header: "Thao tác",
        cell: ({ row }) => {
          const invoice = row.original;
          const canCancel =
            invoice.status !== INVOICE_STATUS.CANCELLED &&
            invoice.status !== INVOICE_STATUS.REFUNDED;

          return (
            <div
              className="flex items-center gap-1"
              onClick={(event) => event.stopPropagation()}
            >
              <Tooltip text={row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}>
                <Button
                  size="icon-sm"
                  variant="outline-info"
                  className="mb-0 mr-0"
                  onClick={() => row.toggleExpanded()}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
              {canCancel && invoice.id ? (
                <PermissionGate resource={perm.resource} action={perm.update}>
                  <Tooltip text="Hủy hóa đơn">
                    <Button
                      size="icon-sm"
                      variant="outline-danger"
                      className="mb-0 mr-0"
                      onClick={() => onCancel(invoice.id!)}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </Button>
                  </Tooltip>
                </PermissionGate>
              ) : null}
            </div>
          );
        },
        size: 100,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, orderBy, isDescending, onSort, onCancel, cols, perm],
  );
}
