import { useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Car,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Trash2,
} from "lucide-react";
import { BarChart } from "@/shared/charts/BarChart";
import { LineChart } from "@/shared/charts/LineChart";
import { chartColors } from "@/shared/charts/chartTheme";
import { Progress, type ProgressTone } from "@/shared/components/Progress";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { TabNav } from "@/shared/components/Tabs";
import { Badge } from "@/shared/elements/Badge";
import { Button, ButtonGroup } from "@/shared/elements/Button";
import { Card, CardFooter, CardHeader } from "@/shared/elements/Card";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { StatCard } from "@/shared/widgets/StatCard";
import {
  WidgetBox,
  WidgetContentLeft,
  WidgetContentOuter,
  WidgetContentRight,
  WidgetContentWrapper,
  WidgetHeading,
  WidgetNumbers,
  WidgetSubheading,
  type WidgetShadowTone,
} from "@/shared/widgets/WidgetContent";
import { DemoPageShell, HeaderIcon } from "../../components/DemoPageShell";

const cardShadow =
  "shadow-[0_0.46875rem_2.1875rem_rgba(8,32,92,0.03),0_0.9375rem_1.40625rem_rgba(8,32,92,0.03),0_0.25rem_0.53125rem_rgba(8,32,92,0.05),0_0.125rem_0.1875rem_rgba(8,32,92,0.03)]";

const salesBarData = [
  { name: "Jan", a: 65, b: 28, c: 42 },
  { name: "Feb", a: 59, b: 48, c: 35 },
  { name: "Mar", a: 80, b: 40, c: 55 },
  { name: "Apr", a: 81, b: 52, c: 62 },
  { name: "May", a: 56, b: 86, c: 48 },
  { name: "Jun", a: 55, b: 74, c: 58 },
  { name: "Jul", a: 72, b: 65, c: 70 },
];

const salesBarSeries = [
  { dataKey: "a", name: "Dataset 1", color: chartColors.red },
  { dataKey: "b", name: "Dataset 2", color: chartColors.blue },
  { dataKey: "c", name: "Dataset 3", color: chartColors.green },
];

const salesHorizSeries = [
  { dataKey: "a", name: "Dataset 1", color: "rgba(220,53,69,0.5)" },
  { dataKey: "b", name: "Dataset 2", color: "rgba(0,123,255,0.5)" },
];

const bandwidthLineData = [
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

const bandwidthLineSeries = [
  { dataKey: "a", name: "Dataset 1", color: chartColors.red },
  { dataKey: "b", name: "Dataset 2", color: chartColors.blue },
];

type RankItem = {
  name: string;
  role: string;
  amount: number;
  trend: "up" | "down" | "dot";
  initial: string;
  color: string;
};

const topAuthors: RankItem[] = [
  { name: "Ella-Rose Henry", role: "Web Developer", amount: 129, trend: "down", initial: "E", color: "#3f6ad8" },
  { name: "Ruben Tillman", role: "UI Designer", amount: 54, trend: "up", initial: "R", color: "#3ac47d" },
  { name: "Vinnie Wagstaff", role: "Java Programmer", amount: 429, trend: "dot", initial: "V", color: "#f7b924" },
  { name: "Ella-Rose Henry", role: "Web Developer", amount: 129, trend: "down", initial: "E", color: "#d92550" },
  { name: "Ruben Tillman", role: "UI Designer", amount: 54, trend: "up", initial: "R", color: "#16aaff" },
];

const topCategories: RankItem[] = [
  { name: "Electronics", role: "Tech Products", amount: 842, trend: "up", initial: "E", color: "#3f6ad8" },
  { name: "Fashion", role: "Clothing & Accessories", amount: 567, trend: "up", initial: "F", color: "#3ac47d" },
  { name: "Home & Garden", role: "Interior Design", amount: 324, trend: "dot", initial: "H", color: "#f7b924" },
  { name: "Sports & Outdoors", role: "Fitness Equipment", amount: 289, trend: "down", initial: "S", color: "#d92550" },
  { name: "Books & Media", role: "Digital Content", amount: 156, trend: "up", initial: "B", color: "#16aaff" },
];

type MetricItem = {
  value: number;
  label: string;
  tone: ProgressTone;
};

const bandwidthTab1: MetricItem[] = [
  { value: 63, label: "Generated Leads", tone: "danger" },
  { value: 32, label: "Submitted Tickers", tone: "success" },
  { value: 71, label: "Server Allocation", tone: "primary" },
  { value: 41, label: "Generated Leads", tone: "warning" },
];

const bandwidthTab2: MetricItem[] = [
  { value: 89, label: "CPU Usage", tone: "info" },
  { value: 67, label: "Memory Usage", tone: "alternate" },
  { value: 54, label: "Disk I/O", tone: "success" },
  { value: 78, label: "Network Load", tone: "warning" },
];

type UserRow = {
  id: string;
  name: string;
  job: string;
  city: string;
  status: "Pending" | "Completed" | "In Progress" | "On Hold";
  initial: string;
  color: string;
};

const users: UserRow[] = [
  { id: "#345", name: "John Doe", job: "Web Developer", city: "Madrid", status: "Pending", initial: "J", color: "#3f6ad8" },
  { id: "#347", name: "Ruben Tillman", job: "Etiam sit amet orci eget", city: "Berlin", status: "Completed", initial: "R", color: "#3ac47d" },
  { id: "#321", name: "Elliot Huber", job: "Lorem ipsum dolor sic", city: "London", status: "In Progress", initial: "E", color: "#d92550" },
  { id: "#55", name: "Vinnie Wagstaff", job: "UI Designer", city: "Amsterdam", status: "On Hold", initial: "V", color: "#16aaff" },
];

function Avatar(props: { initial: string; color: string; size?: number }) {
  const size = props.size ?? 42;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-white font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: props.color,
        fontSize: size > 36 ? "0.95rem" : "0.8rem",
      }}
    >
      {props.initial}
    </div>
  );
}

