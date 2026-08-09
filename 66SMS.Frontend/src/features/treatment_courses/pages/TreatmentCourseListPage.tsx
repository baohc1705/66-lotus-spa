import { useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
} from "@tanstack/react-table";
import { Plus, Trash2, ArrowLeft, History } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TableSelectionBar } from "@/shared/tables/TableSelectionBar";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { useRowSelection } from "@/shared/hooks/useRowSelection";

import { TreatmentCourseFormDialog } from "../components/TreatmentCourseFormDialog";
import { TreatmentCourseDetailExpanded } from "../components/TreatmentCourseDetailExpanded";
import {
  useActiveTreatmentCourseColumns,
  TREATMENT_COURSE_COLUMN_LABELS,
} from "../components/useActiveTreatmentCourseColumns";
import { useDeletedTreatmentCourseColumns } from "../components/useDeletedTreatmentCourseColumns";
import { TREATMENT_COURSE_PERM } from "../constants/treatmentCourse.permissions";
import {
  useAdminTreatmentCourses,
  useDeletedTreatmentCourses,
  useDeleteTreatmentCourse,
  useDeleteTreatmentCourseMultiples,
  useUpdateTreatmentCourse,
  useRestoreTreatmentCourse,
} from "../hooks/useTreatmentCourses";
import { useTreatmentCourseListState } from "../hooks/useTreatmentCourseListState";
import type { TreatmentCourseDto } from "../types/treatmentCourse.types";

const ENTITY = "liệu trình";
const ENTITY_SUBJECT = "Liệu trình";

export function TreatmentCourseListPage() {
  const perm = TREATMENT_COURSE_PERM;

  const listState = useTreatmentCourseListState();
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
  } = listState;

  const activeQuery = useAdminTreatmentCourses(queryParams, !showDeleted);
  const deletedQuery = useDeletedTreatmentCourses(queryParams, showDeleted);

  const courseResult = showDeleted ? deletedQuery.data : activeQuery.data;
  const isLoading = showDeleted
    ? deletedQuery.isLoading
    : activeQuery.isLoading;
  const isFetching = showDeleted
    ? deletedQuery.isFetching
    : activeQuery.isFetching;

  const paged = courseResult?.data;
  const courses = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const pageIds: number[] = [];
  for (let index = 0; index < courses.length; index++) {
    const id = courses[index].id;
    if (id === null || id === undefined) continue;
    pageIds.push(id);
  }

  const {
    selectedRowIds,
    clearSelection,
    headerChecked,
    toggleAll,
    toggleOne,
    selectedCount,
  } = useRowSelection(pageIds);

  const deleteMutation = useDeleteTreatmentCourse();
  const deleteMultiplesMutation = useDeleteTreatmentCourseMultiples();
  const updateMutation = useUpdateTreatmentCourse();
  const restoreMutation = useRestoreTreatmentCourse();

  const activeColumns = useActiveTreatmentCourseColumns({
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

  const deletedColumns = useDeletedTreatmentCourseColumns({
    pageIndex,
    pageSize,
    onRestore: setRestoreTarget,
  });

  const columns = showDeleted ? deletedColumns : activeColumns;

  const table = useReactTable({
    data: courses,
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

  const columnLabels = useMemo(
    () => ({ ...TREATMENT_COURSE_COLUMN_LABELS }),
    [],
  );

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
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
            searchPlaceholder="Tìm theo tên, mã liệu trình..."
          >
            {!showDeleted && (
              <DataTableViewOptions table={table} columnLabels={columnLabels} />
            )}

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
                Thêm liệu trình
              </Button>
            </PermissionGate>

            <PermissionGate
              resource={perm.resource}
              action={perm.read}
              role={perm.role}
            >
              <Button
                variant="secondary"
                size="sm"
                className="mb-0"
                onClick={() => handleToggleView(clearSelection)}
              >
                {showDeleted ? (
                  <>
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Khôi phục
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
          renderExpandedRow={
            showDeleted
              ? undefined
              : ({ row }: { row: Row<TreatmentCourseDto> }) =>
                  row.original.id ? (
                    <TreatmentCourseDetailExpanded
                      courseId={row.original.id}
                      onEdit={(course) => setEditTarget(course)}
                    />
                  ) : null
          }
          emptyState={
            showDeleted ? (
              <TableEmptyState
                icon={Trash2}
                title="Không có liệu trình đã xóa"
              />
            ) : (
              <TableEmptyState
                icon={History}
                title="Chưa có liệu trình"
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
                      Thêm liệu trình
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

      <TreatmentCourseFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <TreatmentCourseFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        course={editTarget}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title={`Xóa ${ENTITY} đã chọn`}
        description={`Bạn có chắc muốn xóa ${selectedCount} ${ENTITY} đã chọn?`}
        confirmLabel="Xóa"
        loading={deleteMultiplesMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={`Xóa ${ENTITY}`}
        description={`Bạn có chắc muốn xóa ${ENTITY} "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        onConfirm={handleRestore}
        title={`Khôi phục ${ENTITY_SUBJECT}`}
        description={`Bạn có chắc muốn khôi phục ${ENTITY_SUBJECT} "${restoreTarget?.name ?? ""}"? ${ENTITY_SUBJECT} sẽ hiển thị lại trong danh sách chính.`}
        confirmLabel="Khôi phục"
        loading={restoreMutation.isPending}
        variant="default"
      />
    </div>
  );
}
