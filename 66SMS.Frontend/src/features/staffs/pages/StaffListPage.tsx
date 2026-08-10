import { useCallback, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import {
  Award,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Scissors,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Dropdown, type DropdownItem } from "@/shared/elements/Dropdown";
import { Checkbox } from "@/shared/forms/Checkbox";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableSelectionBar } from "@/shared/tables/TableSelectionBar";
import {
  DEFAULT_LOADING_ROWS,
  GENDER_MAP,
} from "@/shared/constants/display.const";
import { usePermission } from "@/shared/hooks/usePermission";
import { useRowSelection } from "@/shared/hooks/useRowSelection";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";

import { AssignStaffServiceDialog } from "../components/AssignStaffServiceDialog";
import { StaffCategorySidebar } from "../components/StaffCategorySidebar";
import { StaffDetailExpanded } from "../components/StaffDetailExpanded";
import { StaffFormDialog } from "../components/StaffFormDialog";
import { StaffStatCards } from "../components/StaffStatCards";
import { STAFF_PERM } from "../constants/staff.permissions";
import { useStaffListState } from "../hooks/useStaffListState";
import { useAdminStaffs, useDeleteStaffMutation } from "../hooks/useStaffs";
import type { StaffDto } from "../types/staff.types";

const ENTITY = "nhân viên";

const COLUMN_LABELS = {
  code: "Mã nhân viên",
  fullName: "Nhân viên",
  phone: "Số điện thoại",
  email: "Email",
  gender: "Giới tính",
  contractType: "Loại hợp đồng",
  basicSalary: "Lương",
  status: "Trạng thái",
  createdAt: "Ngày tạo",
};

const STAFF_STATUS_MAP: StatusMap = {
  "0": { label: "Tạm nghỉ", variant: "warning" },
  "1": { label: "Đang làm", variant: "success", dot: true },
  "2": { label: "Nghỉ việc", variant: "error" },
};

