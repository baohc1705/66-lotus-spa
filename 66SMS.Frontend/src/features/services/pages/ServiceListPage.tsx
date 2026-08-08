import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Activity, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableSelectionBar } from "@/shared/tables/TableSelectionBar";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { useRowSelection } from "@/shared/hooks/useRowSelection";

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
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

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
    manualPagination: true,
    manualSorting: true,
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
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <ServiceStatCards
        totalServices={totalCount}
        activeServices={activeServiceCount}
        servicesWithImage={servicesWithImage}
        avgDurationMins={avgDurationMins}
        isLoading={isLoading}
      />

      <div className="flex flex-col items-start gap-3 md:flex-row">
        {!isSidebarMode && (
          <ServiceCategorySidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            showDeleted={showDeleted}
          />
        )}

        <div className="w-full min-w-0 flex-1">
          <TablePageShell isFetching={isFetching} isLoading={isLoading}>
            <div className="border-b border-kit px-3 pt-3">
              {selectedCount > 0 && !showDeleted ? (
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
                        variant="danger"
                        size="sm"
                        className="mb-0"
                        onClick={() => setBulkDeleteOpen(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa đã chọn
                      </Button>
                    </PermissionGate>
                  }
                />
              ) : null}

              <DataTableToolbar
                searchValue={filter}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Tìm kiếm dịch vụ..."
              >
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
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
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
                    className="mb-0"
                    onClick={() => handleToggleView(clearSelection)}
                  >
                    {showDeleted ? (
                      <>
                        <ArrowLeft className="h-4 w-4" />
                        {COMMON_MSG.back}
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
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
                pageSize > DEFAULT_LOADING_ROWS
                  ? DEFAULT_LOADING_ROWS
                  : pageSize
              }
              renderExpandedRow={
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
                          className="mb-0"
                          onClick={() => setCreateOpen(true)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Thêm dịch vụ
                        </Button>
                      </PermissionGate>
                    }
                  />
                )
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
