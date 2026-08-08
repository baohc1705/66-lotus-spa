import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_HEIGHT, CHART_PALETTE } from "./chartTheme";

type DoughnutDatum = {
  name: string;
  value: number;
};

type DoughnutChartProps = {
  data: DoughnutDatum[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
  colors?: string[];
  className?: string;
  showLegend?: boolean;
  innerRadius?: string | number;
};

export function DoughnutChart({
  data,
  dataKey = "value",
  nameKey = "name",
  height = CHART_HEIGHT,
  colors = CHART_PALETTE,
  className,
  showLegend = true,
  innerRadius = "55%",
}: DoughnutChartProps) {
  return (
    <div className={"chart-container w-full " + (className ?? "")} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="75%"
            paddingAngle={1}
          >
            {data.map((_: DoughnutDatum, i: number) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          {showLegend ? <Legend verticalAlign="top" height={36} /> : null}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
