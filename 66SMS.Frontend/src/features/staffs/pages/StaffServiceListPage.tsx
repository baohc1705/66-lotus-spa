import { useAuthStore } from "@/features/auth/stores/authStore";
import { ServiceDetailExpanded } from "@/features/services/components/ServiceDetailExpanded";
import { useStaffServices } from "@/features/staffs/hooks/useStaffServices";
import { Pagination } from "@/shared/components/Pagination";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { formatCurrency } from "@/shared/utils/currency";
import { Eye, Search } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

export function StaffServiceListPage() {
  const user = useAuthStore((state) => state.user);
  const myStaffId = user?.staffInfo?.id ?? null;

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: result, isLoading } = useStaffServices(
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
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  // Đợi 300ms sau khi gõ mới gửi filter lên API, tránh gọi liên tục
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  // Hàm handlePageSizeChange: đổi số dòng mỗi trang, về trang 1
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  // Hàm handleToggleExpand: mở/đóng chi tiết một dòng
  function handleToggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
  }

  const emptyColSpan = 8;

  if (!myStaffId) {
    return (
      <div className="rounded-md border border-kit bg-kit-white p-6 text-sm text-kit-muted">
        Không tìm thấy hồ sơ nhân viên để xem dịch vụ được phân công.
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-6">
      <div className="rounded-md border border-kit bg-kit-white shadow-kit-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm kiếm dịch vụ..."
              inputSize="sm"
              className="mb-0 h-9 pl-9"
            />
          </div>
        </div>

        <TableResponsive>
          <Table hover striped>
            <TableHead className="bg-kit-primary text-kit-white [&_th]:bg-kit-primary">
              <TableRow>
                <TableHeaderCell className="w-12">#</TableHeaderCell>
                <TableHeaderCell>Mã dịch vụ</TableHeaderCell>
                <TableHeaderCell>Tên dịch vụ</TableHeaderCell>
                <TableHeaderCell>Thời lượng</TableHeaderCell>
                <TableHeaderCell>Giá</TableHeaderCell>
                <TableHeaderCell>Hoa hồng</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
                <TableHeaderCell>Thao tác</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    {filter
                      ? "Không tìm thấy dịch vụ phù hợp"
                      : "Chưa được phân công dịch vụ"}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <Fragment key={item.id ?? item.serviceId}>
                    <TableRow
                      className={
                        expandedId === item.serviceId
                          ? "relative z-10 cursor-pointer border-x-2 border-t-2 border-kit-primary [&>td]:bg-kit-white!"
                          : item.serviceId != null
                            ? "cursor-pointer"
                            : undefined
                      }
                      onClick={() => {
                        if (item.serviceId == null) return;
                        handleToggleExpand(item.serviceId);
                      }}
                    >
                      <TableCell className="text-kit-muted">
                        {(safePage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" soft>
                          {item.serCode ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-kit-heading">
                        {item.serName ?? "—"}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.serDurationMins != null
                          ? `${item.serDurationMins} phút`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-kit-primary">
                        {formatCurrency(item.serSellPrice)}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.serCommissionRate != null
                          ? `${item.serCommissionRate}%`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {item.status === StatusActive.Active ? (
                          <Badge variant="success" soft>
                            Đang làm
                          </Badge>
                        ) : (
                          <Badge variant="warning" soft>
                            Tạm dừng
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.serviceId != null ? (
                          <div
                            className="flex items-center gap-1"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Tooltip
                              text={
                                expandedId === item.serviceId
                                  ? "Đóng chi tiết"
                                  : "Xem chi tiết"
                              }
                            >
                              <Button
                                size="icon-sm"
                                variant="outline-info"
                                className="mb-0 mr-0"
                                onClick={() =>
                                  handleToggleExpand(item.serviceId!)
                                }
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Tooltip>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                    {expandedId === item.serviceId && item.serviceId != null ? (
                      <TableRow className="relative z-10 border-x-2 border-b-2 border-t-0 border-kit-primary [&>td]:bg-kit-white!">
                        <TableCell
                          colSpan={emptyColSpan}
                          className="border-b-0 p-0"
                        >
                          <ServiceDetailExpanded serviceId={item.serviceId} />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableResponsive>

        {totalCount > PAGE_SIZE_OPTIONS[0] ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kit px-4 py-3">
            <div className="flex items-center gap-3 text-xs text-kit-dark">
              <span>
                {rangeEnd} / {pageSize}
              </span>
              <span>Hiển thị: </span>
              <Select
                inputSize="sm"
                className="mb-0 w-28"
                value={pageSize}
                onChange={(event) =>
                  handlePageSizeChange(Number(event.target.value))
                }
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </div>
            <Pagination
              page={safePage}
              pageCount={totalPages}
              onPageChange={setPageIndex}
              size="sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
