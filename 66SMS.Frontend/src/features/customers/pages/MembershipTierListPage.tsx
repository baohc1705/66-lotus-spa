import { useMemo } from "react";
import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Crown, Plus } from "lucide-react";

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

import { MembershipTierDetailExpanded } from "../components/MembershipTierDetailExpanded";
import { MembershipTierFormDialog } from "../components/MembershipTierFormDialog";
import {
  MEMBERSHIP_TIER_COLUMN_LABELS,
  useActiveMembershipTierColumns,
} from "../components/useActiveMembershipTierColumns";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import { useMembershipTierListState } from "../hooks/useMembershipTierListState";
import {
  useDeleteMembershipTier,
  useMembershipTiers,
} from "../hooks/useMembershipTiers";

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
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

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
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(
    () => ({ ...MEMBERSHIP_TIER_COLUMN_LABELS }),
    [],
  );

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
            searchPlaceholder="Tìm tên loại thẻ..."
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
                Thêm loại thẻ
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          onRowClick={(row) => row.toggleExpanded()}
          renderExpandedRow={({ row }) =>
            row.original.id ? (
              <MembershipTierDetailExpanded
                tierId={row.original.id}
                onEdit={setEditTarget}
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
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm loại thẻ
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

      <MembershipTierFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editTarget ? (
        <MembershipTierFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          tier={editTarget}
        />
      ) : null}

      {deleteTarget ? (
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
      ) : null}
    </div>
  );
}
