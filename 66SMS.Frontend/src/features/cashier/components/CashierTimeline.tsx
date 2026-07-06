import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { CashierBooking, StaffColumn } from "../types";
import { Clock } from "lucide-react";

interface CashierTimelineProps {
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
const HOUR_WIDTH = 105; // px cho mỗi giờ trên trục ngang
const ROW_HEIGHT = 80; // chiều cao cố định mỗi hàng nhân viên (lane)
const STAFF_COL_WIDTH = 150; // chiều rộng cột nhân viên cố định bên trái

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

interface LayoutBooking extends CashierBooking {
  startMins: number;
  endMins: number;
  rowIndex: number; // tầng dọc bên trong lane
  totalRows: number;
}

interface Cluster {
  id: string;
  bookings: LayoutBooking[];
  startMins: number;
  endMins: number;
  totalRows: number;
}

// Gom các booking chồng giờ trong cùng 1 nhân viên thành cụm,
// rồi xếp tầng (rowIndex) để hiển thị nhiều booking trong cùng khu vực.
function getClusters(laneBookings: CashierBooking[]): Cluster[] {
  if (laneBookings.length === 0) return [];

  const sorted = [...laneBookings]
    .map((b) => ({
      ...b,
      startMins: timeToMins(b.startTime),
      endMins: timeToMins(b.endTime),
      rowIndex: 0,
      totalRows: 1,
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
        totalRows: 1,
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
      totalRows: 1,
    });
  }

  clusters.forEach((cluster) => {
    const rows: LayoutBooking[][] = [];

    cluster.bookings.forEach((booking) => {
      let placed = false;
      for (let i = 0; i < rows.length; i++) {
        const lastInRow = rows[i][rows[i].length - 1];
        if (lastInRow.endMins <= booking.startMins) {
          rows[i].push(booking);
          booking.rowIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([booking]);
        booking.rowIndex = rows.length - 1;
      }
    });

    cluster.totalRows = rows.length;
    cluster.bookings.forEach((b) => (b.totalRows = rows.length));
  });

  return clusters;
}

function getStatusStyle(status: CashierBooking["status"]) {
  let statusColor = "bg-stone-50 border-stone-200 text-stone-700";
  let statusBadge = "bg-stone-400";

  switch (status) {
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

  return { statusColor, statusBadge };
}

export function CashierTimeline({
  columns,
  bookings,
  onBookingClick,
  onEmptySlotClick,
  onBookingMove,
  date,
}: CashierTimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Kéo ngang bằng cách giữ chuột trái trên nền lưới
  const scrollRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ down: false, startX: 0, startLeft: 0, moved: false });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollRef.current) return;
    // Bỏ qua nếu đang bấm vào card lịch (để không cản kéo-thả card)
    if ((e.target as HTMLElement).closest("[data-booking='true']")) return;
    panRef.current = {
      down: true,
      startX: e.clientX,
      startLeft: scrollRef.current.scrollLeft,
      moved: false,
    };
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!panRef.current.down || !scrollRef.current) return;
    const dx = e.clientX - panRef.current.startX;
    if (Math.abs(dx) > 4) panRef.current.moved = true;
    scrollRef.current.scrollLeft = panRef.current.startLeft - dx;
  };

  const handlePanEnd = () => {
    panRef.current.down = false;
  };

  // Tránh tạo lịch khi vừa kéo nền (phân biệt kéo với click ô trống)
  const handleSlotClick = (staffId: number, time: string) => {
    if (panRef.current.moved) return;
    onEmptySlotClick?.(staffId, time);
  };

  const isToday = date.toDateString() === new Date().toDateString();
  const currentH = currentTime.getHours();
  const currentM = currentTime.getMinutes();
  const showCurrentTime = isToday && currentH >= 8 && currentH <= 22;
  const currentTimeX =
    (currentH - 8) * HOUR_WIDTH + (currentM / 60) * HOUR_WIDTH;

  const laneWidth = HOURS.length * HOUR_WIDTH;

  const handleDragStart = (e: React.DragEvent, bookingId: string) => {
    e.dataTransfer.setData("bookingId", bookingId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const xToTime = (x: number) => {
    const minutesFrom8 = (x / HOUR_WIDTH) * 60;
    const newStartMins = 8 * 60 + minutesFrom8;
    const roundedMins = Math.round(newStartMins / 15) * 15;
    const clamped = Math.max(8 * 60, Math.min(22 * 60, roundedMins));
    const hours = Math.floor(clamped / 60);
    const mins = clamped % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const handleDrop = (e: React.DragEvent, staffId: number) => {
    e.preventDefault();
    const bookingId = e.dataTransfer.getData("bookingId");
    if (!bookingId || !onBookingMove) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    onBookingMove(bookingId, staffId, xToTime(x));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full font-sans">
      <div
        ref={scrollRef}
        className="max-h-full overflow-auto bg-white relative cursor-grab active:cursor-grabbing select-none scrollbar-thin"
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
      >
      <div
        className="flex flex-col"
        style={{ width: `${STAFF_COL_WIDTH + laneWidth}px` }}
      >
        {/* Header: thước thời gian (trục X) */}
        <div className="flex sticky top-0 z-40 bg-white">
          <div
            className="flex-shrink-0 h-10 border-b border-r border-stone-300/80 bg-lotus-rose-light/50 sticky left-0 z-50 flex items-center px-4"
            style={{ width: `${STAFF_COL_WIDTH}px` }}
          >
            <span className="text-lotus-admin-base font-bold text-lotus-stone">
              Nhân viên
            </span>
          </div>
          <div
            className="relative h-10 border-b border-stone-300/80 bg-lotus-rose-light/20"
            style={{ width: `${laneWidth}px` }}
          >
            {HOURS.map((hour, i) => (
              <div
                key={hour}
                className="absolute top-0 h-full border-l border-stone-300/60 flex items-center"
                style={{ left: `${i * HOUR_WIDTH}px`, width: `${HOUR_WIDTH}px` }}
              >
                <span className="text-lotus-admin-xs font-bold text-lotus-stone/80 pl-2">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
            {showCurrentTime && (
              <div
                className="absolute top-0 z-40 -translate-x-1/2 pointer-events-none"
                style={{ left: `${currentTimeX}px` }}
              >
                <div className="bg-rose-600 text-white text-lotus-admin-xs px-1 rounded-[2px] shadow-sm font-bold mt-2 border border-rose-600">
                  {currentH.toString().padStart(2, "0")}:
                  {currentM.toString().padStart(2, "0")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Các hàng nhân viên (lane) */}
        <div className="flex flex-col">
        {columns.map((col) => {
          const laneBookings = bookings.filter(
            (b) => b.staffId.toString() === col.id.toString(),
          );

          return (
            <div
              key={col.id}
              className="flex border-b border-stone-300/60"
              style={{ height: `${ROW_HEIGHT}px` }}
            >
              {/* Cột nhân viên cố định bên trái */}
              <div
                className="flex-shrink-0 border-r border-stone-300/80 bg-lotus-rose-light/20 sticky left-0 z-30 flex items-center gap-2 px-4"
                style={{ width: `${STAFF_COL_WIDTH}px` }}
              >
                {col.avatar ? (
                  <img
                    src={col.avatar}
                    alt={col.name}
                    className="w-6 h-6 rounded-[3px] flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-[3px] bg-lotus-gold/10 flex items-center justify-center text-lotus-gold font-bold text-xs flex-shrink-0">
                    {col.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-xs text-lotus-deep truncate whitespace-nowrap">
                    {col.name}
                  </p>
                  <p className="text-lotus-admin-xs text-lotus-stone">KTV</p>
                </div>
              </div>

              {/* Lane: nền lưới giờ + các booking */}
              <div
                className="relative bg-white h-full"
                style={{ width: `${laneWidth}px` }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, Number(col.id))}
              >
                {/* Lưới giờ nền + click ô trống */}
                <div className="absolute inset-0 flex">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="border-l border-stone-300/60 h-full flex"
                      style={{ width: `${HOUR_WIDTH}px` }}
                    >
                      {[0, 15, 30, 45].map((min) => (
                        <div
                          key={min}
                          className="flex-1 h-full border-l border-stone-300/30 border-dashed first:border-0 hover:bg-lotus-primary/5 transition-colors cursor-pointer"
                          onClick={() =>
                            handleSlotClick(
                              Number(col.id),
                              `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
                            )
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Vạch giờ hiện tại (đường dọc) */}
                {showCurrentTime && (
                  <div
                    className="absolute top-0 bottom-0 border-l border-rose-500/60 border-dashed z-20 pointer-events-none"
                    style={{ left: `${currentTimeX}px` }}
                  />
                )}

                {/* Booking cards */}
                {getClusters(laneBookings).map((cluster) =>
                  cluster.bookings.map((booking) => {
                    const left =
                      (booking.startMins - 8 * 60) * (HOUR_WIDTH / 60);
                    const width =
                      (booking.endMins - booking.startMins) * (HOUR_WIDTH / 60);
                    const laneInnerH = ROW_HEIGHT - 6; // chừa padding 3px trên/dưới
                    const cardH = laneInnerH / booking.totalRows;
                    const top = 3 + booking.rowIndex * cardH;
                    const { statusColor, statusBadge } = getStatusStyle(
                      booking.status,
                    );

                    return (
                      <div
                        key={booking.id}
                        data-booking="true"
                        onClick={() => onBookingClick(booking)}
                        draggable={true}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, booking.id);
                        }}
                        className={cn(
                          "absolute rounded-[3px] border px-1.5 py-0.5 cursor-grab active:cursor-grabbing transition-all hover:shadow hover:z-30 overflow-hidden z-10",
                          statusColor,
                        )}
                        style={{
                          left: `${left + 1}px`,
                          width: `${Math.max(width - 2, 24)}px`,
                          top: `${top}px`,
                          height: `${cardH - 2}px`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-1 leading-none">
                          <span className="font-bold text-lotus-admin-xs truncate whitespace-nowrap text-lotus-deep">
                            {booking.customerName}
                          </span>
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full flex-shrink-0",
                              statusBadge,
                            )}
                          />
                        </div>
                        <div className="text-lotus-admin-xs opacity-90 truncate whitespace-nowrap mt-0.5">
                          {booking.serviceName}
                        </div>
                        <div className="text-lotus-admin-xs opacity-75 flex items-center gap-0.5 truncate whitespace-nowrap mt-0.5">
                          <Clock className="w-2 h-2 flex-shrink-0" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          );
        })}

        {columns.length === 0 && (
          <div className="flex items-center justify-center py-12 text-xs text-lotus-stone">
            Không có nhân viên nào trong ngày này
          </div>
        )}
        </div>
      </div>
      </div>
    </div>
  );
}
