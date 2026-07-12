import { useEffect, useState } from "react";
import type { CashierBooking } from "../types";

interface CashierWeeklyViewProps {
  startDate: Date;
  endDate: Date;
  bookings: CashierBooking[];
  onBookingClick: (booking: CashierBooking) => void;
  onEmptySlotClick?: () => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

interface LayoutBooking extends CashierBooking {
  startMins: number;
  endMins: number;
  colIndex: number;
  totalCols: number;
}

interface Cluster {
  id: string;
  bookings: LayoutBooking[];
  startMins: number;
  endMins: number;
  totalCols: number;
}

function getClusters(colBookings: CashierBooking[]): Cluster[] {
  if (colBookings.length === 0) return [];

  const sorted = [...colBookings]
    .map((b) => ({
      ...b,
      startMins: timeToMins(b.startTime),
      endMins: timeToMins(b.endTime),
      colIndex: 0,
      totalCols: 1,
    }))
    .sort((a, b) => {
      if (a.startMins !== b.startMins) return a.startMins - b.startMins;
      return b.endMins - a.endMins;
    });

  const clusters: Cluster[] = [];
  let currentBookings: LayoutBooking[] = [];
  let clusterEnd = 0;
  let clusterStart = 0;

  sorted.forEach((booking) => {
    if (currentBookings.length > 0 && booking.startMins >= clusterEnd) {
      clusters.push({
        id: `cluster-${clusters.length}`,
        bookings: currentBookings,
        startMins: clusterStart,
        endMins: clusterEnd,
        totalCols: 1,
      });
      currentBookings = [];
      clusterEnd = 0;
    }
    if (currentBookings.length === 0) {
      clusterStart = booking.startMins;
    }
    currentBookings.push(booking);
    clusterEnd = Math.max(clusterEnd, booking.endMins);
  });
  if (currentBookings.length > 0) {
    clusters.push({
      id: `cluster-${clusters.length}`,
      bookings: currentBookings,
      startMins: clusterStart,
      endMins: clusterEnd,
      totalCols: 1,
    });
  }

  clusters.forEach((cluster) => {
    const columns: LayoutBooking[][] = [];

    cluster.bookings.forEach((booking) => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1];
        if (lastInCol.endMins <= booking.startMins) {
          columns[i].push(booking);
          booking.colIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([booking]);
        booking.colIndex = columns.length - 1;
      }
    });

    cluster.totalCols = columns.length;
    cluster.bookings.forEach((b) => (b.totalCols = columns.length));
  });

  return clusters;
}

