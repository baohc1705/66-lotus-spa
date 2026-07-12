import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";
import type { RecentTransactionDto } from "../types/revenue.types";

interface RecentTransactionsTableProps {
  data?: RecentTransactionDto[];
  isLoading: boolean;
}

const PAYMENT_METHOD_LABELS: Record<number, string> = {
  1: "Tiền mặt",
  2: "Chuyển khoản",
  3: "Ví thành viên",
  4: "VNPay",
};

const PAYMENT_METHOD_CLASSES: Record<number, string> = {
  1: "bg-state-success-bg text-state-success-text border-state-success-border",
  2: "bg-state-warning-bg text-state-warning-text border-state-warning-border",
  3: "bg-adminGold-100 text-adminGold-700 border-adminGold-600/30",
  4: "bg-state-info-bg text-state-info-text border-state-info-border",
};

export function RecentTransactionsTable({ data = [], isLoading }: RecentTransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-adminGray-100/30 h-[380px] flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="h-5 w-40 bg-adminGray-100 rounded animate-pulse" />
          <div className="h-4 w-20 bg-adminGray-100 rounded animate-pulse" />
        </div>
        <div className="flex-1 mt-6 space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-full bg-adminGray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-adminGray-100/30 flex flex-col h-[380px]">
      {/* Widget Header with navigation link */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h3 className="font-sans text-sm font-bold text-adminInk">
            Giao Dịch Gần Đây
          </h3>
          <p className="text-xs text-adminGray-600 mt-0.5">
            Danh sách hóa đơn thanh toán mới nhất trong hệ thống
          </p>
        </div>

        <Link 
          to="/admin/invoices" 
          className="text-lotus-primary hover:text-lotus-primary/80 text-xs font-bold flex items-center gap-1 transition-colors"
        >
          Xem tất cả
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto min-h-0">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-adminGray-600 text-xs">
            Chưa có giao dịch nào được ghi nhận
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-adminGray-100 text-adminGray-400 font-bold uppercase tracking-wider text-2xs">
                <th className="py-2 pl-1 font-bold">Mã HĐ</th>
                <th className="py-2 font-bold">Khách hàng</th>
                <th className="py-2 font-bold hidden md:table-cell">Chi nhánh</th>
                <th className="py-2 font-bold text-right">Số tiền</th>
                <th className="py-2 font-bold text-center">Thanh toán</th>
                <th className="py-2 pr-1 font-bold text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx) => (
                <tr 
                  key={tx.invoiceId} 
                  className="border-b border-adminGray-50 hover:bg-adminGray-50/50 transition-colors"
                >
                  <td className="py-2.5 pl-1">
                    <Link
                      to={`/admin/invoices?code=${tx.invoiceCode}`}
                      className="font-bold text-lotus-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 text-adminGray-400" />
                      {tx.invoiceCode}
                    </Link>
                  </td>
                  <td className="py-2.5 font-semibold text-adminInk truncate max-w-[100px] sm:max-w-none">
                    {tx.customerName || "Khách vãng lai"}
                  </td>
                  <td className="py-2.5 text-adminGray-600 font-medium hidden md:table-cell">
                    {tx.salonName}
                  </td>
                  <td className="py-2.5 text-right font-bold text-adminInk">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-[4px] border text-2xs font-bold uppercase ${
                      PAYMENT_METHOD_CLASSES[tx.paymentMethod] ?? "bg-adminGray-50 text-adminGray-600 border-adminGray-100"
                    }`}>
                      {PAYMENT_METHOD_LABELS[tx.paymentMethod] ?? "Khác"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-semibold text-adminGray-600 text-2xs pr-1">
                    {formatDateTimeDisplay(tx.issuedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
