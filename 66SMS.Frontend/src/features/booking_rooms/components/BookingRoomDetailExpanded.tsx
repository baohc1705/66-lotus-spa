import { BOOKING_ROOM_PERM } from "@/features/booking_rooms/constants/bookingRoom.permissions";
import { useBookingRoomDetail } from "@/features/booking_rooms/hooks/useBookingRooms";
import type { BookingRoomDto } from "@/features/booking_rooms/types/bookingRoom.types";
import type { BookingPositionDto } from "@/features/booking_positions/types/bookingPosition.types";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tabs } from "@/shared/components/Tabs";
import { StatusActive } from "@/shared/constants/status.enum";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
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
import { MapPin, Pencil } from "lucide-react";
import { useState } from "react";

interface Props {
  roomId: number;
  onEdit?: (room: BookingRoomDto) => void;
}

function positionBadge(status?: number) {
  if (status === 4) {
    return (
      <Badge variant="warning" soft>
        Đang phục vụ
      </Badge>
    );
  }
  if (status === StatusActive.Inactive) {
    return (
      <Badge variant="danger" soft>
        Bảo trì
      </Badge>
    );
  }
  return (
    <Badge variant="success" soft>
      Trống
    </Badge>
  );
}

export function BookingRoomDetailExpanded({ roomId, onEdit }: Props) {
  const { data: result, isLoading } = useBookingRoomDetail(roomId);
  const room = result?.data;
  const positions = room?.positions ?? [];
  const perm = BOOKING_ROOM_PERM;
  const [tabId, setTabId] = useState("info");

  if (isLoading) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="text-sm text-kit-muted">Đang tải chi tiết phòng...</p>
      </TableDetailExpanded>
    );
  }

  if (!room) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="text-sm text-kit-muted">
          Không tìm thấy thông tin phòng dịch vụ
        </p>
      </TableDetailExpanded>
    );
  }

  return (
    <TableDetailExpanded className="bg-kit-white" maxHeightClass="max-h-100">
      <Tabs
        variant="body"
        activeId={tabId}
        onChange={setTabId}
        navClassName="mb-2"
        tabs={[
          {
            id: "info",
            label: "Thông tin",
            content: (
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
                    (room.status === StatusActive.Active
                      ? "Hoạt động"
                      : "Ngưng hoạt động")
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
              </>
            ),
          },
          {
            id: "positions",
            label: `Danh sách vị trí (${positions.length})`,
            content: (
              <>
                {positions.length === 0 ? (
                  <p className="py-6 text-center text-sm text-kit-muted">
                    Chưa có vị trí
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
                        {positions.map((position: BookingPositionDto) => (
                          <TableRow key={position.id}>
                            <TableCell className="text-center text-kit-muted">
                              {position.sortOrder ?? "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 font-medium text-kit-heading">
                                <MapPin className="h-3.5 w-3.5 text-kit-primary" />
                                {position.name}
                              </div>
                            </TableCell>
                            <TableCell>{positionBadge(position.status)}</TableCell>
                            <TableCell className="max-w-xs truncate text-kit-muted">
                              {position.note || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            ),
          },
        ]}
      />

      {onEdit ? (
        <TableDetailActions>
          <PermissionGate resource={perm.resource} action={perm.update}>
            <Button
              variant="admin"
              size="sm"
              className="mb-0"
              onClick={() => onEdit(room)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Cập nhật
            </Button>
          </PermissionGate>
        </TableDetailActions>
      ) : null}
    </TableDetailExpanded>
  );
}
