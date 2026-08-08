import { useState } from "react";
import { BodyTabs } from "@/shared/components/Tabs";
import { Card, CardBody, CardTitle } from "@/shared/elements/Card";
import { BarChart } from "@/shared/charts/BarChart";
import { DoughnutChart } from "@/shared/charts/DoughnutChart";
import { LineChart } from "@/shared/charts/LineChart";
import { PieChart } from "@/shared/charts/PieChart";
import { PolarChart } from "@/shared/charts/PolarChart";
import { RadarChart } from "@/shared/charts/RadarChart";
import { chartColors } from "@/shared/charts/chartTheme";
import { DemoPageShell } from "../../components/DemoPageShell";

const pieData = [
  { name: "Red", value: 65 },
  { name: "Orange", value: 59 },
  { name: "Yellow", value: 80 },
  { name: "Green", value: 81 },
  { name: "Blue", value: 56 },
];

const doughnutData = [
  { name: "Red", value: 45 },
  { name: "Orange", value: 72 },
  { name: "Yellow", value: 38 },
  { name: "Green", value: 64 },
  { name: "Blue", value: 51 },
];

const radarData = [
  { subject: "Eating", a: 65, b: 28 },
  { subject: "Drinking", a: 59, b: 48 },
  { subject: "Sleeping", a: 80, b: 40 },
  { subject: "Designing", a: 81, b: 52 },
  { subject: "Coding", a: 56, b: 86 },
  { subject: "Cycling", a: 55, b: 74 },
  { subject: "Running", a: 72, b: 65 },
];

const polarData = [
  { name: "Red", value: 65 },
  { name: "Green", value: 59 },
  { name: "Yellow", value: 80 },
  { name: "Grey", value: 81 },
  { name: "Blue", value: 56 },
];

const monthBarData = [
  { name: "Jan", a: 65, b: 28, c: 42 },
  { name: "Feb", a: 59, b: 48, c: 35 },
  { name: "Mar", a: 80, b: 40, c: 55 },
  { name: "Apr", a: 81, b: 52, c: 62 },
  { name: "May", a: 56, b: 86, c: 48 },
  { name: "Jun", a: 55, b: 74, c: 58 },
  { name: "Jul", a: 72, b: 65, c: 70 },
];

const lineData = [
  { name: "Jan", a: 65, b: 28 },
  { name: "Feb", a: 59, b: 48 },
  { name: "Mar", a: 80, b: 40 },
  { name: "Apr", a: 81, b: 52 },
  { name: "May", a: 56, b: 86 },
  { name: "Jun", a: 55, b: 74 },
  { name: "Jul", a: 72, b: 65 },
  { name: "Aug", a: 84, b: 52 },
  { name: "Sep", a: 91, b: 63 },
  { name: "Oct", a: 78, b: 85 },
  { name: "Nov", a: 66, b: 92 },
  { name: "Dec", a: 88, b: 78 },
];

const barSeries = [
  { dataKey: "a", name: "Dataset 1", color: chartColors.red },
  { dataKey: "b", name: "Dataset 2", color: chartColors.blue },
  { dataKey: "c", name: "Dataset 3", color: chartColors.green },
];

const horizSeries = [
  { dataKey: "a", name: "Dataset 1", color: "rgba(220,53,69,0.5)" },
  { dataKey: "b", name: "Dataset 2", color: "rgba(0,123,255,0.5)" },
];

const lineSeries = [
  { dataKey: "a", name: "Dataset 1", color: chartColors.red },
  { dataKey: "b", name: "Dataset 2", color: chartColors.blue },
];

const pieColors = [
  chartColors.red,
  chartColors.orange,
  chartColors.yellow,
  chartColors.green,
  chartColors.blue,
];

const polarColors = [
  chartColors.red,
  chartColors.green,
  chartColors.yellow,
  chartColors.grey,
  chartColors.blue,
];

export function RechartsPage() {
  const [tab, setTab] = useState("circular");

  return (
    <DemoPageShell
      title="Recharts"
      subtitle="Huge selection of charts created with Recharts"
    >
      <BodyTabs
        items={[
          { id: "circular", label: "Circular Charts" },
          { id: "lines", label: "Lines & Bars Charts" },
        ]}
        activeId={tab}
        onChange={setTab}
      />

      {tab === "circular" ? (
        <div className="grid md:grid-cols-2 md:gap-x-[30px]">
          <div>
            <Card>
              <CardBody>
                <CardTitle>Pie Chart</CardTitle>
                <PieChart data={pieData} colors={pieColors} />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Radar Chart</CardTitle>
                <RadarChart data={radarData} />
              </CardBody>
            </Card>
          </div>
          <div>
            <Card>
              <CardBody>
                <CardTitle>Doughnut</CardTitle>
                <DoughnutChart data={doughnutData} colors={pieColors} />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Polar Chart</CardTitle>
                <PolarChart
                  data={polarData.map((item, i: number) => ({
                    ...item,
                    fill: polarColors[i],
                  }))}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "lines" ? (
        <div className="grid md:grid-cols-2 md:gap-x-[30px]">
          <div>
            <Card>
              <CardBody>
                <CardTitle>Vertical Bars</CardTitle>
                <BarChart data={monthBarData} series={barSeries} showLegend />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Horizontal Bars</CardTitle>
                <BarChart
                  data={monthBarData}
                  layout="horizontal"
                  series={horizSeries}
                  showLegend
                />
              </CardBody>
            </Card>
          </div>
          <div>
            <Card>
              <CardBody>
                <CardTitle>Line Chart</CardTitle>
                <LineChart data={lineData} series={lineSeries} showLegend />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Stacked Bars</CardTitle>
                <BarChart data={monthBarData} series={barSeries} stacked showLegend />
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </DemoPageShell>
  );
}
