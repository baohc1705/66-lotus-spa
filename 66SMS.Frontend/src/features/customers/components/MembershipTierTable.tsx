import { MembershipTierDetailExpanded } from "@/features/customers/components/MembershipTierDetailExpanded";
import { CUSTOMER_PERM } from "@/features/customers/constants/customer.permissions";
import {
  useDeleteMembershipTier,
  useMembershipTiers,
  useUpdateMembershipTier,
} from "@/features/customers/hooks/useMembershipTiers";
import type { MembershipTierDto } from "@/features/customers/types/membershipTier.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
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
import { formatCurrency } from "@/shared/utils/currency";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

interface Props {
  onEdit: (item: MembershipTierDto) => void;
  onCreate: () => void;
}

export function MembershipTierTable({ onEdit, onCreate }: Props) {
  const perm = CUSTOMER_PERM;

  // Phân trang
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MembershipTierDto | null>(
    null,
  );
  // Chi tiết
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Query params
  const queryParams = {
    pageIndex,
    pageSize,
    keyword: keyword || undefined,
    orderBy,
    isDescending,
  };
  // Gọi hook lấy danh sách hạng thành viên
  const { data: tiersResult, isLoading } = useMembershipTiers(queryParams);
  const updateMutation = useUpdateMembershipTier();
  const deleteMutation = useDeleteMembershipTier();

  // lấy dữ liệu phân trang
  const paged = tiersResult?.data;
  const tiers = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  // debounce search
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  // xử lý phân trang
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  // xử lý sắp xếp
  function handleSort(column: string) {
    if (orderBy === column) {
      setIsDescending(!isDescending);
      return;
    }
    setOrderBy(column);
    setIsDescending(false);
  }

  // xử lý mở/đóng chi tiết
  function handleToggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
  }

  // xử lý chuyển đổi trạng thái
  function handleToggleStatus(item: MembershipTierDto, checked: boolean) {
    if (!item.id) return;
    const status = checked ? StatusActive.Active : StatusActive.Inactive;
    updateMutation.mutate({ id: item.id, payload: { status } });
  }

  // xử lý xóa
  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        setDeleteTarget(null);
        if (expandedId === deleteTarget.id) {
          setExpandedId(null);
        }
      },
    });
  }

  const emptyColSpan = 7;

  return (
    <div className="pb-6">
      <div className="overflow-hidden rounded-md border border-kit bg-kit-white shadow-kit-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm tên loại thẻ..."
              inputSize="sm"
              className="mb-0 h-9 pl-9"
            />
          </div>
          <PermissionGate
            resource={perm.resource}
            action={perm.create}
            role={perm.role}
          >
            <Button
              variant="primary"
              size="sm"
              className="mb-0 mr-0 h-9"
              onClick={onCreate}
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm loại thẻ
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
                    label="Loại thẻ"
                    column="name"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Chi tiêu tối thiểu"
                    column="minSpending"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Giảm giá</TableHeaderCell>
                <TableHeaderCell>Hệ số điểm</TableHeaderCell>
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
              ) : tiers.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Chưa có loại thẻ
                  </TableCell>
                </TableRow>
              ) : (
                tiers.map((item: MembershipTierDto, rowIndex: number) => (
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
                          <span className="truncate">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-kit-primary">
                        {formatCurrency(item.minSpending)}
                      </TableCell>
                      <TableCell>{item.discountPercent ?? 0}%</TableCell>
                      <TableCell>x{item.pointMultiplier ?? 0}</TableCell>
                      <TableCell>
                        <div onClick={(event) => event.stopPropagation()}>
                          <Switch
                            checked={item.status === StatusActive.Active}
                            onChange={(checked: boolean) =>
                              handleToggleStatus(item, checked)
                            }
                            disabled={updateMutation.isPending}
                          />
                        </div>
                      </TableCell>
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
                          <PermissionGate
                            resource={perm.resource}
                            action={perm.delete}
                            role={perm.role}
                          >
                            <Tooltip text="Xóa">
                              <Button
                                size="icon-sm"
                                variant="outline-danger"
                                className="mb-0 mr-0"
                                onClick={() => setDeleteTarget(item)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
                          <MembershipTierDetailExpanded
                            tierId={item.id}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa hạng thành viên"
        description={`Bạn có chắc muốn xóa hạng thành viên "${deleteTarget?.name ?? ""}"? Các khách hàng đang thuộc hạng thẻ này có thể bị ảnh hưởng.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