export function StaffListPage() {
  "use no memo";

  const perm = STAFF_PERM;
  const navigate = useNavigate();
  const { hasPermission, hasRole } = usePermission();
  const listState = useStaffListState();
  const {
    pageIndex,
    setPageIndex,
    pageSize,
    filter,
    orderBy,
    isDescending,
    columnVisibility,
    setColumnVisibility,
    handleSort,
    handlePageSizeChange,
    handleSearchChange,
    salonId,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    selectedRole,
    setSelectedRole,
  } = listState;

  const {
    data: staffsResult,
    isLoading,
    isFetching,
  } = useAdminStaffs({
    pageIndex,
    pageSize,
    filter: filter || undefined,
    orderBy,
    isDescending,
    salonId,
    role: selectedRole || undefined,
  });

  const deleteMutation = useDeleteStaffMutation();
  const [assignTarget, setAssignTarget] = useState<StaffDto | null>(null);

  const paged = staffsResult?.data;
  const staffs = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  let activeStaffs = 0;
  let inactiveStaffs = 0;
  let salarySum = 0;
  let salaryCount = 0;
  for (const s of staffs) {
    if (s.status === 1) activeStaffs += 1;
    if (s.status === 0) inactiveStaffs += 1;
    if (s.basicSalary != null && s.basicSalary > 0) {
      salarySum += s.basicSalary;
      salaryCount += 1;
    }
  }
  const avgSalary =
    salaryCount === 0 ? 0 : Math.round(salarySum / salaryCount);

  const pageIds = staffs
    .map((e: StaffDto) => e.id)
    .filter((id): id is number => id !== undefined && id !== null);

  const {
    selectedRowIds,
    clearSelection,
    headerChecked,
    toggleAll,
    toggleOne,
    selectedCount,
  } = useRowSelection(pageIds);

  const handleDelete = useCallback(() => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null);
        },
      });
    }
  }, [deleteTarget, deleteMutation, setDeleteTarget]);

  const columns = useMemo(() => {
    const cols: ColumnDef<StaffDto>[] = [
      {
        id: "select",
        header: () => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              className="mb-0"
              checked={headerChecked === true}
              indeterminate={headerChecked === "indeterminate"}
              onChange={(checked: boolean) => toggleAll(checked)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => {
          const staff = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                className="mb-0"
                checked={staff.id != null && selectedRowIds.has(staff.id)}
                onChange={(checked: boolean) => {
                  if (staff.id == null) return;
                  toggleOne(staff.id, checked);
                }}
                aria-label="Select row"
              />
            </div>
          );
        },
        size: 40,
        enableResizing: false,
      },
      {
        accessorKey: "code",
        header: () => (
          <SortableColumnHeader
            label={COLUMN_LABELS.code}
            column="code"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={handleSort}
            onPrimary
          />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" soft>
            {row.original.code ?? "—"}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: "fullName",
        header: () => (
          <SortableColumnHeader
            label={COLUMN_LABELS.fullName}
            column="fullname"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={handleSort}
            onPrimary
          />
        ),
        cell: ({ row }) => {
          const staff = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
                <FallbackImage
                  kind="ktv"
                  src={staff.avatarUrl}
                  alt=""
                  className="h-9 w-9 object-cover"
                />
              </div>
              <span className="max-w-36 truncate font-medium text-kit-heading">
                {staff.fullName ?? "—"}
              </span>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "phone",
        header: COLUMN_LABELS.phone,
        cell: ({ row }) => (
          <span className="text-kit-body">{row.original.phone ?? "—"}</span>
        ),
        size: 110,
      },
      {
        accessorKey: "email",
        header: () => (
          <SortableColumnHeader
            label={COLUMN_LABELS.email}
            column="email"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={handleSort}
            onPrimary
          />
        ),
        cell: ({ row }) => (
          <span className="text-kit-muted">{row.original.email ?? "—"}</span>
        ),
        size: 180,
      },
      {
        accessorKey: "gender",
        header: COLUMN_LABELS.gender,
        cell: ({ row }) => (
          <span className="text-kit-muted">
            {GENDER_MAP[row.original.gender ?? ""] ?? "—"}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: "contractType",
        header: COLUMN_LABELS.contractType,
        cell: ({ row }) => (
          <span className="text-kit-muted">
            {row.original.contractType ?? "—"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "basicSalary",
        header: COLUMN_LABELS.basicSalary,
        cell: ({ row }) => (
          <span className="text-sm font-bold text-kit-primary">
            {formatCurrency(row.original.basicSalary)}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "status",
        header: COLUMN_LABELS.status,
        cell: ({ row }) => (
          <StatusBadge
            status={
              row.original.status != null ? String(row.original.status) : null
            }
            statusMap={STAFF_STATUS_MAP}
          />
        ),
        size: 110,
      },
      {
        accessorKey: "createdAt",
        header: COLUMN_LABELS.createdAt,
        cell: ({ row }) => (
          <span className="text-kit-muted">
            {formatDateTimeDisplay(row.original.createdAt)}
          </span>
        ),
        size: 130,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const staff = row.original;
          const expanded = row.getIsExpanded();
          const items: DropdownItem[] = [
            {
              type: "item",
              label: expanded ? "Đóng chi tiết" : "Xem chi tiết",
              icon: <Eye className="h-4 w-4" />,
              onClick: () => row.toggleExpanded(),
            },
          ];

          if (hasPermission(perm.resource, perm.update)) {
            items.push({
              type: "item",
              label: "Sửa",
              icon: <Pencil className="h-4 w-4" />,
              onClick: () => setEditTarget(staff),
            });
          }
          if (hasPermission(perm.resource, perm.create)) {
            items.push({
              type: "item",
              label: "Phân công dịch vụ",
              icon: <Scissors className="h-4 w-4" />,
              onClick: () => setAssignTarget(staff),
            });
          }
          if (
            hasPermission(perm.resource, perm.create) &&
            (!perm.role || hasRole(perm.role))
          ) {
            items.push({
              type: "item",
              label: "Xem chứng chỉ",
              icon: <Award className="h-4 w-4" />,
              onClick: () =>
                navigate(`/admin/staff-certificates?staffId=${staff.id}`),
            });
          }
          if (
            hasPermission(perm.resource, perm.delete) &&
            (!perm.role || hasRole(perm.role))
          ) {
            items.push({ type: "divider" });
            items.push({
              type: "item",
              label: "Xóa nhân viên",
              icon: <Trash2 className="h-4 w-4" />,
              danger: true,
              onClick: () => setDeleteTarget(staff),
            });
          }

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Dropdown
                variant="outline"
                size="sm"
                className="mb-0! mr-0!"
                menuAlign="right"
                trigger={<MoreHorizontal className="h-4 w-4" />}
                items={items}
              />
            </div>
          );
        },
        size: 80,
        enableResizing: false,
      },
    ];

    return cols;
  }, [
    orderBy,
    isDescending,
    handleSort,
    headerChecked,
    selectedRowIds,
    toggleAll,
    toggleOne,
    setEditTarget,
    setDeleteTarget,
    navigate,
    perm,
    hasPermission,
    hasRole,
  ]);

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data: staffs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
  });

  const { layoutMode } = useOutletContext<{
    layoutMode: "top-nav" | "sidebar";
  }>();
  const isSidebarMode = layoutMode === "sidebar";

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <StaffStatCards
        totalStaffs={totalCount}
        activeStaffs={activeStaffs}
        inactiveStaffs={inactiveStaffs}
        avgSalary={avgSalary}
        isLoading={isLoading}
      />

      <div className="flex flex-col items-start gap-3 md:flex-row">
        {!isSidebarMode && (
          <StaffCategorySidebar
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            salonId={salonId}
          />
        )}

        <div className="w-full min-w-0 flex-1">
          <TablePageShell isFetching={isFetching} isLoading={isLoading}>
            <div className="border-b border-kit px-3 pt-3">
              {selectedCount > 0 ? (
                <TableSelectionBar
                  count={selectedCount}
                  onClear={clearSelection}
                />
              ) : null}

              <DataTableToolbar
                searchValue={filter}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Tìm theo tên, Số điện thoại, email, mã NV..."
              >
                <DataTableViewOptions
                  table={table}
                  columnLabels={COLUMN_LABELS}
                />

                <PermissionGate
                  resource={perm.resource}
                  action={perm.create}
                  role={perm.role}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm nhân viên
                  </Button>
                </PermissionGate>
              </DataTableToolbar>
            </div>

            <DataTable
              table={table}
              isLoading={isLoading}
              loadingRows={
                pageSize > DEFAULT_LOADING_ROWS
                  ? DEFAULT_LOADING_ROWS
                  : pageSize
              }
              renderExpandedRow={({ row }: { row: Row<StaffDto> }) =>
                row.original.id ? (
                  <StaffDetailExpanded
                    staffId={row.original.id}
                    onEdit={setEditTarget}
                    onAssignService={setAssignTarget}
                  />
                ) : null
              }
              emptyState={
                <TableEmptyState
                  icon={Users}
                  title="Chưa có nhân viên"
                  action={
                    <PermissionGate
                      resource={perm.resource}
                      action={perm.create}
                      role={perm.role}
                    >
                      <Button
                        variant="admin"
                        size="sm"
                        className="mb-0"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm nhân viên
                      </Button>
                    </PermissionGate>
                  }
                />
              }
              pagination={
                paged && totalCount > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-kit-muted">
                      <span>
                        {rangeStart}-{rangeEnd} / {totalCount}
                      </span>
                      <select
                        value={pageSize}
                        onChange={(e) =>
                          handlePageSizeChange(Number(e.target.value))
                        }
                        className="h-8 cursor-pointer rounded border border-kit bg-kit-white px-2 text-xs text-kit-heading outline-none focus:border-kit-primary"
                      >
                        {[5, 10, 20].map((size: number) => (
                          <option key={size} value={size}>
                            {size} / trang
                          </option>
                        ))}
                      </select>
                    </div>
                    <Pagination
                      page={safePage}
                      pageCount={totalPages}
                      onPageChange={setPageIndex}
                      size="sm"
                    />
                  </div>
                ) : null
              }
            />
          </TablePageShell>
        </div>
      </div>

      <StaffFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <StaffFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        staff={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={`Xóa ${ENTITY}`}
        description={`Bạn có chắc muốn xóa ${ENTITY} "${deleteTarget?.fullName ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />

      <AssignStaffServiceDialog
        open={!!assignTarget}
        onOpenChange={(open) => {
          if (!open) setAssignTarget(null);
        }}
        staff={assignTarget}
      />
    </div>
  );
}