export function CashierWeeklyView({
  startDate,
  bookings,
  onBookingClick,
  onEmptySlotClick,
}: CashierWeeklyViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentH = currentTime.getHours();
  const currentM = currentTime.getMinutes();
  const showCurrentTime = currentH >= 8 && currentH <= 22;
  const currentTimeY = (currentH - 8) * 80 + (currentM / 60) * 80;

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getDayName = (date: Date) => {
    const days = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    return days[date.getDay()];
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 w-full overflow-auto scrollbar-thin bg-white relative font-sans">
      <div className="flex min-w-max">
        {/* Time Column (Y-Axis) */}
        <div className="w-16 flex-shrink-0 border-r border-adminGray-300/80 bg-adminGreen-600-light/20 sticky left-0 z-30">
          <div className="h-16 border-b border-adminGray-300/80 sticky top-0 left-0 bg-adminGreen-600-light/50 z-50"></div>
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[80px] relative">
                <span className="absolute top-1 right-2 text-2xs font-bold text-adminGray-600/85">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Days Columns */}
        {daysOfWeek.map((day, colIdx) => {
          const dateStr = formatDate(day);
          const colBookings = bookings.filter((b) => b.bookingDate === dateStr);
          const clusters = getClusters(colBookings);
          const isToday = day.toDateString() === new Date().toDateString();
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={colIdx}
              className="flex-1 min-w-[150px] border-r border-adminGray-100 relative"
            >
              {/* Header */}
              <div className="h-16 border-b border-adminGray-300/80 sticky top-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-0.5">
                <div
                  className={`text-xs font-medium uppercase ${
                    isToday
                      ? "text-adminGreen-600 font-bold"
                      : isWeekend
                        ? "text-adminGreen-600"
                        : "text-adminInk"
                  }`}
                >
                  {getDayName(day)}
                </div>
                <div
                  className={`text-xs font-extrabold ${
                    isToday
                      ? "text-adminGreen-600"
                      : isWeekend
                        ? "text-adminGreen-600"
                        : "text-adminInk"
                  }`}
                >
                  {`${String(day.getDate()).padStart(2, "0")}/${String(day.getMonth() + 1).padStart(2, "0")}`}
                </div>
              </div>

              {/* Grid Body */}
              <div
                className="relative cursor-pointer"
                style={{ height: HOURS.length * 80 }}
                onClick={() => onEmptySlotClick?.()}
              >
                {/* Background Grid Lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[80px] border-b border-adminGray-100/60 relative"
                  >
                    <div className="absolute top-1/4 w-full border-t border-adminGray-100/30 border-dashed" />
                    <div className="absolute top-2/4 w-full border-t border-adminGray-100/50 border-dashed" />
                    <div className="absolute top-3/4 w-full border-t border-adminGray-100/30 border-dashed" />
                  </div>
                ))}

                {/* Current Time Indicator */}
                {isToday && showCurrentTime && (
                  <div
                    className="absolute left-0 right-0 z-10 pointer-events-none"
                    style={{ top: currentTimeY }}
                  >
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-adminGreen-600 border-2 border-white shadow-sm z-10" />
                    <div className="w-full border-t-2 border-adminGreen-600/80 shadow-sm" />
                  </div>
                )}

                {/* Bookings */}
                {clusters.map((cluster) =>
                  cluster.bookings.map((booking) => {
                    const top = (booking.startMins - 8 * 60) * (80 / 60);
                    const height =
                      (booking.endMins - booking.startMins) * (80 / 60);
                    const width = `calc(${100 / booking.totalCols}% - 4px)`;
                    const left = `calc(${(100 / booking.totalCols) * booking.colIndex}% + 2px)`;

                    return (
                      <div
                        key={booking.id}
                        className={`absolute rounded-[4px] p-1.5 shadow-sm overflow-hidden text-left transition-all hover:scale-[1.02] hover:z-20 hover:shadow-md cursor-pointer font-sans border-l-2 ${getBookingColor(
                          booking.status,
                        )}`}
                        style={{
                          top: `${top}px`,
                          height: `${height - 2}px`,
                          width,
                          left,
                          zIndex: 10 + booking.colIndex,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingClick(booking);
                        }}
                      >
                        <div className="text-2xs font-bold text-black/70 mb-0.5 truncate leading-tight">
                          {booking.startTime} - {booking.endTime}
                        </div>
                        <div className="text-xs font-semibold text-black/90 truncate leading-tight">
                          {booking.customerName}
                        </div>
                        <div className="text-2xs text-black/70 truncate flex items-center gap-1 mt-0.5">
                          {booking.staffName}
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getBookingColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-state-warning-bg border-state-warning-border text-state-warning-text";
    case "confirmed":
      return "bg-state-info-bg border-state-info-border text-state-info-text";
    case "waiting":
      return "bg-state-info-bg border-state-info-border text-state-info-text";
    case "in-progress":
      return "bg-adminGold-100 border-adminGold-600 text-adminGold-700";
    case "completed":
      return "bg-state-success-bg border-state-success-border text-state-success-text";
    case "unpaid":
      return "bg-state-success-bg border-state-success-border text-state-success-text";
    case "paid":
      return "bg-state-success-bg border-state-success-border text-state-success-text";
    case "cancelled":
      return "bg-state-danger-bg border-state-danger-border text-state-danger-text opacity-70";
    case "not-arrived":
      return "bg-adminGray-100 border-adminGray-400 text-adminInk";
    default:
      return "bg-adminGray-100 border-adminGray-400 text-adminInk";
  }
}
