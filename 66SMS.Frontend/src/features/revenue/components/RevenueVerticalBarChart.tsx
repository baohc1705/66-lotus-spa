import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/shared/utils/currency";

type Point = { label: string; revenue: number };

type Props = {
  data: Point[];
  title?: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-sm">
      <div className="mb-1 font-semibold text-slate-800">{label}</div>
      <div className="text-lotus-primary">
        Doanh thu: {formatCurrency(Number(payload[0].value))}
      </div>
    </div>
  );
}

export function RevenueVerticalBarChart({ data, title = "Doanh thu" }: Props) {
  return (
    <div className="bg-white border rounded-lg p-4 h-[400px] flex flex-col">
      <div className="text-sm font-bold mb-3">{title}</div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              interval="preserveStartEnd"
              angle={-40}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickMargin={6}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: unknown) => {
                const n = Number(v);
                if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
                if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
                return `${n}`;
              }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="revenue" fill="var(--admin-green-600)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
