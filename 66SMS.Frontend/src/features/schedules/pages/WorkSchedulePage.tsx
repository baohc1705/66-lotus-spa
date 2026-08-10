import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, Copy } from "lucide-react";

import { TabNav } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody } from "@/shared/elements/Card";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { formatDate } from "@/shared/utils/date.utils";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useShifts } from "@/features/shifts/hooks/useShifts";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";

import { RepeatScheduleDialog } from "../components/RepeatScheduleDialog";
import { ScheduleTable } from "../components/ScheduleTable";
import { useWorkSchedules } from "../hooks/useSchedules";

const VIEW_TABS = [
  { id: "shift", label: "Theo ca" },
  { id: "staff", label: "Theo nhân viên" },
  { id: "single", label: "Cá nhân" },
];

export function WorkSchedulePage() {
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { user, hasRole } = useAuthStore();
  const isAdminOrManager = hasRole("Admin") || hasRole("Manager");
  const currentStaffId = user?.staffInfo?.id;

  const [currentDate, setCurrentDate] = useState(
    formatDate().startOf("isoWeek"),
  );
  const [viewMode, setViewMode] = useState<"shift" | "staff" | "single">(
    isAdminOrManager ? "shift" : "single",
  );
  const [isRepeatDialogOpen, setIsRepeatDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(
    isAdminOrManager ? null : (currentStaffId ?? null),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    if (!isAdminOrManager) {
      setTimeout(() => {
        setViewMode("single");
      }, 0);
      if (currentStaffId) {
        setTimeout(() => {
          setSelectedStaffId(currentStaffId);
        }, 0);
      }
    }
  }, [isAdminOrManager, currentStaffId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const startDateStr = currentDate.format("YYYY-MM-DD");
  const endDateStr = currentDate.endOf("isoWeek").format("YYYY-MM-DD");

  const scheduleQueryParams = useMemo(() => {
    if (debouncedSearchQuery) {
      return {
        pageIndex: 1,
        pageSize: 1000,
        filter: debouncedSearchQuery,
        staffId: selectedStaffId || undefined,
        salonId: salonId || undefined,
      };
    }
    return {
      startDate: startDateStr,
      endDate: endDateStr,
      pageIndex: 1,
      pageSize: 1000,
      staffId: selectedStaffId || undefined,
      salonId: salonId || undefined,
    };
  }, [
    startDateStr,
    endDateStr,
    debouncedSearchQuery,
    selectedStaffId,
    salonId,
  ]);

  const { data: shiftsData, isLoading: isLoadingShifts } = useShifts({
    pageIndex: 1,
    pageSize: 100,
  });

  const { data: staffsData, isLoading: isLoadingStaffs } = useStaffs({
    pageIndex: 1,
    pageSize: 1000,
    filter: debouncedSearchQuery || undefined,
    salonId: salonId || undefined,
  });

  const { data: schedulesData, isLoading: isLoadingSchedules } =
    useWorkSchedules(scheduleQueryParams);

  function handlePrevWeek() {
    setCurrentDate((prev) => prev.subtract(1, "week"));
  }

  function handleNextWeek() {
    setCurrentDate((prev) => prev.add(1, "week"));
  }

  function handleThisWeek() {
    setCurrentDate(formatDate().startOf("isoWeek"));
  }

  const weekLabel = `Tuần ${currentDate.isoWeek()} (${currentDate.format(
    "DD/MM/YYYY",
  )} - ${currentDate.endOf("isoWeek").format("DD/MM/YYYY")})`;

  const isPageLoading =
    isLoadingShifts || isLoadingSchedules || isLoadingStaffs;

  const staffList = staffsData?.data?.items || [];

  const staffOptions = staffList.map((staff: StaffDto) => ({
    value: String(staff.id ?? ""),
    label: staff.fullName ?? "",
  }));

  return (
    <div className="space-y-3 font-sans text-sm text-kit-body">
      <Card className="main-card mb-0">
        <CardBody className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto">
            {isAdminOrManager ? (
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-kit-muted" />
                <Input
                  inputSize="sm"
                  className="h-8 pl-9"
                  value={searchQuery}
                  onChange={(e: { target: { value: string } }) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Tìm kiếm nhân viên..."
                />
              </div>
            ) : null}

            {isAdminOrManager ? (
              <TabNav
                items={VIEW_TABS}
                activeId={viewMode}
                onChange={(id: string) =>
                  setViewMode(id as "shift" | "staff" | "single")
                }
                variant="btn-group-primary"
                className="mb-0"
              />
            ) : null}

            {isAdminOrManager && viewMode === "single" ? (
              <Select
                value={selectedStaffId ? String(selectedStaffId) : ""}
                onChange={(e) =>
                  setSelectedStaffId(Number(e.target.value) || null)
                }
                options={staffOptions}
                placeholder="-- Chọn nhân viên --"
                className="min-w-48"
                inputSize="sm"
              />
            ) : null}
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 xl:w-auto">
            <div className="flex h-8 items-center overflow-hidden rounded border border-kit bg-kit-white">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="flex h-full items-center px-2 text-kit-muted transition-colors hover:bg-kit-page hover:text-kit-heading"
                aria-label="Tuần trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex h-full min-w-52 items-center justify-center border-x border-kit px-3 text-center text-xs font-semibold text-kit-heading">
                {weekLabel}
              </div>
              <button
                type="button"
                onClick={handleNextWeek}
                className="flex h-full items-center px-2 text-kit-muted transition-colors hover:bg-kit-page hover:text-kit-heading"
                aria-label="Tuần sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              className="mb-0! mr-0! h-8"
              onClick={handleThisWeek}
            >
              Tuần này
            </Button>

            {isAdminOrManager ? (
              <Button
                type="button"
                variant="outline-primary"
                size="sm"
                className="mb-0! mr-0! h-8"
                onClick={() => setIsRepeatDialogOpen(true)}
                disabled={!schedulesData?.data?.items?.length}
                title={
                  !schedulesData?.data?.items?.length
                    ? "Chưa có lịch trong tuần này để lặp"
                    : "Lặp lại lịch tuần này sang các tuần sau"
                }
              >
                <Copy className="h-3.5 w-3.5" />
                Lặp lịch
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>

      {isRepeatDialogOpen ? (
        <RepeatScheduleDialog
          currentWeekStart={currentDate}
          currentWeekSchedules={schedulesData?.data?.items || []}
          onClose={() => setIsRepeatDialogOpen(false)}
        />
      ) : null}

      <TablePageShell isLoading={isPageLoading} isFetching={false}>
        {isPageLoading ? (
          <div className="flex min-h-100 flex-col items-center justify-center gap-3 py-24">
            <div className="size-8 animate-spin rounded-full border-4 border-kit border-t-kit-primary" />
            <p className="text-sm font-medium text-kit-muted">
              Đang tải lịch làm việc...
            </p>
          </div>
        ) : (
          <ScheduleTable
            shifts={shiftsData?.data?.items || []}
            workSchedules={schedulesData?.data?.items || []}
            staffList={staffList}
            weekStart={currentDate}
            viewMode={viewMode}
            selectedStaffId={selectedStaffId}
            canEdit={isAdminOrManager}
          />
        )}
      </TablePageShell>
    </div>
  );
}
