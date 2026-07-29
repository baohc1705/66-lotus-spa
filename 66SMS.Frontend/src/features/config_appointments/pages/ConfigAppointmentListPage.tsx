import { useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";

import { ConfigAppointmentFormDialog } from "../components/ConfigAppointmentFormDialog";
import { useConfigAppointmentListState } from "../hooks/useConfigAppointmentListState";
import {
  CONFIG_APPOINTMENT_COLUMN_LABELS,
  useActiveConfigAppointmentColumns,
} from "../components/useActiveConfigAppointmentColumns";
import { CONFIG_APPOINTMENT_PERM } from "../constants/config_appointment.permissions";
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

  const activeColumns = useActiveConfigAppointmentColumns({
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
    columns: activeColumns,
    state: {
      columnVisibility,
    },
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
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (deleteResult) => {
          if (deleteResult.isSuccess) setDeleteTarget(null);
        },
      });
    }
  };

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <DataTableToolbar
        searchPlaceholder="Tìm kiếm cấu hình..."
        searchValue={filter}
        onSearchChange={handleSearchChange}
      >
        <DataTableViewOptions table={table} columnLabels={columnLabels} />
        <div className="flex items-center gap-2 ml-auto">
          <PermissionGate resource={perm.resource} action={perm.create}>
            <Button
              variant="admin"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="lotus-admin-table-toolbar-btn"
            >
              <Plus className="w-4 h-4" />
              Thêm cấu hình
            </Button>
          </PermissionGate>
        </div>
      </DataTableToolbar>

      <div className="lotus-admin-table-page-card">
        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
        />
      </div>

      <DataTablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={paged?.totalPages ?? 0}
        hasPreviousPage={paged?.hasPreviousPage ?? false}
        hasNextPage={paged?.hasNextPage ?? false}
        onPageChange={listState.setPageIndex}
        onPageSizeChange={handlePageSizeChange}
      />

      <ConfigAppointmentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        configAppointment={null}
      />

      {editTarget && (
        <ConfigAppointmentFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          configAppointment={editTarget}
        />
      )}

      {deleteTarget && (
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
        />
      )}
    </TablePageShell>
  );
}
