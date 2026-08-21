import { Fragment, useEffect, useMemo, useState } from "react";
import { Ban, Eye, Plus, Search } from "lucide-react";

import { useAuthStore } from "@/features/auth/stores/authStore";

import { InvoiceDetailExpanded } from "@/features/invoices/components/InvoiceDetailExpanded";
import { InvoiceStatCards } from "@/features/invoices/components/InvoiceStatCards";
import { INVOICE_PERM } from "@/features/invoices/constants/invoice.permissions";
import {
  useCancelInvoice,
  useInvoices,
} from "@/features/invoices/hooks/useInvoices";
import {
  INVOICE_STATUS,
  PAYMENT_METHOD,
  type InvoiceDto,
  type GetAllInvoiceQuery,
} from "@/features/invoices/types/invoice.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Select } from "@/shared/forms/Select";
import { Input } from "@/shared/forms/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { TableResponsive } from "@/shared/tables/Table";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";

interface Props {
  onCreate: () => void;
}

const STATUS_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "Tất cả trạng thái", value: null },
  { label: "Nháp", value: INVOICE_STATUS.DRAFT },
  { label: "Chưa thanh toán", value: INVOICE_STATUS.UNPAID },
  { label: "Đã thanh toán", value: INVOICE_STATUS.PAID },
  { label: "Đã hủy", value: INVOICE_STATUS.CANCELLED },
  { label: "Hoàn tiền", value: INVOICE_STATUS.REFUNDED },
];

const PAYMENT_LABEL: Record<number, string> = {
  [PAYMENT_METHOD.CASH]: "Tiền mặt",
  [PAYMENT_METHOD.BANK_TRANSFER]: "Chuyển khoản",
  [PAYMENT_METHOD.WALLET]: "Ví",
  [PAYMENT_METHOD.VNPAY]: "VNPay",
};

const PAYMENT_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "Tất cả phương thức", value: null },
  { label: "Tiền mặt", value: PAYMENT_METHOD.CASH },
  { label: "Chuyển khoản", value: PAYMENT_METHOD.BANK_TRANSFER },
  { label: "Ví thành viên", value: PAYMENT_METHOD.WALLET },
  { label: "Cổng VNPay", value: PAYMENT_METHOD.VNPAY },
];

