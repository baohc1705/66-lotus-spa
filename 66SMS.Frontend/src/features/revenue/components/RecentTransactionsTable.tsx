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
  1: "bg-emerald-50 text-emerald-700 border-emerald-100",
  2: "bg-amber-50 text-amber-700 border-amber-100",
  3: "bg-pink-50 text-pink-700 border-pink-100",
  4: "bg-blue-50 text-blue-700 border-blue-100",
};

export function RecentTransactionsTable({ data = [], isLoading }: RecentTransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30 h-[380px] flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="h-5 w-40 bg-stone-100 rounded animate-pulse" />
          <div className="h-4 w-20 bg-stone-100 rounded animate-pulse" />
        </div>
        <div className="flex-1 mt-6 space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-full bg-stone-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30 flex flex-col h-[380px]">
      {/* Widget Header with navigation link */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h3 className="font-sans text-lotus-admin-lg font-bold text-lotus-deep">
            Giao Dịch Gần Đây
          </h3>
          <p className="text-lotus-admin-base text-lotus-stone mt-0.5">
            Danh sách hóa đơn thanh toán mới nhất trong hệ thống
          </p>
        </div>

        <Link 
          to="/admin/invoices" 
          className="text-lotus-primary hover:text-lotus-primary/80 text-lotus-admin-base font-bold flex items-center gap-1 transition-colors"
        >
          Xem tất cả
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto min-h-0">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-lotus-stone text-lotus-admin-md">
            Chưa có giao dịch nào được ghi nhận
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-lotus-admin-md font-sans">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider text-lotus-admin-xs">
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
                  className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="py-2.5 pl-1">
                    <Link
                      to={`/admin/invoices?code=${tx.invoiceCode}`}
                      className="font-bold text-lotus-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                      {tx.invoiceCode}
                    </Link>
                  </td>
                  <td className="py-2.5 font-semibold text-lotus-deep truncate max-w-[100px] sm:max-w-none">
                    {tx.customerName || "Khách vãng lai"}
                  </td>
                  <td className="py-2.5 text-stone-500 font-medium hidden md:table-cell">
                    {tx.salonName}
                  </td>
                  <td className="py-2.5 text-right font-bold text-lotus-deep">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-[4px] border text-lotus-admin-xs font-bold uppercase ${
                      PAYMENT_METHOD_CLASSES[tx.paymentMethod] ?? "bg-stone-50 text-stone-600 border-stone-100"
                    }`}>
                      {PAYMENT_METHOD_LABELS[tx.paymentMethod] ?? "Khác"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-semibold text-lotus-stone text-lotus-admin-xs pr-1">
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
