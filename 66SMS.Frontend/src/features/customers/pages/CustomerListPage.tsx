import { useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { Plus, Users } from "lucide-react";

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
import { TABLE_STYLES } from "@/shared/styles/table.styles";
import { useRowSelection } from "@/shared/hooks/useRowSelection";

import { CustomerFormDialog } from "../components/CustomerFormDialog";
import { CustomerDetailExpanded } from "../components/CustomerDetailExpanded";
import {
  useActiveCustomerColumns,
  CUSTOMER_COLUMN_LABELS,
} from "../components/useActiveCustomerColumns";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import { useCustomers, useDeleteCustomer } from "../hooks/useCustomers";
import { useCustomerListState } from "../hooks/useCustomerListState";
import type { CustomerDto } from "../types/customer.types";

const ENTITY = "khách hàng";

export function CustomerListPage() {
  const perm = CUSTOMER_PERM;

  const listState = useCustomerListState();
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

  const { data: customersResult, isLoading, isFetching } = useCustomers(queryParams);
  const deleteMutation = useDeleteCustomer();

  const paged = customersResult?.data;
  const customers = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const pageIds = useMemo(
    () =>
      customers
        .map((c: CustomerDto) => c.id)
        .filter((id): id is number => id != null),
    [customers],
  );

  const {
    selectedRowIds,
    clearSelection,
    headerChecked,
    toggleAll,
    toggleOne,
    selectedCount,
  } = useRowSelection(pageIds);

  const columns = useActiveCustomerColumns({
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
  });

  const table = useReactTable({
    data: customers,
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

  const columnLabels = useMemo(() => ({ ...CUSTOMER_COLUMN_LABELS }), []);

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="px-4 pt-4">
        <DataTableToolbar
          searchValue={filter}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm theo tên, SĐT, email..."
        >
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 mr-auto text-[13px] text-lotus-deep font-medium bg-lotus-cream/50 px-3 py-1.5 rounded-lg border border-stone-200/50">
              <span>Đã chọn {selectedCount}</span>
              <button
                onClick={clearSelection}
                className="text-lotus-stone hover:text-lotus-deep ml-1 transition-colors"
                title="Bỏ chọn tất cả"
              >
                Bỏ chọn
              </button>
            </div>
          )}

          <DataTableViewOptions table={table} columnLabels={columnLabels} />

          <PermissionGate
            resource={perm.resource}
            action={perm.create}
            role={perm.role}
          >
            <Button
              variant="admin"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className={TABLE_STYLES.toolbarBtn}
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm KH
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
            <CustomerDetailExpanded
              customerId={row.original.id}
              onEdit={(cust) => setEditTarget(cust)}
            />
          ) : null
        }
        emptyState={
          <TableEmptyState
            icon={Users}
            title="Chưa có khách hàng"
            hint="Thêm khách hàng mới để bắt đầu quản lý."
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
                  className="mt-1 text-[12px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm khách hàng
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

      <CustomerFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <CustomerFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        customer={editTarget}
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
          deleteTarget?.fullName ?? "",
        )}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </TablePageShell>
  );
}
export default CustomerListPage;
