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
// Mỗi slot 15 phút cao 30px (1 giờ = 120px)
const SLOT_HEIGHT = 30;

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
  const currentTimeY = (currentH - 8) * 120 + (currentM / 60) * 120;

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
    <div className="flex-1 overflow-auto scrollbar-thin bg-white relative">
      <div className="flex min-w-max">
        {/* Time Column (Y-Axis) - Sticky Left */}
        <div className="w-16 flex-shrink-0 border-r border-lotus-gold/20 bg-lotus-cream/10 sticky left-0 z-20">
          <div className="h-14 border-b border-lotus-gold/20 sticky top-0 bg-lotus-cream/10 z-30"></div>
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[120px] relative">
                <span className="absolute -top-2.5 right-2 text-xs font-medium text-lotus-stone">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}

            {showCurrentTime && (
              <div
                className="absolute left-1 right-1 z-30 flex items-center justify-center pointer-events-none"
                style={{ top: `${currentTimeY}px` }}
              >
                <div className="bg-lotus-rose text-white text-[10px] px-1 rounded shadow-sm font-bold -translate-y-1/2 border border-lotus-rose">
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
              className="absolute left-0 right-0 border-b border-lotus-rose border-dashed z-20 pointer-events-none flex items-center"
              style={{ top: `${currentTimeY + 56}px` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-lotus-rose absolute -left-0.5"></div>
            </div>
          )}

          {columns.map((col) => {
            const colBookings = bookings.filter((b) => b.staffId.toString() === col.id.toString());

            return (
              <div
                key={col.id}
                className="flex-1 min-w-[200px] border-r border-lotus-gold/20 border-dashed"
              >
                {/* Column Header */}
                <div className="h-14 bg-white border-b border-lotus-gold/20 sticky top-0 z-10 flex flex-col items-center justify-center px-2">
                  <span className="font-semibold text-sm text-lotus-deep truncate w-full text-center">
                    {col.name}
                  </span>
                  {col.avatar ? (
                    <img
                      src={col.avatar}
                      alt={col.name}
                      className="w-5 h-5 rounded-full mt-0.5"
                    />
                  ) : (
                    <span className="text-[10px] text-lotus-stone mt-0.5">
                      KTV
                    </span>
                  )}
                </div>

                {/* Column Cells */}
                <div
                  className="relative bg-white border-lotus-gold/20"
                  style={{ height: `${HOURS.length * 120}px` }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, Number(col.id))}
                >
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="h-[120px] w-full flex flex-col border-b border-lotus-gold/20"
                      >
                        {[0, 15, 30, 45].map((min) => (
                          <div
                            key={min}
                            className="flex-1 border-b border-lotus-gold/10 border-dashed border-opacity-40 last:border-0 relative group pointer-events-auto cursor-crosshair hover:bg-lotus-leaf/5 transition-colors"
                            onClick={() =>
                              onEmptySlotClick?.(
                                Number(col.id),
                                `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
                              )
                            }
                          >
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-lotus-deep text-white text-[10px] px-1 rounded z-20 font-medium shadow-sm transition-opacity">
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
                            (booking.startMins - 8 * 60) * (120 / 60);
                          const height =
                            (booking.endMins - booking.startMins) * (120 / 60);
                          const leftPercent = booking.colIndex * widthPercent;
                          const left = `calc(${leftPercent}% + 2px)`;
                          const width = `calc(${widthPercent}% - 4px)`;

                          let statusColor =
                            "bg-gray-100 border-gray-300 text-gray-700";
                          let statusBadge = "bg-gray-400";

                          switch (booking.status) {
                            case "in-progress":
                              statusColor = "bg-sky-50 border-sky-300 text-sky-600";
                              statusBadge = "bg-status-in-progress";
                              break;
                            case "not-arrived":
                              statusColor = "bg-red-50 border-red-300 text-red-600";
                              statusBadge = "bg-status-cancelled";
                              break;
                            case "waiting":
                              statusColor = "bg-yellow-50 border-yellow-300 text-yellow-600";
                              statusBadge = "bg-status-waiting";
                              break;
                            case "pending":
                              statusColor = "bg-amber-50 border-amber-300 text-amber-600";
                              statusBadge = "bg-status-pending";
                              break;
                            case "confirmed":
                              statusColor = "bg-blue-50 border-blue-300 text-blue-600";
                              statusBadge = "bg-status-confirmed";
                              break;
                            case "unpaid":
                              statusColor = "bg-rose-50 border-rose-300 text-rose-600";
                              statusBadge = "bg-lotus-rose animate-pulse";
                              break;
                            case "paid":
                            case "completed":
                              statusColor = "bg-emerald-50 border-emerald-300 text-emerald-600";
                              statusBadge = "bg-status-completed";
                              break;
                            case "cancelled":
                              statusColor = "bg-slate-50 border-slate-300 text-slate-600";
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
                                "absolute rounded-admin border p-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md overflow-hidden group z-10",
                                statusColor,
                              )}
                              style={{
                                top: `${startOffset}px`,
                                height: `${height}px`,
                                left,
                                width,
                              }}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <div className="font-semibold text-sm truncate">
                                  {booking.customerName}
                                </div>
                                <div
                                  className={cn(
                                    "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                                    statusBadge,
                                  )}
                                ></div>
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {booking.serviceName}
                              </div>
                              <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {booking.startTime} - {booking.endTime}
                              </div>
                            </div>
                          );
                        })}

                        {hasOverflow && (
                          <div
                            className="absolute bg-lotus-cream/50 hover:bg-lotus-cream cursor-pointer rounded-admin border border-lotus-gold/30 flex items-center justify-center text-xs font-semibold text-lotus-deep z-10 transition-colors shadow-sm"
                            style={{
                              top: `${(cluster.startMins - 8 * 60) * 2}px`,
                              height: `${(cluster.endMins - cluster.startMins) * 2}px`,
                              left: `calc(${MAX_COLS * widthPercent}% + 2px)`,
                              width: `calc(${0.5 * widthPercent}% - 4px)`,
                              minWidth: "24px",
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
                                  className="absolute top-0 right-full mr-2 bg-white rounded-xl shadow-xl border border-lotus-gold/20 p-3 w-64 z-[60] flex flex-col gap-2 cursor-default"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex justify-between items-center border-b border-lotus-gold/10 pb-2 mb-1">
                                    <span className="font-semibold text-sm text-lotus-deep">
                                      Lịch bị ẩn ({hiddenBookings.length})
                                    </span>
                                    <button
                                      onClick={() => setActiveOverflow(null)}
                                      className="text-lotus-stone hover:text-lotus-deep rounded-full hover:bg-lotus-cream p-1 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4"
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
                                  <div className="max-h-[300px] overflow-auto flex flex-col gap-2 scrollbar-thin">
                                    {hiddenBookings.map((b) => (
                                      <div
                                        key={b.id}
                                        onClick={() => {
                                          onBookingClick(b);
                                          setActiveOverflow(null);
                                        }}
                                        className="bg-lotus-cream/20 border border-lotus-gold/20 rounded-admin p-2 cursor-pointer hover:bg-white hover:border-lotus-gold hover:shadow-sm transition-all text-left"
                                      >
                                        <div className="font-semibold text-sm text-lotus-deep">
                                          {b.customerName}
                                        </div>
                                        <div className="text-xs text-lotus-deep/70 mt-0.5">
                                          {b.serviceName}
                                        </div>
                                        <div className="text-xs text-lotus-stone mt-1.5 flex items-center gap-1 font-medium">
                                          <Clock className="w-3 h-3" />
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
