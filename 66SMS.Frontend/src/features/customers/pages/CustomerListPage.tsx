import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { Plus, Users, ArrowLeft, Trash2 } from "lucide-react";
import { motion } from "motion/react";

import { containerVariants } from "@/shared/motion/pageVariants";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
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
import { StatusActive } from "@/shared/constants/status.enum";

import { CustomerFormDialog } from "../components/CustomerFormDialog";
import { CustomerDetailExpanded } from "../components/CustomerDetailExpanded";
import { CustomerStatCards } from "../components/CustomerStatCards";
import { CustomerFilterSidebar } from "../components/CustomerFilterSidebar";
import {
  useActiveCustomerColumns,
  CUSTOMER_COLUMN_LABELS,
} from "../components/useActiveCustomerColumns";
import { useDeletedCustomerColumns } from "../components/useDeletedCustomerColumns";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import {
  useCustomers,
  useDeleteCustomer,
  useRestoreCustomer,
} from "../hooks/useCustomers";
import { useCustomerListState } from "../hooks/useCustomerListState";
import type { CustomerDto } from "../types/customer.types";

const ENTITY = "khách hàng";
const ENTITY_SUBJECT = "Khách hàng";

export function CustomerListPage() {
  const perm = CUSTOMER_PERM;

  const listState = useCustomerListState();
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
    selectedGender,
    setSelectedGender,
    selectedSource,
    setSelectedSource,
  } = listState;

  const { data: customersResult, isLoading, isFetching } = useCustomers(queryParams);
  const deleteMutation = useDeleteCustomer();
  const restoreMutation = useRestoreCustomer();

  const paged = customersResult?.data;
  const customers = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  // Stat card calculations
  const activeCustomerCount = useMemo(
    () =>
      customers.filter((c: CustomerDto) => c.status === StatusActive.Active)
        .length,
    [customers],
  );

  const totalPoints = useMemo(
    () =>
      customers.reduce(
        (sum: number, c: CustomerDto) => sum + (c.loyaltyPoint ?? 0),
        0,
      ),
    [customers],
  );

  const walkInCustomerCount = useMemo(
    () =>
      customers.filter(
        (c: CustomerDto) =>
          c.source === "Walk-in" || c.source === "Đến trực tiếp",
      ).length,
    [customers],
  );

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

  const activeColumns = useActiveCustomerColumns({
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

  const deletedColumns = useDeletedCustomerColumns({
    pageIndex,
    pageSize,
    onRestore: setRestoreTarget,
  });

  const columns = showDeleted ? deletedColumns : activeColumns;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: customers,
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

  const handleRestore = useCallback(() => {
    if (!restoreTarget?.id) return;
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setRestoreTarget(null);
      },
    });
  }, [restoreTarget, restoreMutation, setRestoreTarget]);

  const columnLabels = useMemo(() => ({ ...CUSTOMER_COLUMN_LABELS }), []);

  const { layoutMode } = useOutletContext<{
    layoutMode: "top-nav" | "sidebar";
  }>();
  const isSidebarMode = layoutMode === "sidebar";

  return (
    <div className="flex h-full overflow-hidden gap-2">
      {/* Sidebar bộ lọc */}
      {!isSidebarMode && (
        <CustomerFilterSidebar
          selectedGender={selectedGender}
          onSelectGender={setSelectedGender}
          selectedSource={selectedSource}
          onSelectSource={setSelectedSource}
        />
      )}

      {/* Main container: Stats + Table */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        {/* Stats row */}
        <div className="shrink-0">
          <CustomerStatCards
            totalCustomers={totalCount}
            activeCustomers={activeCustomerCount}
            totalPoints={totalPoints}
            walkInCustomers={walkInCustomerCount}
            isLoading={isLoading}
          />
        </div>

        {/* Table card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={`${TABLE_STYLES.pageCard} flex-1 min-h-0 flex flex-col overflow-hidden relative`}
        >
          {/* Fetching bar */}
          {isFetching && !isLoading && (
            <div className={TABLE_STYLES.fetchBar}>
              <div className={TABLE_STYLES.fetchBarInner} />
            </div>
          )}

          {/* Toolbar */}
          <div className="px-4 pt-3 shrink-0">
            <DataTableToolbar
              searchValue={filter}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Tìm theo tên, SĐT, email..."
            >
              {selectedCount > 0 && !showDeleted && (
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
                  onClick={() => setCreateOpen(true)}
                  className={TABLE_STYLES.toolbarBtn}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm KH
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
                  className={TABLE_STYLES.toolbarBtn}
                  onClick={() => handleToggleView(clearSelection)}
                  title={showDeleted ? "Quay lại danh sách" : "Khách hàng đã xóa"}
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

          {/* Table */}
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
                      <CustomerDetailExpanded
                        customerId={row.original.id}
                        onEdit={(cust) => setEditTarget(cust)}
                      />
                    ) : null
            }
            emptyState={
              showDeleted ? (
                <TableEmptyState
                  icon={Trash2}
                  title="Không có khách hàng đã xóa"
                  hint="Các khách hàng bị xóa sẽ hiển thị tại đây."
                />
              ) : (
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
        </motion.div>
      </div>

      {/* Dialogs */}
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

      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        onConfirm={handleRestore}
        title={CONFIRM_MSG.restoreTitle(ENTITY_SUBJECT)}
        description={CONFIRM_MSG.restoreDescription(
          ENTITY_SUBJECT,
          restoreTarget?.fullName ?? "",
        )}
        confirmLabel={COMMON_MSG.restore}
        loading={restoreMutation.isPending}
        variant="default"
      />
    </div>
  );
}

export default CustomerListPage;
