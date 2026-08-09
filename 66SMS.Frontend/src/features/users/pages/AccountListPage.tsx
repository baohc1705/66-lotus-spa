import { useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { UserRound } from "lucide-react";

import { Pagination } from "@/shared/components/Pagination";
import { Select } from "@/shared/forms/Select";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import {
  ACCOUNT_COLUMN_LABELS,
  useActiveAccountColumns,
} from "../components/useActiveAccountColumns";
import { useGetAllAccounts } from "../hooks/useUsers";
import { useAccountListState } from "../hooks/useAccountListState";

export function AccountListPage() {
  const listState = useAccountListState();

  const {
    queryParams,
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
    data: accountsResult,
    isLoading,
    isFetching,
  } = useGetAllAccounts(queryParams);

  const paged = accountsResult?.data;
  const accounts = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const columns = useActiveAccountColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
  });

  const table = useReactTable({
    data: accounts,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(() => ({ ...ACCOUNT_COLUMN_LABELS }), []);

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tài khoản, email..."
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          emptyState={
            <TableEmptyState
              icon={UserRound}
              title="Chưa có tài khoản"
              hint="Danh sách tài khoản đăng nhập sẽ hiển thị tại đây."
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
    </div>
  );
}

export default AccountListPage;
