import { useMemo } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Plus, Tag } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { Select } from "@/shared/forms/Select";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { PromotionFormDialog } from "../components/PromotionFormDialog";
import {
  PROMOTION_COLUMN_LABELS,
  useActivePromotionColumns,
} from "../components/useActivePromotionColumns";
import { PROMOTION_PERM } from "../constants/promotion.permissions";
import { usePromotionListState } from "../hooks/usePromotionListState";
import { useAdminPromotions, useDeletePromotion } from "../hooks/usePromotions";

const ENTITY = "khuyến mãi";

export function PromotionListPage() {
  const perm = PROMOTION_PERM;
  const listState = usePromotionListState();

  const {
    queryParams,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    pageIndex,
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

  const {
    data: promotionsResult,
    isLoading,
    isFetching,
  } = useAdminPromotions(queryParams);
  const deleteMutation = useDeletePromotion();

  const paged = promotionsResult?.data;
  const promotions = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const columns = useActivePromotionColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  const table = useReactTable({
    data: promotions,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(() => ({ ...PROMOTION_COLUMN_LABELS }), []);

  const handleDelete = () => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          <DataTableToolbar
            searchPlaceholder="Tìm theo mã, tên khuyến mãi..."
            searchValue={filter}
            onSearchChange={handleSearchChange}
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
            <PermissionGate resource={perm.resource} action={perm.create}>
              <Button
                variant="admin"
                size="sm"
                className="mb-0"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm khuyến mãi
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          emptyState={
            <TableEmptyState
              icon={Tag}
              title="Chưa có khuyến mãi"
              action={
                <PermissionGate resource={perm.resource} action={perm.create}>
                  <Button
                    variant="admin"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm khuyến mãi
                  </Button>
                </PermissionGate>
              }
            />
          }
          pagination={
            totalCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 text-xs text-kit-muted">
                  <span>
                    {rangeStart}-{rangeEnd} / {totalCount}
                  </span>
                  <Select
                    value={String(pageSize)}
                    onChange={(event) =>
                      handlePageSizeChange(Number(event.target.value))
                    }
                    options={[
                      { value: "5", label: "5 / trang" },
                      { value: "10", label: "10 / trang" },
                      { value: "20", label: "20 / trang" },
                    ]}
                    inputSize="sm"
                    className="w-auto min-w-28"
                  />
                </div>
                <Pagination
                  page={safePage}
                  pageCount={totalPages}
                  onPageChange={listState.setPageIndex}
                  size="sm"
                />
              </div>
            ) : null
          }
        />
      </TablePageShell>

      <PromotionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        promotion={null}
      />

      {editTarget ? (
        <PromotionFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          promotion={editTarget}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDelete}
          title={`Xóa ${ENTITY}`}
          description={`Bạn có chắc muốn xóa ${ENTITY} "${deleteTarget?.code ?? ""}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa"
          loading={deleteMutation.isPending}
          variant="danger"
        />
      ) : null}
    </div>
  );
}
