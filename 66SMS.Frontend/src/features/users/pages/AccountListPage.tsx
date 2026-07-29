import { useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { UserRound } from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import {
  ACCOUNT_COLUMN_LABELS,
  useActiveAccountColumns,
} from "../components/useActiveAccountColumns";
import { useGetAllAccounts } from "../hooks/useUsers";
import { useAccountListState } from "../hooks/useAccountListState";

export function AccountListPage() {
  const {
    queryParams,
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
  } = useAccountListState();

  const {
    data: accountsResult,
    isLoading,
    isFetching,
  } = useGetAllAccounts(queryParams);

  const paged = accountsResult?.data;
  const accounts = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

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
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(() => ({ ...ACCOUNT_COLUMN_LABELS }), []);

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-lotus-deep">
            Quản lý tài khoản
          </h1>
        </div>
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
        loadingRows={
          pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize
        }
        emptyState={
          <TableEmptyState
            icon={UserRound}
            title="Chưa có tài khoản"
            hint="Danh sách tài khoản đăng nhập sẽ hiển thị tại đây."
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
    </TablePageShell>
  );
}

export default AccountListPage;
