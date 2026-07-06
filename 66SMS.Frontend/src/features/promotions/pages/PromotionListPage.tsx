import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";

import { PromotionFormDialog } from "../components/PromotionFormDialog";
import { usePromotionListState } from "../hooks/usePromotionListState";
import {
  PROMOTION_COLUMN_LABELS,
  useActivePromotionColumns,
} from "../components/useActivePromotionColumns";
import { PROMOTION_PERM } from "../constants/promotion.permissions";
import {
  useAdminPromotions,
  useDeletePromotion,
} from "../hooks/usePromotions";

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

  const { data: promotionsResult, isLoading, isFetching } = useAdminPromotions(queryParams);
  const deleteMutation = useDeletePromotion();

  const paged = promotionsResult?.data;
  const promotions = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const activeColumns = useActivePromotionColumns({
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
    columns: activeColumns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(() => ({ ...PROMOTION_COLUMN_LABELS }), []);

  const handleDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null);
        },
      });
    }
  };

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <DataTableToolbar
        searchPlaceholder="Tìm theo mã, tên khuyến mãi..."
        searchValue={filter}
        onSearchChange={handleSearchChange}
      >
        <DataTableViewOptions table={table} columnLabels={columnLabels} />
        <div className="flex items-center gap-2 ml-auto">
          <PermissionGate resource={perm.resource} action={perm.create}>
            <Button
              variant="admin"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="lotus-admin-table-toolbar-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm khuyến mãi
            </Button>
          </PermissionGate>
        </div>
      </DataTableToolbar>

      <div className="lotus-admin-table-page-card">
        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
        />
      </div>

      <DataTablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={paged?.totalPages ?? 0}
        hasPreviousPage={paged?.hasPreviousPage ?? false}
        hasNextPage={paged?.hasNextPage ?? false}
        onPageChange={listState.setPageIndex}
        onPageSizeChange={handlePageSizeChange}
      />

      <PromotionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        promotion={null}
      />

      {editTarget && (
        <PromotionFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          promotion={editTarget}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title={CONFIRM_MSG.deleteTitle(ENTITY)}
          description={CONFIRM_MSG.deleteDescription(ENTITY, deleteTarget.code ?? "")}
          onConfirm={handleDelete}
          confirmLabel={COMMON_MSG.delete}
          loading={deleteMutation.isPending}
        />
      )}
    </TablePageShell>
  );
}
