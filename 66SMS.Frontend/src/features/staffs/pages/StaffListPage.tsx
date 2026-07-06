import { useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useOutletContext } from "react-router-dom";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { TableSelectionBar } from "@/shared/components/DataTable/TableSelectionBar";
import { containerVariants } from "@/shared/motion/pageVariants";

import { StaffFormDialog } from "../components/StaffFormDialog";
import { StaffDetailExpanded } from "../components/StaffDetailExpanded";
import { StaffStatCards } from "../components/StaffStatCards";
import { StaffCategorySidebar } from "../components/StaffCategorySidebar";
import { useDeleteStaffMutation, useAdminStaffs } from "../hooks/useStaffs";
import { useStaffListState } from "../hooks/useStaffListState";
import { useActiveStaffColumns, STAFF_COLUMN_LABELS } from "../components/useActiveStaffColumns";
import { useRowSelection } from "@/shared/hooks/useRowSelection";
import { STAFF_PERM } from "../constants/staff.permissions";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type { StaffDto } from "../types/staff.types";

const ENTITY = "nhân viên";

export function StaffListPage() {
  const perm = STAFF_PERM;
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

  const paged = staffsResult?.data;
  const staffs = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  // Stat card calculations
  const activeStaffs = useMemo(
    () => staffs.filter((s: StaffDto) => s.status === "1").length,
    [staffs],
  );

  const inactiveStaffs = useMemo(
    () => staffs.filter((s: StaffDto) => s.status === "0").length,
    [staffs],
  );

  const avgSalary = useMemo(() => {
    const withSalary = staffs.filter(
      (s: StaffDto) => s.basicSalary != null && s.basicSalary > 0,
    );
    if (withSalary.length === 0) return 0;
    const total = withSalary.reduce(
      (sum: number, s: StaffDto) => sum + (s.basicSalary ?? 0),
      0,
    );
    return Math.round(total / withSalary.length);
  }, [staffs]);

  const pageIds = useMemo(
    () =>
      staffs.map((e) => e.id).filter((id): id is number => id !== undefined && id !== null),
    [staffs],
  );

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

  const columns = useActiveStaffColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    headerChecked,
    selectedRowIds,
    onToggleAll: toggleAll,
    onToggleOne: toggleOne,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  const columnLabels = useMemo(() => ({ ...STAFF_COLUMN_LABELS }), []);

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
  });

  const { layoutMode } = useOutletContext<{
    layoutMode: "top-nav" | "sidebar";
  }>();
  const isSidebarMode = layoutMode === "sidebar";

  return (
    <div className="flex h-full overflow-hidden gap-2">
      {/* Sidebar danh mục vai trò */}
      {!isSidebarMode && (
        <StaffCategorySidebar
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          salonId={salonId}
        />
      )}

      {/* Right: Stats + Table */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        {/* Stats row */}
        <div className="shrink-0">
          <StaffStatCards
            totalStaffs={totalCount}
            activeStaffs={activeStaffs}
            inactiveStaffs={inactiveStaffs}
            avgSalary={avgSalary}
            isLoading={isLoading}
          />
        </div>

        {/* Table card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lotus-admin-table-page-card flex-1 min-h-0 flex flex-col overflow-hidden relative"
        >
          {/* Fetching bar */}
          {isFetching && !isLoading && (
            <div className="lotus-admin-table-fetch-bar">
              <div className="lotus-admin-table-fetch-bar-inner" />
            </div>
          )}

          {/* Toolbar */}
          <div className="px-4 pt-3 shrink-0">
            <DataTableToolbar
              searchValue={filter}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Tìm theo tên, SĐT, email, mã NV..."
            >
              {selectedCount > 0 && (
                <TableSelectionBar
                  count={selectedCount}
                  onClear={clearSelection}
                />
              )}

              <DataTableViewOptions
                table={table}
                columnLabels={columnLabels}
              />

              <PermissionGate resource={perm.resource} action={perm.create} role={perm.role}>
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="lotus-admin-table-toolbar-btn"
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
                  onEdit={setEditTarget}
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
                  <p className="text-lotus-admin-md text-lotus-stone mt-0.5">
                    Thêm nhân viên mới để bắt đầu quản lý.
                  </p>
                </div>
                <PermissionGate resource={perm.resource} action={perm.create} role={perm.role}>
                  <Button
                    variant="admin"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="mt-1 text-lotus-admin-md"
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
        </motion.div>
      </div>

      {/* Dialogs */}
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
        title={CONFIRM_MSG.deleteTitle(ENTITY)}
        description={CONFIRM_MSG.deleteDescription(ENTITY, deleteTarget?.fullName ?? "")}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
