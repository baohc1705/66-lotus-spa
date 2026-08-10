import { Filter, RefreshCw } from "lucide-react";

import { Button } from "@/shared/elements/Button";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";

import { INVOICE_STATUS, PAYMENT_METHOD } from "../types/invoice.types";

interface InvoiceFilterSidebarProps {
  selectedStatus: number | null;
  onSelectStatus: (status: number | null) => void;
  selectedPaymentMethod: number | null;
  onSelectPaymentMethod: (method: number | null) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: null as number | null },
  { label: "Nháp", value: INVOICE_STATUS.DRAFT },
  { label: "Chưa thanh toán", value: INVOICE_STATUS.UNPAID },
  { label: "Đã thanh toán", value: INVOICE_STATUS.PAID },
  { label: "Đã hủy", value: INVOICE_STATUS.CANCELLED },
  { label: "Hoàn tiền", value: INVOICE_STATUS.REFUNDED },
];

const METHOD_OPTIONS = [
  { label: "Tất cả phương thức", value: null as number | null },
  { label: "Tiền mặt", value: PAYMENT_METHOD.CASH },
  { label: "Chuyển khoản", value: PAYMENT_METHOD.BANK_TRANSFER },
  { label: "Ví thành viên", value: PAYMENT_METHOD.WALLET },
  { label: "Cổng VNPay", value: PAYMENT_METHOD.VNPAY },
];

export function InvoiceFilterSidebar({
  selectedStatus,
  onSelectStatus,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onReset,
}: InvoiceFilterSidebarProps) {
  const hasFilter = selectedStatus !== null || selectedPaymentMethod !== null;

  return (
    <div className="flex w-56 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-kit-heading">
          <Filter className="h-4 w-4 text-kit-primary" />
          Bộ lọc hóa đơn
        </div>
        {hasFilter ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-0 h-7 px-2 text-xs"
            onClick={onReset}
          >
            <RefreshCw className="h-3 w-3" />
            Xóa
          </Button>
        ) : null}
      </div>

      <div className="space-y-1">
        <p className="px-1 text-xs font-semibold tracking-wide text-kit-muted uppercase">
          Trạng thái
        </p>
        <ListGroup className="mb-0">
          {STATUS_OPTIONS.map((option) => (
            <ListGroupItem
              key={String(option.value)}
              action
              active={selectedStatus === option.value}
              onClick={() => onSelectStatus(option.value)}
            >
              <span className="truncate">{option.label}</span>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>

      <div className="space-y-1">
        <p className="px-1 text-xs font-semibold tracking-wide text-kit-muted uppercase">
          Phương thức
        </p>
        <ListGroup className="mb-0">
          {METHOD_OPTIONS.map((option) => (
            <ListGroupItem
              key={String(option.value)}
              action
              active={selectedPaymentMethod === option.value}
              onClick={() => onSelectPaymentMethod(option.value)}
            >
              <span className="truncate">{option.label}</span>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}
