import { memo } from "react";
import { formatCurrency } from "@/shared/utils/currency";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { RevenueSummaryDto } from "../types/revenue.types";

interface RevenueKpiCardsProps {
  summary?: RevenueSummaryDto;
  isLoading: boolean;
}

export const RevenueKpiCards = memo(function RevenueKpiCards({
  summary,
  isLoading,
}: RevenueKpiCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-admin border border-adminGray-100 p-4 h-[100px]"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-adminGray-100" />
              <div className="w-16 h-3 rounded bg-adminGray-100" />
            </div>
            <div className="w-24 h-5 rounded bg-adminGray-100 mb-1" />
            <div className="w-14 h-3 rounded bg-adminGray-100" />
          </div>
        ))}
      </div>
    );
  }

  const {
    cashIn,
    cashOut,
    netCashFlow,
    grossRevenue,
    transactionCount,
    averageOrderValue,
    previousPeriod,
  } = summary;

  const renderTrend = (
    current: number,
    prev?: number,
    isOutflow: boolean = false,
  ) => {
    if (prev === undefined || prev === null || prev === 0) return null;
    const change = ((current - prev) / prev) * 100;
    const isPositive = change >= 0;
    const isGood = isOutflow ? !isPositive : isPositive;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-2xs font-bold ${
          isGood ? "text-adminGreen-600" : "text-state-danger-text"
        }`}
      >
        <Icon className="w-3 h-3" />
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  const cards = [
    {
      label: "Dòng tiền vào",
      value: formatCurrency(cashIn),
      trend: renderTrend(cashIn, previousPeriod?.cashIn),
      icon: DollarSign,
      iconColor: "admin-stat-icon--gold",
    },
    {
      label: "Dòng tiền ra",
      value: formatCurrency(cashOut),
      trend: renderTrend(cashOut, previousPeriod?.cashOut, true),
      icon: Wallet,
      iconColor: "bg-state-danger-bg text-state-danger-text",
    },
    {
      label: "Dòng tiền ròng",
      value: formatCurrency(netCashFlow),
      trend: renderTrend(netCashFlow, previousPeriod?.netCashFlow),
      icon: TrendingUp,
      iconColor: "admin-stat-icon--gold",
    },
    {
      label: "Doanh thu",
      value: formatCurrency(grossRevenue),
      trend: renderTrend(grossRevenue, previousPeriod?.grossRevenue),
      icon: CreditCard,
      iconColor: "admin-stat-icon--gold",
    },
    {
      label: "Số giao dịch",
      value: transactionCount.toLocaleString("vi-VN"),
      trend: renderTrend(transactionCount, previousPeriod?.transactionCount),
      icon: Activity,
      iconColor: "admin-stat-icon--gold",
    },
    {
      label: "Giá trị TB / đơn",
      value: formatCurrency(averageOrderValue),
      trend: renderTrend(averageOrderValue, previousPeriod?.averageOrderValue),
      icon: ShoppingBag,
      iconColor: "admin-stat-icon--gold",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white border border-adminGray-100 rounded-admin p-4 flex flex-col gap-2 hover:border-adminGray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${card.iconColor}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              {card.trend}
            </div>
            <div>
              <div className="text-2xs text-adminGray-400 font-medium mb-0.5">
                {card.label}
              </div>
              <div className="text-base font-bold text-adminInk truncate">
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
