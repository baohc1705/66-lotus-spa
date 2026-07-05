import { useState, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, type Variants } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
} from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Switch } from "@/shared/components/ui/switch";
import { TABLE_STYLES } from "@/shared/styles/table.styles";

import { BookingPositionFormDialog } from "../components/BookingPositionFormDialog";
import { BookingRoomSidebar } from "../components/BookingRoomSidebar";
import { BookingPositionStatCards } from "../components/BookingPositionStatCards";
import {
  useBookingPositions,
  useDeleteBookingPosition,
  useUpdateBookingPosition,
} from "../hooks/useBookingPositions";
import type { BookingPositionDTO } from "../types/booking_position.types";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export function BookingPositionListPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [editBookingPosition, setEditBookingPosition] = useState<BookingPositionDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookingPositionDTO | null>(null);

  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const handleSelectRoom = useCallback((id: number | null) => {
    setSelectedRoomId(id);
    setPageIndex(1);
  }, []);

  const {
    data: positionResult,
    isLoading,
    isFetching,
  } = useBookingPositions({
    pageIndex,
    pageSize,
    filter: filter || undefined,
    orderBy,
    isDescending,
    roomId: selectedRoomId ?? undefined,
  });

  const { data: allPositionsResult, isLoading: isLoadingAll } = useBookingPositions({
    pageIndex: 1,
    pageSize: 10000,
  });

  const deleteMutation = useDeleteBookingPosition();
  const updateMutation = useUpdateBookingPosition();

  const paged = positionResult?.data;
  const positions = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const allPositions = useMemo(() => allPositionsResult?.data?.items ?? [], [allPositionsResult]);

  const totalPositionsCount = allPositions.length;
  const activePositionsCount = useMemo(
    () => allPositions.filter((p) => p.status === 1).length,
    [allPositions],
  );
  const maintenancePositionsCount = useMemo(
    () => allPositions.filter((p) => p.status === 0).length,
    [allPositions],
  );

  const currentPageIds = useMemo(
    () => positions.map((c) => c.id).filter((id): id is number => id !== undefined),
    [positions],
  );

  const isAllSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedRowIds.has(id));
  const isSomeSelected = currentPageIds.some((id) => selectedRowIds.has(id));
  const headerChecked = isAllSelected
    ? true
    : isSomeSelected
      ? "indeterminate"
      : false;

  const handleSort = useCallback(
    (column: string) => {
      if (orderBy === column) {
        setIsDescending((prev) => !prev);
      } else {
        setOrderBy(column);
        setIsDescending(false);
      }
    },
    [orderBy],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilter(value);
    setPageIndex(1);
  }, []);

  const handleDelete = useCallback(() => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null);
        },
      });
    }
  }, [deleteTarget, deleteMutation]);

  const SortIcon = useCallback(
    ({ column }: { column: string }) => {
      if (orderBy !== column) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
      return isDescending ? (
        <ArrowDown className="w-3 h-3 text-lotus-leaf" />
      ) : (
        <ArrowUp className="w-3 h-3 text-lotus-leaf" />
      );
    },
    [orderBy, isDescending],
  );

  const columns = useMemo<ColumnDef<BookingPositionDTO>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={headerChecked}
            onCheckedChange={(checked) => {
              const newSet = new Set(selectedRowIds);
              if (headerChecked === "indeterminate" || checked === false) {
                currentPageIds.forEach((id) => newSet.delete(id));
              } else if (checked === true) {
                currentPageIds.forEach((id) => newSet.add(id));
              }
              setSelectedRowIds(newSet);
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Checkbox
              checked={item.id !== undefined && selectedRowIds.has(item.id)}
              onCheckedChange={(checked) => {
                if (item.id === undefined) return;
                const newSet = new Set(selectedRowIds);
                if (checked) newSet.add(item.id);
                else newSet.delete(item.id);
                setSelectedRowIds(newSet);
              }}
              aria-label={`Select row`}
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        size: 40,
        enableResizing: false,
      },
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-lotus-stone">
            {(pageIndex - 1) * pageSize + row.index + 1}
          </span>
        ),
        size: 50,
        enableResizing: false,
      },
      {
        accessorKey: "name",
        header: () => (
          <button
            onClick={() => handleSort("name")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors text-[13px] font-semibold"
          >
            Tên vị trí <SortIcon column="name" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {row.original.name ?? "—"}
          </span>
        ),
        size: 200,
      },
      {
        accessorKey: "roomName",
        header: "Phòng dịch vụ",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80">
            {row.original.roomName || "—"}
          </span>
        ),
        size: 150,
      },
      {
        accessorKey: "sortOrder",
        header: () => (
          <button
            onClick={() => handleSort("sortOrder")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors text-[13px] font-semibold"
          >
            Thứ tự <SortIcon column="sortOrder" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-lotus-deep/80">
            {row.original.sortOrder ?? "—"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <Switch
                checked={item.status === 1}
                onCheckedChange={(checked) => {
                  if (item.id) {
                    updateMutation.mutate({
                      id: item.id,
                      payload: {
                        status: checked ? 1 : 0,
                      },
                    });
                  }
                }}
                disabled={updateMutation.isPending}
              />
            </div>
          );
        },
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <PermissionGate resource="booking_positions" action="update">
                    <DropdownMenuItem
                      onClick={() => setEditBookingPosition(item)}
                    >
                      <Pencil className="w-4 h-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate
                    resource="booking_positions"
                    action="delete"
                    role="admin"
                  >
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa vị trí
                    </DropdownMenuItem>
                  </PermissionGate>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
        enableResizing: false,
      },
    ],
    [
      headerChecked,
      selectedRowIds,
      currentPageIds,
      pageIndex,
      pageSize,
      SortIcon,
      handleSort,
      updateMutation,
    ],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: positions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const { layoutMode } = useOutletContext<{
    layoutMode: "top-nav" | "sidebar";
  }>();
  const isSidebarMode = layoutMode === "sidebar";

  return (
    <div className="flex h-full overflow-hidden gap-2">
      {/* Sidebar phòng */}
      {!isSidebarMode && (
        <BookingRoomSidebar
          selectedRoomId={selectedRoomId}
          onSelectRoom={handleSelectRoom}
        />
      )}

      {/* Right container: Table */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        {/* Stats row */}
        <div className="shrink-0">
          <BookingPositionStatCards
            totalPositions={totalPositionsCount}
            activePositions={activePositionsCount}
            maintenancePositions={maintenancePositionsCount}
            isLoading={isLoadingAll}
          />
        </div>

        {/* Table card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={`${TABLE_STYLES.pageCard} flex-1 min-h-0 flex flex-col overflow-hidden relative`}
        >
          {/* Fetching bar */}
          {isFetching && !isLoading && (
            <div className={TABLE_STYLES.fetchBar}>
              <div className={TABLE_STYLES.fetchBarInner} />
            </div>
          )}

          {/* Toolbar */}
          <div className="px-4 pt-3 shrink-0">
            <DataTableToolbar
              searchValue={filter}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Tìm kiếm vị trí..."
            >
              {selectedRowIds.size > 0 && (
                <div className="flex items-center gap-2 mr-auto text-[13px] text-lotus-deep font-medium bg-lotus-cream/50 px-3 py-1.5 rounded-lg border border-stone-200/50">
                  <span>Đã chọn {selectedRowIds.size}</span>
                  <button
                    onClick={() => setSelectedRowIds(new Set())}
                    className="text-lotus-stone hover:text-lotus-deep ml-1 transition-colors"
                    title="Bỏ chọn tất cả"
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}

              <DataTableViewOptions
                table={table}
                columnLabels={{
                  name: "Tên vị trí",
                  roomName: "Phòng dịch vụ",
                  sortOrder: "Thứ tự",
                  status: "Trạng thái",
                }}
              />

              <PermissionGate
                resource="booking_positions"
                action="create"
                role="admin"
              >
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className={TABLE_STYLES.toolbarBtn}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm vị trí
                </Button>
              </PermissionGate>
            </DataTableToolbar>
          </div>

          {/* Table */}
          <DataTable
            table={table}
            isLoading={isLoading}
            loadingRows={pageSize > 5 ? 5 : pageSize}
            emptyState={
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-lotus-stone" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-lotus-deep">
                    Chưa có vị trí dịch vụ
                  </p>
                  <p className="text-[12px] text-lotus-stone mt-0.5">
                    Thêm vị trí mới để sử dụng dịch vụ.
                  </p>
                </div>
                <PermissionGate
                  resource="booking_positions"
                  action="create"
                  role="admin"
                >
                  <Button
                    variant="admin"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="mt-1 text-[12px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm vị trí
                  </Button>
                </PermissionGate>
              </div>
            }
            pagination={
              paged && totalCount > 0 ? (
                <DataTablePagination
                  pageIndex={paged.pageIndex}
                  pageSize={paged.pageSize}
                  totalCount={paged.totalCount}
                  totalPages={paged.totalPages}
                  hasPreviousPage={paged.hasPreviousPage}
                  hasNextPage={paged.hasNextPage}
                  onPageChange={setPageIndex}
                  onPageSizeChange={handlePageSizeChange}
                />
              ) : null
            }
          />
        </motion.div>
      </div>

      <BookingPositionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <BookingPositionFormDialog
        open={!!editBookingPosition}
        onOpenChange={(open) => {
          if (!open) setEditBookingPosition(null);
        }}
        bookingPosition={editBookingPosition}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa vị trí dịch vụ"
        description={`Bạn có chắc muốn xóa vị trí "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
export default BookingPositionListPage;
