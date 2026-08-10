import { useMemo, useState } from "react";
import { Plus, Scissors, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Button } from "@/shared/elements/Button";
import { Switch } from "@/shared/forms/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { StatusActive } from "@/shared/constants/status.enum";
import { formatCurrency } from "@/shared/utils/currency";

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

  function handleRemove() {
    if (!removeTarget?.id) return;
    deleteMutation.mutate([removeTarget.id], {
      onSuccess: (res) => {
        if (res.isSuccess) setRemoveTarget(null);
      },
    });
  }

  if (isLoading) {
    return <p className="py-6 text-center text-sm text-kit-muted">Đang tải...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-kit-muted">
          {items.length > 0
            ? `${items.length} dịch vụ đang phân công`
            : "Chưa phân công dịch vụ nào"}
        </p>
        <PermissionGate resource={perm.resource} action={perm.create}>
          <Button
            variant="admin"
            size="sm"
            className="mb-0"
            onClick={onAssign}
          >
            <Plus className="h-3.5 w-3.5" />
            Phân công
          </Button>
        </PermissionGate>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-kit-muted">
          <Scissors className="h-8 w-8" />
          <p className="text-sm font-medium text-kit-heading">
            Chưa có dịch vụ thực hiện
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-kit bg-kit-white">
          <Table size="sm" hover>
            <TableHead>
              <TableRow>
                <TableHeaderCell>#</TableHeaderCell>
                <TableHeaderCell>Mã dịch vụ</TableHeaderCell>
                <TableHeaderCell>Tên dịch vụ</TableHeaderCell>
                <TableHeaderCell>Thời lượng</TableHeaderCell>
                <TableHeaderCell>Giá vốn</TableHeaderCell>
                <TableHeaderCell>Hoa hồng</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
                <TableHeaderCell className="w-16 text-center">
                  Xóa
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item: StaffServiceDto, index: number) => (
                <TableRow key={item.id ?? item.serviceId}>
                  <TableCell className="text-kit-muted">{index + 1}</TableCell>
                  <TableCell className="text-kit-muted">
                    {item.serCode ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium text-kit-heading">
                    {item.serName ?? "—"}
                  </TableCell>
                  <TableCell className="text-kit-muted">
                    {item.serDurationMins != null
                      ? `${item.serDurationMins} phút`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-kit-muted">
                    {formatCurrency(item.serCostPrice)}
                  </TableCell>
                  <TableCell className="text-kit-muted">
                    {item.serCommissionRate != null
                      ? `${item.serCommissionRate}%`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <PermissionGate
                      resource={perm.resource}
                      action={perm.update}
                    >
                      <Switch
                        className="mb-0"
                        checked={item.status === StatusActive.Active}
                        onChange={(checked: boolean) => {
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
                  </TableCell>
                  <TableCell className="text-center">
                    <PermissionGate
                      resource={perm.resource}
                      action={perm.delete}
                    >
                      <Tooltip text="Gỡ dịch vụ">
                        <Button
                          size="icon-sm"
                          variant="outline-danger"
                          className="mb-0 mr-0"
                          onClick={() => setRemoveTarget(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        onConfirm={handleRemove}
        title="Xóa phân công dịch vụ"
        description={
          staffName
            ? `Gỡ dịch vụ "${removeTarget?.serName ?? ""}" khỏi nhân viên ${staffName}?`
            : `Bạn có chắc muốn xóa phân công dịch vụ "${removeTarget?.serName ?? ""}"? Hành động này không thể hoàn tác.`
        }
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
