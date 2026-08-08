import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_HEIGHT, chartColors, type ChartSeries } from "./chartTheme";

type RadarChartProps = {
  data: Record<string, string | number>[];
  angleKey?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  series?: ChartSeries[];
};

const defaultSeries: ChartSeries[] = [
  {
    dataKey: "a",
    name: "My First dataset",
    color: chartColors.red,
  },
  {
    dataKey: "b",
    name: "My Second dataset",
    color: chartColors.blue,
  },
];

export function RadarChart({
  data,
  angleKey = "subject",
  height = CHART_HEIGHT,
  className,
  showLegend = true,
  series = defaultSeries,
}: RadarChartProps) {
  return (
    <div className={"chart-container w-full " + (className ?? "")} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#dee2e6" />
          <PolarAngleAxis dataKey={angleKey} tick={{ fontSize: 11, fill: "#6c757d" }} />
          <PolarRadiusAxis tick={{ fontSize: 10, fill: "#adb5bd" }} />
          <Tooltip />
          {showLegend ? <Legend verticalAlign="top" height={36} /> : null}
          {series.map((s: ChartSeries) => (
            <Radar
              key={s.dataKey}
              name={s.name ?? s.dataKey}
              dataKey={s.dataKey}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.2}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
