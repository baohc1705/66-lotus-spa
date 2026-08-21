import { useAuthStore } from "@/features/auth/stores/authStore";
import { useBookingRooms } from "@/features/booking_rooms/hooks/useBookingRooms";
import type { BookingRoomDto } from "@/features/booking_rooms/types/bookingRoom.types";
import { BookingPositionStatCards } from "@/features/booking_positions/components/BookingPositionStatCards";
import { BOOKING_POSITION_PERM } from "@/features/booking_positions/constants/bookingPosition.permissions";
import {
  useBookingPositions,
  useDeleteBookingPosition,
  useUpdateBookingPosition,
} from "@/features/booking_positions/hooks/useBookingPositions";
import type { BookingPositionDto } from "@/features/booking_positions/types/bookingPosition.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

// Giải thích:
// onEdit: Hàm xử lý khi nhấn vào nút sửa
// onCreate: Hàm xử lý khi nhấn vào nút thêm
interface Props {
  onEdit: (item: BookingPositionDto) => void;
  onCreate: (roomId: number | null) => void;
}

export function BookingPositionTable({ onEdit, onCreate }: Props) {
  const perm = BOOKING_POSITION_PERM;

  const salonId = useAuthStore((state) => state.getEffectiveSalonId());

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookingPositionDto | null>(
    null,
  );

  const { data: roomsResult } = useBookingRooms({
    pageIndex: 1,
    pageSize: 500,
    salonId: salonId ?? undefined,
  });
  const rooms = roomsResult?.data?.items ?? [];

  const queryParams = {
    pageIndex,
    pageSize,
    keyword: filter || undefined,
    orderBy,
    isDescending,
    roomId: selectedRoomId ?? undefined,
  };

  const currentQuery = useBookingPositions(queryParams);
  const { data: allPositionsResult } = useBookingPositions({
    pageIndex: 1,
    pageSize: 10000,
  });

  const paged = currentQuery.data?.data;
  const positions = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const allPositions = allPositionsResult?.data?.items ?? [];
  let activePositionsCount = 0;
  let maintenancePositionsCount = 0;
  for (let index = 0; index < allPositions.length; index++) {
    const item = allPositions[index];
    if (item.status === StatusActive.Active) activePositionsCount += 1;
    if (item.status === StatusActive.Inactive) maintenancePositionsCount += 1;
  }

  const updateMutation = useUpdateBookingPosition();
  const deleteMutation = useDeleteBookingPosition();

  useEffect(() => {
    setPageIndex(1);
  }, [salonId]);

  // Giải thích:
  // Đợi 300ms sau khi gõ mới gửi keyword lên API, tránh gọi liên tục
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  function handleSort(column: string) {
    if (orderBy === column) {
      setIsDescending(!isDescending);
      return;
    }
    setOrderBy(column);
    setIsDescending(false);
  }

  // Giải thích:
  // handleRoomChange: Lọc danh sách theo phòng dịch vụ, về trang 1
  function handleRoomChange(value: string) {
    if (!value) {
      setSelectedRoomId(null);
    } else {
      setSelectedRoomId(Number(value));
    }
    setPageIndex(1);
  }

  function handleToggleStatus(item: BookingPositionDto, checked: boolean) {
    if (!item.id) return;
    const status = checked ? StatusActive.Active : StatusActive.Inactive;
    updateMutation.mutate({ id: item.id, data: { status } });
  }

  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setDeleteTarget(null);
      },
    });
  }

  const emptyColSpan = 5;

  return (
    <div className="space-y-0 pb-6">
      <BookingPositionStatCards
        totalPositions={allPositionsResult?.data?.totalCount ?? allPositions.length}
        activePositions={activePositionsCount}
        maintenancePositions={maintenancePositionsCount}
        isLoading={currentQuery.isLoading && allPositions.length === 0}
      />

      <div className="rounded-md border border-kit bg-kit-white shadow-kit-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm kiếm vị trí..."
              inputSize="sm"
              className="mb-0 h-9 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              inputSize="sm"
              className="mb-0 mr-0 h-9 w-52"
              value={selectedRoomId ? String(selectedRoomId) : ""}
              onChange={(event) => handleRoomChange(event.target.value)}
            >
              <option value="">Tất cả phòng dịch vụ</option>
              {rooms.map((room: BookingRoomDto) => (
                <option key={room.id} value={room.id?.toString() || ""}>
                  {room.name}
                </option>
              ))}
            </Select>
            <PermissionGate resource={perm.resource} action={perm.create}>
              <Button
                variant="primary"
                size="sm"
                className="mb-0 mr-0 h-9"
                onClick={() => onCreate(selectedRoomId)}
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm vị trí
              </Button>
            </PermissionGate>
          </div>
        </div>

        <TableResponsive>
          <Table hover striped>
            <TableHead className="bg-kit-primary text-kit-white [&_th]:bg-kit-primary">
              <TableRow>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Tên vị trí"
                    column="name"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Phòng dịch vụ</TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Thứ tự"
                    column="sortOrder"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
                <TableHeaderCell>Thao tác</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : positions.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Chưa có vị trí dịch vụ
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-kit-heading">
                      {item.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-kit-muted">
                      {item.roomName ?? "—"}
                    </TableCell>
                    <TableCell className="text-kit-muted">
                      {item.sortOrder ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.status === StatusActive.Active}
                        onChange={(checked: boolean) =>
                          handleToggleStatus(item, checked)
                        }
                        disabled={updateMutation.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <PermissionGate
                          resource={perm.resource}
                          action={perm.update}
                        >
                          <Tooltip text="Sửa">
                            <Button
                              size="icon-sm"
                              variant="outline-primary"
                              className="mb-0 mr-0"
                              onClick={() => onEdit(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Tooltip>
                        </PermissionGate>
                        <PermissionGate
                          resource={perm.resource}
                          action={perm.delete}
                        >
                          <Tooltip text="Xóa">
                            <Button
                              size="icon-sm"
                              variant="outline-danger"
                              className="mb-0 mr-0"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </Tooltip>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableResponsive>

        {totalCount > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kit px-4 py-3">
            <div className="flex items-center gap-3 text-xs text-kit-dark">
              <span>
                {rangeEnd} / {pageSize}
              </span>
              <Select
                inputSize="sm"
                className="mb-0 w-28"
                value={pageSize}
                onChange={(event) =>
                  handlePageSizeChange(Number(event.target.value))
                }
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </div>
            <Pagination
              page={safePage}
              pageCount={totalPages}
              onPageChange={setPageIndex}
              size="sm"
            />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa vị trí dịch vụ"
        description={`Bạn có chắc muốn xóa vị trí dịch vụ "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
