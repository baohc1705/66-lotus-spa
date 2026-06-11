import { useState, useCallback, useMemo } from "react";
import { motion, type Variants } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2, Clock, Eye } from "lucide-react";
import { formatDate } from "@/shared/utils/date.utils";

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
//import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";

import { ShiftFormDialog } from "../components/ShiftFormDialog";
import { ShiftDetailExpanded } from "../components/ShiftDetailExpanded";
import { useShifts, useDeleteShift } from "../hooks/useShifts";
import type { ShiftDTO } from "../types/shift.types";

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

export function ShiftListPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [editShift, setEditShift] = useState<ShiftDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShiftDTO | null>(null);

  const {
    data: shiftResult,
    isLoading,
    isFetching,
  } = useShifts({
    pageIndex,
    pageSize,
    filter: filter || undefined,
  });

  const deleteMutation = useDeleteShift();

  const paged = shiftResult?.data;
  const shifts = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

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

  const columns = useMemo<ColumnDef<ShiftDTO>[]>(
    () => [
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
        header: "Tên ca",
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {row.original.name ?? "—"}
          </span>
        ),
        size: 150,
      },
      {
        id: "time",
        header: "Giờ làm việc",
        cell: ({ row }) => {
          const currentPeriod = row.original.shiftPeriodDTOs?.[0];
          if (!currentPeriod) return "—";
          return (
            <div className="flex items-center gap-1.5 text-lotus-deep/90">
              <Clock className="w-4 h-4 text-lotus-stone" />
              <span>
                {currentPeriod.shiftStart?.substring(0, 5)} -{" "}
                {currentPeriod.shiftEnd?.substring(0, 5)}
              </span>
            </div>
          );
        },
        size: 200,
      },
      {
        id: "effective",
        header: "Hiệu lực",
        cell: ({ row }) => {
          const currentPeriod = row.original.shiftPeriodDTOs?.[0];
          if (!currentPeriod) return "—";
          const from = formatDate(currentPeriod.effectiveFrom).format(
            "DD/MM/YYYY",
          );
          const to = currentPeriod.effectiveTo
            ? formatDate(currentPeriod.effectiveTo).format("DD/MM/YYYY")
            : "Vô thời hạn";
          return (
            <span className="text-lotus-deep/80 text-[13px]">
              {from} - {to}
            </span>
          );
        },
        size: 250,
      },
      {
        accessorKey: "description",
        header: "Mô tả",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80 truncate max-w-[200px] inline-block">
            {row.original.description || "—"}
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
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  {/* Admin only */}
                  <DropdownMenuItem onClick={() => setEditShift(item)}>
                    <Pencil className="w-4 h-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa ca
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize],
  );

  const table = useReactTable({
    data: shifts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
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
            searchPlaceholder="Tìm kiếm ca..."
          >
            <DataTableViewOptions
              table={table}
              columnLabels={{
                name: "Tên ca",
                time: "Giờ làm việc",
                effective: "Hiệu lực",
                description: "Mô tả",
              }}
            />

            <Button
              variant="admin"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="text-[12px] gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm ca
            </Button>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          onRowClick={(row) => row.toggleExpanded()}
          renderSubComponent={({ row }) => (
            <ShiftDetailExpanded shift={row.original} />
          )}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Clock className="w-7 h-7 text-lotus-stone" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">
                  Chưa có ca làm việc
                </p>
                <p className="text-[12px] text-lotus-stone mt-0.5">
                  Thêm ca làm việc mới để bắt đầu phân lịch.
                </p>
              </div>
              <Button
                variant="admin"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="mt-1 text-[12px]"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm ca
              </Button>
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

      <ShiftFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ShiftFormDialog
        open={!!editShift}
        onOpenChange={(open) => {
          if (!open) setEditShift(null);
        }}
        shift={editShift}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa ca làm việc"
        description={`Bạn có chắc muốn xóa ca "${
          deleteTarget?.name ?? ""
        }"? Tất cả lịch làm việc liên quan có thể bị ảnh hưởng.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  );
}
