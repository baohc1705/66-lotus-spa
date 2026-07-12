import { useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { Plus, Crown } from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { MembershipTierFormDialog } from "../components/MembershipTierFormDialog";
import { MembershipTierDetailExpanded } from "../components/MembershipTierDetailExpanded";
import {
  useActiveMembershipTierColumns,
  MEMBERSHIP_TIER_COLUMN_LABELS,
} from "../components/useActiveMembershipTierColumns";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import {
  useMembershipTiers,
  useDeleteMembershipTier,
} from "../hooks/useMembershipTiers";
import { useMembershipTierListState } from "../hooks/useMembershipTierListState";

const ENTITY = "hạng thành viên";

export function MembershipTierListPage() {
  const perm = CUSTOMER_PERM;

  const listState = useMembershipTierListState();
  const {
    queryParams,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
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

  const {
    data: tiersResult,
    isLoading,
    isFetching,
  } = useMembershipTiers(queryParams);

  const deleteMutation = useDeleteMembershipTier();

  const paged = tiersResult?.data;
  const tiers = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const columns = useActiveMembershipTierColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  const table = useReactTable({
    data: tiers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
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

  const columnLabels = useMemo(
    () => ({ ...MEMBERSHIP_TIER_COLUMN_LABELS }),
    [],
  );

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="px-4 pt-4">
        <DataTableToolbar
          searchValue={filter}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm tên loại thẻ..."
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
              Thêm loại thẻ
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
        onRowClick={(row) => row.toggleExpanded()}
        renderSubComponent={({ row }) =>
          row.original.id ? (
            <MembershipTierDetailExpanded
              tierId={row.original.id}
              onEdit={(tier) => setEditTarget(tier)}
            />
          ) : null
        }
        emptyState={
          <TableEmptyState
            icon={Crown}
            title="Chưa có loại thẻ"
            hint="Thêm loại thẻ thành viên để phân hạng khách hàng."
            action={
              <PermissionGate resource={perm.resource} action={perm.create}>
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="mt-1 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm loại thẻ
                </Button>
              </PermissionGate>
            }
          />
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

      <MembershipTierFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <MembershipTierFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        tier={editTarget}
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
          "Các khách hàng đang thuộc hạng thẻ này có thể bị ảnh hưởng.",
        )}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </TablePageShell>
  );
}
export default MembershipTierListPage;
