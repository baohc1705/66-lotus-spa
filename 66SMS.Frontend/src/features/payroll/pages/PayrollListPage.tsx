import { Calculator, CheckCircle2, Pencil, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { useSalons } from "@/features/salons/hooks/useSalons";
import { useAdminStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import type { SalonListItem } from "@/features/salons/types/salon.types";
import { Pagination } from "@/shared/components/Pagination";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { DataTable } from "@/shared/tables/DataTable";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import {
  IndexCell,
  MutedCell,
  NameCell,
  PriceCell,
} from "@/shared/tables/TableCells";
import { formatCurrency } from "@/shared/utils/currency";

import { EditPayrollDialog } from "../components/EditPayrollDialog";
import { GeneratePayrollDialog } from "../components/GeneratePayrollDialog";
import { useConfirmPayroll, usePayrolls } from "../hooks/usePayrolls";
import type { PayrollDto } from "../types/payroll.types";

const SALARY_TYPE_LABEL: Record<string, string> = {
  "1": "Theo giờ",
  "2": "Theo ngày công",
};

const now = new Date();

export function PayrollListPage() {
  "use no memo";
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [localSalonId, setLocalSalonId] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(now.getFullYear());
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollDto | null>(null);

  const headerSalonId = useAuthStore((s) => s.getEffectiveSalonId());
  const effectiveSalonId = headerSalonId ?? localSalonId;

  const { data: staffsResult } = useAdminStaffs({
    pageIndex: 1,
    pageSize: 200,
    salonId: effectiveSalonId ?? undefined,
  });
  const staffs = useMemo(
    () => staffsResult?.data?.items ?? [],
    [staffsResult?.data?.items],
  );

  const { data: salonsResult } = useSalons(
    { pageIndex: 1, pageSize: 100 },
    !headerSalonId,
  );
  const salons = useMemo(() => salonsResult?.data?.items ?? [], [salonsResult]);

  const { data: result, isLoading, isFetching } = usePayrolls({
    pageIndex,
    pageSize,
    staffId: staffId ?? undefined,
    salonId: effectiveSalonId ?? undefined,
    month: month ?? undefined,
    year: year ?? undefined,
  });

  const confirmMutation = useConfirmPayroll();

  const paged = result?.data;
  const items = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const months = Array.from({ length: 12 }, (_: unknown, index: number) => index + 1);
  const years = Array.from(
    { length: 6 },
    (_: unknown, index: number) => now.getFullYear() - index,
  );

  const staffOptions = useMemo(
    () =>
      staffs
        .filter((staff: StaffDto) => staff.id != null)
        .map((staff: StaffDto) => ({
          value: String(staff.id),
          label: staff.fullName ?? `Nhân viên #${staff.id}`,
        })),
    [staffs],
  );

  const salonOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả chi nhánh" },
      ...salons
        .filter((salon: SalonListItem) => salon.id != null)
        .map((salon: SalonListItem) => ({
          value: String(salon.id),
          label: salon.name ?? `Chi nhánh #${salon.id}`,
        })),
    ],
    [salons],
  );

  const monthOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      ...months.map((monthValue: number) => ({
        value: String(monthValue),
        label: `Tháng ${monthValue}`,
      })),
    ],
    [months],
  );

  const yearOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      ...years.map((yearValue: number) => ({
        value: String(yearValue),
        label: String(yearValue),
      })),
    ],
    [years],
  );

  const columns = useMemo<ColumnDef<PayrollDto>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <IndexCell
            pageIndex={pageIndex}
            pageSize={pageSize}
            rowIndex={row.index}
          />
        ),
        size: 50,
      },
      {
        accessorKey: "staffName",
        header: "Nhân viên",
        cell: ({ row }) => <NameCell value={row.original.staffName} />,
      },
      {
        id: "period",
        header: "Kỳ lương",
        cell: ({ row }) => (
          <MutedCell
            value={`${row.original.periodMonth}/${row.original.periodYear}`}
          />
        ),
      },
      {
        accessorKey: "salaryType",
        header: "Loại lương",
        cell: ({ row }) => (
          <MutedCell
            value={
              SALARY_TYPE_LABEL[String(row.original.salaryType ?? "")] ?? "—"
            }
          />
        ),
      },
      {
        accessorKey: "rate",
        header: "Lương tháng",
        cell: ({ row }) => <PriceCell value={row.original.rate} />,
      },
      {
        accessorKey: "standardWorkDays",
        header: "Công chuẩn",
        cell: ({ row }) => (
          <MutedCell value={row.original.standardWorkDays ?? "—"} />
        ),
      },
      {
        accessorKey: "totalHours",
        header: "Tổng giờ",
        cell: ({ row }) => <MutedCell value={row.original.totalHours ?? 0} />,
      },
      {
        accessorKey: "totalWorkDays",
        header: "Tổng công",
        cell: ({ row }) => <MutedCell value={row.original.totalWorkDays ?? 0} />,
      },
      {
        accessorKey: "baseAmount",
        header: "Lương CB",
        cell: ({ row }) => <PriceCell value={row.original.baseAmount} />,
      },
      {
        accessorKey: "commissionAmount",
        header: "Hoa hồng dịch vụ",
        cell: ({ row }) => (
          <span className="font-semibold text-kit-warning">
            {formatCurrency(row.original.commissionAmount)}
          </span>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Tổng",
        cell: ({ row }) => (
          <span className="font-semibold text-kit-heading">
            {formatCurrency(row.original.totalAmount)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === 2) {
            return (
              <Badge variant="success" soft>
                Đã chốt
              </Badge>
            );
          }
          return (
            <Badge variant="warning" soft>
              Nháp
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const payroll = row.original;
          if (!payroll.id) return null;
          return (
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                className="mb-0"
                onClick={() => setEditingPayroll(payroll)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Sửa
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="mb-0"
                loading={confirmMutation.isPending}
                onClick={() => confirmMutation.mutate(payroll.id!)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Chốt
              </Button>
            </div>
          );
        },
        size: 180,
      },
    ],
    [pageIndex, pageSize, confirmMutation],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <Button
              variant="primary"
              size="sm"
              className="mb-0"
              onClick={() => setGenerateOpen(true)}
            >
              <Calculator className="h-3.5 w-3.5" />
              Tính lương
            </Button>

            <div className="ml-auto flex flex-wrap items-end gap-3">
              {!headerSalonId ? (
                <FormField label="Chi nhánh" className="mb-0 min-w-44">
                  <Select
                    inputSize="sm"
                    value={localSalonId ? String(localSalonId) : "all"}
                    options={salonOptions}
                    onChange={(event) => {
                      const value = event.target.value;
                      setLocalSalonId(value === "all" ? null : Number(value));
                      setStaffId(null);
                      setPageIndex(1);
                    }}
                  />
                </FormField>
              ) : null}

              <FormField label="Nhân viên" className="mb-0 min-w-55">
                <SearchableSelect
                  inputSize="sm"
                  className="w-55"
                  value={staffId ? String(staffId) : ""}
                  options={staffOptions}
                  placeholder="Tất cả nhân viên"
                  searchPlaceholder="Tìm nhân viên..."
                  emptyText="Không tìm thấy"
                  clearable
                  onChange={(value: string) => {
                    setStaffId(value ? Number(value) : null);
                    setPageIndex(1);
                  }}
                />
              </FormField>

              <FormField label="Tháng" className="mb-0 min-w-[120px]">
                <Select
                  inputSize="sm"
                  value={month ? String(month) : "all"}
                  options={monthOptions}
                  onChange={(event) => {
                    const value = event.target.value;
                    setMonth(value === "all" ? null : Number(value));
                    setPageIndex(1);
                  }}
                />
              </FormField>

              <FormField label="Năm" className="mb-0 min-w-[120px]">
                <Select
                  inputSize="sm"
                  value={year ? String(year) : "all"}
                  options={yearOptions}
                  onChange={(event) => {
                    const value = event.target.value;
                    setYear(value === "all" ? null : Number(value));
                    setPageIndex(1);
                  }}
                />
              </FormField>
            </div>
          </div>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={
            pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize
          }
          emptyState={
            <TableEmptyState
              icon={Wallet}
              title="Chưa có bảng lương"
              action={
                <Button
                  variant="primary"
                  size="sm"
                  className="mb-0"
                  onClick={() => setGenerateOpen(true)}
                >
                  <Calculator className="h-3.5 w-3.5" />
                  Tính lương
                </Button>
              }
            />
          }
          pagination={
            paged && totalCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 text-xs text-kit-muted">
                  <span>
                    {rangeStart}-{rangeEnd} / {totalCount}
                  </span>
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPageIndex(1);
                    }}
                    className="h-8 cursor-pointer rounded border border-kit bg-kit-white px-2 text-xs text-kit-heading outline-none focus:border-kit-primary"
                  >
                    {[5, 10, 20].map((size: number) => (
                      <option key={size} value={size}>
                        {size} / trang
                      </option>
                    ))}
                  </select>
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

      <GeneratePayrollDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
      />
      <EditPayrollDialog
        open={editingPayroll !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPayroll(null);
        }}
        payroll={editingPayroll}
      />
    </div>
  );
}
