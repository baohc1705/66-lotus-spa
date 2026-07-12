import { Filter, RefreshCw } from "lucide-react";
import { INVOICE_STATUS, PAYMENT_METHOD } from "../types/invoice.types";

interface InvoiceFilterSidebarProps {
  selectedStatus: number | null;
  onSelectStatus: (status: number | null) => void;
  selectedPaymentMethod: number | null;
  onSelectPaymentMethod: (method: number | null) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: null },
  { label: "Nháp", value: INVOICE_STATUS.DRAFT },
  { label: "Chưa thanh toán", value: INVOICE_STATUS.UNPAID },
  { label: "Đã thanh toán", value: INVOICE_STATUS.PAID },
  { label: "Đã hủy", value: INVOICE_STATUS.CANCELLED },
  { label: "Hoàn tiền", value: INVOICE_STATUS.REFUNDED },
];

const METHOD_OPTIONS = [
  { label: "Tất cả phương thức", value: null },
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
    <aside className="w-56 shrink-0 flex flex-col h-full bg-white rounded overflow-hidden">
      {/* Title */}
      <div className="px-4 py-3 border-b border-adminGray-100 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-adminGold-600" />
          <span className="text-sm font-bold text-adminInk">Bộ lọc hóa đơn</span>
        </div>
        {hasFilter && (
          <button
            onClick={onReset}
            className="text-xs text-adminGray-600 hover:text-adminGreen-600 transition-colors flex items-center gap-0.5"
            title="Xóa tất cả bộ lọc"
          >
            <RefreshCw className="w-3 h-3" />
            Xóa
          </button>
        )}
      </div>

      {/* Filter Options */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
        {/* Status Group */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-adminGray-600 tracking-wider uppercase px-1">
            Trạng thái
          </p>
          <div className="space-y-1">
            {STATUS_OPTIONS.map((opt) => {
              const isActive = selectedStatus === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => onSelectStatus(opt.value)}
                  className={`lotus-admin-sidebar-item ${
                    isActive
                      ? "bg-adminGreen-100 text-adminGreen-600 font-semibold"
                      : "text-adminInk/75 hover:bg-adminGreen-50 hover:text-adminGreen-600"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method Group */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-adminGray-600 tracking-wider uppercase px-1">
            Phương thức
          </p>
          <div className="space-y-1">
            {METHOD_OPTIONS.map((opt) => {
              const isActive = selectedPaymentMethod === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => onSelectPaymentMethod(opt.value)}
                  className={`lotus-admin-sidebar-item ${
                    isActive
                      ? "bg-adminGreen-100 text-adminGreen-600 font-semibold"
                      : "text-adminInk/75 hover:bg-adminGreen-50 hover:text-adminGreen-600"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
