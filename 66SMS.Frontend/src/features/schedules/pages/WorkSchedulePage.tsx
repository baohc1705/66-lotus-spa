import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  Briefcase,
  User,
  Copy,
} from "lucide-react";
import { formatDate } from "@/shared/utils/date.utils";

import { useShifts } from "@/features/shifts/hooks/useShifts";
import { useWorkSchedules } from "../hooks/useSchedules";
import { ScheduleTable } from "../components/ScheduleTable";
import { Button } from "@/shared/components/ui/button";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import { RepeatScheduleDialog } from "../components/RepeatScheduleDialog";
import { useAuthStore } from "@/features/auth/stores/authStore";

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

  // Sync state if user info loads asynchronously
  useEffect(() => {
    if (!isAdminOrManager) {
      setViewMode("single");
      if (currentStaffId) {
        setSelectedStaffId(currentStaffId);
      }
    }
  }, [isAdminOrManager, currentStaffId]);

  // Debounce for search query to avoid spamming the database
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

  const handlePrevWeek = () =>
    setCurrentDate((prev) => prev.subtract(1, "week"));

  const handleNextWeek = () => setCurrentDate((prev) => prev.add(1, "week"));

  const handleThisWeek = () => setCurrentDate(formatDate().startOf("isoWeek"));

  const weekLabel = `Tuần ${currentDate.isoWeek()} (${currentDate.format(
    "DD/MM/YYYY",
  )} - ${currentDate.endOf("isoWeek").format("DD/MM/YYYY")})`;

  const isPageLoading =
    isLoadingShifts || isLoadingSchedules || isLoadingStaffs;

  const staffList = staffsData?.data?.items || [];

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-admin border border-stone-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full xl:w-auto">
          {isAdminOrManager && (
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-lotus-stone"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nhân viên..."
                className="pl-9 pr-4 py-2 bg-white border border-stone-200/50 rounded-lg text-lotus-admin-lg focus:outline-none focus:ring-1 focus:ring-lotus-leaf w-full transition-shadow placeholder:text-stone-400"
              />
            </div>
          )}

          {isAdminOrManager && (
            <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200/50 h-9">
              <button
                onClick={() => setViewMode("shift")}
                className={`flex items-center gap-1.5 px-3 rounded-md text-lotus-admin-lg font-semibold transition-colors ${
                  viewMode === "shift"
                    ? "bg-white text-lotus-leaf shadow-sm"
                    : "text-lotus-stone hover:text-lotus-deep"
                }`}
              >
                <Briefcase size={14} />
                <span>Xem theo ca</span>
              </button>
              <button
                onClick={() => setViewMode("staff")}
                className={`flex items-center gap-1.5 px-3 rounded-md text-lotus-admin-lg font-semibold transition-colors ${
                  viewMode === "staff"
                    ? "bg-white text-lotus-leaf shadow-sm"
                    : "text-lotus-stone hover:text-lotus-deep"
                }`}
              >
                <Users size={14} />
                <span>Xem theo nhân viên</span>
              </button>
              <button
                onClick={() => setViewMode("single")}
                className={`flex items-center gap-1.5 px-3 rounded-md text-lotus-admin-lg font-semibold transition-colors ${
                  viewMode === "single"
                    ? "bg-white text-lotus-leaf shadow-sm"
                    : "text-lotus-stone hover:text-lotus-deep"
                }`}
              >
                <User size={14} />
                <span>Xem cá nhân</span>
              </button>
            </div>
          )}

          {isAdminOrManager && viewMode === "single" && (
            <select
              value={selectedStaffId || ""}
              onChange={(e) =>
                setSelectedStaffId(Number(e.target.value) || null)
              }
              className="px-3 py-1.5 border border-stone-200/50 rounded-lg bg-white text-lotus-admin-lg font-semibold h-9 focus:outline-none focus:ring-1 focus:ring-lotus-leaf text-lotus-deep"
            >
              <option value="">-- Chọn nhân viên --</option>
              {staffList.map((emp) => (
                <option key={emp.id} value={emp.id ?? ""}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          <div className="flex items-center bg-white border border-stone-200/50 rounded-lg overflow-hidden h-9">
            <button
              onClick={handlePrevWeek}
              className="px-3 h-full hover:bg-stone-50 flex items-center justify-center text-lotus-stone transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="px-4 text-lotus-admin-lg font-semibold text-lotus-deep select-none min-w-[170px] text-center border-x border-stone-100">
              {weekLabel}
            </div>

            <button
              onClick={handleNextWeek}
              className="px-3 h-full hover:bg-stone-50 flex items-center justify-center text-lotus-stone transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <Button
            onClick={handleThisWeek}
            variant="outline"
            className="text-lotus-admin-lg h-9"
          >
            Tuần này
          </Button>

          {isAdminOrManager && (
            <Button
              onClick={() => setIsRepeatDialogOpen(true)}
              variant="outline"
              className="text-lotus-admin-lg h-9 gap-1.5"
              disabled={!schedulesData?.data?.items?.length}
              title={
                !schedulesData?.data?.items?.length
                  ? "Chưa có lịch trong tuần này để lặp"
                  : "Lặp lại lịch tuần này sang các tuần sau"
              }
            >
              <Copy size={14} />
              Lặp lịch
            </Button>
          )}
        </div>
      </div>

      {isRepeatDialogOpen && (
        <RepeatScheduleDialog
          currentWeekStart={currentDate}
          currentWeekSchedules={schedulesData?.data?.items || []}
          onClose={() => setIsRepeatDialogOpen(false)}
        />
      )}

      {/* Content */}
      {isPageLoading ? (
        <div className="flex items-center justify-center py-20 backdrop-blur-md rounded-admin border border-stone-200/30 p-4 min-h-[500px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-stone-200 border-t-lotus-leaf" />
            <p className="text-sm text-lotus-stone">
              Đang tải lịch làm việc...
            </p>
          </div>
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
    </div>
  );
}
