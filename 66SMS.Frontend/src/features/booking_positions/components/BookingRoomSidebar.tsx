import { useState, useMemo } from "react";
import { Search, Home, DoorOpen } from "lucide-react";
import { useBookingRooms } from "@/features/booking_rooms/hooks/useBookingRooms";
import { useBookingPositions } from "../hooks/useBookingPositions";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { BookingRoomDTO } from "@/features/booking_rooms/types/booking_room.types";
import { Badge } from "@/shared/elements/Badge";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";

interface BookingRoomSidebarProps {
  selectedRoomId: number | null;
  onSelectRoom: (id: number | null) => void;
}

export function BookingRoomSidebar({
  selectedRoomId,
  onSelectRoom,
}: BookingRoomSidebarProps) {
  const [searchText, setSearchText] = useState("");
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());

  const { data: roomsResult, isLoading: isLoadingRooms } = useBookingRooms({
    pageIndex: 1,
    pageSize: 100,
    salonId: salonId ?? undefined,
  });

  const rooms = useMemo(
    () => roomsResult?.data?.items ?? [],
    [roomsResult?.data?.items],
  );

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
    return rooms.filter((r: BookingRoomDTO) =>
      (r.name ?? "").toLowerCase().includes(lower),
    );
  }, [rooms, searchText]);

  return (
    <div className="w-56 shrink-0 space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-kit-muted" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm phòng..."
          className="h-9 w-full rounded-md border border-kit bg-kit-white py-2 pr-3 pl-8 text-sm text-kit-body outline-none focus:border-kit-primary focus:ring-2 focus:ring-blue-600/25"
        />
      </div>

      <ListGroup className="mb-0 max-h-96 overflow-y-auto">
        <ListGroupItem
          action
          active={selectedRoomId === null}
          onClick={() => onSelectRoom(null)}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Home className="h-4 w-4 shrink-0" />
            <span className="truncate">Tất cả phòng</span>
          </span>
          <Badge
            variant={selectedRoomId === null ? "light" : "secondary"}
            pill
          >
            {totalCount}
          </Badge>
        </ListGroupItem>

        {isLoadingRooms
          ? Array.from({ length: 4 }).map((_, i: number) => (
              <ListGroupItem key={i} disabled>
                <span className="h-4 w-28 animate-pulse rounded bg-kit-page" />
                <span className="h-4 w-6 animate-pulse rounded-full bg-kit-page" />
              </ListGroupItem>
            ))
          : filteredRooms.map((room: BookingRoomDTO) => {
              const isActive = selectedRoomId === room.id;
              const count = room.id != null ? (countMap.get(room.id) ?? 0) : 0;
              return (
                <ListGroupItem
                  key={room.id}
                  action
                  active={isActive}
                  onClick={() => onSelectRoom(room.id ?? null)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <DoorOpen className="h-4 w-4 shrink-0" />
                    <span className="truncate">{room.name ?? "—"}</span>
                  </span>
                  <Badge variant={isActive ? "light" : "secondary"} pill>
                    {count}
                  </Badge>
                </ListGroupItem>
              );
            })}
      </ListGroup>
    </div>
  );
}
