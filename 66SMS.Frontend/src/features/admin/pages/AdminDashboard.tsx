import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Download,
  RefreshCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/utils/kitToast";

import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  useRevenueBreakdown,
  useRevenueSummary,
  useRevenueTrend,
  useTodaySummary,
  useTopRevenueItems,
  useTopStaff,
} from "@/features/revenue/hooks/useRevenueDashboard";
import { useExportBranchRevenue } from "@/features/revenue/hooks/useExportBranchRevenue";
import { useExportRevenueBySalon } from "@/features/revenue/hooks/useExportRevenueBySalon";
import {
  useRevenueFilters,
  type RevenuePreset,
} from "@/features/revenue/hooks/useRevenueFilters";
import type { TopRevenueItemDto, TopStaffDto } from "@/features/revenue/types/revenue.types";
import { BarChart } from "@/shared/charts/BarChart";
import { chartColors } from "@/shared/charts/chartTheme";
import { DoughnutChart } from "@/shared/charts/DoughnutChart";
import { LineChart } from "@/shared/charts/LineChart";
import { PieChart } from "@/shared/charts/PieChart";
import { TabNav } from "@/shared/components/Tabs";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody, CardHeader } from "@/shared/elements/Card";
import { Dropdown } from "@/shared/elements/Dropdown";
import { Input } from "@/shared/forms/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDate } from "@/shared/utils/date.utils";
import { StatCard } from "@/shared/widgets/StatCard";
import {
  WidgetContentLeft,
  WidgetContentWrapper,
  WidgetHeading,
  WidgetSubheading,
} from "@/shared/widgets/WidgetContent";

const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= current - 5; y--) years.push(y);
  return years;
})();

const PRESET_OPTIONS: { key: RevenuePreset; label: string }[] = [
  { key: "today", label: "Hôm nay" },
  { key: "7days", label: "7 ngày qua" },
  { key: "30days", label: "30 ngày qua" },
  { key: "thisMonth", label: "Tháng này" },
  { key: "day", label: "Theo ngày" },
  { key: "month", label: "Theo tháng" },
  { key: "year", label: "Theo năm" },
];

function TrendBadge(props: { value: number | null | undefined }) {
  if (props.value === null || props.value === undefined) {
    return <span className="text-kit-muted">—</span>;
  }
  const isUp = props.value >= 0;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={
        "inline-flex items-center gap-0.5 text-sm font-bold " +
        (isUp ? "text-kit-success" : "text-kit-danger")
      }
    >
      <Icon className="h-4 w-4 stroke-[2.5]" />
      {Math.abs(props.value).toFixed(0)}%
    </span>
  );
}

function ChartEmpty(props: { loading: boolean; empty: boolean }) {
  if (props.loading) {
    return (
      <div className="flex h-60 items-center justify-center text-kit-muted">Đang tải...</div>
    );
  }
  if (props.empty) {
    return (
      <div className="flex h-60 items-center justify-center text-kit-muted">Chưa có dữ liệu</div>
    );
  }
  return null;
}

function StaffInitial(props: { name: string }) {
  const parts = props.name.trim().split(/\s+/);
  const initials =
    parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full soft-kit-primary text-xs font-bold">
      {initials}
    </div>
  );
}