function TrendIcon(props: { trend: RankItem["trend"] }) {
  if (props.trend === "up") {
    return <ChevronUp className="inline h-3.5 w-3.5 text-[#3ac47d]" strokeWidth={2.5} />;
  }
  if (props.trend === "down") {
    return <ChevronDown className="inline h-3.5 w-3.5 text-[#d92550]" strokeWidth={2.5} />;
  }
  return <CircleDot className="inline h-3 w-3 text-[#f7b924]" strokeWidth={2.5} />;
}

function RankList(props: { items: RankItem[] }) {
  return (
    <ScrollArea size="sm">
      <ListGroup flush>
        {props.items.map((item: RankItem, index: number) => (
          <ListGroupItem key={item.name + "-" + index} className="!block">
            <div className="w-full p-0">
              <WidgetContentWrapper>
                <WidgetContentLeft className="mr-3 shrink-0">
                  <Avatar initial={item.initial} color={item.color} />
                </WidgetContentLeft>
                <WidgetContentLeft>
                  <WidgetHeading>{item.name}</WidgetHeading>
                  <WidgetSubheading>{item.role}</WidgetSubheading>
                </WidgetContentLeft>
                <WidgetContentRight>
                  <div className="text-lg text-[#6c757d]">
                    <small className="opacity-50 pe-1">$</small>
                    <span>{item.amount}</span>
                    <small className="ps-2">
                      <TrendIcon trend={item.trend} />
                    </small>
                  </div>
                </WidgetContentRight>
              </WidgetContentWrapper>
            </div>
          </ListGroupItem>
        ))}
      </ListGroup>
    </ScrollArea>
  );
}

function BandwidthMetric(props: MetricItem) {
  return (
    <div className="p-4">
      <WidgetContentOuter>
        <WidgetContentWrapper>
          <WidgetContentLeft>
            <WidgetNumbers tone="muted" size="md">
              {props.value}%
            </WidgetNumbers>
          </WidgetContentLeft>
          <WidgetContentRight>
            <div className="text-[#6c757d] opacity-60">{props.label}</div>
          </WidgetContentRight>
        </WidgetContentWrapper>
        <div className="mt-1">
          <Progress value={props.value} tone={props.tone} size="sm" animated className="mb-0" />
        </div>
      </WidgetContentOuter>
    </div>
  );
}

