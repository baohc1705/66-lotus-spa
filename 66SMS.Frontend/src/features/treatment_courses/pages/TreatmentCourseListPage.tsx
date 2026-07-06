import { useCallback, useMemo } from "react";
import { useReactTable, getCoreRowModel, getExpandedRowModel } from "@tanstack/react-table";
import { Plus, Trash2, ArrowLeft, History } from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { TableSelectionBar } from "@/shared/components/DataTable/TableSelectionBar";
import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

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
import { useRowSelection } from "@/shared/hooks/useRowSelection";
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
  const isLoading = showDeleted ? deletedQuery.isLoading : activeQuery.isLoading;
  const isFetching = showDeleted ? deletedQuery.isFetching : activeQuery.isFetching;

  const paged = courseResult?.data;
  const courses = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const pageIds = useMemo(
    () =>
      courses
        .map((c: TreatmentCourseDto) => c.id)
        .filter((id): id is number => id !== null && id !== undefined),
    [courses],
  );

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
  }, [selectedRowIds, deleteMultiplesMutation, setBulkDeleteOpen, clearSelection]);

  const handleRestore = useCallback(() => {
    if (!restoreTarget?.id) return;
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setRestoreTarget(null);
      },
    });
  }, [restoreTarget, restoreMutation, setRestoreTarget]);

  const columnLabels = useMemo(() => ({ ...TREATMENT_COURSE_COLUMN_LABELS }), []);

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="px-4 pt-4">
        <DataTableToolbar
          searchValue={filter}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm theo tên, mã liệu trình..."
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
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
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
              Thêm liệu trình
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
              title={showDeleted ? "Quay lại danh sách" : "Liệu trình đã xóa"}
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
              hint="Các liệu trình bị xóa sẽ hiển thị tại đây."
            />
          ) : (
            <TableEmptyState
              icon={History}
              title="Chưa có liệu trình"
              hint="Thêm liệu trình mới để bắt đầu quản lý."
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
                    className="mt-1 text-lotus-admin-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm liệu trình
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

      <TreatmentCourseFormDialog open={createOpen} onOpenChange={setCreateOpen} />

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
    </TablePageShell>
  );
}
