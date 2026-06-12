import { useState, useCallback, useMemo } from "react";
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
  X,
  Clock,
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

import { TimeSlotFormDialog } from "../components/TimeSlotFormDialog";
import {
  useTimeSlots,
  useDeleteTimeSlot,
} from "../hooks/useTimeSlots";
import type { TimeSlotDTO } from "../types/time_slot.types";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

export function TimeSlotListPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [editTimeSlot, setEditTimeSlot] = useState<TimeSlotDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimeSlotDTO | null>(null);

  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  const {
    data: timeSlotResult,
    isLoading,
    isFetching,
  } = useTimeSlots({
    pageIndex,
    pageSize,
    filter: filter || undefined,
    orderBy,
    isDescending,
  });
  
  const deleteMutation = useDeleteTimeSlot();

  const paged = timeSlotResult?.data;
  const timeSlots = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const currentPageIds = useMemo(
    () => timeSlots.map((c) => c.id).filter((id): id is number => id !== undefined),
    [timeSlots],
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

  const formatDisplayTime = (t?: string) => {
    if (!t) return "—";
    const parts = t.split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return t;
  };

  const columns = useMemo<ColumnDef<TimeSlotDTO>[]>(
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
        accessorKey: "startTime",
        header: () => (
          <button
            onClick={() => handleSort("startTime")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
          >
            Giờ bắt đầu <SortIcon column="startTime" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {formatDisplayTime(row.original.startTime)}
          </span>
        ),
        size: 200,
      },
      {
        accessorKey: "endTime",
        header: () => (
          <button
            onClick={() => handleSort("endTime")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
          >
            Giờ kết thúc <SortIcon column="endTime" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {formatDisplayTime(row.original.endTime)}
          </span>
        ),
        size: 200,
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
                  <PermissionGate resource="time_slots" action="update">
                    <DropdownMenuItem
                      onClick={() => setEditTimeSlot(item)}
                    >
                      <Pencil className="w-4 h-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate
                    resource="time_slots"
                    action="delete"
                    role="admin"
                  >
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa khung giờ
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
    ],
  );

  const table = useReactTable({
    data: timeSlots,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      <motion.div
        variants={itemVariants}
        className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden"
      >
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm kiếm khung giờ..."
          >
            {selectedRowIds.size > 0 && (
              <div className="flex items-center gap-2 mr-auto text-[13px] text-lotus-deep font-medium bg-lotus-cream/50 px-3 py-1.5 rounded-lg border border-stone-200/50">
                <span>Đã chọn {selectedRowIds.size}</span>
                <button
                  onClick={() => setSelectedRowIds(new Set())}
                  className="text-lotus-stone hover:text-lotus-deep ml-1 transition-colors"
                  title="Bỏ chọn tất cả"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <DataTableViewOptions
              table={table}
              columnLabels={{
                startTime: "Giờ bắt đầu",
                endTime: "Giờ kết thúc",
              }}
            />

            <PermissionGate
              resource="time_slots"
              action="create"
              role="admin"
            >
              <Button
                variant="admin"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="text-[12px] gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm khung giờ
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Clock className="w-7 h-7 text-lotus-stone" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">
                  Chưa có khung giờ
                </p>
                <p className="text-[12px] text-lotus-stone mt-0.5">
                  Thêm khung giờ mới để khách hàng chọn lịch.
                </p>
              </div>
              <PermissionGate
                resource="time_slots"
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
                  Thêm khung giờ
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

        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-lotus-leaf/30 overflow-hidden">
            <div className="h-full w-1/3 bg-lotus-leaf animate-[slide_1s_ease-in-out_infinite]" />
          </div>
        )}
      </motion.div>

      <TimeSlotFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <TimeSlotFormDialog
        open={!!editTimeSlot}
        onOpenChange={(open) => {
          if (!open) setEditTimeSlot(null);
        }}
        timeSlot={editTimeSlot}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa khung giờ"
        description={`Bạn có chắc muốn xóa khung giờ "${formatDisplayTime(deleteTarget?.startTime)} - ${formatDisplayTime(deleteTarget?.endTime)}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  );
}
