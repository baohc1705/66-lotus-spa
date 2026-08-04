import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Activity, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { TableSelectionBar } from "@/shared/components/DataTable/TableSelectionBar";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/components/ui/button";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { useRowSelection } from "@/shared/hooks/useRowSelection";
import { containerVariants } from "@/shared/motion/pageVariants";

import { ServiceCategorySidebar } from "../components/ServiceCategorySidebar";
import { ServiceDetailExpanded } from "../components/ServiceDetailExpanded";
import { ServiceFormDialog } from "../components/ServiceFormDialog";
import { ServiceStatCards } from "../components/ServiceStatCards";
import {
  SERVICE_COLUMN_LABELS,
  useActiveServiceColumns,
} from "../components/useActiveServiceColumns";
import { useDeletedServiceColumns } from "../components/useDeletedServiceColumns";
import { SERVICE_PERM } from "../constants/service.permissions";
import { useServiceListState } from "../hooks/useServiceListState";
import {
  useAdminServices,
  useDeletedServices,
  useDeleteService,
  useDeleteServiceMultiples,
  useRestoreService,
  useUpdateService,
} from "../hooks/useServices";
import type { ServiceDto } from "../types/service.types";

const ENTITY = "dịch vụ";
const ENTITY_SUBJECT = "Dịch vụ";

