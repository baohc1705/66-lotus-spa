import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/components/ui/button";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { containerVariants } from "@/shared/motion/pageVariants";

import { InvoiceDetailExpanded } from "../components/InvoiceDetailExpanded";
import { InvoiceFilterSidebar } from "../components/InvoiceFilterSidebar";
import { InvoiceFormDialog } from "../components/InvoiceFormDialog";
import { InvoiceStatCards } from "../components/InvoiceStatCards";
import {
  INVOICE_COLUMN_LABELS,
  useActiveInvoiceColumns,
} from "../components/useActiveInvoiceColumns";
import { INVOICE_PERM } from "../constants/invoice.permissions";
import { useInvoiceListState } from "../hooks/useInvoiceListState";
import {
  useAdminInvoices,
  useCancelInvoice,
} from "../hooks/useInvoices";
import { INVOICE_STATUS } from "../types/invoice.types";

export function InvoiceListPage() {
  const perm = INVOICE_PERM;
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const listState = useInvoiceListState(salonId);

  const {
    queryParams,
    createOpen,
    setCreateOpen,
    cancelTarget,
    setCancelTarget,
    selectedStatus,
    selectedPaymentMethod,
    handleSelectStatus,
    handleSelectPaymentMethod,
    handleResetFilters,
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

  // Active paginated query
  const { data: result, isLoading, isFetching } = useAdminInvoices(queryParams);

  // Global query for calculations
  const { data: allInvoicesResult } = useAdminInvoices({
    pageIndex: 1,
    pageSize: 10000,
    salonId: salonId || undefined,
  });

  const cancelMutation = useCancelInvoice();

  const paged = result?.data;
  const invoices = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const allInvoices = useMemo(() => allInvoicesResult?.data?.items ?? [], [allInvoicesResult]);

  const paidRevenue = useMemo(
    () =>
      allInvoices
        .filter((inv) => inv.status === INVOICE_STATUS.PAID)
        .reduce((sum, inv) => sum + (inv.totalAmount ?? 0), 0),
    [allInvoices],
  );

  const paidCount = useMemo(
    () => allInvoices.filter((inv) => inv.status === INVOICE_STATUS.PAID).length,
    [allInvoices],
  );

  const unpaidCount = useMemo(
    () => allInvoices.filter((inv) => inv.status === INVOICE_STATUS.UNPAID).length,
    [allInvoices],
  );

  const cancelledCount = useMemo(
    () => allInvoices.filter((inv) => inv.status === INVOICE_STATUS.CANCELLED).length,
    [allInvoices],
  );

  const handleCancel = () => {
    if (cancelTarget) {
      cancelMutation.mutate(cancelTarget, {
        onSuccess: (res) => {
          if (res.isSuccess) setCancelTarget(null);
        },
      });
    }
  };

  const activeColumns = useActiveInvoiceColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    onCancel: setCancelTarget,
  });

  const table = useReactTable({
    data: invoices,
    columns: activeColumns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(() => ({ ...INVOICE_COLUMN_LABELS }), []);

  const { layoutMode } = useOutletContext<{
    layoutMode: "top-nav" | "sidebar";
  }>();
  const isSidebarMode = layoutMode === "sidebar";

  return (
    <div className="flex h-full overflow-hidden gap-2">
      {/* Sidebar bộ lọc */}
      {!isSidebarMode && (
        <InvoiceFilterSidebar
          selectedStatus={selectedStatus}
          onSelectStatus={handleSelectStatus}
          selectedPaymentMethod={selectedPaymentMethod}
          onSelectPaymentMethod={handleSelectPaymentMethod}
          onReset={handleResetFilters}
        />
      )}

      {/* Right: Stats + Table */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        <div className="shrink-0">
          <InvoiceStatCards
            paidRevenue={paidRevenue}
            paidCount={paidCount}
            unpaidCount={unpaidCount}
            cancelledCount={cancelledCount}
            isLoading={isLoading}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lotus-admin-table-page-card flex-1 min-h-0 flex flex-col overflow-hidden relative"
        >
          {isFetching && !isLoading && (
            <div className="lotus-admin-table-fetch-bar">
              <div className="lotus-admin-table-fetch-bar-inner" />
            </div>
          )}

          <div className="px-4 pt-3 shrink-0">
            <DataTableToolbar
              searchPlaceholder="Tìm theo mã, tên khách hàng..."
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
                    <Plus className="w-4 h-4" /> Lập hóa đơn
                  </Button>
                </PermissionGate>
              </div>
            </DataTableToolbar>
          </div>

          <DataTable
            table={table}
            isLoading={isLoading}
            loadingRows={pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize}
            renderSubComponent={({ row }) =>
              row.original.id ? (
                <InvoiceDetailExpanded
                  invoiceId={row.original.id}
                  onCancel={(id) => setCancelTarget(id)}
                />
              ) : null
            }
            emptyState={
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                  <Receipt className="w-7 h-7 text-lotus-stone" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-lotus-deep">
                    Chưa có hóa đơn
                  </p>
                  <p className="text-lotus-admin-md text-lotus-stone mt-0.5">
                    Lập hóa đơn mới để bắt đầu.
                  </p>
                </div>
                <PermissionGate resource={perm.resource} action="create">
                  <Button
                    variant="admin"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="mt-1 text-lotus-admin-md"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lập hóa đơn
                  </Button>
                </PermissionGate>
              </div>
            }
            pagination={
              paged && totalCount > 0 ? (
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
              ) : null
            }
          />
        </motion.div>
      </div>

      <InvoiceFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {cancelTarget && (
        <ConfirmDialog
          open={cancelTarget !== null}
          onOpenChange={(open) => {
            if (!open) setCancelTarget(null);
          }}
          onConfirm={handleCancel}
          title="Hủy hóa đơn"
          description="Bạn có chắc muốn hủy hóa đơn này? Hệ thống sẽ hoàn lại kho sản phẩm và điểm thưởng đã dùng."
          confirmLabel="Hủy hóa đơn"
          loading={cancelMutation.isPending}
          variant="danger"
        />
      )}
    </div>
  );
}

export default InvoiceListPage;