function TopItemsTable(props: {
  items: TopRevenueItemDto[];
  loading: boolean;
}) {
  if (props.loading || props.items.length === 0) {
    return (
      <ChartEmpty loading={props.loading} empty={!props.loading && props.items.length === 0} />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table borderless striped hover size="sm">
        <TableHead>
          <TableRow>
            <TableHeaderCell className="text-center">#</TableHeaderCell>
            <TableHeaderCell>Tên</TableHeaderCell>
            <TableHeaderCell className="text-center">Số lượng</TableHeaderCell>
            <TableHeaderCell className="text-right">Doanh thu</TableHeaderCell>
            <TableHeaderCell className="text-center">Tỷ trọng</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.items.map((item: TopRevenueItemDto, index: number) => (
            <TableRow key={item.itemId}>
              <TableCell className="text-center text-kit-muted">{index + 1}</TableCell>
              <TableCell className="font-semibold text-kit-heading">{item.itemName}</TableCell>
              <TableCell className="text-center">
                {item.quantity.toLocaleString("vi-VN")}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
              <TableCell className="text-center">
                <Badge soft variant={item.percent >= 20 ? "success" : "primary"}>
                  {item.percent.toFixed(1)}%
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const selectedSalonId = useAuthStore((state) => state.selectedSalonId);
  const getEffectiveSalonId = useAuthStore((state) => state.getEffectiveSalonId);
  const isAdmin = useAuthStore((state) => state.hasRole("Admin"));
  const isManager = useAuthStore((state) => state.hasRole("Manager"));

  const {
    preset,
    from,
    to,
    setPreset,
    selectedDay,
    setSelectedDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
  } = useRevenueFilters();

  const [cashFlowView, setCashFlowView] = useState("line");
  const [structureView, setStructureView] = useState("doughnut");
  const [topGroup, setTopGroup] = useState("service");
  const [topView, setTopView] = useState("bar");
  const [staffView, setStaffView] = useState("table");

  const exportBySalonMutation = useExportRevenueBySalon();
  const exportBranchMutation = useExportBranchRevenue();

  const branchSalonId = isAdmin ? selectedSalonId : getEffectiveSalonId();
  const canExportBranch =
    (isManager || isAdmin) && branchSalonId != null && branchSalonId > 0;

  const queryParams = useMemo(
    () => ({ from, to, salonId: selectedSalonId }),
    [from, to, selectedSalonId],
  );

  const summaryQuery = useRevenueSummary(queryParams);
  const trendQuery = useRevenueTrend(queryParams);
  const breakdownQuery = useRevenueBreakdown(queryParams);
  const topServicesQuery = useTopRevenueItems(queryParams, "service", 5);
  const topProductsQuery = useTopRevenueItems(queryParams, "product", 5);
  const todayQuery = useTodaySummary(selectedSalonId);
  const topStaffQuery = useTopStaff(selectedSalonId, from, to, 5);

  const summary = summaryQuery.data?.data;
  const today = todayQuery.data?.data;
  const isLoading =
    summaryQuery.isLoading || trendQuery.isLoading || breakdownQuery.isLoading;
  const isRefreshing =
    summaryQuery.isFetching ||
    trendQuery.isFetching ||
    breakdownQuery.isFetching ||
    topServicesQuery.isFetching ||
    topProductsQuery.isFetching ||
    todayQuery.isFetching ||
    topStaffQuery.isFetching;

  const trendData = useMemo(() => {
    const rows = trendQuery.data?.data ?? [];
    return rows.map((row) => ({
      name: formatDate(row.date).format("DD/MM"),
      cashIn: row.cashIn,
      cashOut: row.cashOut,
    }));
  }, [trendQuery.data?.data]);

  const cashFlowSeries = [
    { dataKey: "cashIn", name: "Tiền vào", color: chartColors.green },
    { dataKey: "cashOut", name: "Tiền ra", color: chartColors.red },
  ];

  const structurePie = useMemo(() => {
    const rows = breakdownQuery.data?.data?.byItemType ?? [];
    return rows.map((row) => ({ name: row.label, value: row.amount }));
  }, [breakdownQuery.data?.data?.byItemType]);

  const structureBar = useMemo(() => {
    return structurePie.map((row) => ({ name: row.name, value: row.value }));
  }, [structurePie]);

  const topServices = topServicesQuery.data?.data ?? [];
  const topProducts = topProductsQuery.data?.data ?? [];
  const activeTopItems = topGroup === "service" ? topServices : topProducts;
  const topLoading =
    topGroup === "service" ? topServicesQuery.isLoading : topProductsQuery.isLoading;

  const topBarData = useMemo(() => {
    return activeTopItems.map((row: TopRevenueItemDto) => ({
      name: row.itemName.length > 16 ? row.itemName.slice(0, 16) + "…" : row.itemName,
      value: row.revenue,
    }));
  }, [activeTopItems]);

  const topStaff = topStaffQuery.data?.data ?? [];

  const staffBarData = useMemo(() => {
    return topStaff.map((s: TopStaffDto) => ({
      name: s.staffName.length > 12 ? s.staffName.slice(0, 12) + "…" : s.staffName,
      value: s.revenue,
    }));
  }, [topStaff]);

  const appointmentRate = today?.appointments.completionRate ?? 0;

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["revenue"] });
  }

  function handleExportBySalon() {
    exportBySalonMutation.mutate({ from, to });
  }

  function handleExportBranch() {
    if (branchSalonId == null || branchSalonId <= 0) {
      toast.error("Vui lòng chọn chi nhánh để xuất báo cáo.");
      return;
    }
    exportBranchMutation.mutate({ from, to, salonId: branchSalonId });
  }

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded border border-kit bg-kit-white p-2.5 shadow-kit-card">
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            variant="outline-secondary"
            size="sm"
            className="mb-0! mr-0!"
            label={
              PRESET_OPTIONS.find((p) => p.key === preset)?.label ?? "Kỳ báo cáo"
            }
            items={PRESET_OPTIONS.map((p) => ({
              type: "item" as const,
              label: p.label,
              onClick: () => setPreset(p.key),
            }))}
          />

          {preset === "day" ? (
            <Input
              type="date"
              inputSize="sm"
              className="h-8 w-auto cursor-pointer font-semibold"
              value={selectedDay}
              onChange={(e: { target: { value: string } }) =>
                setSelectedDay(e.target.value)
              }
            />
          ) : null}

          {preset === "month" ? (
            <Input
              type="month"
              inputSize="sm"
              className="h-8 w-auto cursor-pointer font-semibold"
              value={selectedMonth}
              onChange={(e: { target: { value: string } }) =>
                setSelectedMonth(e.target.value)
              }
            />
          ) : null}

          {preset === "year" ? (
            <Dropdown
              variant="outline-secondary"
              size="sm"
              className="mb-0! mr-0!"
              label={String(selectedYear)}
              items={YEAR_OPTIONS.map((y: number) => ({
                type: "item" as const,
                label: String(y),
                onClick: () => setSelectedYear(y),
              }))}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            className="mb-0! mr-0! h-8 w-8 p-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Làm mới"
            aria-label="Làm mới"
          >
            <RefreshCw
              className={"h-3.5 w-3.5 " + (isRefreshing ? "animate-spin" : "")}
            />
          </Button>

          {isAdmin ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mb-0! mr-0!"
              onClick={handleExportBySalon}
              disabled={exportBySalonMutation.isPending}
              loading={exportBySalonMutation.isPending}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Xuất Excel
            </Button>
          ) : null}

          {canExportBranch ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mb-0! mr-0!"
              onClick={handleExportBranch}
              disabled={exportBranchMutation.isPending}
              loading={exportBranchMutation.isPending}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Báo cáo chi nhánh
            </Button>
          ) : null}
        </div>
      </div>

      {/* 4 stats kỳ — tone theo BoxesPage */}
      <div className="mb-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="midnight-bloom"
          title="Doanh thu gộp"
          value={isLoading ? "…" : formatCurrency(summary?.grossRevenue ?? 0)}
          valueTone="white"
        />
        <StatCard
          tone="premium-dark"
          title="Số giao dịch"
          value={
            isLoading ? "…" : (summary?.transactionCount ?? 0).toLocaleString("vi-VN")
          }
          valueTone="warning"
        />
        <StatCard
          tone="sunny-morning"
          title="Giá trị trung bình mỗi đơn"
          value={isLoading ? "…" : formatCurrency(summary?.averageOrderValue ?? 0)}
          valueTone="dark"
        />
        <StatCard
          tone="happy-green"
          title="Dòng tiền ròng"
          value={isLoading ? "…" : formatCurrency(summary?.netCashFlow ?? 0)}
          valueTone="dark"
        />
      </div>

      {/* 4 stats hôm nay — thanh tiến độ lấy từ BE */}
      <div className="mb-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Khách hôm nay"
          description={
            today
              ? `${today.customers.newCustomers} mới · ${today.customers.returning} quay lại`
              : "Chưa có dữ liệu"
          }
          value={todayQuery.isLoading ? "…" : String(today?.customers.total ?? 0)}
          valueTone="primary"
        />
        <StatCard
          title="Lịch hẹn hôm nay"
          description={
            today ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <span>
                  {today.appointments.completed}/{today.appointments.total} hoàn thành
                </span>
                <TrendBadge value={today.appointments.changeVsYesterday} />
              </span>
            ) : (
              "Chưa có dữ liệu"
            )
          }
          value={todayQuery.isLoading ? "…" : String(today?.appointments.total ?? 0)}
          valueTone="success"
          progress={{
            value: appointmentRate,
            tone: "success",
            size: "sm",
            animated: true,
            leftLabel: "Tỷ lệ hoàn thành",
            rightLabel: `${appointmentRate}%`,
          }}
        />
        <StatCard
          title="Thu hôm nay"
          description={
            today ? `Doanh thu ròng ${formatCurrency(today.cash.netRevenue)}` : "Chưa có dữ liệu"
          }
          value={
            todayQuery.isLoading ? "…" : formatCurrency(today?.cash.grossRevenue ?? 0)
          }
          valueTone="warning"
        />
        <StatCard
          title="Chi hôm nay"
          description={
            today
              ? `Doanh thu gộp ${formatCurrency(today.cash.grossRevenue)}`
              : "Chưa có dữ liệu"
          }
          value={todayQuery.isLoading ? "…" : formatCurrency(today?.cash.cashOut ?? 0)}
          valueTone="danger"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="main-card overflow-hidden">
          <CardHeader className="justify-between gap-2">
            <div className="min-w-0 text-sm font-bold text-kit-heading/70">Dòng tiền</div>
            <TabNav
              items={[
                { id: "line", label: "Biểu đồ đường" },
                { id: "bar", label: "Biểu đồ cột" },
              ]}
              activeId={cashFlowView}
              onChange={setCashFlowView}
              variant="nav-link-header"
            />
          </CardHeader>
          <CardBody>
            <ChartEmpty loading={isLoading} empty={!isLoading && trendData.length === 0} />
            {!isLoading && trendData.length > 0 ? (
              cashFlowView === "line" ? (
                <LineChart data={trendData} series={cashFlowSeries} height={240} showLegend />
              ) : (
                <BarChart data={trendData} series={cashFlowSeries} height={240} showLegend />
              )
            ) : null}
          </CardBody>
        </Card>

        <Card className="main-card overflow-hidden">
          <CardHeader className="justify-between gap-2">
            <div className="min-w-0 text-sm font-bold text-kit-heading/70">
              Cơ cấu doanh thu
            </div>
            <TabNav
              items={[
                { id: "doughnut", label: "Biểu đồ vành" },
                { id: "pie", label: "Biểu đồ tròn" },
                { id: "bar", label: "Biểu đồ cột" },
              ]}
              activeId={structureView}
              onChange={setStructureView}
              variant="nav-link-header"
            />
          </CardHeader>
          <CardBody>
            <ChartEmpty
              loading={isLoading}
              empty={!isLoading && structurePie.length === 0}
            />
            {!isLoading && structurePie.length > 0 ? (
              structureView === "doughnut" ? (
                <DoughnutChart data={structurePie} height={240} showLegend />
              ) : structureView === "pie" ? (
                <PieChart data={structurePie} height={240} showLegend />
              ) : (
                <BarChart
                  data={structureBar}
                  dataKey="value"
                  height={240}
                  color={chartColors.primary}
                  layout="horizontal"
                />
              )
            ) : null}
          </CardBody>
        </Card>
      </div>

      {/* Top bán chạy + nhân viên */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="main-card overflow-hidden">
          <CardHeader className="flex-wrap justify-between gap-2">
            <div className="min-w-0 text-sm font-bold text-kit-heading/70">Top bán chạy</div>
            <div className="flex flex-wrap items-center gap-2">
              <TabNav
                items={[
                  { id: "service", label: "Dịch vụ" },
                  { id: "product", label: "Sản phẩm" },
                ]}
                activeId={topGroup}
                onChange={setTopGroup}
                variant="btn-outline-alternate-pill"
              />
              <TabNav
                items={[
                  { id: "bar", label: "Biểu đồ cột" },
                  { id: "table", label: "Bảng dữ liệu" },
                ]}
                activeId={topView}
                onChange={setTopView}
                variant="nav-link-header"
              />
            </div>
          </CardHeader>
          <CardBody>
            {topView === "bar" ? (
              <>
                <ChartEmpty
                  loading={topLoading}
                  empty={!topLoading && topBarData.length === 0}
                />
                {!topLoading && topBarData.length > 0 ? (
                  <BarChart
                    data={topBarData}
                    dataKey="value"
                    height={240}
                    color={
                      topGroup === "service" ? chartColors.primary : chartColors.green
                    }
                    layout="horizontal"
                  />
                ) : null}
              </>
            ) : (
              <TopItemsTable items={activeTopItems} loading={topLoading} />
            )}
          </CardBody>
        </Card>

        <Card className="main-card overflow-hidden">
          <CardHeader className="justify-between gap-2">
            <div className="min-w-0 text-sm font-bold text-kit-heading/70">Top nhân viên</div>
            <div className="flex items-center gap-2">
              <TabNav
                items={[
                  { id: "table", label: "Bảng dữ liệu" },
                  { id: "bar", label: "Biểu đồ cột" },
                ]}
                activeId={staffView}
                onChange={setStaffView}
                variant="nav-link-header"
              />
              <Link
                to="/admin/reports/revenue/by-staff"
                className="inline-flex items-center gap-1 text-xs font-semibold text-kit-primary no-underline hover:underline"
              >
                Xem chi tiết
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardBody className={staffView === "table" ? "p-0" : undefined}>
            {staffView === "bar" ? (
              <>
                <ChartEmpty
                  loading={topStaffQuery.isLoading}
                  empty={!topStaffQuery.isLoading && staffBarData.length === 0}
                />
                {!topStaffQuery.isLoading && staffBarData.length > 0 ? (
                  <BarChart
                    data={staffBarData}
                    dataKey="value"
                    height={240}
                    color={chartColors.blue}
                    layout="horizontal"
                  />
                ) : null}
              </>
            ) : (
              <div className="overflow-x-auto">
                <Table borderless striped hover size="sm">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="text-center">#</TableHeaderCell>
                      <TableHeaderCell>Nhân viên</TableHeaderCell>
                      <TableHeaderCell className="text-right">Doanh thu</TableHeaderCell>
                      <TableHeaderCell className="text-center">Số lượt</TableHeaderCell>
                      <TableHeaderCell className="text-center">Tăng trưởng</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topStaff.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-kit-muted">
                          {topStaffQuery.isLoading ? "Đang tải..." : "Chưa có dữ liệu"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      topStaff.map((staff: TopStaffDto, index: number) => (
                        <TableRow key={staff.staffId}>
                          <TableCell className="text-center text-kit-muted">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <WidgetContentWrapper>
                              <WidgetContentLeft className="mr-2 shrink-0">
                                <StaffInitial name={staff.staffName} />
                              </WidgetContentLeft>
                              <WidgetContentLeft>
                                <WidgetHeading>{staff.staffName}</WidgetHeading>
                                <WidgetSubheading>
                                  Hoa hồng {formatCurrency(staff.commission)}
                                </WidgetSubheading>
                              </WidgetContentLeft>
                            </WidgetContentWrapper>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-kit-heading">
                            {formatCurrency(staff.revenue)}
                          </TableCell>
                          <TableCell className="text-center">
                            {staff.quantity.toLocaleString("vi-VN")}
                          </TableCell>
                          <TableCell className="text-center">
                            <TrendBadge value={staff.growthPercent} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
