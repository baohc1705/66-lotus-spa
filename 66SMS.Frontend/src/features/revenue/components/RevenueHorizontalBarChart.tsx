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

export function RevenueHorizontalBarChart({
  data,
  title = "Doanh thu",
}: Props) {
  const height = Math.max(280, data.length * 36);

  return (
    <div
      className="bg-white border rounded-lg p-4 flex flex-col"
      style={{ height }}
    >
      <div className="text-sm font-bold mb-3">{title}</div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: unknown) => {
                const n = Number(v);
                if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
                return `${n}`;
              }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(v: unknown) => [
                formatCurrency(Number(v)),
                "Doanh thu",
              ]}
            />
            <Bar dataKey="revenue" fill="var(--admin-green-600)" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