function TargetChartBlock(props: {
  value: number;
  label: string;
  tone: WidgetShadowTone;
}) {
  return (
    <WidgetBox shadowTone={props.tone} className="text-left">
      <WidgetContentOuter>
        <WidgetContentWrapper>
          <WidgetContentLeft className="shrink-0 pr-2 text-base">
            <WidgetNumbers tone={props.tone} size="md" className="mt-0">
              {props.value}%
            </WidgetNumbers>
          </WidgetContentLeft>
          <div className="widget-content-right min-w-0 w-full">
            <Progress value={props.value} tone={props.tone} size="xs" className="mb-0" />
          </div>
        </WidgetContentWrapper>
        <WidgetContentLeft className="text-base">
          <div className="text-[#6c757d] opacity-60">{props.label}</div>
        </WidgetContentLeft>
      </WidgetContentOuter>
    </WidgetBox>
  );
}

function statusBadge(status: UserRow["status"]) {
  if (status === "Completed") return <Badge variant="success">{status}</Badge>;
  if (status === "Pending") return <Badge variant="warning">{status}</Badge>;
  if (status === "In Progress") return <Badge variant="danger">{status}</Badge>;
  return <Badge variant="info">{status}</Badge>;
}

export function DashboardExample1Page() {
  const [salesTab, setSalesTab] = useState("last");
  const [bandwidthTab, setBandwidthTab] = useState("tab1");
  const [usersRange, setUsersRange] = useState("week");

  return (
    <DemoPageShell
      title="Analytics Dashboard"
      subtitle="This is an example dashboard created using build-in elements and components."
      icon={Car}
    >
      <div className="grid gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          tone="midnight-bloom"
          title="Total Orders"
          description="Last year expenses"
          value="1896"
          valueTone="white"
        />
        <StatCard
          tone="arielle-smile"
          title="Clients"
          description="Total Clients Profit"
          value="$ 568"
          valueTone="white"
        />
        <StatCard
          tone="grow-early"
          title="Followers"
          description="People Interested"
          value="46%"
          valueTone="white"
        />
        <div className="xl:hidden">
          <StatCard
            tone="premium-dark"
            title="Products Sold"
            description="Revenue streams"
            value="$14M"
            valueTone="warning"
          />
        </div>
      </div>

      <div className="grid gap-x-6 lg:grid-cols-2">
        {/* Sales Report */}
        <div className={"mb-3 overflow-hidden rounded bg-white " + cardShadow}>
          <div className="card-header flex h-14 items-center justify-between border-b border-black/5 px-4">
            <div className="flex items-center text-sm font-bold text-[rgba(36,59,107,0.7)]">
              <HeaderIcon gradient="love-kiss" />
              Sales Report
            </div>
            <TabNav
              items={[
                { id: "last", label: "Last" },
                { id: "current", label: "Current" },
              ]}
              activeId={salesTab}
              onChange={setSalesTab}
              variant="nav-link-header"
            />
          </div>
          <div className="p-4">
            {salesTab === "last" ? (
              <>
                <div className="mb-3 opacity-90">
                  <BarChart data={salesBarData} series={salesBarSeries} height={240} showLegend />
                </div>
                <h6 className="mb-2 text-sm font-normal uppercase tracking-wide text-[#6c757d] opacity-50">
                  Top Authors
                </h6>
                <RankList items={topAuthors} />
              </>
            ) : (
              <>
                <div className="mb-3 opacity-90">
                  <BarChart
                    data={salesBarData}
                    series={salesHorizSeries}
                    layout="horizontal"
                    height={240}
                    showLegend
                  />
                </div>
                <h6 className="mb-2 text-sm font-normal uppercase tracking-wide text-[#6c757d] opacity-50">
                  Top Categories
                </h6>
                <RankList items={topCategories} />
              </>
            )}
          </div>
        </div>

        {/* Bandwidth Reports */}
        <div className={"mb-3 overflow-hidden rounded bg-white " + cardShadow}>
          <div className="card-header flex h-14 items-center justify-between border-b border-black/5 px-4">
            <div className="flex items-center text-sm font-bold text-[rgba(36,59,107,0.7)]">
              <HeaderIcon gradient="tempting-azure" />
              Bandwidth Reports
            </div>
            <TabNav
              items={[
                { id: "tab1", label: "Tab 1" },
                { id: "tab2", label: "Tab 2" },
              ]}
              activeId={bandwidthTab}
              onChange={setBandwidthTab}
              variant="btn-outline-alternate-pill"
            />
          </div>

          {bandwidthTab === "tab1" ? (
            <>
              <div className="p-3">
                <LineChart
                  data={bandwidthLineData}
                  series={bandwidthLineSeries}
                  height={220}
                  showLegend
                />
                <div className="mt-8 text-center text-sm">
                  <span className="inline-flex items-center text-[#f7b924]">
                    <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                    <span className="ps-1 font-semibold">175.5%</span>
                  </span>
                  <span className="ps-1 text-[#6c757d] opacity-80">
                    increased server resources
                  </span>
                </div>
              </div>
              <div className="grid pt-2 md:grid-cols-2">
                {bandwidthTab1.map((item: MetricItem, index: number) => (
                  <BandwidthMetric key={"b1-" + index} {...item} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="p-3">
                <LineChart
                  data={bandwidthLineData}
                  series={bandwidthLineSeries}
                  height={220}
                  showLegend
                />
                <div className="mt-8 text-center text-sm">
                  <span className="inline-flex items-center text-[#3ac47d]">
                    <ArrowUp className="mr-1 h-3.5 w-3.5" />
                    <span className="ps-1 font-semibold">12.4%</span>
                  </span>
                  <span className="ps-1 text-[#6c757d] opacity-80">
                    improvement from last week
                  </span>
                </div>
              </div>
              <div className="grid pt-2 md:grid-cols-2">
                {bandwidthTab2.map((item: MetricItem, index: number) => (
                  <BandwidthMetric key={"b2-" + index} {...item} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Plain widgets — Income card hidden on xl+ */}
      <div className="grid gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Orders"
          description="Last year expenses"
          value="1896"
          valueTone="success"
        />
        <StatCard
          title="Products Sold"
          description="Revenue streams"
          value="$3M"
          valueTone="warning"
        />
        <StatCard
          title="Followers"
          description="People Interested"
          value="45,9%"
          valueTone="danger"
        />
        <div className="xl:hidden">
          <StatCard
            title="Income"
            description="Expected totals"
            value="$147"
            valueTone="focus"
            progress={{
              value: 54,
              tone: "info",
              size: "sm",
              animated: true,
              leftLabel: "Expenses",
              rightLabel: "100%",
            }}
          />
        </div>
      </div>

      {/* Active Users */}
      <Card className="main-card">
        <CardHeader className="justify-between">
          <span className="text-sm font-bold text-[rgba(36,59,107,0.7)]">
            Active Users
          </span>
          <ButtonGroup className="btn-group-sm">
            <Button
              size="sm"
              variant="focus"
              active={usersRange === "week"}
              onClick={() => setUsersRange("week")}
            >
              Last Week
            </Button>
            <Button
              size="sm"
              variant="focus"
              active={usersRange === "month"}
              onClick={() => setUsersRange("month")}
            >
              All Month
            </Button>
          </ButtonGroup>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table borderless striped hover>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-center">#</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell className="text-center">City</TableHeaderCell>
                <TableHeaderCell className="text-center">Status</TableHeaderCell>
                <TableHeaderCell className="text-center">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: UserRow) => (
                <TableRow key={user.id}>
                  <TableCell className="text-center text-[#6c757d]">{user.id}</TableCell>
                  <TableCell>
                    <WidgetContentWrapper>
                      <WidgetContentLeft className="mr-3 shrink-0">
                        <Avatar initial={user.initial} color={user.color} size={40} />
                      </WidgetContentLeft>
                      <WidgetContentLeft>
                        <WidgetHeading>{user.name}</WidgetHeading>
                        <WidgetSubheading className="opacity-70">{user.job}</WidgetSubheading>
                      </WidgetContentLeft>
                    </WidgetContentWrapper>
                  </TableCell>
                  <TableCell className="text-center">{user.city}</TableCell>
                  <TableCell className="text-center">{statusBadge(user.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" variant="primary">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <CardFooter className="justify-center">
          <Button size="sm" variant="outline-danger" className="me-2 !px-2" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="success" wide>
            Save
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
        <TargetChartBlock value={71} label="Income Target" tone="danger" />
        <TargetChartBlock value={54} label="Expenses Target" tone="success" />
        <TargetChartBlock value={32} label="Spendings Target" tone="warning" />
        <TargetChartBlock value={89} label="Totals Target" tone="info" />
      </div>
    </DemoPageShell>
  );
}
