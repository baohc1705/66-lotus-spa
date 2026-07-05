import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { CreditCard } from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { MembershipCardFormDialog } from "../components/MembershipCardFormDialog";
import { MembershipCardDetailExpanded } from "../components/MembershipCardDetailExpanded";
import {
  useActiveMembershipCardColumns,
  MEMBERSHIP_CARD_COLUMN_LABELS,
} from "../components/useActiveMembershipCardColumns";
import { useMembershipCards } from "../hooks/useMembershipCards";
import { useMembershipCardListState } from "../hooks/useMembershipCardListState";

export function MembershipCardListPage() {
  const listState = useMembershipCardListState();
  const {
    queryParams,
    editTarget,
    setEditTarget,
    pageIndex,
    setPageIndex,
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
    data: cardsResult,
    isLoading,
    isFetching,
  } = useMembershipCards(queryParams);

  const paged = cardsResult?.data;
  const cards = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const columns = useActiveMembershipCardColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    onEdit: setEditTarget,
  });

  const table = useReactTable({
    data: cards,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const columnLabels = useMemo(() => ({ ...MEMBERSHIP_CARD_COLUMN_LABELS }), []);

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="px-4 pt-4">
        <DataTableToolbar
          searchValue={filter}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm mã thẻ, tên khách hàng..."
        >
          <DataTableViewOptions table={table} columnLabels={columnLabels} />
        </DataTableToolbar>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        loadingRows={
          pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize
        }
        onRowClick={(row) => row.toggleExpanded()}
        renderSubComponent={({ row }) =>
          row.original.id ? (
            <MembershipCardDetailExpanded
              cardId={row.original.id}
              onEdit={(card) => setEditTarget(card)}
            />
          ) : null
        }
        emptyState={
          <TableEmptyState
            icon={CreditCard}
            title="Chưa có thẻ thành viên"
            hint="Thẻ sẽ tự động được tạo khi khách hàng mới được đăng ký."
          />
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
              onPageSizeChange={handlePageSizeChange}
            />
          ) : null
        }
      />

      <MembershipCardFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        card={editTarget}
      />
    </TablePageShell>
  );
}
export default MembershipCardListPage;
