import { StaffDetailExpanded } from "@/features/staffs/components/StaffDetailExpanded";
import { StaffServiceForm } from "@/features/staffs/components/StaffServiceForm";
import type { StaffStatCardsData } from "@/features/staffs/components/StaffStatCards";
import { STAFF_PERM } from "@/features/staffs/constants/staff.permissions";
import {
  useDeleteBulkStaffs,
  useDeleteStaff,
  useRestoreStaff,
  useStaffsAdmin,
} from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { useGetAllRoles } from "@/features/auth/hooks/useGetAllRoles";
import type { RoleDTO } from "@/features/auth/types/auth.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  DEFAULT_PAGE_SIZE,
  GENDER_MAP,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
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
import { formatCurrency } from "@/shared/utils/currency";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";
import {
  ArrowLeft,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STAFF_STATUS_MAP: StatusMap = {
  "0": { label: "Tạm nghỉ", variant: "warning" },
  "1": { label: "Đang làm", variant: "success", dot: true },
  "3": { label: "Nghỉ việc", variant: "error" },
};

// Giải thích:
// onEdit: Hàm xử lý khi nhấn vào nút sửa
// onCreate: Hàm xử lý khi nhấn vào nút thêm
interface Props {
  onEdit: (item: StaffDto) => void;
  onCreate: () => void;
  onStatsChange?: (stats: StaffStatCardsData) => void;
}

export function StaffTable({ onEdit, onCreate, onStatsChange }: Props) {
  const perm = STAFF_PERM;
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<StaffDto | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<StaffDto | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [assignTarget, setAssignTarget] = useState<StaffDto | null>(null);

  const { data: rolesResult } = useGetAllRoles();
  const roles = rolesResult?.data ?? [];

  const queryParams = {
    pageIndex,
    pageSize,
    // BE lọc theo filter (tên, SĐT, email, mã NV), không dùng keyword
    filter: filter || undefined,
    orderBy,
    isDescending,
    role: selectedRole || undefined,
  };

  // Giải thích:
  // activeQuery: Query lấy danh sách nhân viên đang làm
  // deletedQuery: Query lấy danh sách nhân viên đã xóa
  // currentQuery: Query lấy danh sách nhân viên hiện tại
  const activeQuery = useStaffsAdmin(queryParams, !showDeleted);
  const deletedQuery = useStaffsAdmin(
    { ...queryParams, isDeleted: true },
    showDeleted,
  );
  const currentQuery = showDeleted ? deletedQuery : activeQuery;

  const paged = currentQuery.data?.data;
  const staffs = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  // Giải thích:
  // safePage là trang hiện tại, nếu pageIndex lớn hơn totalPages thì sẽ đặt là totalPages
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  // Giải thích:
  // Đếm số liệu trên trang hiện tại để hiện 4 thẻ StatCards
  let activeStaffs = 0;
  let inactiveStaffs = 0;
  let salarySum = 0;
  let salaryCount = 0;
  for (let index = 0; index < staffs.length; index++) {
    const item = staffs[index];
    if (item.status === StatusActive.Active) activeStaffs += 1;
    if (item.status === StatusActive.Inactive) inactiveStaffs += 1;
    if (item.basicSalary != null && item.basicSalary > 0) {
      salarySum += item.basicSalary;
      salaryCount += 1;
    }
  }
  const avgSalary =
    salaryCount === 0 ? 0 : Math.round(salarySum / salaryCount);

  useEffect(() => {
    if (!onStatsChange) return;
    onStatsChange({
      totalStaffs: totalCount,
      activeStaffs,
      inactiveStaffs,
      avgSalary,
      isLoading: currentQuery.isLoading,
    });
  }, [
    totalCount,
    activeStaffs,
    inactiveStaffs,
    avgSalary,
    currentQuery.isLoading,
    onStatsChange,
  ]);

  // Giải thích:
  // deleteMutation: Xóa một nhân viên
  // deleteBulkMutation: Xóa nhiều nhân viên đã chọn
  // restoreMutation: Khôi phục nhân viên đã xóa
  const deleteMutation = useDeleteStaff();
  const deleteBulkMutation = useDeleteBulkStaffs();
  const restoreMutation = useRestoreStaff();

  // Giải thích:
  // Đợi 300ms sau khi gõ mới gửi filter lên API, tránh gọi liên tục
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  // Giải thích:
  // allChecked: Kiểm tra xem tất cả nhân viên trên trang đã được chọn hay không
  const allChecked =
    staffs.length > 0 && selectedIds.length === staffs.length;

  // Giải thích:
  // handlePageSizeChange: Hàm xử lý khi chọn số dòng mỗi trang
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  // Giải thích:
  // handleSort: Hàm xử lý khi nhấn vào nút sắp xếp
  function handleSort(column: string) {
    if (orderBy === column) {
      setIsDescending(!isDescending);
      return;
    }
    setOrderBy(column);
    setIsDescending(false);
  }

  // Giải thích:
  // handleToggleView: Hàm xử lý khi nhấn vào nút xem nhân viên đã xóa
  function handleToggleView() {
    setShowDeleted(!showDeleted);
    setSelectedIds([]);
    setPageIndex(1);
    setSearchText("");
    setFilter("");
    setExpandedId(null);
  }

  // Giải thích:
  // handleRoleChange: Lọc danh sách theo vai trò, về trang 1
  function handleRoleChange(value: string) {
    setSelectedRole(value);
    setPageIndex(1);
    setSelectedIds([]);
    setExpandedId(null);
  }

  // Giải thích:
  // handleToggleExpand: Mở/đóng chi tiết một dòng, chỉ mở một dòng tại một thời điểm
  function handleToggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
  }

  // Giải thích:
  // handleToggleOne: Hàm xử lý khi chọn một nhân viên
  function handleToggleOne(id: number, checked: boolean) {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
      return;
    }
    const next: number[] = [];
    for (let index = 0; index < selectedIds.length; index++) {
      if (selectedIds[index] === id) continue;
      next.push(selectedIds[index]);
    }
    setSelectedIds(next);
  }

  // Giải thích:
  // handleToggleAll: Hàm xử lý khi chọn tất cả nhân viên
  function handleToggleAll(checked: boolean) {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    const ids: number[] = [];
    for (let index = 0; index < staffs.length; index++) {
      const id = staffs[index].id;
      if (id == null) continue;
      ids.push(id);
    }
    setSelectedIds(ids);
  }

  // Giải thích:
  // handleDelete: Hàm xử lý khi nhấn vào nút xóa nhân viên
  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setDeleteTarget(null);
      },
    });
  }

  // Giải thích:
  // handleBulkDelete: Hàm xử lý khi nhấn vào nút xóa đã chọn
  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    deleteBulkMutation.mutate(selectedIds, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        setBulkDeleteOpen(false);
        setSelectedIds([]);
      },
    });
  }

  // Giải thích:
  // handleRestore: Hàm xử lý khi nhấn vào nút khôi phục nhân viên
  function handleRestore() {
    if (!restoreTarget?.id) return;
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setRestoreTarget(null);
      },
    });
  }

  // Giải thích:
  // emptyColSpan: Số cột khi bảng trống (thùng rác ít cột hơn vì không có checkbox và trạng thái)
  const emptyColSpan = showDeleted ? 9 : 11;

  return (
    <>
      <div className="rounded-md border border-kit bg-kit-white shadow-kit-card">
        {/* Toolbar của bảng */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm theo tên, số điện thoại, email, mã NV..."
              inputSize="sm"
              className="mb-0 h-9 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              inputSize="sm"
              className="mb-0 mr-0 h-9 w-52"
              value={selectedRole}
              onChange={(event) => handleRoleChange(event.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              {roles.map((role: RoleDTO) => (
                <option key={role.id} value={role.code || role.name}>
                  {role.name}
                </option>
              ))}
            </Select>
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
                Thêm nhân viên
              </Button>
            </PermissionGate>

            <PermissionGate
              resource={perm.resource}
              action={perm.read}
              role={perm.role}
            >
              <Button
                variant="secondary"
                size="sm"
                className="mb-0 mr-0 h-9"
                onClick={handleToggleView}
              >
                {showDeleted ? (
                  <>
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Quay lại
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Khôi phục
                  </>
                )}
              </Button>
            </PermissionGate>

            {selectedIds.length > 0 && !showDeleted ? (
              <PermissionGate
                resource={perm.resource}
                action={perm.delete}
                role={perm.role}
              >
                <Button
                  variant="danger"
                  size="sm"
                  className="mb-0 mr-0 h-9"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa đã chọn ({selectedIds.length})
                </Button>
              </PermissionGate>
            ) : null}
          </div>
        </div>

        {/* Bảng */}
        <TableResponsive>
          <Table hover striped>
            {/* Header của bảng */}
            <TableHead className="bg-kit-primary text-kit-white [&_th]:bg-kit-primary">
              <TableRow>
                {!showDeleted ? (
                  <TableHeaderCell className="w-10">
                    <Checkbox
                      className="mb-0"
                      checked={allChecked}
                      onChange={handleToggleAll}
                      aria-label="Select all"
                    />
                  </TableHeaderCell>
                ) : null}
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Mã nhân viên"
                    column="code"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Nhân viên"
                    column="fullname"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Số điện thoại</TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Email"
                    column="email"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Giới tính</TableHeaderCell>
                <TableHeaderCell>Loại hợp đồng</TableHeaderCell>
                <TableHeaderCell>Lương</TableHeaderCell>
                {!showDeleted ? (
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                ) : null}
                <TableHeaderCell>
                  {showDeleted ? (
                    "Ngày xóa"
                  ) : (
                    <SortableColumnHeader
                      label="Ngày tạo"
                      column="createdAt"
                      orderBy={orderBy}
                      isDescending={isDescending}
                      onSort={handleSort}
                      onPrimary
                    />
                  )}
                </TableHeaderCell>
                <TableHeaderCell>Thao tác</TableHeaderCell>
              </TableRow>
            </TableHead>

            {/* Body của bảng */}
            <TableBody>
              {currentQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : staffs.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    {showDeleted
                      ? "Không có nhân viên đã xóa"
                      : "Chưa có nhân viên"}
                  </TableCell>
                </TableRow>
              ) : (
                staffs.map((item) => (
                  // map ra 2 TableRow (dòng data + chi tiết). Fragment gom chúng vì tbody không bọc div; key đặt trên Fragment.
                  <Fragment key={item.id}>
                    {/* Dòng data */}
                    <TableRow
                      className={
                        expandedId === item.id
                          ? "relative z-10 cursor-pointer border-x-2 border-t-2 border-kit-primary [&>td]:bg-kit-white!"
                          : !showDeleted && item.id != null
                            ? "cursor-pointer"
                            : undefined
                      }
                      onClick={() => {
                        if (showDeleted || item.id == null) return;
                        handleToggleExpand(item.id);
                      }}
                    >
                      {!showDeleted ? (
                        <TableCell>
                          <div onClick={(event) => event.stopPropagation()}>
                            <Checkbox
                              className="mb-0"
                              checked={
                                item.id != null && selectedIds.includes(item.id)
                              }
                              onChange={(checked: boolean) => {
                                if (item.id == null) return;
                                handleToggleOne(item.id, checked);
                              }}
                              aria-label="Select row"
                            />
                          </div>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <Badge variant="secondary" soft>
                          {item.code ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
                            <FallbackImage
                              kind="ktv"
                              src={item.avatarUrl}
                              alt=""
                              className="h-9 w-9 object-cover"
                            />
                          </div>
                          <span className="max-w-36 truncate font-medium text-kit-heading">
                            {item.fullName ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-kit-body">
                        {item.phone ?? "—"}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {GENDER_MAP[item.gender ?? ""] ?? "—"}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.contractType ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-kit-primary">
                        {formatCurrency(item.basicSalary)}
                      </TableCell>
                      {!showDeleted ? (
                        <TableCell>
                          <StatusBadge
                            status={
                              item.status != null ? String(item.status) : null
                            }
                            statusMap={STAFF_STATUS_MAP}
                          />
                        </TableCell>
                      ) : null}
                      <TableCell className="text-kit-muted">
                        {formatDateTimeDisplay(
                          showDeleted ? item.updatedAt : item.createdAt,
                        )}
                      </TableCell>
                      <TableCell>
                        {showDeleted ? (
                          <PermissionGate
                            resource={perm.resource}
                            action={perm.update}
                            role={perm.role}
                          >
                            <Tooltip text="Khôi phục">
                              <Button
                                size="icon-sm"
                                variant="outline-success"
                                className="mb-0 mr-0"
                                onClick={() => setRestoreTarget(item)}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            </Tooltip>
                          </PermissionGate>
                        ) : (
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
                            {item.id != null ? (
                              <Tooltip text="Chứng chỉ">
                                <Button
                                  size="icon-sm"
                                  variant="outline-success"
                                  className="mb-0 mr-0"
                                  onClick={() =>
                                    navigate(`/admin/chung-chi-nhan-vien?staffId=${item.id}`)
                                  }
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
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
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Chi tiết nhân viên */}
                    {!showDeleted &&
                    expandedId === item.id &&
                    item.id != null ? (
                      <TableRow className="relative z-10 border-x-2 border-b-2 border-t-0 border-kit-primary [&>td]:bg-kit-white!">
                        <TableCell
                          colSpan={emptyColSpan}
                          className="border-b-0 p-0"
                        >
                          <StaffDetailExpanded
                            staffId={item.id}
                            onEdit={onEdit}
                            onAssignService={setAssignTarget}
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

        {/* Phân trang */}
        {totalCount > 0 ? (
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

      {/* Dialog xóa nhiều nhân viên */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title="Xóa nhân viên đã chọn"
        description={`Bạn có chắc muốn xóa ${selectedIds.length} nhân viên đã chọn?`}
        confirmLabel="Xóa"
        loading={deleteBulkMutation.isPending}
        variant="danger"
      />

      {/* Dialog xóa một nhân viên */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa nhân viên"
        description={`Bạn có chắc muốn xóa nhân viên "${deleteTarget?.fullName}"?`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />

      {/* Dialog khôi phục nhân viên */}
      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        onConfirm={handleRestore}
        title="Khôi phục nhân viên"
        description={`Bạn có chắc muốn khôi phục nhân viên "${restoreTarget?.fullName}"? Nhân viên sẽ hiển thị lại trong danh sách chính.`}
        confirmLabel="Khôi phục"
        loading={restoreMutation.isPending}
        variant="default"
      />

      <StaffServiceForm
        open={!!assignTarget}
        onOpenChange={(open) => {
          if (!open) setAssignTarget(null);
        }}
        staff={assignTarget}
      />
    </>
  );
}
