import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import { Plus, Scissors, Trash2 } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import {
  IndexCell,
  PriceCell,
  MutedCell,
  NameCell,
} from "@/shared/components/DataTable/TableCells";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import { STAFF_PERM } from "../constants/staff.permissions";
import {
  useDeleteStaffServicesMutation,
  useStaffServices,
  useUpdateStaffServiceMutation,
} from "../hooks/useStaffs";
import type { StaffServiceDto } from "../types/staff.types";

interface StaffServicesTabProps {
  staffId: number;
  staffName?: string | null;
  onAssign?: () => void;
}

export function StaffServicesTab({
  staffId,
  staffName,
  onAssign,
}: StaffServicesTabProps) {
  const perm = STAFF_PERM;
  const [removeTarget, setRemoveTarget] = useState<StaffServiceDto | null>(
    null,
  );

  const { data: result, isLoading } = useStaffServices({
    staffId,
    pageIndex: 1,
    pageSize: 200,
  });
  const deleteMutation = useDeleteStaffServicesMutation();
  const updateMutation = useUpdateStaffServiceMutation();

  const items = useMemo(() => result?.data?.items ?? [], [result?.data?.items]);

  const columns = useMemo<ColumnDef<StaffServiceDto>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <IndexCell pageIndex={1} pageSize={200} rowIndex={row.index} />
        ),
        size: 50,
        enableResizing: false,
      },
      {
        accessorKey: "serCode",
        header: "Mã dịch vụ",
        cell: ({ row }) => (
          <span className="text-adminGreen-600/80">
            {row.original.serCode ?? "—"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "serName",
        header: "Tên dịch vụ",
        cell: ({ row }) => <NameCell value={row.original.serName} />,
        size: 200,
      },
      {
        accessorKey: "serDurationMins",
        header: "Thời lượng",
        cell: ({ row }) => (
          <MutedCell
            value={
              row.original.serDurationMins != null
                ? `${row.original.serDurationMins} phút`
                : null
            }
          />
        ),
        size: 110,
      },
      {
        accessorKey: "serCostPrice",
        header: "Giá vốn",
        cell: ({ row }) => <PriceCell value={row.original.serCostPrice} />,
        size: 110,
      },
      {
        accessorKey: "serCommissionRate",
        header: "Hoa hồng",
        cell: ({ row }) => (
          <MutedCell
            value={
              row.original.serCommissionRate != null
                ? `${row.original.serCommissionRate}%`
                : null
            }
          />
        ),
        size: 80,
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <PermissionGate resource={perm.resource} action={perm.update}>
                <Switch
                  checked={item.status === StatusActive.Active}
                  onCheckedChange={(checked) => {
                    if (!item.id) return;
                    updateMutation.mutate({
                      id: item.id,
                      payload: {
                        status: checked
                          ? StatusActive.Active
                          : StatusActive.Inactive,
                      },
                    });
                  }}
                  disabled={updateMutation.isPending}
                />
              </PermissionGate>
            </div>
          );
        },
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <PermissionGate resource={perm.resource} action={perm.delete}>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-adminGray-400 hover:text-state-danger-text"
                onClick={() => setRemoveTarget(row.original)}
                aria-label="Gỡ dịch vụ"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </PermissionGate>
          </div>
        ),
        size: 50,
        enableResizing: false,
      },
    ],
    [perm, updateMutation],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => false,
    enableColumnResizing: false,
  });

  function handleRemove() {
    if (!removeTarget?.id) return;
    deleteMutation.mutate([removeTarget.id], {
      onSuccess: (res) => {
        if (res.isSuccess) setRemoveTarget(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-adminGray-600">
          {items.length > 0
            ? `${items.length} dịch vụ đang phân công`
            : "Chưa phân công dịch vụ nào"}
        </p>
        <PermissionGate resource={perm.resource} action={perm.create}>
          <Button
            variant="admin"
            size="sm"
            onClick={onAssign}
            className="h-8 px-3 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Phân công
          </Button>
        </PermissionGate>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        loadingRows={4}
        emptyState={
          <TableEmptyState
            icon={Scissors}
            title="Chưa có dịch vụ thực hiện"
            hint="Phân công dịch vụ để nhân viên có thể nhận lịch tương ứng."
          />
        }
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        onConfirm={handleRemove}
        title={CONFIRM_MSG.deleteTitle("phân công dịch vụ")}
        description={
          staffName
            ? `Gỡ dịch vụ "${removeTarget?.serName ?? ""}" khỏi nhân viên ${staffName}?`
            : CONFIRM_MSG.deleteDescription(
                "phân công dịch vụ",
                removeTarget?.serName ?? "",
              )
        }
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
