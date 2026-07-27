import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { Plus, ImageIcon } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { LandingBannerFormDialog } from "../components/LandingBannerFormDialog";
import {
  useAdminLandingBanners,
  useDeleteLandingBannerMutation,
} from "../hooks/useLandingBanners";
import { useLandingBannerListState } from "../hooks/useLandingBannerListState";
import {
  useActiveLandingBannerColumns,
  LANDING_BANNER_COLUMN_LABELS,
} from "../components/useActiveLandingBannerColumns";
import { LANDING_BANNER_PERM } from "../constants/landing-banner.permissions";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";

const ENTITY = "banner";

export function LandingBannerListPage() {
  const perm = LANDING_BANNER_PERM;
  const listState = useLandingBannerListState();
  const {
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
  } = useAdminLandingBanners({
    pageIndex,
    pageSize,
    filter: filter || undefined,
  });

  const deleteMutation = useDeleteLandingBannerMutation();

  const paged = bannersResult?.data;
  const banners = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const handleConfirmDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null);
        },
      });
    }
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
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="bg-white/70 backdrop-blur-md rounded-admin border border-adminGray-100/30 overflow-hidden relative">
        <div className="px-4 pt-4">
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
                onClick={() => setCreateOpen(true)}
                className="lotus-admin-table-toolbar-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm banner
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-adminGray-50 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-adminGreen-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-adminInk">
                  Chưa có banner
                </p>
                <p className="text-xs text-adminGray-600 mt-0.5">
                  Thêm banner để hiển thị trên Hero trang chủ.
                </p>
              </div>
              <PermissionGate resource={perm.resource} action={perm.create}>
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="mt-1 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm banner
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
      </div>

      <LandingBannerFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <LandingBannerFormDialog
        open={editBannerId != null}
        onOpenChange={(open) => {
          if (!open) setEditBannerId(null);
        }}
        bannerId={editBannerId}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={CONFIRM_MSG.deleteTitle(ENTITY)}
        description={CONFIRM_MSG.deleteDescription(
          ENTITY,
          deleteTarget?.title ?? ""
        )}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </TablePageShell>
  );
}
