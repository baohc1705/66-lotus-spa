import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Receipt } from "lucide-react";
import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { Select } from "@/shared/forms/Select";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { InvoiceDetailExpanded } from "../components/InvoiceDetailExpanded";
import { InvoiceFilterSidebar } from "../components/InvoiceFilterSidebar";
import { InvoiceStatCards } from "../components/InvoiceStatCards";
import {
  INVOICE_COLUMN_LABELS,
  useActiveInvoiceColumns,
} from "../components/useActiveInvoiceColumns";
import { useInvoiceListState } from "../hooks/useInvoiceListState";
import { useAdminInvoices, useCancelInvoice } from "../hooks/useInvoices";
import { INVOICE_STATUS, type InvoiceDto } from "../types/invoice.types";

export function InvoiceListPage() {
  const salonId = useAuthStore((state) => state.getEffectiveSalonId());
  const listState = useInvoiceListState(salonId);

  const {
    queryParams,
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

  const { data: result, isLoading, isFetching } = useAdminInvoices(queryParams);

  const { data: allInvoicesResult } = useAdminInvoices({
    pageIndex: 1,
    pageSize: 10000,
    salonId: salonId || undefined,
  });

  const cancelMutation = useCancelInvoice();

  const paged = result?.data;
  const invoices = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const allInvoices = useMemo(
    () => allInvoicesResult?.data?.items ?? [],
    [allInvoicesResult],
  );

  const paidRevenue = useMemo(
    () =>
      allInvoices
        .filter(
          (invoice: InvoiceDto) => invoice.status === INVOICE_STATUS.PAID,
        )
        .reduce(
          (sum: number, invoice: InvoiceDto) =>
            sum + (invoice.totalAmount ?? 0),
          0,
        ),
    [allInvoices],
  );

  const paidCount = useMemo(
    () =>
      allInvoices.filter(
        (invoice: InvoiceDto) => invoice.status === INVOICE_STATUS.PAID,
      ).length,
    [allInvoices],
  );

  const unpaidCount = useMemo(
    () =>
      allInvoices.filter(
        (invoice: InvoiceDto) => invoice.status === INVOICE_STATUS.UNPAID,
      ).length,
    [allInvoices],
  );

  const cancelledCount = useMemo(
    () =>
      allInvoices.filter(
        (invoice: InvoiceDto) => invoice.status === INVOICE_STATUS.CANCELLED,
      ).length,
    [allInvoices],
  );

  function handleCancel() {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelTarget, {
      onSuccess: (response) => {
        if (response.isSuccess) setCancelTarget(null);
      },
    });
  }

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
    state: { columnVisibility },
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
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <InvoiceStatCards
        paidRevenue={paidRevenue}
        paidCount={paidCount}
        unpaidCount={unpaidCount}
        cancelledCount={cancelledCount}
        isLoading={isLoading && allInvoices.length === 0}
      />

      <div className="flex flex-col items-start gap-3 md:flex-row">
        {!isSidebarMode ? (
          <InvoiceFilterSidebar
            selectedStatus={selectedStatus}
            onSelectStatus={handleSelectStatus}
            selectedPaymentMethod={selectedPaymentMethod}
            onSelectPaymentMethod={handleSelectPaymentMethod}
            onReset={handleResetFilters}
          />
        ) : null}

        <div className="w-full min-w-0 flex-1">
          <TablePageShell isFetching={isFetching} isLoading={isLoading}>
            <div className="border-b border-kit px-4 pt-4">
              <DataTableToolbar
                searchPlaceholder="Tìm theo mã, tên khách hàng..."
                searchValue={filter}
                onSearchChange={handleSearchChange}
              >
                <DataTableViewOptions
                  table={table}
                  columnLabels={columnLabels}
                />
              </DataTableToolbar>
            </div>

            <DataTable
              table={table}
              isLoading={isLoading}
              loadingRows={DEFAULT_LOADING_ROWS}
              renderExpandedRow={({ row }) =>
                row.original.id ? (
                  <InvoiceDetailExpanded
                    invoiceId={row.original.id}
                    onCancel={(id) => setCancelTarget(id)}
                  />
                ) : null
              }
              emptyState={
                <TableEmptyState
                  icon={Receipt}
                  title="Chưa có hóa đơn"
                  hint="Hóa đơn được tạo từ quầy thu ngân."
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
        </div>
      </div>

      {cancelTarget ? (
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
      ) : null}
    </div>
  );
}

export default InvoiceListPage;
