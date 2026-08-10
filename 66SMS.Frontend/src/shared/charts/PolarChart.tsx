import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_HEIGHT, CHART_PALETTE } from "./chartTheme";

type PolarDatum = {
  name: string;
  value: number;
  fill?: string;
};

type PolarChartProps = {
  data: PolarDatum[];
  height?: number;
  className?: string;
  showLegend?: boolean;
};

export function PolarChart({
  data,
  height = CHART_HEIGHT,
  className,
  showLegend = true,
}: PolarChartProps) {
  const chartData = data.map((item: PolarDatum, i: number) => ({
    ...item,
    fill: item.fill ?? CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  return (
    <div className={"chart-container w-full " + (className ?? "")} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="15%"
          outerRadius="80%"
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: "#f1f4f6" }}
            dataKey="value"
            cornerRadius={4}
          />
          <Tooltip />
          {showLegend ? <Legend verticalAlign="top" height={36} /> : null}
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
