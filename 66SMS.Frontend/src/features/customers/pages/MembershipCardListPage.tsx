import { useMemo } from "react";
import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CreditCard } from "lucide-react";

import { Pagination } from "@/shared/components/Pagination";
import { Select } from "@/shared/forms/Select";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { MembershipCardDetailExpanded } from "../components/MembershipCardDetailExpanded";
import { MembershipCardFormDialog } from "../components/MembershipCardFormDialog";
import {
  MEMBERSHIP_CARD_COLUMN_LABELS,
  useActiveMembershipCardColumns,
} from "../components/useActiveMembershipCardColumns";
import { useMembershipCardListState } from "../hooks/useMembershipCardListState";
import { useMembershipCards } from "../hooks/useMembershipCards";

export function MembershipCardListPage() {
  const listState = useMembershipCardListState();

  const {
    queryParams,
    editTarget,
    setEditTarget,
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
    data: cardsResult,
    isLoading,
    isFetching,
  } = useMembershipCards(queryParams);

  const paged = cardsResult?.data;
  const cards = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

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
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(
    () => ({ ...MEMBERSHIP_CARD_COLUMN_LABELS }),
    [],
  );

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          <DataTableToolbar
            searchPlaceholder="Tìm mã thẻ, tên khách hàng..."
            searchValue={filter}
            onSearchChange={handleSearchChange}
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          onRowClick={(row) => row.toggleExpanded()}
          renderExpandedRow={({ row }) =>
            row.original.id ? (
              <MembershipCardDetailExpanded
                cardId={row.original.id}
                onEdit={setEditTarget}
              />
            ) : null
          }
          emptyState={
            <TableEmptyState
              icon={CreditCard}
              title="Chưa có thẻ thành viên"
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

      {editTarget ? (
        <MembershipCardFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          card={editTarget}
        />
      ) : null}
    </div>
  );
}
