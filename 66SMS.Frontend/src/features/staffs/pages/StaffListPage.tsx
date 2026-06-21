import { useState, useCallback, useMemo } from "react";
import { motion, type Variants } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  Users,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { StaffFormDialog } from "../components/StaffFormDialog";
import { StaffDetailExpanded } from "../components/StaffDetailExpanded";
import { useStaffs, useDeleteStaff } from "../hooks/useStaffs";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { StaffDto } from "../types/staff.types";
import { formatDate } from "@/shared/utils/date.utils";

// ---- Constants ----

const STAFF_STATUS_MAP: StatusMap = {
  "0": { label: "Nghỉ việc", variant: "error" },
  "1": { label: "Đang làm", variant: "success", dot: true },
  "2": { label: "Tạm nghỉ", variant: "warning" },
};

const GENDER_MAP: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
};

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

// ---- Page Component ----

export function StaffListPage() {
  // Table state
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffDto | null>(null);

  // Selection state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  // Data fetching
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const [prevSalonId, setPrevSalonId] = useState(salonId);
  if (salonId !== prevSalonId) {
    setPageIndex(1);
    setPrevSalonId(salonId);
  }

  const {
    data: staffsResult,
    isLoading,
    isFetching,
  } = useStaffs({
    pageIndex,
    pageSize,
    filter: filter || undefined,
    orderBy,
    isDescending,
    salonId,
  });
  const deleteMutation = useDeleteStaff();

  const paged = staffsResult?.data;
  const staffs = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  // Selection logic
  const currentPageIds = useMemo(
    () =>
      staffs.map((e) => e.id).filter((id): id is number => id !== undefined),
    [staffs],
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

  // Handlers
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

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("vi-VN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Render sort icon
  const SortIcon = useCallback(
    ({ column }: { column: string }) => {
      if (orderBy !== column)
        return <ArrowUpDown className="w-3 h-3 opacity-40" />;
      return isDescending ? (
        <ArrowDown className="w-3 h-3 text-lotus-leaf" />
      ) : (
        <ArrowUp className="w-3 h-3 text-lotus-leaf" />
      );
    },
    [orderBy, isDescending],
  );

  // --- React Table Definition ---
  const columns = useMemo<ColumnDef<StaffDto>[]>(
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
          const staff = row.original;
          return (
            <Checkbox
              checked={staff.id !== undefined && selectedRowIds.has(staff.id)}
              onCheckedChange={(checked) => {
                if (staff.id === undefined) return;
                const newSet = new Set(selectedRowIds);
                if (checked) newSet.add(staff.id);
                else newSet.delete(staff.id);
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
        accessorKey: "code",
        header: () => (
          <button
            onClick={() => handleSort("code")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
          >
            Mã NV <SortIcon column="code" />
          </button>
        ),
        cell: ({ row }) => (
          <Badge variant="outline" size="sm" className="text-[10px] font-mono">
            {row.original.code ?? "—"}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: "fullName",
        header: () => (
          <button
            onClick={() => handleSort("fullname")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
          >
            Nhân viên <SortIcon column="fullname" />
          </button>
        ),
        cell: ({ row }) => {
          const staff = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-lotus-leaf/10 flex items-center justify-center shrink-0 overflow-hidden">
                {staff.avatarUrl ? (
                  <img
                    src={staff.avatarUrl}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-lotus-leaf">
                    {(staff.fullName ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-semibold text-lotus-deep truncate max-w-[140px]">
                {staff.fullName ?? "—"}
              </span>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "phone",
        header: "SĐT",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80">
            {row.original.phone ?? "—"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "email",
        header: () => (
          <button
            onClick={() => handleSort("email")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
          >
            Email <SortIcon column="email" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
            {row.original.email ?? "—"}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "gender",
        header: "Giới tính",
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
            {GENDER_MAP[row.original.gender ?? ""] ?? "—"}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: "contractType",
        header: "Loại HĐ",
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
            {row.original.contractType ?? "—"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "basicSalary",
        header: "Lương",
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {formatCurrency(row.original.basicSalary)}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
            {row.original.createdAt
              ? formatDate(row.original.createdAt).format("DD/MM/YYYY")
              : "—"}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            statusMap={STAFF_STATUS_MAP}
          />
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const staff = row.original;
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
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  <PermissionGate resource="staffs" action="update">
                    <DropdownMenuItem onClick={() => setEditStaff(staff)}>
                      <Pencil className="w-4 h-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate
                    resource="staffs"
                    action="delete"
                    role="admin"
                  >
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTarget(staff)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa nhân viên
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
      handleSort,
      SortIcon,
    ],
  );

  const table = useReactTable({
    data: staffs,
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
      {/* Main Table Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden"
      >
        {/* Toolbar */}
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tên, SĐT, email, mã NV..."
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

            {/* Cài đặt hiển thị cột */}
            <DataTableViewOptions
              table={table}
              columnLabels={{
                fullName: "Nhân viên",
                code: "Mã NV",
                phone: "SĐT",
                contractType: "Loại HĐ",
                basicSalary: "Lương",
                gender: "Giới tính",
                createdAt: "Ngày tạo",
                status: "Trạng thái",
                email: "Email",
              }}
            />

            <PermissionGate resource="staffs" action="create" role="admin">
              <Button
                variant="admin"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="text-[12px] gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm NV
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        {/* Table */}
        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          onRowClick={(row) => row.toggleExpanded()}
          renderSubComponent={({ row }) =>
            row.original.id ? (
              <StaffDetailExpanded
                staffId={row.original.id}
                onEdit={(staff) => setEditStaff(staff)}
              />
            ) : null
          }
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Users className="w-7 h-7 text-lotus-stone" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">
                  Chưa có nhân viên
                </p>
                <p className="text-[12px] text-lotus-stone mt-0.5">
                  Thêm nhân viên mới để bắt đầu quản lý.
                </p>
              </div>
              <PermissionGate resource="staffs" action="create" role="admin">
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="mt-1 text-[12px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm nhân viên
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

        {/* Fetch indicator */}
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-lotus-leaf/30 overflow-hidden">
            <div className="h-full w-1/3 bg-lotus-leaf animate-[slide_1s_ease-in-out_infinite]" />
          </div>
        )}
      </motion.div>

      {/* ---- Dialogs & Drawers ---- */}

      {/* Create Dialog */}
      <StaffFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit Dialog */}
      <StaffFormDialog
        open={!!editStaff}
        onOpenChange={(open) => {
          if (!open) setEditStaff(null);
        }}
        staff={editStaff}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa nhân viên"
        description={`Bạn có chắc muốn xóa nhân viên "${deleteTarget?.fullName ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  );
}
