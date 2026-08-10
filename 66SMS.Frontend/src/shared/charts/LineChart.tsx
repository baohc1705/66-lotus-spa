import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_HEIGHT, chartColors, type ChartSeries } from "./chartTheme";

type LineChartProps = {
  data: Record<string, string | number>[];
  dataKey?: string;
  xKey?: string;
  height?: number;
  color?: string;
  className?: string;
  showLegend?: boolean;
  series?: ChartSeries[];
};

export function LineChart({
  data,
  dataKey = "value",
  xKey = "name",
  height = CHART_HEIGHT,
  color = chartColors.primary,
  className,
  showLegend = false,
  series,
}: LineChartProps) {
  const lines: ChartSeries[] =
    series && series.length > 0 ? series : [{ dataKey, color, name: dataKey }];

  return (
    <div className={"chart-container w-full " + (className ?? "")} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#6c757d" }} />
          <YAxis tick={{ fontSize: 12, fill: "#6c757d" }} />
          <Tooltip />
          {(showLegend || lines.length > 1) && <Legend />}
          {lines.map((line: ChartSeries) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name ?? line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
