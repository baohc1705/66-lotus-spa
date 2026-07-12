import { Wallet, ShieldAlert, BadgeDollarSign } from "lucide-react";
import { formatCurrency } from "@/shared/utils/currency";

interface CashOutBreakdownProps {
  data?: {
    payrollBase: number;
    commission: number;
    refunds: number;
  };
  total?: number;
  isLoading: boolean;
}

export function CashOutBreakdown({ data, total = 0, isLoading }: CashOutBreakdownProps) {
  if (isLoading || !data) {
    return (
      <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-adminGray-100/30 h-[280px] flex flex-col justify-between">
        <div className="h-5 w-40 bg-adminGray-100 rounded animate-pulse" />
        <div className="space-y-4 mt-6">
          <div className="h-6 w-full bg-adminGray-100 rounded animate-pulse" />
          <div className="h-6 w-full bg-adminGray-100 rounded animate-pulse" />
          <div className="h-6 w-full bg-adminGray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const { payrollBase, commission, refunds } = data;
  const computedTotal = payrollBase + commission + refunds;
  const displayTotal = total > 0 ? total : computedTotal;

  const basePct = displayTotal > 0 ? Math.round((payrollBase / displayTotal) * 100) : 0;
  const commPct = displayTotal > 0 ? Math.round((commission / displayTotal) * 100) : 0;
  const refundPct = displayTotal > 0 ? Math.max(0, 100 - basePct - commPct) : 0;

  const items = [
    {
      label: "Lương cơ bản KTV/Nhân sự",
      amount: payrollBase,
      percent: basePct,
      color: "bg-adminGreen-600",
      icon: Wallet,
    },
    {
      label: "Hoa hồng kỹ thuật viên",
      amount: commission,
      percent: commPct,
      color: "bg-adminGold-600",
      icon: BadgeDollarSign,
    },
    {
      label: "Hoàn cọc & Hoàn trả HĐ",
      amount: refunds,
      percent: refundPct,
      color: "bg-state-danger-solid",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-adminGray-100 flex flex-col h-[280px]">
      <div>
        <h3 className="font-sans text-sm font-bold text-adminInk">
          Cơ Cấu Chi Phí Dòng Tiền Ra
        </h3>
        <p className="text-xs text-adminGray-600 mt-0.5">
          Phân tích các khoản chi trả nhân sự và hoàn tiền
        </p>
      </div>

      <div className="mt-4 flex flex-col flex-1 justify-between">
        {/* Visual Stacked Progress Bar */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-2xs text-adminGray-400 font-bold uppercase tracking-wider">Tổng tiền thực chi</span>
            <span className="text-lg font-bold text-adminInk">{formatCurrency(displayTotal)}</span>
          </div>
          <div className="w-full h-3 rounded-full flex overflow-hidden bg-adminGray-100 mt-1.5 border border-adminGray-100">
            {payrollBase > 0 && <div className="bg-adminGreen-600 h-full" style={{ width: `${basePct}%` }} />}
            {commission > 0 && <div className="bg-adminGold-600 h-full" style={{ width: `${commPct}%` }} />}
            {refunds > 0 && <div className="bg-state-danger-solid h-full" style={{ width: `${refundPct}%` }} />}
          </div>
        </div>

        {/* Detailed Items list */}
        <div className="space-y-3 mt-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-sm ${item.color} shrink-0`} />
                  <Icon className="w-3.5 h-3.5 text-adminGray-400 shrink-0" />
                  <span className="text-adminInk font-semibold truncate max-w-[170px] sm:max-w-none">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="font-bold text-adminInk">{formatCurrency(item.amount)}</span>
                  <span className="text-2xs font-bold text-adminGray-400 bg-adminGray-100/70 px-1.5 py-0.5 rounded">
                    {item.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
