import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { StaffSalonFormDialog } from "../components/StaffSalonFormDialog";
import { StaffSalonStatusBadge } from "../components/StaffSalonStatusBadge";
import { useStaffSalons, useDeleteStaffSalon } from "../hooks/useStaffSalons";
import type { StaffSalonDTO } from "../types/staff-salon.types";

interface SalonStaffPageProps {
  salonId: number;
}

export function SalonStaffPage({ salonId }: SalonStaffPageProps) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffSalonDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffSalonDTO | null>(null);

  const { data: result, isLoading } = useStaffSalons({
    salonId,
    pageIndex,
    pageSize,
  });
  const deleteMutation = useDeleteStaffSalon();

  const paged = result?.data;
  const items = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const columns: ColumnDef<StaffSalonDTO>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-adminGray-400 text-sm">
          {(pageIndex - 1) * pageSize + row.index + 1}
        </span>
      ),
      size: 50,
    },
    {
      accessorKey: "staffId",
      header: "Mã NV",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs bg-adminGray-100 px-1.5 py-0.5 rounded">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "staffName",
      header: "Họ tên",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-adminGray-100 px-1.5 py-0.5 rounded">
          {row.original.staffName}
        </span>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Ngày bắt đầu",
      cell: ({ getValue }) => (
        <span className="text-sm">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "endDate",
      header: "Ngày kết thúc",
      cell: ({ getValue }) => (
        <span className="text-sm text-adminGray-600">
          {String(getValue() ?? "—")}
        </span>
      ),
    },
    {
      id: "statusBadge",
      header: "Trạng thái",
      cell: ({ row }) => (
        <StaffSalonStatusBadge
          status={row.original.status}
          isManager={row.original.isManager}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditTarget(row.original)}>
              <Pencil className="h-3.5 w-3.5 mr-2" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-state-danger-text"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 50,
    },
  ];

  const table = useReactTable({
    data: items,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-adminGray-600">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Nhân viên chi nhánh</span>
          <span className="text-xs text-adminGray-400">({totalCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Gán nhân viên
          </Button>
        </div>
      </div>

      <DataTable table={table} isLoading={isLoading} />

      {totalCount > pageSize && (
        <DataTablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={paged?.totalPages ?? 0}
          hasPreviousPage={paged?.hasPreviousPage ?? false}
          hasNextPage={paged?.hasNextPage ?? false}
          onPageChange={setPageIndex}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPageIndex(1);
          }}
        />
      )}

      <StaffSalonFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        salonId={salonId}
      />

      <StaffSalonFormDialog
        open={!!editTarget}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
        salonId={salonId}
        staffSalon={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Xóa nhân viên khỏi chi nhánh?"
        description="Hành động này sẽ xóa nhân viên khỏi chi nhánh này."
        onConfirm={() => {
          if (deleteTarget?.id) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
