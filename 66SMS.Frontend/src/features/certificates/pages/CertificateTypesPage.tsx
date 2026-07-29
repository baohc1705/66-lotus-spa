import { useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Plus, Award } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { CertificateTypeFormDialog } from "../components/CertificateTypeFormDialog";
import {
  useActiveCertificateTypeColumns,
  CERTIFICATE_TYPE_COLUMN_LABELS,
} from "../components/useActiveCertificateTypeColumns";
import {
  useCertificateTypes,
  useDeleteCertificateType,
} from "../hooks/useCertificateTypes";
import { useCertificateTypeListState } from "../hooks/useCertificateTypeListState";
import { CERTIFICATE_PERM } from "../constants/certificate.permissions";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

const ENTITY = "loại chứng chỉ";

export function CertificateTypesPage() {
  const perm = CERTIFICATE_PERM;
  const listState = useCertificateTypeListState();
  const {
    pageIndex,
    pageSize,
    filter,
    columnVisibility,
    createOpen,
    editTarget,
    deleteTarget,
    setPageIndex,
    handlePageSizeChange,
    setCreateOpen,
    setEditTarget,
    setDeleteTarget,
    setColumnVisibility,
    handleSearchChange,
    queryParams,
  } = listState;

  const {
    data: result,
    isLoading,
    isFetching,
  } = useCertificateTypes(queryParams);
  const deleteMutation = useDeleteCertificateType();

  const paged = result?.data;
  const items = useMemo(() => paged?.items ?? [], [paged?.items]);

  const columns = useActiveCertificateTypeColumns({
    pageIndex,
    pageSize,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (r) => {
          if (r.isSuccess) setDeleteTarget(null);
        },
      });
    }
  };

  const columnLabels = useMemo(
    () => ({ ...CERTIFICATE_TYPE_COLUMN_LABELS }),
    [],
  );

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="bg-white/70 backdrop-blur-md rounded-admin border border-adminGray-100/30 overflow-hidden">
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tên, mã..."
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
            <PermissionGate resource={perm.resource} action={perm.create}>
              <Button
                variant="admin"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="lotus-admin-table-toolbar-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm loại chứng chỉ
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={
            pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize
          }
          emptyState={
            <TableEmptyState
              icon={Award}
              title="Chưa có loại chứng chỉ"
              hint="Thêm loại chứng chỉ để quản lý bằng cấp nhân viên."
              action={
                <PermissionGate resource={perm.resource} action={perm.create}>
                  <Button
                    variant="admin"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="mt-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm loại chứng chỉ
                  </Button>
                </PermissionGate>
              }
            />
          }
          pagination={
            paged && paged.totalCount > 0 ? (
              <DataTablePagination
                pageIndex={paged.pageIndex}
                pageSize={paged.pageSize}
                totalCount={paged.totalCount}
                totalPages={paged.totalPages}
                hasPreviousPage={paged.hasPreviousPage}
                hasNextPage={paged.hasNextPage}
                onPageChange={setPageIndex}
                onPageSizeChange={handlePageSizeChange}
              />
            ) : null
          }
        />
      </div>

      <CertificateTypeFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <CertificateTypeFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        item={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={CONFIRM_MSG.deleteTitle(ENTITY)}
        description={CONFIRM_MSG.deleteDescription(
          ENTITY,
          deleteTarget?.name ?? "",
        )}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </TablePageShell>
  );
}
