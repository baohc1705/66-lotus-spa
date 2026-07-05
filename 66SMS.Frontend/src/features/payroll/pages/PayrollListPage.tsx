import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import { Calculator, CheckCircle2, Wallet } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { usePayrolls, useConfirmPayroll } from "../hooks/usePayrolls";
import { GeneratePayrollDialog } from "../components/GeneratePayrollDialog";
import { useAdminStaffs } from "@/features/staffs/hooks/useStaffs";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { PayrollDto } from "../types/payroll.types";
import type { StaffDto } from "@/features/staffs/types/staff.types";

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
  v !== null && v !== undefined ? new Intl.NumberFormat("vi-VN").format(v) : "—";

export function PayrollListPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(now.getFullYear());
  const [generateOpen, setGenerateOpen] = useState(false);

  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { data: staffsResult } = useAdminStaffs({ pageIndex: 1, pageSize: 200, salonId });
  const staffs = useMemo(() => staffsResult?.data?.items ?? [], [staffsResult?.data?.items]);

  const { data: result, isLoading } = usePayrolls({
    pageIndex,
    pageSize,
    staffId: staffId ?? undefined,
    salonId,
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
          <span className="text-lotus-stone">
            {(pageIndex - 1) * pageSize + row.index + 1}
          </span>
        ),
        size: 50,
      },
      {
        accessorKey: "staffName",
        header: "Nhân viên",
        cell: ({ row }) => (
          <span className="text-[13px] font-semibold text-lotus-deep">
            {row.original.staffName ?? "—"}
          </span>
        ),
      },
      {
        id: "period",
        header: "Kỳ lương",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80">
            {row.original.periodMonth}/{row.original.periodYear}
          </span>
        ),
      },
      {
        accessorKey: "salaryType",
        header: "Loại lương",
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
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
          <span className="text-lotus-gold font-semibold">
            {formatVnd(row.original.commissionAmount)}
          </span>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Tổng",
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {formatVnd(row.original.totalAmount)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status?.toString() ?? null} statusMap={PAYROLL_STATUS_MAP} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const p = row.original;
          if (p.status === 2 || !p.id) return null;
          return (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-[12px]"
              onClick={() => confirmMutation.mutate(p.id!)}
              loading={confirmMutation.isPending}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Chốt
            </Button>
          );
        },
        size: 80,
      },
    ],
    [pageIndex, pageSize, confirmMutation],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden w-full">
        {/* Toolbar */}
        <div className="p-4 flex flex-wrap items-end gap-3 border-b border-stone-100">
          <Button
            variant="admin"
            size="sm"
            className="gap-1.5"
            onClick={() => setGenerateOpen(true)}
          >
            <Calculator className="w-3.5 h-3.5" /> Tính lương
          </Button>

          <div className="ml-auto flex items-end gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-lotus-deep/80">Nhân viên</label>
              <Select
                value={staffId ? String(staffId) : "all"}
                onValueChange={(v) => {
                  setStaffId(v === "all" ? null : Number(v));
                  setPageIndex(1);
                }}
              >
                <SelectTrigger className="h-9 text-[13px] w-[180px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
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
              <label className="text-[12px] font-semibold text-lotus-deep/80">Tháng</label>
              <Select
                value={month ? String(month) : "all"}
                onValueChange={(v) => {
                  setMonth(v === "all" ? null : Number(v));
                  setPageIndex(1);
                }}
              >
                <SelectTrigger className="h-9 text-[13px] w-[120px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
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
              <label className="text-[12px] font-semibold text-lotus-deep/80">Năm</label>
              <Select
                value={year ? String(year) : "all"}
                onValueChange={(v) => {
                  setYear(v === "all" ? null : Number(v));
                  setPageIndex(1);
                }}
              >
                <SelectTrigger className="h-9 text-[13px] w-[120px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
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
          loadingRows={pageSize > 5 ? 5 : pageSize}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Wallet className="w-7 h-7 text-lotus-stone" />
              </div>
              <p className="text-sm font-semibold text-lotus-deep">Chưa có bảng lương</p>
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
      </div>

      <GeneratePayrollDialog open={generateOpen} onOpenChange={setGenerateOpen} />
    </div>
  );
}
