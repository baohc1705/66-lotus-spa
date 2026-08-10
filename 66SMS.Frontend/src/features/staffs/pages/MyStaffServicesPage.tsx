import { Eye, Scissors } from "lucide-react";
import { useMemo } from "react";
import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { ServiceDetailExpanded } from "@/features/services/components/ServiceDetailExpanded";
import { Pagination } from "@/shared/components/Pagination";
import { Tooltip } from "@/shared/components/Tooltip";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import {
  IndexCell,
  MutedCell,
  NameCell,
  PriceCell,
} from "@/shared/tables/TableCells";
import { StatusActive } from "@/shared/constants/status.enum";

import { useStaffServices } from "../hooks/useStaffs";
import type { StaffServiceDto } from "../types/staff.types";

export function MyStaffServicesPage() {
  "use no memo";

  const user = useAuthStore((s) => s.user);
  const myStaffId = user?.staffInfo?.id ?? null;

  const {
    pageIndex,
    setPageIndex,
    pageSize,
    filter,
    handlePageSizeChange,
    handleSearchChange,
  } = useTableQueryParams(10);

  const { data: result, isLoading, isFetching } = useStaffServices(
    {
      staffId: myStaffId ?? undefined,
      pageIndex,
      pageSize,
      filter: filter || undefined,
    },
    !!myStaffId,
  );

  const paged = result?.data;
  const items = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const columns = useMemo(() => {
    const cols: ColumnDef<StaffServiceDto>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <IndexCell
            pageIndex={safePage}
            pageSize={pageSize}
            rowIndex={row.index}
          />
        ),
        size: 50,
      },
      {
        accessorKey: "serCode",
        header: "Mã dịch vụ",
        cell: ({ row }) => <MutedCell value={row.original.serCode ?? "—"} />,
      },
      {
        accessorKey: "serName",
        header: "Tên dịch vụ",
        cell: ({ row }) => <NameCell value={row.original.serName ?? "—"} />,
      },
      {
        accessorKey: "serDurationMins",
        header: "Thời lượng",
        cell: ({ row }) => (
          <MutedCell
            value={
              row.original.serDurationMins != null
                ? `${row.original.serDurationMins} phút`
                : "—"
            }
          />
        ),
      },
      {
        accessorKey: "serCostPrice",
        header: "Giá",
        cell: ({ row }) => <PriceCell value={row.original.serCostPrice} />,
      },
      {
        accessorKey: "serCommissionRate",
        header: "Hoa hồng",
        cell: ({ row }) => (
          <MutedCell
            value={
              row.original.serCommissionRate != null
                ? `${row.original.serCommissionRate}%`
                : "—"
            }
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          if (row.original.status === StatusActive.Active) {
            return (
              <Badge variant="success" soft>
                Đang làm
              </Badge>
            );
          }
          return (
            <Badge variant="warning" soft>
              Tạm dừng
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const expanded = row.getIsExpanded();
          return (
            <div
              className="flex items-center gap-1"
              onClick={(event) => event.stopPropagation()}
            >
              <Tooltip text={expanded ? "Đóng chi tiết" : "Xem chi tiết"}>
                <Button
                  size="icon-sm"
                  variant="outline-info"
                  className="mb-0 mr-0"
                  onClick={() => row.toggleExpanded()}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </div>
          );
        },
        size: 70,
        enableResizing: false,
      },
    ];
    return cols;
  }, [safePage, pageSize]);

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    manualPagination: true,
  });

  if (!myStaffId) {
    return (
      <div className="rounded-lg border border-kit bg-kit-white p-6 text-sm text-kit-muted">
        Không tìm thấy hồ sơ nhân viên để xem dịch vụ được phân công.
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-3 pt-3">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm kiếm dịch vụ..."
          />
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={
            pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize
          }
          renderExpandedRow={({ row }: { row: Row<StaffServiceDto> }) => {
            if (!row.original.serviceId) return null;
            return <ServiceDetailExpanded serviceId={row.original.serviceId} />;
          }}
          emptyState={
            <TableEmptyState
              icon={Scissors}
              title={
                filter
                  ? "Không tìm thấy dịch vụ phù hợp"
                  : "Chưa được phân công dịch vụ"
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
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      handlePageSizeChange(Number(event.target.value));
                    }}
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
  );
}
