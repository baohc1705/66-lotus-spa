import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/shared/utils/date.utils";

import { useShifts } from "@/features/shifts/hooks/useShifts";
import { useWorkSchedules } from "../hooks/useSchedules";
import { ScheduleTable } from "../components/ScheduleTable";
import { Button } from "@/shared/components/ui/button";

export function WorkSchedulePage() {
  const [currentDate, setCurrentDate] = useState(formatDate().startOf("isoWeek"));

  const startDateStr = currentDate.format("YYYY-MM-DD");
  const endDateStr = currentDate.endOf("isoWeek").format("YYYY-MM-DD");

  const scheduleQueryParams = useMemo(() => {
    return {
      startDate: startDateStr,
      endDate: endDateStr,
      pageIndex: 1,
      pageSize: 1000,
    };
  }, [startDateStr, endDateStr]);

  const { data: shiftsData, isLoading: isLoadingShifts } = useShifts({
    pageIndex: 1,
    pageSize: 100,
  });

  const { data: schedulesData, isLoading: isLoadingSchedules } =
    useWorkSchedules(scheduleQueryParams);

  const handlePrevWeek = () =>
    setCurrentDate((prev) => prev.subtract(1, "week"));

  const handleNextWeek = () => setCurrentDate((prev) => prev.add(1, "week"));

  const handleThisWeek = () => setCurrentDate(formatDate().startOf("isoWeek"));

  const weekLabel = `Tuần ${currentDate.isoWeek()} (${currentDate.format(
    "DD/MM/YYYY"
  )} - ${currentDate.endOf("isoWeek").format("DD/MM/YYYY")})`;

  const isPageLoading = isLoadingShifts || isLoadingSchedules;

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-admin border border-stone-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="text-xl font-bold text-lotus-deep whitespace-nowrap font-playfair">
            Phân công ca làm việc
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-stone-200/50 rounded-lg overflow-hidden h-9">
            <button
              onClick={handlePrevWeek}
              className="px-3 h-full hover:bg-stone-50 flex items-center justify-center text-lotus-stone transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="px-4 text-[13px] font-semibold text-lotus-deep select-none min-w-[170px] text-center border-x border-stone-100">
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
            className="text-[13px] h-9"
          >
            Tuần này
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 p-4 min-h-[500px]">
        {isPageLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 animate-spin rounded-full border-4 border-stone-200 border-t-lotus-sage" />
              <p className="text-sm text-lotus-stone">
                Đang tải lịch làm việc...
              </p>
            </div>
          </div>
        ) : (
          <ScheduleTable
            shifts={shiftsData?.data?.items || []}
            workSchedules={schedulesData?.data?.items || []}
            weekStart={currentDate}
            canEdit={true}
          />
        )}
      </div>
    </div>
  );
}
