import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaffScheduleBooking, StaffScheduleDayDto } from "../types";

interface StaffWeekGridProps {
  days: StaffScheduleDayDto[];
  highlightDate?: Date;
  onBookingClick: (booking: StaffScheduleBooking, date: string) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function statusStyles(status: string) {
  switch (status) {
    case "in-progress":
      return "bg-state-info-bg/80 border-state-info-border text-state-info-text font-medium";
    case "not-arrived":
      return "bg-state-danger-bg/80 border-state-danger-border text-state-danger-text font-medium";
    case "waiting":
      return "bg-state-warning-bg border-state-warning-border text-state-warning-text font-medium";
    case "completed":
    case "paid":
      return "bg-state-success-bg border-state-success-border text-state-success-text font-medium";
    case "unpaid":
      return "bg-state-danger-bg border-state-danger-border text-state-danger-text font-medium";
    case "cancelled":
      return "bg-adminGray-50/80 border-adminGray-100 text-adminGray-600 font-medium";
    case "confirmed":
      return "bg-state-info-bg/80 border-state-info-border text-state-info-text font-medium";
    case "pending":
    default:
      return "bg-state-warning-bg/80 border-state-warning-border text-state-warning-text font-medium";
  }
}

function statusDot(status: string) {
  switch (status) {
    case "in-progress":
      return "bg-status-in-progress";
    case "not-arrived":
      return "bg-status-cancelled";
    case "waiting":
      return "bg-status-waiting";
    case "completed":
    case "paid":
      return "bg-status-completed";
    case "unpaid":
      return "bg-adminGreen-600";
    case "cancelled":
      return "bg-status-cancelled";
    case "confirmed":
      return "bg-status-confirmed";
    default:
      return "bg-status-pending";
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

export function StaffWeekGrid({
  days,
  highlightDate,
  onBookingClick,
}: StaffWeekGridProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentH = currentTime.getHours();
  const currentM = currentTime.getMinutes();
  const showCurrentTime = currentH >= 8 && currentH <= 22;
  const currentTimeY = (currentH - 8) * 120 + (currentM / 60) * 120;

  return (
    <div className="flex-1 overflow-auto scrollbar-thin bg-white border border-adminGray-100/50 rounded-admin">
      <div className="flex min-w-max">
        <div className="w-16 flex-shrink-0 border-r border-adminGray-100/50 bg-adminGray-50/50 sticky left-0 z-20">
          <div className="h-14 border-b border-adminGray-100/50 sticky top-0 bg-adminGray-50/50 z-30" />
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[120px] relative">
                <span className="absolute -top-2.5 right-2 text-2xs font-semibold text-adminGray-600/80">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex relative">
          {showCurrentTime && days.some((d) => d.date === todayStr) && (
            <div
              className="absolute left-0 right-0 border-b border-adminGreen-500 border-dashed z-20 pointer-events-none"
              style={{ top: `${currentTimeY + 56}px` }}
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

            return (
              <div
                key={day.date}
                className={cn(
                  "flex-1 min-w-[140px] border-r border-adminGray-100/50 border-dashed",
                  (header.isToday || isHighlighted) && "bg-primary/5",
                )}
              >
                <div
                  className={cn(
                    "h-14 border-b border-adminGray-100/50 sticky top-0 z-10 flex flex-col items-center justify-center px-1",
                    header.isToday ? "bg-adminGray-50" : "bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "text-2xs font-bold uppercase",
                      header.isToday ? "text-primary" : "text-adminGray-600",
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
                </div>

                <div
                  className="relative bg-white"
                  style={{ height: `${HOURS.length * 120}px` }}
                >
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="h-[120px] w-full flex flex-col border-b border-adminGray-100"
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

                  {day.bookings.map((booking) => {
                    const startMins = timeToMins(booking.startTime);
                    const endMins = timeToMins(booking.endTime);
                    const startOffset = (startMins - 8 * 60) * 2;
                    const height = (endMins - startMins) * 2;

                    return (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => onBookingClick(booking, day.date)}
                        className={cn(
                          "absolute left-1 right-1 rounded-lotus-admin-sm border p-1.5 text-left transition-all hover:shadow-md overflow-hidden z-10",
                          statusStyles(booking.status),
                        )}
                        style={{
                          top: `${startOffset}px`,
                          height: `${Math.max(height, 40)}px`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-semibold text-xs truncate">
                            {booking.customerName}
                          </div>
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full shrink-0 mt-0.5",
                              statusDot(booking.status),
                            )}
                          />
                        </div>
                        <div className="text-2xs opacity-90 truncate">
                          {booking.serviceName}
                        </div>
                        <div className="text-2xs opacity-75 mt-0.5 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {booking.startTime}–{booking.endTime}
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
