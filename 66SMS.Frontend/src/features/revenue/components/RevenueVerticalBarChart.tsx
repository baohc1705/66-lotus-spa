import { BarChart } from "@/shared/charts/BarChart";
import { chartColors } from "@/shared/charts/chartTheme";
import { Card, CardBody, CardHeader } from "@/shared/elements/Card";

type Point = { label: string; revenue: number };

type Props = {
  data: Point[];
  title?: string;
};

export function RevenueVerticalBarChart({ data, title = "Doanh thu" }: Props) {
  const chartData = data.map((row: Point) => ({
    name: row.label,
    value: row.revenue,
  }));

  return (
    <Card className="main-card mb-0 overflow-hidden">
      <CardHeader>
        <span className="text-sm font-bold text-kit-heading/70">{title}</span>
      </CardHeader>
      <CardBody>
        {chartData.length === 0 ? (
          <div className="flex h-80 items-center justify-center text-kit-muted">
            Chưa có dữ liệu
          </div>
        ) : (
          <BarChart
            data={chartData}
            dataKey="value"
            height={320}
            color={chartColors.primary}
          />
        )}
      </CardBody>
    </Card>
  );
}
