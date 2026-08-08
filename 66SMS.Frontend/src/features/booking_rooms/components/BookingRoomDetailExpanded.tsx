import { useState } from "react";
import { Pencil, MapPin } from "lucide-react";
import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { Nav, NavItem, NavLink } from "@/shared/elements/Nav";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { FallbackImage } from "@/shared/components/FallbackImage";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { useBookingRoomDetail } from "../hooks/useBookingRooms";
import { BOOKING_ROOM_PERM } from "../constants/booking_room.permissions";
import type { BookingRoomDTO } from "../types/booking_room.types";
import type { BookingPositionDTO } from "@/features/booking_positions/types/booking_position.types";

interface BookingRoomDetailExpandedProps {
  roomId: number;
  onEdit?: (room: BookingRoomDTO) => void;
}

function positionBadge(status?: number) {
  if (status === 4) {
    return <Badge variant="warning" soft>Đang phục vụ</Badge>;
  }
  if (status === 0) {
    return <Badge variant="danger" soft>Bảo trì</Badge>;
  }
  return <Badge variant="success" soft>Trống</Badge>;
}

export function BookingRoomDetailExpanded({
  roomId,
  onEdit,
}: BookingRoomDetailExpandedProps) {
  const { data: result, isLoading } = useBookingRoomDetail(roomId);
  const room = result?.data;
  const positions = room?.positions ?? [];
  const [tab, setTab] = useState<"info" | "positions">("info");

  if (isLoading) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">Đang tải chi tiết phòng...</p>
      </TableDetailExpanded>
    );
  }

  if (!room) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">
          Không tìm thấy thông tin phòng dịch vụ
        </p>
      </TableDetailExpanded>
    );
  }

  return (
    <TableDetailExpanded maxHeightClass="max-h-100">
      <Nav pills className="mb-2">
        <NavItem>
          <NavLink active={tab === "info"} onClick={() => setTab("info")}>
            Thông tin chung
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={tab === "positions"}
            onClick={() => setTab("positions")}
          >
            Danh sách vị trí ({positions.length})
          </NavLink>
        </NavItem>
      </Nav>

      {tab === "info" ? (
        <>
          <TableDetailHeader
            icon={
              <FallbackImage
                kind="position"
                src={room.imageUrl}
                alt={room.name ?? ""}
                className="h-full w-full object-cover"
              />
            }
            title={room.name ?? "—"}
            subtitle={
              (room.salonName ? `${room.salonName} · ` : "") +
              (room.status === 1 ? "Hoạt động" : "Ngưng hoạt động")
            }
          />

          <TableDetailGrid>
            <TableDetailField label="Tên phòng" value={room.name} />
            <TableDetailField label="Chi nhánh" value={room.salonName} />
            <TableDetailField
              label="Vị trí trống"
              value={`${room.availableCount ?? 0}`}
            />
            <TableDetailField
              label="Đang phục vụ"
              value={`${room.inServiceCount ?? 0}`}
            />
            <TableDetailField label="Ghi chú" value={room.note} />
          </TableDetailGrid>

          <TableDetailActions>
            <PermissionGate
              resource={BOOKING_ROOM_PERM.resource}
              action={BOOKING_ROOM_PERM.update}
            >
              <Button
                variant="admin"
                size="sm"
                className="mb-0"
                onClick={() => onEdit?.(room)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Cập nhật
              </Button>
            </PermissionGate>
          </TableDetailActions>
        </>
      ) : positions.length === 0 ? (
        <p className="py-6 text-center text-sm text-kit-muted">
          Chưa có vị trí nào được thiết lập trong phòng này
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-kit bg-kit-white">
          <Table size="sm" hover>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-16 text-center">
                  Thứ tự
                </TableHeaderCell>
                <TableHeaderCell>Tên vị trí</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
                <TableHeaderCell>Ghi chú</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.map((pos: BookingPositionDTO) => (
                <TableRow key={pos.id}>
                  <TableCell className="text-center text-kit-muted">
                    {pos.sortOrder ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-kit-heading">
                      <MapPin className="h-3.5 w-3.5 text-kit-primary" />
                      {pos.name}
                    </div>
                  </TableCell>
                  <TableCell>{positionBadge(pos.status)}</TableCell>
                  <TableCell className="max-w-xs truncate text-kit-muted">
                    {pos.note || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </TableDetailExpanded>
  );
}
