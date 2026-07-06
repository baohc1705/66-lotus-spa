import { useState, useMemo } from "react";
import { Search, Home, DoorOpen } from "lucide-react";
import { useBookingRooms } from "@/features/booking_rooms/hooks/useBookingRooms";
import { useBookingPositions } from "../hooks/useBookingPositions";

interface BookingRoomSidebarProps {
  selectedRoomId: number | null;
  onSelectRoom: (id: number | null) => void;
}

export function BookingRoomSidebar({
  selectedRoomId,
  onSelectRoom,
}: BookingRoomSidebarProps) {
  const [searchText, setSearchText] = useState("");

  const { data: roomsResult, isLoading: isLoadingRooms } = useBookingRooms({
    pageIndex: 1,
    pageSize: 100,
  });

  const rooms = useMemo(
    () => roomsResult?.data?.items ?? [],
    [roomsResult?.data?.items],
  );

  // Fetch all positions without room filter for counting
  const { data: allPositionsResult } = useBookingPositions({
    pageIndex: 1,
    pageSize: 10000,
  });

  const countPositions = useMemo(
    () => allPositionsResult?.data?.items ?? [],
    [allPositionsResult],
  );

  const countMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of countPositions) {
      if (p.roomId != null) {
        map.set(p.roomId, (map.get(p.roomId) ?? 0) + 1);
      }
    }
    return map;
  }, [countPositions]);

  const totalCount = countPositions.length;

  const filteredRooms = useMemo(() => {
    if (!searchText.trim()) return rooms;
    const lower = searchText.toLowerCase();
    return rooms.filter((r) => (r.name ?? "").toLowerCase().includes(lower));
  }, [rooms, searchText]);

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-white rounded border border-stone-200/60 overflow-hidden">
      {/* Search */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm phòng..."
            className="lotus-admin-sidebar-search"
          />
        </div>
      </div>

      {/* Room list */}
      <nav className="flex-1 flex-col h-full overflow-y-auto custom-scrollbar px-2 pb-2 space-y-0.5">
        {/* Tất cả phòng */}
        <button
          type="button"
          onClick={() => onSelectRoom(null)}
          className={`lotus-admin-sidebar-item ${
            selectedRoomId === null
              ? "bg-lotus-leaf/10 text-lotus-leaf font-semibold border-l-[3px] border-lotus-leaf"
              : "text-lotus-deep/70 hover:bg-lotus-leaf/5 hover:text-lotus-leaf border-l-[3px] border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Home
              className={`w-4 h-4 shrink-0 ${
                selectedRoomId === null ? "text-lotus-leaf" : "text-stone-400"
              }`}
            />
            <span className="truncate">Tất cả phòng</span>
          </div>
          <span
            className={`lotus-admin-sidebar-badge ${
              selectedRoomId === null
                ? "bg-lotus-leaf/20 text-lotus-leaf"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {isLoadingRooms ? (
          <div className="space-y-1 px-1 mt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-7 bg-stone-100/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isActive = selectedRoomId === room.id;
            const count = room.id != null ? (countMap.get(room.id) ?? 0) : 0;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => onSelectRoom(room.id ?? null)}
                className={`lotus-admin-sidebar-item group ${
                  isActive
                    ? "bg-lotus-leaf/10 text-lotus-leaf font-semibold border-l-[3px] border-lotus-leaf"
                    : "text-lotus-deep/70 hover:bg-lotus-leaf/5 hover:text-lotus-leaf border-l-[3px] border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <DoorOpen
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? "text-lotus-leaf"
                        : "text-stone-400 group-hover:text-stone-500"
                    }`}
                  />
                  <span className="truncate">{room.name ?? "—"}</span>
                </div>
                <span
                  className={`lotus-admin-sidebar-badge ${
                    isActive
                      ? "bg-lotus-leaf/20 text-lotus-leaf"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}
