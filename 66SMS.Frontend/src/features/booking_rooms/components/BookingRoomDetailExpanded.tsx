import { DoorOpen, Pencil, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { useBookingRoomDetail } from "../hooks/useBookingRooms";
import { BOOKING_ROOM_PERM } from "../constants/booking_room.permissions";
import type { BookingRoomDTO } from "../types/booking_room.types";
import type { BookingPositionDTO } from "@/features/booking_positions/types/booking_position.types";

interface BookingRoomDetailExpandedProps {
  roomId: number;
  onEdit?: (room: BookingRoomDTO) => void;
}

const POSITION_STATUS_MAP: StatusMap = {
  "0": { label: "Bảo trì", variant: "error" },
  "1": { label: "Khả dụng", variant: "success", dot: true },
};

export function BookingRoomDetailExpanded({
  roomId,
  onEdit,
}: BookingRoomDetailExpandedProps) {
  const { data: result, isLoading } = useBookingRoomDetail(roomId);
  const room = result?.data;
  const positions = room?.positions ?? [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-adminGray-50/30">
        <div className="flex gap-4 mb-4">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
        <Skeleton className="w-48 h-6" />
        <div className="grid grid-cols-2 gap-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-6 text-center text-adminGray-600 text-sm bg-adminGray-50/30">
        Không tìm thấy thông tin phòng dịch vụ
      </div>
    );
  }

  return (
    <div className="bg-adminGray-50/30 w-full overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
      <Tabs defaultValue="info" className="w-full flex-col">
        <div className="px-4 pt-2 sticky top-0 bg-adminGray-50/95 backdrop-blur-sm z-10">
          <TabsList className="h-10 border-b border-adminGray-100/80 justify-start rounded-none bg-transparent p-0 flex flex-nowrap overflow-x-auto overflow-y-hidden hide-scrollbar">
            <TabsTrigger
              value="info"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="positions"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Danh sách vị trí ({positions.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="p-4 m-0 border-none outline-none">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-adminGray-50/50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-adminGray-100/50">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt={room.name ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DoorOpen className="w-7 h-7 text-adminGray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-adminInk truncate">
                  {room.name ?? "—"}
                </h3>
                <p className="text-xs text-adminGray-600 mt-0.5">
                  Trạng thái:{" "}
                  {room.status === 1 ? "Hoạt động" : "Ngưng hoạt động"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              <div className="flex flex-col">
                <DetailField label="Tên phòng" value={room.name} />
              </div>
              <div className="flex flex-col">
                <DetailField label="Ghi chú" value={room.note} />
              </div>
            </div>

            <div className="flex items-end justify-end mt-2 pt-4 border-t border-adminGray-100/80">
              <PermissionGate
                resource={BOOKING_ROOM_PERM.resource}
                action={BOOKING_ROOM_PERM.update}
              >
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => onEdit?.(room)}
                  className="bg-adminGreen-600 hover:opacity-90 text-white shadow-sm h-8 px-4 text-sm gap-1.5 rounded-md transition-opacity"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Cập nhật
                </Button>
              </PermissionGate>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="positions"
          className="p-4 m-0 border-none outline-none"
        >
          {positions.length === 0 ? (
            <div className="py-8 text-center text-adminGray-600 text-sm">
              Chưa có vị trí nào được thiết lập trong phòng này
            </div>
          ) : (
            <div className="rounded-md border border-adminGray-100 overflow-x-auto w-full">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-adminGray-50 border-b border-adminGray-100 text-adminGray-600">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold w-16 text-center">
                      Thứ tự
                    </th>
                    <th className="py-2.5 px-4 font-semibold">Tên vị trí</th>
                    <th className="py-2.5 px-4 font-semibold">Trạng thái</th>
                    <th className="py-2.5 px-4 font-semibold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-adminGray-100 bg-white">
                  {positions.map((pos: BookingPositionDTO) => (
                    <tr
                      key={pos.id}
                      className="hover:bg-adminGray-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-semibold text-adminGray-600 text-center">
                        {pos.sortOrder ?? "-"}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-adminInk">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-adminGreen-600/70" />
                          {pos.name}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge
                          status={pos.status?.toString()}
                          statusMap={POSITION_STATUS_MAP}
                        />
                      </td>
                      <td
                        className="py-2.5 px-4 text-adminGray-600 truncate max-w-[200px]"
                        title={pos.note}
                      >
                        {pos.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="py-3.5 border-b border-adminGray-100/80 last:border-b-0 group">
      <p className="text-xs text-adminGray-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-adminInk truncate">
        {value || "—"}
      </p>
    </div>
  );
}
