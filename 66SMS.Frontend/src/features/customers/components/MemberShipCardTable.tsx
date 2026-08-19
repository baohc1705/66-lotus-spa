import { MembershipCardDetailExpanded } from "@/features/customers/components/MembershipCardDetailExpanded";
import { CUSTOMER_PERM } from "@/features/customers/constants/customer.permissions";
import { useMembershipCards } from "@/features/customers/hooks/useMembershipCards";
import type { MembershipCardDto } from "@/features/customers/types/membershipCard.types";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { CreditCard, Eye, Pencil, Plus, Search } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

interface Props {
  onEdit: (item: MembershipCardDto) => void;
  onCreate: () => void;
}

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "1", label: "Hoạt động" },
  { value: "2", label: "Hết hạn" },
];

function cardStatusBadge(status?: number) {
  if (status === 1) {
    return (
      <Badge variant="success" soft>
        Hoạt động
      </Badge>
    );
  }
  if (status === 2) {
    return (
      <Badge variant="warning" soft>
        Hết hạn
      </Badge>
    );
  }
  if (status === 3) {
    return (
      <Badge variant="danger" soft>
        Đã thu hồi
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      Không rõ
    </Badge>
  );
}

export function MembershipCardTable({ onEdit, onCreate }: Props) {
  const perm = CUSTOMER_PERM;

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const queryParams = {
    pageIndex,
    pageSize,
    filter: filter || undefined,
    status: selectedStatus ?? undefined,
    orderBy,
    isDescending,
  };

  const { data: cardsResult, isLoading } = useMembershipCards(queryParams);

  const paged = cardsResult?.data;
  const cards = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  function handleSort(column: string) {
    if (orderBy === column) {
      setIsDescending(!isDescending);
      return;
    }
    setOrderBy(column);
    setIsDescending(false);
  }

  function handleToggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
  }

  function handleSelectStatus(value: string) {
    setSelectedStatus(value === "all" ? null : Number(value));
    setPageIndex(1);
  }

  const emptyColSpan = 7;

  return (
    <div className="pb-6">
      <div className="overflow-hidden rounded-md border border-kit bg-kit-white shadow-kit-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="relative w-64 min-w-0">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm mã thẻ, tên khách hàng..."
                inputSize="sm"
                className="mb-0 h-9 pl-9"
              />
            </div>
            <Select
              inputSize="sm"
              className="mb-0 h-9 w-44"
              value={selectedStatus === null ? "all" : String(selectedStatus)}
              onChange={(event) => handleSelectStatus(event.target.value)}
              options={STATUS_FILTER_OPTIONS}
            />
          </div>
          <PermissionGate
            resource={perm.resource}
            action={perm.create}
            role={perm.role}
          >
            <Button
              variant="admin"
              size="sm"
              className="mb-0"
              onClick={onCreate}
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm mới
            </Button>
          </PermissionGate>
        </div>

        <TableResponsive>
          <Table hover striped>
            <TableHead className="bg-kit-primary text-kit-white [&_th]:bg-kit-primary">
              <TableRow>
                <TableHeaderCell className="w-12">#</TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Mã thẻ"
                    column="cardCode"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Khách hàng</TableHeaderCell>
                <TableHeaderCell>Hạng thẻ</TableHeaderCell>
                <TableHeaderCell>Ngày cấp</TableHeaderCell>
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
              ) : cards.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Chưa có thẻ thành viên
                  </TableCell>
                </TableRow>
              ) : (
                cards.map((item: MembershipCardDto, rowIndex: number) => (
                  <Fragment key={item.id}>
                    <TableRow
                      className={
                        expandedId === item.id
                          ? "relative z-10 cursor-pointer border-x-2 border-t-2 border-kit-primary [&>td]:bg-kit-white!"
                          : item.id != null
                            ? "cursor-pointer"
                            : undefined
                      }
                      onClick={() => {
                        if (item.id == null) return;
                        handleToggleExpand(item.id);
                      }}
                    >
                      <TableCell className="text-kit-muted">
                        {(safePage - 1) * pageSize + rowIndex + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-kit-heading">
                          <CreditCard className="h-4 w-4 shrink-0 text-kit-primary" />
                          <span className="truncate">
                            {item.cardCode ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-kit-body">
                        {item.customerName ?? "—"}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.tierName ?? "—"}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.issuedAt ? formatDisplayDate(item.issuedAt) : "—"}
                      </TableCell>
                      <TableCell>{cardStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-1"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {item.id != null ? (
                            <Tooltip
                              text={
                                expandedId === item.id
                                  ? "Đóng chi tiết"
                                  : "Xem chi tiết"
                              }
                            >
                              <Button
                                size="icon-sm"
                                variant="outline-info"
                                className="mb-0 mr-0"
                                onClick={() => handleToggleExpand(item.id!)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Tooltip>
                          ) : null}
                          <PermissionGate
                            resource={perm.resource}
                            action={perm.update}
                            role={perm.role}
                          >
                            <Tooltip text="Sửa">
                              <Button
                                size="icon-sm"
                                variant="outline-primary"
                                className="mb-0 mr-0"
                                onClick={() => onEdit(item)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </Tooltip>
                          </PermissionGate>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedId === item.id && item.id != null ? (
                      <TableRow className="relative z-10 border-x-2 border-b-2 border-t-0 border-kit-primary [&>td]:bg-kit-white!">
                        <TableCell
                          colSpan={emptyColSpan}
                          className="border-b-0 p-0"
                        >
                          <MembershipCardDetailExpanded
                            cardId={item.id}
                            onEdit={onEdit}
                          />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableResponsive>

        {totalCount > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kit px-4 py-3">
            <div className="flex items-center gap-3 text-xs text-kit-dark">
              <span>
                {rangeEnd} / {totalCount}
              </span>
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
