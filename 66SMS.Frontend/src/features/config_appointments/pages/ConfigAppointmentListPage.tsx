import { useMemo } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Plus, Settings } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { Select } from "@/shared/forms/Select";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { ConfigAppointmentFormDialog } from "../components/ConfigAppointmentFormDialog";
import {
  CONFIG_APPOINTMENT_COLUMN_LABELS,
  useActiveConfigAppointmentColumns,
} from "../components/useActiveConfigAppointmentColumns";
import { CONFIG_APPOINTMENT_PERM } from "../constants/config_appointment.permissions";
import { useConfigAppointmentListState } from "../hooks/useConfigAppointmentListState";
import {
  useAdminConfigAppointments,
  useDeleteConfigAppointment,
} from "../hooks/useConfigAppointments";

const ENTITY = "cấu hình lịch hẹn";

export function ConfigAppointmentListPage() {
  const perm = CONFIG_APPOINTMENT_PERM;
  const listState = useConfigAppointmentListState();

  const {
    queryParams,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
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

  const {
    data: result,
    isLoading,
    isFetching,
  } = useAdminConfigAppointments(queryParams);
  const deleteMutation = useDeleteConfigAppointment();

  const paged = result?.data;
  const items = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const columns = useActiveConfigAppointmentColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  const table = useReactTable({
    data: items,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(
    () => ({ ...CONFIG_APPOINTMENT_COLUMN_LABELS }),
    [],
  );

  const handleDelete = () => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (deleteResult) => {
        if (deleteResult.isSuccess) setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          <DataTableToolbar
            searchPlaceholder="Tìm kiếm cấu hình..."
            searchValue={filter}
            onSearchChange={handleSearchChange}
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
            <PermissionGate resource={perm.resource} action={perm.create}>
              <Button
                variant="admin"
                size="sm"
                className="mb-0"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm cấu hình
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          emptyState={
            <TableEmptyState
              icon={Settings}
              title="Chưa có cấu hình lịch hẹn"
              hint="Thêm cấu hình phần trăm cọc và khung giờ cho từng chi nhánh."
              action={
                <PermissionGate resource={perm.resource} action={perm.create}>
                  <Button
                    variant="admin"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm cấu hình
                  </Button>
                </PermissionGate>
              }
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

      <ConfigAppointmentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        configAppointment={null}
      />

      {editTarget ? (
        <ConfigAppointmentFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          configAppointment={editTarget}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title={CONFIRM_MSG.deleteTitle(ENTITY)}
          description={CONFIRM_MSG.deleteDescription(
            ENTITY,
            deleteTarget.salonName ?? `#${deleteTarget.id}`,
          )}
          onConfirm={handleDelete}
          confirmLabel={COMMON_MSG.delete}
          loading={deleteMutation.isPending}
          variant="danger"
        />
      ) : null}
    </div>
  );
}
