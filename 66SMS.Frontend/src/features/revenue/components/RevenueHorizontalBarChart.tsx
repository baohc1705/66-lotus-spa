import { BarChart } from "@/shared/charts/BarChart";
import { chartColors } from "@/shared/charts/chartTheme";
import { Card, CardBody, CardHeader } from "@/shared/elements/Card";

type Point = { label: string; revenue: number };

type Props = {
  data: Point[];
  title?: string;
};

export function RevenueHorizontalBarChart({
  data,
  title = "Doanh thu",
}: Props) {
  const chartData = data.map((row: Point) => ({
    name: row.label.length > 18 ? row.label.slice(0, 18) + "…" : row.label,
    value: row.revenue,
  }));
  const height = Math.max(280, chartData.length * 36);

  return (
    <Card className="main-card mb-0 overflow-hidden">
      <CardHeader>
        <span className="text-sm font-bold text-kit-heading/70">{title}</span>
      </CardHeader>
      <CardBody>
        {chartData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-kit-muted">
            Chưa có dữ liệu
          </div>
        ) : (
          <BarChart
            data={chartData}
            dataKey="value"
            height={height}
            color={chartColors.primary}
            layout="horizontal"
          />
        )}
      </CardBody>
    </Card>
  );
}
