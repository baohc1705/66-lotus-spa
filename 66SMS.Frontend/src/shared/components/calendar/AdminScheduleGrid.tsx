import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/shared/utils/date.utils";

export interface AdminScheduleEvent {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  startTime: string;
  endTime: string;
  footerRight?: string;
  status?: string | number;
}

export interface AdminScheduleDay {
  date: string;
}

interface AdminScheduleGridProps {
  days: AdminScheduleDay[];
  events: AdminScheduleEvent[];
  highlightDate?: Date;
  columnTitle?: string;
  onEventClick: (event: AdminScheduleEvent, date: string) => void;
  showCurrentTime?: boolean;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);
const HOUR_HEIGHT = 120;
const HEADER_HEIGHT = 56;

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function statusStyles(status?: string | number) {
  switch (status) {
    case "in-progress":
    case 4:
      return "bg-state-info-bg/80 border-state-info-border text-state-info-text font-medium";
    case "not-arrived":
    case 9:
      return "bg-state-danger-bg/80 border-state-danger-border text-state-danger-text font-medium";
    case "waiting":
    case 3:
      return "bg-state-warning-bg border-state-warning-border text-state-warning-text font-medium";
    case "completed":
    case "paid":
    case 5:
      return "bg-state-success-bg border-state-success-border text-state-success-text font-medium";
    case "unpaid":
      return "bg-state-danger-bg border-state-danger-border text-state-danger-text font-medium";
    case "cancelled":
    case 6:
      return "bg-adminGray-50/80 border-adminGray-100 text-adminGray-600 font-medium";
    case "confirmed":
    case 2:
      return "bg-state-info-bg/80 border-state-info-border text-state-info-text font-medium";
    case "pending":
    case 1:
    default:
      return "bg-state-success-bg border-state-success-border text-state-success-text font-medium";
  }
}

function statusDot(status?: string | number) {
  switch (status) {
    case "in-progress":
    case 4:
      return "bg-status-in-progress";
    case "not-arrived":
    case 9:
      return "bg-status-cancelled";
    case "waiting":
    case 3:
      return "bg-status-waiting";
    case "completed":
    case "paid":
    case 5:
      return "bg-status-completed";
    case "unpaid":
      return "bg-adminGreen-600";
    case "cancelled":
    case 6:
      return "bg-status-cancelled";
    case "confirmed":
    case 2:
      return "bg-status-confirmed";
    case "pending":
    case 1:
    default:
      return "bg-status-completed";
  }
}

function formatDayHeader(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: d.toLocaleDateString("vi-VN", { weekday: "short" }),
    label: d.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
    isToday: d.toDateString() === new Date().toDateString(),
  };
}

export function AdminScheduleGrid({
  days,
  events,
  highlightDate,
  columnTitle,
  onEventClick,
  showCurrentTime = true,
}: AdminScheduleGridProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const singleColumn = days.length === 1;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = formatDate().format("YYYY-MM-DD");
  const currentH = currentTime.getHours();
  const currentM = currentTime.getMinutes();
  const canShowNow =
    showCurrentTime && currentH >= 8 && currentH <= 22;
  const currentTimeY =
    (currentH - 8) * HOUR_HEIGHT + (currentM / 60) * HOUR_HEIGHT;

  return (
    <div className="h-full flex-1 overflow-auto scrollbar-thin bg-white border border-adminGray-100/50 rounded-admin">
      <div className="flex min-w-max h-full">
        {/* Cột giờ — label dùng top-1 để không bị cắt 08:00 */}
        <div className="w-16 flex-shrink-0 border-r border-adminGray-100/50 bg-adminGray-50/50 sticky left-0 z-20">
          <div
            className="border-b border-adminGray-100/50 sticky top-0 bg-adminGray-50/50 z-30"
            style={{ height: HEADER_HEIGHT }}
          />
          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute top-1 right-2 text-2xs font-semibold text-adminGray-600/80">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex relative">
          {canShowNow && days.some((d) => d.date === todayStr) && (
            <div
              className="absolute left-0 right-0 border-b border-adminGreen-500 border-dashed z-20 pointer-events-none"
              style={{ top: `${currentTimeY + HEADER_HEIGHT}px` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-adminGreen-500 absolute -left-0.5" />
            </div>
          )}

          {days.map((day) => {
            const header = formatDayHeader(day.date);
            const isHighlighted =
              highlightDate &&
              day.date ===
                `${highlightDate.getFullYear()}-${String(highlightDate.getMonth() + 1).padStart(2, "0")}-${String(highlightDate.getDate()).padStart(2, "0")}`;
            const dayEvents = events.filter((e) => e.date === day.date);

            return (
              <div
                key={day.date}
                className={cn(
                  "flex-1 border-r border-adminGray-100/50 border-dashed",
                  singleColumn ? "min-w-[220px]" : "min-w-[140px]",
                  (header.isToday || isHighlighted) && "bg-primary/5",
                )}
              >
                <div
                  className={cn(
                    "border-b border-adminGray-100/50 sticky top-0 z-10 flex flex-col items-center justify-center px-1",
                    header.isToday ? "bg-adminGray-50" : "bg-white",
                  )}
                  style={{ height: HEADER_HEIGHT }}
                >
                  {singleColumn && columnTitle ? (
                    <span className="text-xs font-semibold text-adminInk truncate max-w-full px-2">
                      {columnTitle}
                    </span>
                  ) : (
                    <>
                      <span
                        className={cn(
                          "text-2xs font-bold uppercase",
                          header.isToday
                            ? "text-primary"
                            : "text-adminGray-600",
                        )}
                      >
                        {header.weekday}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          header.isToday ? "text-primary" : "text-adminInk",
                        )}
                      >
                        {header.label}
                      </span>
                    </>
                  )}
                </div>

                <div
                  className="relative bg-white"
                  style={{ height: HOURS.length * HOUR_HEIGHT }}
                >
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="w-full flex flex-col border-b border-adminGray-100"
                        style={{ height: HOUR_HEIGHT }}
                      >
                        {[0, 15, 30, 45].map((min) => (
                          <div
                            key={min}
                            className="flex-1 border-b border-adminGray-100/50 border-dashed last:border-0"
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {dayEvents.map((event) => {
                    const startMins = timeToMins(event.startTime);
                    const endMins = timeToMins(event.endTime);
                    if (
                      Number.isNaN(startMins) ||
                      Number.isNaN(endMins) ||
                      endMins <= startMins
                    ) {
                      return null;
                    }

                    const top = ((startMins - 8 * 60) / 60) * HOUR_HEIGHT;
                    const height = Math.max(
                      ((endMins - startMins) / 60) * HOUR_HEIGHT,
                      40,
                    );

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onEventClick(event, day.date)}
                        className={cn(
                          "absolute left-1 right-1 rounded-lotus-admin-sm border p-1.5 text-left transition-all hover:shadow-md overflow-hidden z-10",
                          statusStyles(event.status),
                        )}
                        style={{ top, height }}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-semibold text-xs truncate">
                            {event.title}
                          </div>
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full shrink-0 mt-0.5",
                              statusDot(event.status),
                            )}
                          />
                        </div>
                        {event.subtitle ? (
                          <div className="text-2xs opacity-90 truncate">
                            {event.subtitle}
                          </div>
                        ) : null}
                        <div className="text-2xs opacity-75 mt-0.5 flex items-center justify-between gap-0.5">
                          <span className="flex items-center gap-0.5 min-w-0 truncate">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            {event.startTime}–{event.endTime}
                          </span>
                          {event.footerRight ? (
                            <span className="font-bold shrink-0">
                              {event.footerRight}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
