import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { CashierBooking, StaffColumn } from "../types";
import { Clock } from "lucide-react";

interface CashierGridProps {
  date: Date;
  columns: StaffColumn[];
  bookings: CashierBooking[];
  onBookingClick: (booking: CashierBooking) => void;
  onEmptySlotClick?: (staffId: number, time: string) => void;
  onBookingMove?: (
    bookingId: string,
    newStaffId: number,
    newStartTime: string,
  ) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
// Mỗi slot 15 phút cao 20px (1 giờ = 80px)
const SLOT_HEIGHT = 20;

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

export function CashierGrid({
  columns,
  bookings,
  onBookingClick,
  onEmptySlotClick,
  onBookingMove,
  date,
}: CashierGridProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeOverflow, setActiveOverflow] = useState<{
    clusterId: string;
    colId: string;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    const handleClick = () => setActiveOverflow(null);
    document.addEventListener("click", handleClick);

    return () => {
      clearInterval(timer);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const isToday = date.toDateString() === new Date().toDateString();
  const currentH = currentTime.getHours();
  const currentM = currentTime.getMinutes();
  const showCurrentTime = isToday && currentH >= 8 && currentH <= 22;
  const currentTimeY = (currentH - 8) * 80 + (currentM / 60) * 80;

  const handleDragStart = (e: React.DragEvent, bookingId: string) => {
    e.dataTransfer.setData("bookingId", bookingId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, staffId: number) => {
    e.preventDefault();

    const bookingId = e.dataTransfer.getData("bookingId");
    if (!bookingId || !onBookingMove) return;

    // Lấy vị trí thả
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Tính toán thời gian mới dựa trên vị trí Y
    // Mỗi slot là 30px = 15 phút => 1px = 0.5 phút
    const minutesFrom8 = Math.floor((y / SLOT_HEIGHT) * 15);
    const newStartMins = 8 * 60 + minutesFrom8;

    // Làm tròn thời gian thả (nếu cần) - ví dụ làm tròn thành các mốc 15 phút
    const roundedMins = Math.round(newStartMins / 15) * 15;

    const hours = Math.floor(roundedMins / 60);
    const mins = roundedMins % 60;
    const newStartTime = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

    onBookingMove(bookingId, staffId, newStartTime);
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 w-full overflow-auto scrollbar-thin bg-white relative font-sans">
      <div className="flex min-w-max">
        {/* Time Column (Y-Axis) - Sticky Left */}
        <div className="w-16 flex-shrink-0 border-r border-stone-300/80 bg-[#FDF5F7] sticky left-0 z-30">
          <div className="h-11 border-b border-stone-300/80 sticky top-0 left-0 bg-[#FBE5EB] z-50"></div>
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[80px] relative">
                <span className="absolute top-1 right-2 text-[10px] font-bold text-lotus-stone/85">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}

            {showCurrentTime && (
              <div
                className="absolute left-0.5 right-0.5 z-30 flex items-center justify-center pointer-events-none"
                style={{ top: `${currentTimeY}px` }}
              >
                <div className="bg-rose-600 text-white text-[9px] px-1 rounded-[2px] shadow-sm font-bold -translate-y-1/2 border border-rose-600">
                  {currentH.toString().padStart(2, "0")}:
                  {currentM.toString().padStart(2, "0")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid Columns (X-Axis) */}
        <div className="flex-1 flex relative">
          {showCurrentTime && (
            <div
              className="absolute left-0 right-0 border-b border-rose-500/60 border-dashed z-20 pointer-events-none flex items-center"
              style={{ top: `${currentTimeY + 44}px` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute -left-0.5"></div>
            </div>
          )}

          {columns.map((col) => {
            const colBookings = bookings.filter((b) => b.staffId.toString() === col.id.toString());

            return (
              <div
                key={col.id}
                className="flex-1 min-w-[150px] border-r border-stone-300/60 border-dashed"
              >
                {/* Column Header */}
                <div className="h-11 bg-[#FDF5F7] border-b border-stone-300/80 sticky top-0 z-40 flex items-center justify-center gap-2.5 px-4">
                  {col.avatar ? (
                    <img
                      src={col.avatar}
                      alt={col.name}
                      className="w-5 h-5 rounded-[2px]"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-[2px] bg-lotus-gold/10 flex items-center justify-center text-lotus-gold font-bold text-[9px]">
                      {col.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-bold text-xs text-lotus-deep truncate text-center">
                    {col.name}
                  </span>
                </div>

                {/* Column Cells */}
                <div
                  className="relative bg-white border-stone-300/60"
                  style={{ height: `${HOURS.length * 80}px` }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, Number(col.id))}
                >
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="h-[80px] w-full flex flex-col border-b border-stone-300/60"
                      >
                        {[0, 15, 30, 45].map((min) => (
                          <div
                            key={min}
                            className="flex-1 border-b border-stone-300/30 border-dashed last:border-0 relative group pointer-events-auto cursor-crosshair hover:bg-lotus-primary/5 transition-colors"
                            onClick={() =>
                              onEmptySlotClick?.(
                                Number(col.id),
                                `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
                              )
                            }
                          >
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-lotus-deep text-white text-[9px] px-1 rounded-[2px] z-20 font-medium shadow-sm transition-opacity">
                              {hour.toString().padStart(2, "0")}:
                              {min.toString().padStart(2, "0")}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {getClusters(colBookings).map((cluster) => {
                    const MAX_COLS = 5;
                    const hasOverflow = cluster.totalCols > MAX_COLS;
                    const renderTotalCols = hasOverflow
                      ? MAX_COLS + 0.5
                      : cluster.totalCols;
                    const widthPercent = 100 / renderTotalCols;

                    const visibleBookings = cluster.bookings.filter(
                      (b) => b.colIndex < MAX_COLS,
                    );
                    const hiddenBookings = cluster.bookings.filter(
                      (b) => b.colIndex >= MAX_COLS,
                    );

                    return (
                      <div key={cluster.id}>
                        {visibleBookings.map((booking) => {
                          const startOffset =
                            (booking.startMins - 8 * 60) * (80 / 60);
                          const height =
                            (booking.endMins - booking.startMins) * (80 / 60);
                          const leftPercent = booking.colIndex * widthPercent;
                          const left = `calc(${leftPercent}% + 2px)`;
                          const width = `calc(${widthPercent}% - 4px)`;

                          let statusColor =
                            "bg-stone-50 border-stone-200 text-stone-700";
                          let statusBadge = "bg-stone-400";

                          switch (booking.status) {
                            case "in-progress":
                              statusColor = "bg-sky-50 border-sky-200 text-sky-700";
                              statusBadge = "bg-status-in-progress";
                              break;
                            case "not-arrived":
                              statusColor = "bg-red-50 border-red-200 text-red-700";
                              statusBadge = "bg-status-cancelled";
                              break;
                            case "waiting":
                              statusColor = "bg-yellow-50 border-yellow-200 text-yellow-700";
                              statusBadge = "bg-status-waiting";
                              break;
                            case "pending":
                              statusColor = "bg-amber-50 border-amber-200 text-amber-700";
                              statusBadge = "bg-status-pending";
                              break;
                            case "confirmed":
                              statusColor = "bg-blue-50 border-blue-200 text-blue-700";
                              statusBadge = "bg-status-confirmed";
                              break;
                            case "unpaid":
                              statusColor = "bg-rose-50 border-rose-200 text-rose-700";
                              statusBadge = "bg-lotus-rose animate-pulse";
                              break;
                            case "paid":
                            case "completed":
                              statusColor = "bg-emerald-50 border-emerald-200 text-emerald-700";
                              statusBadge = "bg-status-completed";
                              break;
                            case "cancelled":
                              statusColor = "bg-slate-50 border-slate-200 text-slate-700";
                              statusBadge = "bg-status-cancelled";
                              break;
                          }

                          return (
                            <div
                              key={booking.id}
                              onClick={() => onBookingClick(booking)}
                              draggable={true}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleDragStart(e, booking.id);
                              }}
                              className={cn(
                                "absolute rounded-[3px] border px-1.5 py-0.5 cursor-grab active:cursor-grabbing transition-all hover:shadow overflow-hidden group z-10",
                                statusColor,
                              )}
                              style={{
                                top: `${startOffset}px`,
                                height: `${height}px`,
                                left,
                                width,
                              }}
                            >
                              <div className="flex items-center justify-between gap-1 leading-none">
                                <div className="font-bold text-[10px] truncate whitespace-nowrap text-lotus-deep">
                                  {booking.customerName}
                                </div>
                                <div
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    statusBadge,
                                  )}
                                ></div>
                              </div>
                              <div className="text-[9px] opacity-90 truncate whitespace-nowrap mt-0.5">
                                {booking.serviceName}
                              </div>
                              <div className="text-[9px] opacity-75 mt-0.5 flex items-center gap-0.5 truncate whitespace-nowrap">
                                <Clock className="w-2 h-2 flex-shrink-0" />
                                {booking.startTime} - {booking.endTime}
                              </div>
                            </div>
                          );
                        })}

                        {hasOverflow && (
                          <div
                            className="absolute bg-lotus-cream/40 hover:bg-lotus-cream cursor-pointer rounded-[3px] border border-stone-200 flex items-center justify-center text-[10px] font-bold text-lotus-deep z-10 transition-colors shadow-sm"
                            style={{
                              top: `${(cluster.startMins - 8 * 60) * (80 / 60)}px`,
                              height: `${(cluster.endMins - cluster.startMins) * (80 / 60)}px`,
                              left: `calc(${MAX_COLS * widthPercent}% + 2px)`,
                              width: `calc(${0.5 * widthPercent}% - 4px)`,
                              minWidth: "16px",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveOverflow((prev) =>
                                prev?.clusterId === cluster.id &&
                                prev?.colId === col.id
                                  ? null
                                  : { clusterId: cluster.id, colId: col.id },
                              );
                            }}
                          >
                            +{hiddenBookings.length}
                            {activeOverflow?.clusterId === cluster.id &&
                              activeOverflow?.colId === col.id && (
                                <div
                                  className="absolute top-0 right-full mr-1.5 bg-white rounded-[3px] shadow border border-stone-200 p-2 w-56 z-[60] flex flex-col gap-1.5 cursor-default animate-in fade-in zoom-in-95 duration-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex justify-between items-center border-b border-stone-100 pb-1.5 mb-0.5">
                                    <span className="font-bold text-xs text-lotus-deep">
                                      Lịch bị ẩn ({hiddenBookings.length})
                                    </span>
                                    <button
                                      onClick={() => setActiveOverflow(null)}
                                      className="text-lotus-stone hover:text-lotus-deep rounded-[2px] hover:bg-lotus-cream/50 p-0.5 transition-colors"
                                    >
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="max-h-[240px] overflow-auto flex flex-col gap-1.5 scrollbar-thin">
                                    {hiddenBookings.map((b) => (
                                      <div
                                        key={b.id}
                                        onClick={() => {
                                          onBookingClick(b);
                                          setActiveOverflow(null);
                                        }}
                                        className="bg-lotus-cream/10 border border-stone-200/60 rounded-[2px] p-1.5 cursor-pointer hover:bg-lotus-cream/20 hover:border-stone-300 transition-all text-left"
                                      >
                                        <div className="font-bold text-[10px] text-lotus-deep truncate whitespace-nowrap">
                                          {b.customerName}
                                        </div>
                                        <div className="text-[9px] text-lotus-deep/75 mt-0.5 truncate whitespace-nowrap">
                                          {b.serviceName}
                                        </div>
                                        <div className="text-[9px] text-lotus-stone mt-1 flex items-center gap-0.5 font-semibold truncate whitespace-nowrap">
                                          <Clock className="w-2 h-2" />
                                          {b.startTime} - {b.endTime}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
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
