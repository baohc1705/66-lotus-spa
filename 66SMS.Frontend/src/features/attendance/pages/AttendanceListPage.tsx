import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import { LogIn, LogOut, Pencil, CalendarCheck, CalendarPlus } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { useAttendances, useCheckIn, useCheckOut } from "../hooks/useAttendances";
import { AttendanceFormDialog } from "../components/AttendanceFormDialog";
import { ManualAttendanceFormDialog } from "../components/ManualAttendanceFormDialog";
import { useAdminStaffs } from "@/features/staffs/hooks/useStaffs";
import { useWorkSchedules } from "@/features/schedules/hooks/useSchedules";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { AttendanceDto } from "../types/attendance.types";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import type { WorkScheduleDTO } from "@/features/schedules/types/schedule.types";
import { formatDisplayDate } from "@/shared/utils/date.utils";

const ATTENDANCE_STATUS_MAP: StatusMap = {
  "1": { label: "Đang làm", variant: "warning", dot: true },
  "2": { label: "Đã ra", variant: "success" },
  "3": { label: "Vắng", variant: "error" },
  "4": { label: "Nghỉ phép", variant: "admin" },
  "5": { label: "Nghỉ lễ", variant: "gold" },
  "6": { label: "Nghỉ không lương", variant: "error" },
};

const formatVnd = (v?: number | null) =>
  v !== null && v !== undefined ? new Intl.NumberFormat("vi-VN").format(v) : "—";

function todayIsoDate(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function displayTime(val?: string | null): string {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// KpiBadge removed

export function AttendanceListPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editTarget, setEditTarget] = useState<AttendanceDto | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedWorkScheduleId, setSelectedWorkScheduleId] = useState<string>("");

  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const today = todayIsoDate();

  const { data: staffsResult } = useAdminStaffs({ pageIndex: 1, pageSize: 200, salonId });
  const staffs = useMemo(() => staffsResult?.data?.items ?? [], [staffsResult?.data?.items]);

  const { data: schedulesResult } = useWorkSchedules({
    pageIndex: 1,
    pageSize: 50,
    staffId: selectedStaffId ? Number(selectedStaffId) : undefined,
    salonId: salonId ?? undefined,
    startDate: today,
    endDate: today,
  });
  const todaySchedules = useMemo(
    () => schedulesResult?.data?.items ?? [],
    [schedulesResult?.data?.items],
  );

  const { data: result, isLoading } = useAttendances({
    pageIndex,
    pageSize,
    staffId: staffId ?? undefined,
    salonId,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const paged = result?.data;
  const items = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const handleCheckIn = () => {
    if (!selectedStaffId || !selectedWorkScheduleId) return;
    checkInMutation.mutate({
      staffId: Number(selectedStaffId),
      workScheduleId: Number(selectedWorkScheduleId),
    });
  };

  const handleCheckOut = () => {
    if (!selectedStaffId || !selectedWorkScheduleId) return;
    checkOutMutation.mutate({
      staffId: Number(selectedStaffId),
      workScheduleId: Number(selectedWorkScheduleId),
    });
  };

  const columns = useMemo<ColumnDef<AttendanceDto>[]>(
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
        accessorKey: "shiftName",
        header: "Ca",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80">{row.original.shiftName ?? "—"}</span>
        ),
      },
      {
        accessorKey: "workDate",
        header: "Ngày",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80">
            {formatDisplayDate(row.original.workDate)}
          </span>
        ),
      },
      {
        accessorKey: "checkInAt",
        header: "Giờ vào",
        cell: ({ row }) => <span>{displayTime(row.original.checkInAt)}</span>,
      },
      {
        accessorKey: "checkOutAt",
        header: "Giờ ra",
        cell: ({ row }) => <span>{displayTime(row.original.checkOutAt)}</span>,
      },
      // KPI columns removed
      {
        accessorKey: "workCredits",
        header: "Công",
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-gold">
            {row.original.workCredits ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status?.toString() ?? null} statusMap={ATTENDANCE_STATUS_MAP} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditTarget(row.original)}
            title="Sửa giờ"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        ),
        size: 50,
      },
    ],
    [pageIndex, pageSize],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden">
        <div className="p-4 flex flex-wrap items-end gap-3 border-b border-stone-100">
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-lotus-deep/80">Nhân viên</label>
            <Select
              value={selectedStaffId}
              onValueChange={(v) => {
                setSelectedStaffId(v);
                setSelectedWorkScheduleId("");
              }}
            >
              <SelectTrigger className="h-9 text-[13px] w-[200px]">
                <SelectValue placeholder="Chọn nhân viên..." />
              </SelectTrigger>
              <SelectContent>
                {staffs.map((s: StaffDto) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-lotus-deep/80">Ca hôm nay *</label>
            <Select
              value={selectedWorkScheduleId}
              onValueChange={setSelectedWorkScheduleId}
              disabled={!selectedStaffId}
            >
              <SelectTrigger className="h-9 text-[13px] w-[200px]">
                <SelectValue placeholder={selectedStaffId ? "Chọn ca..." : "Chọn NV trước"} />
              </SelectTrigger>
              <SelectContent>
                {todaySchedules.map((ws: WorkScheduleDTO) => (
                  <SelectItem key={ws.id} value={String(ws.id)}>
                    {ws.shift?.name ?? `Ca #${ws.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="admin"
            size="sm"
            className="gap-1.5"
            onClick={handleCheckIn}
            loading={checkInMutation.isPending}
            disabled={!selectedStaffId || !selectedWorkScheduleId}
          >
            <LogIn className="w-3.5 h-3.5" /> Check-in
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCheckOut}
            loading={checkOutMutation.isPending}
            disabled={!selectedStaffId || !selectedWorkScheduleId}
          >
            <LogOut className="w-3.5 h-3.5" /> Check-out
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setManualOpen(true)}
          >
            <CalendarPlus className="w-3.5 h-3.5" /> Ghi nghỉ phép/lễ
          </Button>

          <div className="ml-auto flex items-end gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-lotus-deep/80">Lọc NV</label>
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
              <label className="text-[12px] font-semibold text-lotus-deep/80">Từ ngày</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPageIndex(1);
                }}
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-lotus-deep/80">Đến ngày</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPageIndex(1);
                }}
                className="h-9 text-[13px]"
              />
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
                <CalendarCheck className="w-7 h-7 text-lotus-stone" />
              </div>
              <p className="text-sm font-semibold text-lotus-deep">Chưa có chấm công</p>
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

      <AttendanceFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        attendance={editTarget}
      />

      <ManualAttendanceFormDialog open={manualOpen} onOpenChange={setManualOpen} />
    </div>
  );
}