export function ServiceListPage() {
  const perm = SERVICE_PERM;

  const listState = useServiceListState();
  const {
    queryParams,
    showDeleted,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    restoreTarget,
    setRestoreTarget,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    handleToggleView,
    pageIndex,
    setPageIndex,
    pageSize,
    columnVisibility,
    setColumnVisibility,
    orderBy,
    isDescending,
    handleSort,
    handlePageSizeChange,
    handleSearchChange,
    filter,
    selectedCategoryId,
    setSelectedCategoryId,
  } = listState;

  const activeQuery = useAdminServices(
    { ...queryParams, categoryId: selectedCategoryId ?? undefined },
    !showDeleted,
  );
  const deletedQuery = useDeletedServices(
    { ...queryParams, categoryId: selectedCategoryId ?? undefined },
    showDeleted,
  );

  const serviceResult = showDeleted ? deletedQuery.data : activeQuery.data;
  const isLoading = showDeleted
    ? deletedQuery.isLoading
    : activeQuery.isLoading;
  const isFetching = showDeleted
    ? deletedQuery.isFetching
    : activeQuery.isFetching;

  const paged = serviceResult?.data;
  const services = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const activeServiceCount = useMemo(
    () =>
      services.filter((s: ServiceDto) => s.status === StatusActive.Active)
        .length,
    [services],
  );

  const servicesWithImage = useMemo(
    () => services.filter((s: ServiceDto) => !!s.imageUrl).length,
    [services],
  );

  const avgDurationMins = useMemo(() => {
    const withDuration = services.filter(
      (s: ServiceDto) => (s.durationMins ?? 0) > 0,
    );
    if (withDuration.length === 0) return 0;
    const total = withDuration.reduce(
      (sum: number, s: ServiceDto) => sum + (s.durationMins ?? 0),
      0,
    );
    return Math.round(total / withDuration.length);
  }, [services]);

  const pageIds = useMemo(
    () =>
      services
        .map((s: ServiceDto) => s.id)
        .filter((id): id is number => id !== undefined),
    [services],
  );

  const {
    selectedRowIds,
    clearSelection,
    headerChecked,
    toggleAll,
    toggleOne,
    selectedCount,
  } = useRowSelection(pageIds);

  const deleteMutation = useDeleteService();
  const deleteMultiplesMutation = useDeleteServiceMultiples();
  const updateMutation = useUpdateService();
  const restoreMutation = useRestoreService();

  const activeColumns = useActiveServiceColumns({
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
    updateMutation,
  });

  const deletedColumns = useDeletedServiceColumns({
    pageIndex,
    pageSize,
    onRestore: setRestoreTarget,
  });

  const columns = showDeleted ? deletedColumns : activeColumns;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: services,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(!showDeleted && {
      getExpandedRowModel: getExpandedRowModel(),
      getRowCanExpand: () => true,
    }),
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleDelete = useCallback(() => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteMutation, setDeleteTarget]);

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedRowIds);
    if (ids.length === 0) return;
    deleteMultiplesMutation.mutate(ids, {
      onSuccess: (result) => {
        if (result.isSuccess) {
          setBulkDeleteOpen(false);
          clearSelection();
        }
      },
    });
  }, [
    selectedRowIds,
    deleteMultiplesMutation,
    setBulkDeleteOpen,
    clearSelection,
  ]);

  const handleRestore = useCallback(() => {
    if (!restoreTarget?.id) return;
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setRestoreTarget(null);
      },
    });
  }, [restoreTarget, restoreMutation, setRestoreTarget]);

  const columnLabels = useMemo(() => ({ ...SERVICE_COLUMN_LABELS }), []);

  const { layoutMode } = useOutletContext<{
    layoutMode: "top-nav" | "sidebar";
  }>();
  const isSidebarMode = layoutMode === "sidebar";

  return (
    <div className="flex h-full overflow-hidden gap-2">
      {!isSidebarMode && (
        <ServiceCategorySidebar
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          showDeleted={showDeleted}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        <div className="shrink-0">
          <ServiceStatCards
            totalServices={totalCount}
            activeServices={activeServiceCount}
            servicesWithImage={servicesWithImage}
            avgDurationMins={avgDurationMins}
            isLoading={isLoading}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lotus-admin-table-page-card flex-1 min-h-0 flex flex-col overflow-hidden relative"
        >
          {isFetching && !isLoading && (
            <div className="lotus-admin-table-fetch-bar">
              <div className="lotus-admin-table-fetch-bar-inner" />
            </div>
          )}

          <div className="px-4 pt-3 shrink-0">
            <DataTableToolbar
              searchValue={filter}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Tìm kiếm dịch vụ..."
            >
              {selectedCount > 0 && !showDeleted && (
                <TableSelectionBar
                  count={selectedCount}
                  onClear={clearSelection}
                  actions={
                    <PermissionGate
                      resource={perm.resource}
                      action={perm.delete}
                      role={perm.role}
                    >
                      <Button
                        variant="destructive"
                        size="sm"
                        className="lotus-admin-btn-toolbar"
                        onClick={() => setBulkDeleteOpen(true)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa đã chọn
                      </Button>
                    </PermissionGate>
                  }
                />
              )}

              {!showDeleted && (
                <DataTableViewOptions
                  table={table}
                  columnLabels={columnLabels}
                />
              )}

              <PermissionGate
                resource={perm.resource}
                action={perm.create}
                role={perm.role}
              >
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="lotus-admin-table-toolbar-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm dịch vụ
                </Button>
              </PermissionGate>

              <PermissionGate
                resource={perm.resource}
                action={perm.read}
                role={perm.role}
              >
                <Button
                  variant="admin"
                  size="sm"
                  className="lotus-admin-table-toolbar-btn"
                  onClick={() => handleToggleView(clearSelection)}
                  title={showDeleted ? "Quay lại danh sách" : "Dịch vụ đã xóa"}
                >
                  {showDeleted ? (
                    <>
                      <ArrowLeft className="w-4 h-4" />
                      {COMMON_MSG.back}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {COMMON_MSG.restore}
                    </>
                  )}
                </Button>
              </PermissionGate>
            </DataTableToolbar>
          </div>

          <DataTable
            table={table}
            isLoading={isLoading}
            loadingRows={
              pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize
            }
            onRowClick={showDeleted ? undefined : (row) => row.toggleExpanded()}
            renderSubComponent={
              showDeleted
                ? undefined
                : ({ row }) =>
                    row.original.id ? (
                      <ServiceDetailExpanded
                        serviceId={row.original.id}
                        onEdit={(service) => setEditTarget(service)}
                      />
                    ) : null
            }
            emptyState={
              showDeleted ? (
                <TableEmptyState
                  icon={Trash2}
                  title="Không có dịch vụ đã xóa"
                  hint="Các dịch vụ bị xóa sẽ hiển thị tại đây."
                />
              ) : (
                <TableEmptyState
                  icon={Activity}
                  title="Chưa có dịch vụ"
                  hint="Thêm dịch vụ mới để bắt đầu quản lý."
                  action={
                    <PermissionGate
                      resource={perm.resource}
                      action={perm.create}
                      role={perm.role}
                    >
                      <Button
                        variant="admin"
                        size="sm"
                        onClick={() => setCreateOpen(true)}
                        className="mt-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm dịch vụ
                      </Button>
                    </PermissionGate>
                  }
                />
              )
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

      <ServiceFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ServiceFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        service={editTarget}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title={CONFIRM_MSG.bulkDeleteTitle(ENTITY)}
        description={CONFIRM_MSG.bulkDeleteDescription(selectedCount, ENTITY)}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMultiplesMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={CONFIRM_MSG.deleteTitle(ENTITY)}
        description={CONFIRM_MSG.deleteDescription(
          ENTITY,
          deleteTarget?.name ?? "",
        )}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        onConfirm={handleRestore}
        title={CONFIRM_MSG.restoreTitle(ENTITY_SUBJECT)}
        description={CONFIRM_MSG.restoreDescription(
          ENTITY_SUBJECT,
          restoreTarget?.name ?? "",
        )}
        confirmLabel={COMMON_MSG.restore}
        loading={restoreMutation.isPending}
        variant="default"
      />
    </div>
  );
}
