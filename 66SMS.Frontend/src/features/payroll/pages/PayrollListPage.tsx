import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useSalons } from "@/features/salons/hooks/useSalons";
import { useAdminStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/button";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { containerVariants } from "@/shared/motion/pageVariants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Calculator, CheckCircle2, Pencil, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { EditPayrollDialog } from "../components/EditPayrollDialog";
import { GeneratePayrollDialog } from "../components/GeneratePayrollDialog";
import { useConfirmPayroll, usePayrolls } from "../hooks/usePayrolls";
import type { PayrollDto } from "../types/payroll.types";

const PAYROLL_STATUS_MAP: StatusMap = {
  "1": { label: "Nháp", variant: "warning" },
  "2": { label: "Đã chốt", variant: "success", dot: true },
};

const SALARY_TYPE_LABEL: Record<string, string> = {
  "1": "Theo giờ",
  "2": "Theo ngày công",
};

const now = new Date();
const formatVnd = (v?: number | null) =>
  v !== null && v !== undefined
    ? new Intl.NumberFormat("vi-VN").format(v)
    : "—";

export function PayrollListPage() {
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

  const { data: result, isLoading } = usePayrolls({
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

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);

  const columns = useMemo<ColumnDef<PayrollDto>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-adminGray-600">
            {(pageIndex - 1) * pageSize + row.index + 1}
          </span>
        ),
        size: 50,
      },
      {
        accessorKey: "staffName",
        header: "Nhân viên",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-adminInk">
            {row.original.staffName ?? "—"}
          </span>
        ),
      },
      {
        id: "period",
        header: "Kỳ lương",
        cell: ({ row }) => (
          <span className="text-adminInk/80">
            {row.original.periodMonth}/{row.original.periodYear}
          </span>
        ),
      },
      {
        accessorKey: "salaryType",
        header: "Loại lương",
        cell: ({ row }) => (
          <span className="text-adminInk/70">
            {SALARY_TYPE_LABEL[String(row.original.salaryType ?? "")] ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "rate",
        header: "Lương tháng",
        cell: ({ row }) => <span>{formatVnd(row.original.rate)}</span>,
      },
      {
        accessorKey: "standardWorkDays",
        header: "Công chuẩn",
        cell: ({ row }) => <span>{row.original.standardWorkDays ?? "—"}</span>,
      },
      {
        accessorKey: "totalHours",
        header: "Tổng giờ",
        cell: ({ row }) => <span>{row.original.totalHours ?? 0}</span>,
      },
      {
        accessorKey: "totalWorkDays",
        header: "Tổng công",
        cell: ({ row }) => <span>{row.original.totalWorkDays ?? 0}</span>,
      },
      {
        accessorKey: "baseAmount",
        header: "Lương CB",
        cell: ({ row }) => <span>{formatVnd(row.original.baseAmount)}</span>,
      },
      {
        accessorKey: "commissionAmount",
        header: "Hoa hồng dịch vụ",
        cell: ({ row }) => (
          <span className="text-adminGold-600 font-semibold">
            {formatVnd(row.original.commissionAmount)}
          </span>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Tổng",
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk">
            {formatVnd(row.original.totalAmount)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status?.toString() ?? null}
            statusMap={PAYROLL_STATUS_MAP}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const p = row.original;
          if (!p.id) return null;
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs h-8 px-2 text-adminInk hover:text-adminInk hover:bg-lotus-stone/10"
                onClick={() => setEditingPayroll(p)}
              >
                <Pencil className="w-3.5 h-3.5" /> Sửa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs h-8 px-2 text-adminGreen-600 hover:text-state-success-text hover:bg-adminGreen-50"
                onClick={() => confirmMutation.mutate(p.id!)}
                loading={confirmMutation.isPending}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Chốt
              </Button>
            </div>
          );
        },
        size: 150,
      },
    ],
    [pageIndex, pageSize, confirmMutation, setEditingPayroll],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden w-full">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="lotus-admin-table-page-card flex-1 min-h-0 flex flex-col overflow-hidden relative"
      >
        <div className="p-4 flex flex-wrap items-end gap-3 border-b border-adminGray-100 shrink-0">
          <Button
            variant="admin"
            size="sm"
            className="lotus-admin-table-toolbar-btn gap-1.5"
            onClick={() => setGenerateOpen(true)}
          >
            <Calculator className="w-3.5 h-3.5" /> Tính lương
          </Button>

          <div className="ml-auto flex items-end gap-3">
            {!headerSalonId && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-adminInk/80">
                  Chi nhánh
                </label>
                <Select
                  value={localSalonId ? String(localSalonId) : "all"}
                  onValueChange={(v) => {
                    setLocalSalonId(v === "all" ? null : Number(v));
                    setStaffId(null);
                    setPageIndex(1);
                  }}
                >
                  <AdminSelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tất cả" />
                  </AdminSelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                    {salons.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-adminInk/80">
                Nhân viên
              </label>
              <Select
                value={staffId ? String(staffId) : "all"}
                onValueChange={(v) => {
                  setStaffId(v === "all" ? null : Number(v));
                  setPageIndex(1);
                }}
              >
                <AdminSelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tất cả" />
                </AdminSelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {staffs.map((s: StaffDto) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-adminInk/80">
                Tháng
              </label>
              <Select
                value={month ? String(month) : "all"}
                onValueChange={(v) => {
                  setMonth(v === "all" ? null : Number(v));
                  setPageIndex(1);
                }}
              >
                <AdminSelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tất cả" />
                </AdminSelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-adminInk/80">
                Năm
              </label>
              <Select
                value={year ? String(year) : "all"}
                onValueChange={(v) => {
                  setYear(v === "all" ? null : Number(v));
                  setPageIndex(1);
                }}
              >
                <AdminSelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tất cả" />
                </AdminSelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-adminGray-50 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-adminGray-600" />
              </div>
              <p className="text-sm font-semibold text-adminInk">
                Chưa có bảng lương
              </p>
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
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPageIndex(1);
                }}
              />
            ) : null
          }
        />
      </motion.div>

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