function statusBadge(status: number | null | undefined) {
  if (status === INVOICE_STATUS.DRAFT) {
    return (
      <Badge variant="secondary" soft>
        Nháp
      </Badge>
    );
  }

  if (status === INVOICE_STATUS.UNPAID) {
    return (
      <Badge variant="warning" soft>
        Chưa TT
      </Badge>
    );
  }

  if (status === INVOICE_STATUS.PAID) {
    return (
      <Badge variant="success" soft>
        Đã TT
      </Badge>
    );
  }

  if (status === INVOICE_STATUS.CANCELLED) {
    return (
      <Badge variant="danger" soft>
        Đã hủy
      </Badge>
    );
  }

  if (status === INVOICE_STATUS.REFUNDED) {
    return (
      <Badge variant="secondary" soft>
        Hoàn tiền
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" soft>
      —
    </Badge>
  );
}

export function InvoiceTable({ onCreate }: Props) {
  const perm = INVOICE_PERM;
  const { getEffectiveSalonId } = useAuthStore();
  const salonId = getEffectiveSalonId();

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  const cancelMutation = useCancelInvoice();

  const queryParams: GetAllInvoiceQuery = {
    pageIndex,
    pageSize,
    filter: filter || undefined,
    orderBy,
    isDescending,
    salonId: salonId || undefined,
    status: selectedStatus ?? undefined,
    paymentMethod: selectedPaymentMethod ?? undefined,
  };

  const statsQueryParams: GetAllInvoiceQuery = {
    pageIndex: 1,
    pageSize: 10000,
    salonId: salonId || undefined,
  };

  const {
    data: result,
    isLoading,
    refetch,
  } = useInvoices(queryParams, salonId != null);

  const { data: allInvoicesResult } = useInvoices(
    statsQueryParams,
    salonId != null,
  );

  const paged = result?.data;
  const invoices = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const { paidRevenue, paidCount, unpaidCount, cancelledCount } = useMemo(() => {
    const allInvoices = allInvoicesResult?.data?.items ?? [];

    let revenue = 0;
    let paid = 0;
    let unpaid = 0;
    let cancelled = 0;

    for (let index = 0; index < allInvoices.length; index++) {
      const invoice = allInvoices[index] as InvoiceDto;
      if (invoice.status === INVOICE_STATUS.PAID) {
        paid += 1;
        revenue += invoice.totalAmount ?? 0;
        continue;
      }
      if (invoice.status === INVOICE_STATUS.UNPAID) {
        unpaid += 1;
        continue;
      }
      if (invoice.status === INVOICE_STATUS.CANCELLED) {
        cancelled += 1;
      }
    }

    return {
      paidRevenue: revenue,
      paidCount: paid,
      unpaidCount: unpaid,
      cancelledCount: cancelled,
    };
  }, [allInvoicesResult?.data?.items]);

  const emptyColSpan = 7;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
      setExpandedId(null);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchText]);

  function handleSort(column: string) {
    if (orderBy === column) {
      setIsDescending((prev) => !prev);
      return;
    }

    setOrderBy(column);
    setIsDescending(false);
    setPageIndex(1);
    setExpandedId(null);
  }

  function handleToggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
  }

  function handleCancel() {
    if (cancelTarget == null) return;

    cancelMutation.mutate(cancelTarget, {
      onSuccess: (resultData) => {
        if (resultData.isSuccess !== true) return;
        setCancelTarget(null);
        setExpandedId(null);
        refetch();
      },
    });
  }

  function handleSelectStatus(value: number | null) {
    setSelectedStatus(value);
    setPageIndex(1);
    setExpandedId(null);
  }

  function handleSelectPaymentMethod(value: number | null) {
    setSelectedPaymentMethod(value);
    setPageIndex(1);
    setExpandedId(null);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
    setExpandedId(null);
  }

  const canCancelInvoice = (invoice: InvoiceDto) => {
    if (!invoice.id) return false;
    return (
      invoice.status !== INVOICE_STATUS.CANCELLED &&
      invoice.status !== INVOICE_STATUS.REFUNDED
    );
  };

  return (
    <>
      <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
        <InvoiceStatCards
          paidRevenue={paidRevenue}
          paidCount={paidCount}
          unpaidCount={unpaidCount}
          cancelledCount={cancelledCount}
          isLoading={isLoading && invoices.length === 0}
        />

        <div className="flex flex-col items-start gap-3 md:flex-row">
          <div className="w-full min-w-0 flex-1">
            <div className="rounded-md border border-kit bg-kit-white shadow-kit-card">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
                <div className="relative w-64">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
                  <Input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Tìm theo mã, tên khách hàng..."
                    inputSize="sm"
                    className="mb-0 h-9 pl-9"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    inputSize="sm"
                    className="mb-0 mr-0 h-9 w-52"
                    value={selectedStatus != null ? String(selectedStatus) : ""}
                    onChange={(event) =>
                      handleSelectStatus(
                        event.target.value
                          ? Number(event.target.value)
                          : null,
                      )
                    }
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option
                        key={String(option.value ?? "all")}
                        value={option.value != null ? String(option.value) : ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    inputSize="sm"
                    className="mb-0 mr-0 h-9 w-52"
                    value={
                      selectedPaymentMethod != null
                        ? String(selectedPaymentMethod)
                        : ""
                    }
                    onChange={(event) =>
                      handleSelectPaymentMethod(
                        event.target.value
                          ? Number(event.target.value)
                          : null,
                      )
                    }
                  >
                    {PAYMENT_OPTIONS.map((option) => (
                      <option
                        key={String(option.value ?? "all")}
                        value={option.value != null ? String(option.value) : ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </Select>

                  <PermissionGate
                    resource={perm.resource}
                    action={perm.create}
                    role={perm.role}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="mb-0 mr-0 h-9"
                      onClick={onCreate}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Lập hóa đơn
                    </Button>
                  </PermissionGate>
                </div>
              </div>

              {/* Table */}
              <TableResponsive>
                <Table hover striped>
                  <TableHead className="bg-kit-primary text-kit-white [&_th]:bg-kit-primary">
                    <TableRow>
                      <TableHeaderCell>
                        <SortableColumnHeader
                          label="Mã hóa đơn"
                          column="code"
                          orderBy={orderBy}
                          isDescending={isDescending}
                          onSort={handleSort}
                        />
                      </TableHeaderCell>
                      <TableHeaderCell>Khách hàng</TableHeaderCell>
                      <TableHeaderCell>
                        <SortableColumnHeader
                          label="Tổng tiền"
                          column="total"
                          orderBy={orderBy}
                          isDescending={isDescending}
                          onSort={handleSort}
                        />
                      </TableHeaderCell>
                      <TableHeaderCell>Hình thức</TableHeaderCell>
                      <TableHeaderCell>Trạng thái</TableHeaderCell>
                      <TableHeaderCell>
                        <SortableColumnHeader
                          label="Ngày lập"
                          column="issued_at"
                          orderBy={orderBy}
                          isDescending={isDescending}
                          onSort={handleSort}
                        />
                      </TableHeaderCell>
                      <TableHeaderCell>Thao tác</TableHeaderCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={emptyColSpan}
                          className="py-8 text-center text-kit-muted"
                        >
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={emptyColSpan}
                          className="py-8 text-center text-kit-muted"
                        >
                          Chưa có hóa đơn
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((invoice: InvoiceDto) => {
                        if (!invoice.id) return null;

                        const canCancel = canCancelInvoice(invoice);
                        const isExpanded = expandedId === invoice.id;

                        return (
                          <Fragment key={invoice.id}>
                            <TableRow
                              className={
                                isExpanded
                                  ? "relative z-10 cursor-pointer border-x-2 border-t-2 border-kit-primary [&>td]:bg-kit-white!"
                                  : "cursor-pointer"
                              }
                              onClick={() => handleToggleExpand(invoice.id!)}
                            >
                              <TableCell className="font-medium text-kit-heading">
                                {invoice.invoiceCode ?? "—"}
                              </TableCell>
                              <TableCell className="text-kit-muted">
                                <div className="leading-5">
                                  <div className="font-medium text-kit-heading">
                                    {invoice.customerName ?? "Khách vãng lai"}
                                  </div>
                                  {invoice.customerPhone ? (
                                    <div className="text-xs text-kit-muted">
                                      {invoice.customerPhone}
                                    </div>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-bold text-kit-primary">
                                {formatCurrency(invoice.totalAmount)}
                              </TableCell>
                              <TableCell className="text-kit-muted">
                                {PAYMENT_LABEL[invoice.paymentMethod ?? 0] ??
                                  "—"}
                              </TableCell>
                              <TableCell>{statusBadge(invoice.status)}</TableCell>
                              <TableCell className="text-kit-muted">
                                {formatDateTimeDisplay(invoice.issuedAt)}
                              </TableCell>
                              <TableCell>
                                <div
                                  className="flex items-center gap-1"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <Button
                                    size="icon-sm"
                                    variant="outline-info"
                                    className="mb-0 mr-0"
                                    onClick={() => {
                                      handleToggleExpand(invoice.id!);
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>

                                  {canCancel ? (
                                    <PermissionGate
                                      resource={perm.resource}
                                      action={perm.update}
                                      role={perm.role}
                                    >
                                      <Button
                                        size="icon-sm"
                                        variant="outline-danger"
                                        className="mb-0 mr-0"
                                        onClick={() => setCancelTarget(invoice.id!)}
                                      >
                                        <Ban className="h-3.5 w-3.5" />
                                      </Button>
                                    </PermissionGate>
                                  ) : null}
                                </div>
                              </TableCell>
                            </TableRow>

                            {isExpanded ? (
                              <TableRow className="relative z-10 border-x-2 border-b-2 border-t-0 border-kit-primary [&>td]:bg-kit-white!">
                                <TableCell
                                  colSpan={emptyColSpan}
                                  className="border-b-0 p-0"
                                >
                                  <InvoiceDetailExpanded
                                    invoiceId={invoice.id!}
                                    onCancel={(id) => setCancelTarget(id)}
                                  />
                                </TableCell>
                              </TableRow>
                            ) : null}
                          </Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableResponsive>

              {/* Pagination */}
              {totalCount > 0 ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kit px-4 py-3">
                  <div className="flex items-center gap-3 text-xs text-kit-dark">
                    <span>
                      {rangeEnd} / {pageSize}
                    </span>
                    <span>Hiển thị: </span>
                    <Select
                      inputSize="sm"
                      className="mb-0 w-28"
                      value={pageSize}
                      onChange={(event) =>
                        handlePageSizeChange(Number(event.target.value))
                      }
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Pagination
                    page={safePage}
                    pageCount={totalPages}
                    onPageChange={setPageIndex}
                    size="sm"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}

