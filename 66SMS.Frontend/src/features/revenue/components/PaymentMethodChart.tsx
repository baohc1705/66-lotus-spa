import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/shared/utils/currency";
import type { PaymentMethodBreakdownItemDto } from "../types/revenue.types";

interface PaymentMethodChartProps {
  data?: PaymentMethodBreakdownItemDto[];
  isLoading: boolean;
}

const COLORS = ["#3e7a3e", "#b08d57", "#eaa9ba", "#3b82f6"]; // CASH, BANK, WALLET, VNPAY

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      amount: number;
      percent: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-stone-200/50 p-2.5 rounded-admin shadow-lg text-xs font-sans">
        <p className="font-semibold text-lotus-deep">{data.label}</p>
        <p className="font-bold text-lotus-deep mt-0.5">
          {formatCurrency(data.amount)} ({data.percent}%)
        </p>
      </div>
    );
  }
  return null;
};

export function PaymentMethodChart({ data = [], isLoading }: PaymentMethodChartProps) {
  if (isLoading) {
    return (
      <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30 h-[280px] flex flex-col justify-between">
        <div className="h-5 w-48 bg-stone-100 rounded animate-pulse" />
        <div className="flex-1 mt-4 bg-stone-50 border border-dashed border-stone-100 rounded-admin flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-lotus-leaf border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30 flex flex-col h-[280px]">
      <div className="mb-4">
        <h3 className="font-sans text-lotus-admin-lg font-bold text-lotus-deep">
          Thu Nhập Theo Kênh Thanh Toán
        </h3>
        <p className="text-lotus-admin-base text-lotus-stone mt-0.5">
          Tỷ lệ và tổng dòng tiền thu vào (Cash In) của từng kênh
        </p>
      </div>

      <div className="flex-1 w-full min-h-0 text-lotus-admin-base">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-lotus-stone">
            Chưa có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
            >
              <XAxis 
                type="number" 
                tickFormatter={(v) => v >= 1000000 ? `${v / 1000000}M` : v}
                tickLine={false}
                axisLine={false}
                stroke="#888888"
              />
              <YAxis 
                dataKey="label" 
                type="category" 
                tickLine={false}
                axisLine={false}
                stroke="#888888"
                width={85}
                style={{ fontWeight: "bold" }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Bar 
                dataKey="amount" 
                radius={[0, 4, 4, 0]}
                barSize={16}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
