import { useMemo } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Plus, ImageIcon } from "lucide-react";

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
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { LandingBannerFormDialog } from "../components/LandingBannerFormDialog";
import {
  LANDING_BANNER_COLUMN_LABELS,
  useActiveLandingBannerColumns,
} from "../components/useActiveLandingBannerColumns";
import { LANDING_BANNER_PERM } from "../constants/landing-banner.permissions";
import {
  useAdminLandingBanners,
  useDeleteLandingBannerMutation,
} from "../hooks/useLandingBanners";
import { useLandingBannerListState } from "../hooks/useLandingBannerListState";

const ENTITY = "banner";

export function LandingBannerListPage() {
  const perm = LANDING_BANNER_PERM;
  const listState = useLandingBannerListState();

  const {
    queryParams,
    pageIndex,
    setPageIndex,
    pageSize,
    filter,
    columnVisibility,
    setColumnVisibility,
    handlePageSizeChange,
    handleSearchChange,
    createOpen,
    setCreateOpen,
    editBannerId,
    setEditBannerId,
    deleteTarget,
    setDeleteTarget,
  } = listState;

  const {
    data: bannersResult,
    isLoading,
    isFetching,
  } = useAdminLandingBanners(queryParams);

  const deleteMutation = useDeleteLandingBannerMutation();

  const paged = bannersResult?.data;
  const banners = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const handleConfirmDelete = () => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setDeleteTarget(null);
      },
    });
  };

  const columns = useActiveLandingBannerColumns({
    pageIndex,
    pageSize,
    onEdit: (item) => {
      if (item.id) setEditBannerId(item.id);
    },
    onDelete: setDeleteTarget,
  });

  const columnLabels = useMemo(() => ({ ...LANDING_BANNER_COLUMN_LABELS }), []);

  const table = useReactTable({
    data: banners,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tiêu đề, nhãn..."
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
                Thêm banner
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
              icon={ImageIcon}
              title="Chưa có banner"
              hint="Thêm banner để hiển thị trên Hero trang chủ."
              action={
                <PermissionGate resource={perm.resource} action={perm.create}>
                  <Button
                    variant="admin"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm banner
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
                  onPageChange={setPageIndex}
                  size="sm"
                />
              </div>
            ) : null
          }
        />
      </TablePageShell>

      <LandingBannerFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <LandingBannerFormDialog
        open={editBannerId != null}
        onOpenChange={(open) => {
          if (!open) setEditBannerId(null);
        }}
        bannerId={editBannerId}
      />

      {deleteTarget ? (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
          title={CONFIRM_MSG.deleteTitle(ENTITY)}
          description={CONFIRM_MSG.deleteDescription(
            ENTITY,
            deleteTarget?.title ?? "",
          )}
          confirmLabel={COMMON_MSG.delete}
          loading={deleteMutation.isPending}
          variant="danger"
        />
      ) : null}
    </div>
  );
}
