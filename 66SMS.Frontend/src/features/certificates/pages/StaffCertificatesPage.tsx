import { useMemo } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { Plus, ShieldCheck } from "lucide-react";
import { StaffCertificateDetailExpanded } from "../components/StaffCertificateDetailExpanded";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { StaffCertificateFormDialog } from "../components/StaffCertificateFormDialog";
import {
  useActiveStaffCertificateColumns,
  STAFF_CERTIFICATE_COLUMN_LABELS,
} from "../components/useActiveStaffCertificateColumns";
import {
  useStaffCertificates,
  useDeleteStaffCertificate,
} from "../hooks/useStaffCertificates";
import { useStaffCertificateListState } from "../hooks/useStaffCertificateListState";
import { CertificateTypeSidebar } from "../components/CertificateTypeSidebar";
import { StaffCertificateStatCards } from "../components/StaffCertificateStatCards";
import { CERTIFICATE_PERM } from "../constants/certificate.permissions";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

interface Props {
  staffId?: number;
}

const ENTITY = "chứng chỉ";

export function StaffCertificatesPage({ staffId }: Props) {
  const perm = CERTIFICATE_PERM;
  const [searchParams] = useSearchParams();
  const staffIdFromQuery = Number(searchParams.get("staffId"));
  const effectiveStaffId =
    staffId ??
    (Number.isFinite(staffIdFromQuery) && staffIdFromQuery > 0
      ? staffIdFromQuery
      : undefined);
  const listState = useStaffCertificateListState();
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
    selectedCertificateTypeId,
    setSelectedCertificateTypeId,
  } = listState;

  const mergedParams = useMemo(
    () => ({
      ...queryParams,
      staffId: effectiveStaffId,
    }),
    [queryParams, effectiveStaffId],
  );

  const {
    data: result,
    isLoading,
    isFetching,
  } = useStaffCertificates(mergedParams);
  const deleteMutation = useDeleteStaffCertificate();

  const { data: allCertsResult, isLoading: isLoadingAll } =
    useStaffCertificates({
      pageIndex: 1,
      pageSize: 10000,
      staffId: effectiveStaffId,
    });

  const paged = result?.data;
  const items = useMemo(() => paged?.items ?? [], [paged?.items]);

  const allCerts = useMemo(
    () => allCertsResult?.data?.items ?? [],
    [allCertsResult],
  );

  const totalCertsCount = allCerts.length;
  const activeCertsCount = useMemo(
    () => allCerts.filter((c) => c.status === 1).length,
    [allCerts],
  );
  const expiredCertsCount = useMemo(
    () => allCerts.filter((c) => c.status === 2).length,
    [allCerts],
  );
  const pendingCertsCount = useMemo(
    () => allCerts.filter((c) => c.status === 0).length,
    [allCerts],
  );

  const columns = useActiveStaffCertificateColumns({
    pageIndex,
    pageSize,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
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
    () => ({ ...STAFF_CERTIFICATE_COLUMN_LABELS }),
    [],
  );

  const { layoutMode } = useOutletContext<{
    layoutMode: "top-nav" | "sidebar";
  }>();
  const isSidebarMode = layoutMode === "sidebar";

  return (
    <div className="flex h-full overflow-hidden gap-2">
      {!isSidebarMode && (
        <CertificateTypeSidebar
          selectedTypeId={selectedCertificateTypeId}
          onSelectType={setSelectedCertificateTypeId}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        <div className="shrink-0">
          <StaffCertificateStatCards
            totalCount={totalCertsCount}
            activeCount={activeCertsCount}
            expiredCount={expiredCertsCount}
            pendingCount={pendingCertsCount}
            isLoading={isLoadingAll}
          />
        </div>

        <div className="lotus-admin-table-page-card flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {isFetching && !isLoading && (
            <div className="lotus-admin-table-fetch-bar">
              <div className="lotus-admin-table-fetch-bar-inner" />
            </div>
          )}

          <div className="px-4 pt-4">
            <DataTableToolbar
              searchValue={filter}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Tìm theo tên chứng chỉ, tổ chức..."
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
                  Thêm chứng chỉ
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
            onRowClick={(row) => row.toggleExpanded()}
            renderSubComponent={({ row }) => (
              <StaffCertificateDetailExpanded
                cert={row.original}
                onEdit={() => setEditTarget(row.original)}
              />
            )}
            emptyState={
              <TableEmptyState
                icon={ShieldCheck}
                title="Chưa có chứng chỉ"
                hint="Thêm chứng chỉ để quản lý bằng cấp nhân viên."
                action={
                  <PermissionGate resource={perm.resource} action={perm.create}>
                    <Button
                      variant="admin"
                      size="sm"
                      onClick={() => setCreateOpen(true)}
                      className="mt-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm chứng chỉ
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
      </div>

      <StaffCertificateFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        staffId={effectiveStaffId}
      />
      <StaffCertificateFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        item={editTarget}
        staffId={effectiveStaffId}
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
          deleteTarget?.certificateName ?? "",
        )}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
export default StaffCertificatesPage;
