import { useState, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, type Variants } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Ban,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Receipt,
} from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { InvoiceFormDialog } from "../components/InvoiceFormDialog";
import { InvoiceDetailExpanded } from "../components/InvoiceDetailExpanded";
import { InvoiceFilterSidebar } from "../components/InvoiceFilterSidebar";
import { InvoiceStatCards } from "../components/InvoiceStatCards";
import { useInvoices, useCancelInvoice } from "../hooks/useInvoices";
import {
  INVOICE_STATUS,
  PAYMENT_METHOD,
  type InvoiceDto,
} from "../types/invoice.types";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { TABLE_STYLES } from "@/shared/styles/table.styles";

const STATUS_MAP: StatusMap = {
  "0": { label: "Nháp", variant: "outline" },
  "1": { label: "Chưa TT", variant: "warning" },
  "2": { label: "Đã TT", variant: "success", dot: true },
  "3": { label: "Đã hủy", variant: "error" },
  "4": { label: "Hoàn tiền", variant: "outline" },
};

const PAYMENT_LABEL: Record<number, string> = {
  [PAYMENT_METHOD.CASH]: "Tiền mặt",
  [PAYMENT_METHOD.BANK_TRANSFER]: "Chuyển khoản",
  [PAYMENT_METHOD.WALLET]: "Ví",
  [PAYMENT_METHOD.VNPAY]: "VNPay",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export function InvoiceListPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const [prevSalonId, setPrevSalonId] = useState(salonId);
  if (salonId !== prevSalonId) {
    setPageIndex(1);
    setPrevSalonId(salonId);
  }

  // Filter Sidebar State
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);

  const handleSelectStatus = useCallback((status: number | null) => {
    setSelectedStatus(status);
    setPageIndex(1);
  }, []);

  const handleSelectPaymentMethod = useCallback((method: number | null) => {
    setSelectedPaymentMethod(method);
    setPageIndex(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedStatus(null);
    setSelectedPaymentMethod(null);
    setPageIndex(1);
  }, []);

  const mergedParams = useMemo(
    () => ({
      pageIndex,
      pageSize,
      filter: filter || undefined,
      salonId: salonId || undefined,
      orderBy,
      isDescending,
      status: selectedStatus ?? undefined,
      paymentMethod: selectedPaymentMethod ?? undefined,
    }),
    [
      pageIndex,
      pageSize,
      filter,
      salonId,
      orderBy,
      isDescending,
      selectedStatus,
      selectedPaymentMethod,
    ],
  );

  const { data: result, isLoading, isFetching } = useInvoices(mergedParams);
  const cancelMutation = useCancelInvoice();

  // Fetch all invoices globally for this salon to calculate counts & revenue
  const { data: allInvoicesResult, isLoading: isLoadingAll } = useInvoices({
    pageIndex: 1,
    pageSize: 10000,
    salonId: salonId || undefined,
  });

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

  const handleSort = useCallback(
    (column: string) => {
      if (orderBy === column) setIsDescending((prev) => !prev);
      else {
        setOrderBy(column);
        setIsDescending(false);
      }
    },
    [orderBy],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(1);
  }, []);
  const handleSearchChange = useCallback((value: string) => {
    setFilter(value);
    setPageIndex(1);
  }, []);

  const handleCancel = useCallback(() => {
    if (cancelTarget) {
      cancelMutation.mutate(cancelTarget, {
        onSuccess: (res) => {
          if (res.isSuccess) setCancelTarget(null);
        },
      });
    }
  }, [cancelTarget, cancelMutation]);

  const SortIcon = useCallback(
    ({ column }: { column: string }) => {
      if (orderBy !== column) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
      return isDescending ? (
        <ArrowDown className="w-3 h-3 text-lotus-leaf" />
      ) : (
        <ArrowUp className="w-3 h-3 text-lotus-leaf" />
      );
    },
    [orderBy, isDescending],
  );

  const columns = useMemo<ColumnDef<InvoiceDto>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-lotus-stone">
            {(pageIndex - 1) * pageSize + row.index + 1}
          </span>
        ),
        size: 50,
        enableResizing: false,
      },
      {
        accessorKey: "code",
        header: () => (
          <button
            onClick={() => handleSort("code")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors text-[13px] font-semibold"
          >
            Mã HĐ <SortIcon column="code" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-[12px] text-lotus-stone">
            {row.original.invoiceCode ?? "—"}
          </span>
        ),
        size: 170,
      },
      {
        accessorKey: "customerName",
        header: "Khách hàng",
        cell: ({ row }) => (
          <div>
            <p className="text-[13px] font-semibold text-lotus-deep truncate max-w-[180px]">
              {row.original.customerName ?? "Khách vãng lai"}
            </p>
            {row.original.customerPhone && (
              <p className="text-[11px] text-lotus-stone">
                {row.original.customerPhone}
              </p>
            )}
          </div>
        ),
        size: 200,
      },
      {
        accessorKey: "total",
        header: () => (
          <button
            onClick={() => handleSort("total")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors text-[13px] font-semibold"
          >
            Tổng tiền <SortIcon column="total" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-lotus-deep font-semibold">
            {(row.original.totalAmount ?? 0).toLocaleString("vi-VN")}đ
          </span>
        ),
        size: 130,
      },
      {
        accessorKey: "paymentMethod",
        header: "Hình thức",
        cell: ({ row }) => (
          <span className="text-[12px] text-lotus-stone">
            {PAYMENT_LABEL[row.original.paymentMethod ?? 0] ?? "—"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge
            status={String(row.original.status ?? 1)}
            statusMap={STATUS_MAP}
          />
        ),
        size: 110,
      },
      {
        accessorKey: "issuedAt",
        header: () => (
          <button
            onClick={() => handleSort("issued_at")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors text-[13px] font-semibold"
          >
            Ngày lập <SortIcon column="issued_at" />
          </button>
        ),
        cell: ({ row }) => {
          const d = row.original.issuedAt;
          return (
            <span className="text-[12px] text-lotus-stone">
              {d ? new Date(d).toLocaleString("vi-VN") : "—"}
            </span>
          );
        },
        size: 150,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const inv = row.original;
          const canCancel =
            inv.status !== INVOICE_STATUS.CANCELLED &&
            inv.status !== INVOICE_STATUS.REFUNDED;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  {canCancel && inv.id && (
                    <PermissionGate resource="invoices" action="update">
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setCancelTarget(inv.id!)}
                      >
                        <Ban className="w-4 h-4" /> Hủy hóa đơn
                      </DropdownMenuItem>
                    </PermissionGate>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, handleSort, SortIcon],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

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
        {/* Stats Cards */}
        <div className="shrink-0">
          <InvoiceStatCards
            paidRevenue={paidRevenue}
            paidCount={paidCount}
            unpaidCount={unpaidCount}
            cancelledCount={cancelledCount}
            isLoading={isLoadingAll}
          />
        </div>

        {/* Table Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={`${TABLE_STYLES.pageCard} flex-1 min-h-0 flex flex-col overflow-hidden relative`}
        >
          <div className="px-4 pt-4">
            <DataTableToolbar
              searchValue={filter}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Tìm theo mã HĐ, tên, SĐT..."
            >
              <DataTableViewOptions
                table={table}
                columnLabels={{
                  code: "Mã HĐ",
                  customerName: "Khách hàng",
                  total: "Tổng tiền",
                  paymentMethod: "Hình thức",
                  status: "Trạng thái",
                  issuedAt: "Ngày lập",
                }}
              />
              <PermissionGate resource="invoices" action="create">
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="text-[12px] gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Lập hóa đơn
                </Button>
              </PermissionGate>
            </DataTableToolbar>
          </div>

          <DataTable
            table={table}
            isLoading={isLoading}
            loadingRows={pageSize > 5 ? 5 : pageSize}
            onRowClick={(row) => row.toggleExpanded()}
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
                  <p className="text-[12px] text-lotus-stone mt-0.5">
                    Lập hóa đơn mới để bắt đầu.
                  </p>
                </div>
                <PermissionGate resource="invoices" action="create">
                  <Button
                    variant="admin"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="mt-1 text-[12px]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lập hóa đơn
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
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-lotus-leaf/30 overflow-hidden">
              <div className="h-full w-1/3 bg-lotus-leaf animate-[slide_1s_ease-in-out_infinite]" />
            </div>
          )}
        </motion.div>
      </div>

      <InvoiceFormDialog open={createOpen} onOpenChange={setCreateOpen} />
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
    </div>
  );
}
export default InvoiceListPage;
