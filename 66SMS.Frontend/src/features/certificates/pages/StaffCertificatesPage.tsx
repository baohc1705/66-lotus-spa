import { useMemo } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
} from "@tanstack/react-table";
import { Plus, ShieldCheck } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { CertificateTypeSidebar } from "../components/CertificateTypeSidebar";
import { StaffCertificateDetailExpanded } from "../components/StaffCertificateDetailExpanded";
import { StaffCertificateFormDialog } from "../components/StaffCertificateFormDialog";
import { StaffCertificateStatCards } from "../components/StaffCertificateStatCards";
import {
  useActiveStaffCertificateColumns,
  STAFF_CERTIFICATE_COLUMN_LABELS,
} from "../components/useActiveStaffCertificateColumns";
import { CERTIFICATE_PERM } from "../constants/certificate.permissions";
import {
  useStaffCertificates,
  useDeleteStaffCertificate,
} from "../hooks/useStaffCertificates";
import { useStaffCertificateListState } from "../hooks/useStaffCertificateListState";
import type { StaffCertificateDTO } from "../types/certificate.types";

interface Props {
  staffId?: number;
}

const ENTITY = "chứng chỉ";

export function StaffCertificatesPage({ staffId }: Props) {
  "use no memo";

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
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const allCerts = useMemo(
    () => allCertsResult?.data?.items ?? [],
    [allCertsResult],
  );

  let totalCertsCount = 0;
  let activeCertsCount = 0;
  let expiredCertsCount = 0;
  let pendingCertsCount = 0;
  for (const cert of allCerts) {
    const item: StaffCertificateDTO = cert;
    totalCertsCount += 1;
    if (item.status === 1) activeCertsCount += 1;
    if (item.status === 2) expiredCertsCount += 1;
    if (item.status === 0) pendingCertsCount += 1;
  }

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
    manualPagination: true,
  });

  const handleDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (response) => {
          if (response.isSuccess) setDeleteTarget(null);
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
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <StaffCertificateStatCards
        totalCount={totalCertsCount}
        activeCount={activeCertsCount}
        expiredCount={expiredCertsCount}
        pendingCount={pendingCertsCount}
        isLoading={isLoadingAll}
      />

      <div className="flex flex-col items-start gap-3 md:flex-row">
        {!isSidebarMode && (
          <CertificateTypeSidebar
            selectedTypeId={selectedCertificateTypeId}
            onSelectType={setSelectedCertificateTypeId}
          />
        )}

        <div className="w-full min-w-0 flex-1">
          <TablePageShell isFetching={isFetching} isLoading={isLoading}>
            <div className="border-b border-kit px-3 pt-3">
              <DataTableToolbar
                searchValue={filter}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Tìm theo tên chứng chỉ, tổ chức..."
              >
                <DataTableViewOptions
                  table={table}
                  columnLabels={columnLabels}
                />
                <PermissionGate resource={perm.resource} action={perm.create}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm chứng chỉ
                  </Button>
                </PermissionGate>
              </DataTableToolbar>
            </div>

            <DataTable
              table={table}
              isLoading={isLoading}
              loadingRows={
                pageSize > DEFAULT_LOADING_ROWS
                  ? DEFAULT_LOADING_ROWS
                  : pageSize
              }
              renderExpandedRow={({
                row,
              }: {
                row: Row<StaffCertificateDTO>;
              }) => (
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
                    <PermissionGate
                      resource={perm.resource}
                      action={perm.create}
                    >
                      <Button
                        variant="admin"
                        size="sm"
                        className="mb-0"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm chứng chỉ
                      </Button>
                    </PermissionGate>
                  }
                />
              }
              pagination={
                paged && totalCount > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-kit-muted">
                      <span>
                        {rangeStart}-{rangeEnd} / {totalCount}
                      </span>
                      <select
                        value={pageSize}
                        onChange={(e) =>
                          handlePageSizeChange(Number(e.target.value))
                        }
                        className="h-8 cursor-pointer rounded border border-kit bg-kit-white px-2 text-xs text-kit-heading outline-none focus:border-kit-primary"
                      >
                        {[5, 10, 20].map((size: number) => (
                          <option key={size} value={size}>
                            {size} / trang
                          </option>
                        ))}
                      </select>
                    </div>
                    <Pagination
                      page={safePage}
                      pageCount={totalPages}
                      onPageChange={setPageIndex}
                      size="sm"
                    />
                  </div>
                ) : null
              }
            />
          </TablePageShell>
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
