import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_HEIGHT, chartColors, type ChartSeries } from "./chartTheme";

type BarChartProps = {
  data: Record<string, string | number>[];
  dataKey?: string;
  xKey?: string;
  height?: number;
  color?: string;
  className?: string;
  showLegend?: boolean;
  layout?: "horizontal" | "vertical";
  stacked?: boolean;
  series?: ChartSeries[];
};

export function BarChart({
  data,
  dataKey = "value",
  xKey = "name",
  height = CHART_HEIGHT,
  color = chartColors.primary,
  className,
  showLegend = false,
  layout = "vertical",
  stacked = false,
  series,
}: BarChartProps) {
  const bars: ChartSeries[] =
    series && series.length > 0 ? series : [{ dataKey, color, name: dataKey }];
  const isHorizontal = layout === "horizontal";

  return (
    <div
      className={"chart-container w-full " + (className ?? "")}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          {isHorizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 12, fill: "#6c757d" }} />
              <YAxis
                type="category"
                dataKey={xKey}
                width={72}
                tick={{ fontSize: 12, fill: "#6c757d" }}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#6c757d" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6c757d" }} />
            </>
          )}
          <Tooltip />
          {(showLegend || bars.length > 1) && <Legend />}
          {bars.map((bar: ChartSeries) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name ?? bar.dataKey}
              fill={bar.color}
              stackId={stacked ? "stack" : undefined}
              radius={stacked ? 0 : isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
