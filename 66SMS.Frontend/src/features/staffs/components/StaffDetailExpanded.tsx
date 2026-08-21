import { useAuthStore } from "@/features/auth/stores/authStore";
import { useGetAllRoles } from "@/features/auth/hooks/useGetAllRoles";
import type { RoleDTO } from "@/features/auth/types/auth.types";
import { STAFF_PERM } from "@/features/staffs/constants/staff.permissions";
import { useStaffDetail } from "@/features/staffs/hooks/useStaffs";
import {
  useDeleteStaffServices,
  useStaffServices,
  useUpdateStaffService,
} from "@/features/staffs/hooks/useStaffServices";
import type { StaffFullDto } from "@/features/staffs/types/staff.types";
import type { StaffServiceDto } from "@/features/staffs/types/staffService.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Tabs } from "@/shared/components/Tabs";
import {
  DEFAULT_PAGE_SIZE,
  GENDER_MAP,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { Switch } from "@/shared/forms/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { Pencil, Plus, Scissors, Trash2 } from "lucide-react";
import { useState } from "react";
import { Pagination } from "@/shared/components/Pagination";
import { Select } from "@/shared/forms/Select";

interface Props {
  staffId: number;
  onEdit?: (staff: StaffFullDto) => void;
  onAssignService?: (staff: StaffFullDto) => void;
}

export function StaffDetailExpanded({
  staffId,
  onEdit,
  onAssignService,
}: Props) {
  const { data: result, isLoading } = useStaffDetail(staffId);
  const staff = result?.data;
  const { data: rolesResult } = useGetAllRoles();
  const roles = rolesResult?.data ?? [];
  const [tabId, setTabId] = useState("info");
  const [removeTarget, setRemoveTarget] = useState<StaffServiceDto | null>(
    null,
  );
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const perm = STAFF_PERM;
  const hasRole = useAuthStore((state) => state.hasRole);
  const canManageStaffServices = hasRole("Admin") || hasRole("Manager");

  const { data: staffServicesResult, isLoading: isLoadingStaffServices } =
    useStaffServices({
      staffId,
      pageIndex: 1,
      pageSize: 200,
    });
  const deleteStaffServiceMutation = useDeleteStaffServices();
  const updateStaffServiceMutation = useUpdateStaffService();
  const staffServices = staffServicesResult?.data?.items ?? [];
  const paged = staffServicesResult?.data;

  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  // Hàm handleRemoveStaffService để gỡ phân công dịch vụ
  function handleRemoveStaffService() {
    if (!removeTarget?.id) return;
    deleteStaffServiceMutation.mutate([removeTarget.id], {
      onSuccess: (mutationResult) => {
        if (mutationResult.isSuccess !== true) return;
        setRemoveTarget(null);
      },
    });
  }

  // Hàm handlePageSizeChange để đổi số dòng mỗi trang
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }
  if (isLoading) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="text-sm text-kit-muted">Đang tải chi tiết nhân viên...</p>
      </TableDetailExpanded>
    );
  }

  if (!staff) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="text-sm text-kit-muted">
          Không tìm thấy thông tin nhân viên
        </p>
      </TableDetailExpanded>
    );
  }

  let roleLabel: string | null = staff.role ?? null;
  for (let index = 0; index < roles.length; index++) {
    const role: RoleDTO = roles[index];
    if (role.code === staff.role) {
      roleLabel = role.name;
      break;
    }
  }

  return (
    <TableDetailExpanded className="bg-kit-white" maxHeightClass="max-h-100">
      <Tabs
        variant="body"
        activeId={tabId}
        onChange={setTabId}
        navClassName="mb-2"
        tabs={[
          {
            id: "info",
            label: "Thông tin",
            content: (
              <>
                <TableDetailHeader
                  icon={
                    <FallbackImage
                      kind="ktv"
                      src={staff.avatarUrl}
                      alt={staff.fullName ?? ""}
                      className="h-full w-full object-cover"
                    />
                  }
                  title={staff.fullName ?? "—"}
                  subtitle={`Mã nhân viên: ${staff.code ?? "—"}`}
                />

                <TableDetailGrid cols={3}>
                  <TableDetailField label="Số điện thoại" value={staff.phone} />
                  <TableDetailField
                    label="Số CMND/CCCD"
                    value={staff.nationalId}
                  />
                  <TableDetailField
                    label="Ngày bắt đầu làm việc"
                    value={formatDisplayDate(staff.hireDate)}
                  />
                  <TableDetailField label="Vai trò" value={roleLabel} />
                  <TableDetailField
                    label="Chi nhánh làm việc"
                    value={staff.salonName}
                  />
                  <TableDetailField label="Địa chỉ" value={staff.fullAddress} />
                  <TableDetailField label="Tài khoản" value={staff.username} />
                  <TableDetailField label="Email" value={staff.email} />
                  <TableDetailField
                    label="Giới tính"
                    value={
                      GENDER_MAP[staff.gender ?? ""] ??
                      (staff.gender != null ? String(staff.gender) : null)
                    }
                  />
                  <TableDetailField
                    label="Ngày sinh"
                    value={formatDisplayDate(staff.dateOfBirth)}
                  />
                </TableDetailGrid>
              </>
            ),
          },
          {
            id: "services",
            label: "Dịch vụ thực hiện",
            content: isLoadingStaffServices ? (
              <p className="py-6 text-center text-sm text-kit-muted">
                Đang tải...
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-kit-muted">
                    {staffServices.length > 0
                      ? `${staffServices.length} dịch vụ đang phân công`
                      : "Chưa phân công dịch vụ nào"}
                  </p>
                  {canManageStaffServices ? (
                    <Button
                      variant="admin"
                      size="sm"
                      className="mb-0"
                      onClick={() => onAssignService?.(staff)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Phân công
                    </Button>
                  ) : null}
                </div>

                {staffServices.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-kit-muted">
                    <Scissors className="h-8 w-8" />
                    <p className="text-sm font-medium text-kit-heading">
                      Chưa có dịch vụ thực hiện
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded border border-kit bg-kit-white">
                    <TableResponsive>
                      <Table striped>
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell>#</TableHeaderCell>
                            <TableHeaderCell>Mã dịch vụ</TableHeaderCell>
                            <TableHeaderCell>Tên dịch vụ</TableHeaderCell>
                            <TableHeaderCell>Thời lượng</TableHeaderCell>
                            <TableHeaderCell>Giá</TableHeaderCell>
                            <TableHeaderCell>Hoa hồng</TableHeaderCell>
                            <TableHeaderCell>Trạng thái</TableHeaderCell>
                            {canManageStaffServices ? (
                              <TableHeaderCell className="w-16 text-center">
                                Xóa
                              </TableHeaderCell>
                            ) : null}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {staffServices.map(
                            (item: StaffServiceDto, index: number) => (
                              <TableRow key={item.id ?? item.serviceId}>
                                <TableCell className="text-kit-muted">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="text-kit-muted">
                                  {item.serCode ?? "—"}
                                </TableCell>
                                <TableCell className="font-medium text-kit-heading">
                                  {item.serName ?? "—"}
                                </TableCell>
                                <TableCell className="text-kit-muted">
                                  {item.serDurationMins != null
                                    ? `${item.serDurationMins} phút`
                                    : "—"}
                                </TableCell>
                                <TableCell className="text-kit-muted">
                                  {formatCurrency(item.serSellPrice)}
                                </TableCell>
                                <TableCell className="text-kit-muted">
                                  {item.serCommissionRate != null
                                    ? `${item.serCommissionRate}%`
                                    : "—"}
                                </TableCell>
                                <TableCell>
                                  {canManageStaffServices ? (
                                    <Switch
                                      className="mb-0"
                                      checked={
                                        item.status === StatusActive.Active
                                      }
                                      onChange={(checked: boolean) => {
                                        if (!item.id) return;
                                        updateStaffServiceMutation.mutate({
                                          id: item.id,
                                          data: {
                                            status: checked
                                              ? StatusActive.Active
                                              : StatusActive.Inactive,
                                          },
                                        });
                                      }}
                                      disabled={
                                        updateStaffServiceMutation.isPending
                                      }
                                    />
                                  ) : item.status === StatusActive.Active ? (
                                    <span className="text-sm text-kit-success">
                                      Đang làm
                                    </span>
                                  ) : (
                                    <span className="text-sm text-kit-muted">
                                      Tạm dừng
                                    </span>
                                  )}
                                </TableCell>
                                {canManageStaffServices ? (
                                  <TableCell className="text-center">
                                    <Tooltip text="Gỡ dịch vụ">
                                      <Button
                                        size="icon-sm"
                                        variant="outline-danger"
                                        className="mb-0 mr-0"
                                        onClick={() => setRemoveTarget(item)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </Tooltip>
                                  </TableCell>
                                ) : null}
                              </TableRow>
                            ),
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
                )}
              </div>
            ),
          },
        ]}
      />

      {canManageStaffServices ? (
        <ConfirmDialog
          open={!!removeTarget}
          onOpenChange={(open) => {
            if (!open) setRemoveTarget(null);
          }}
          onConfirm={handleRemoveStaffService}
          title="Xóa phân công dịch vụ"
          description={
            staff.fullName
              ? `Gỡ dịch vụ "${removeTarget?.serName ?? ""}" khỏi nhân viên ${staff.fullName}?`
              : `Bạn có chắc muốn xóa phân công dịch vụ "${removeTarget?.serName ?? ""}"? Hành động này không thể hoàn tác.`
          }
          confirmLabel="Xóa"
          loading={deleteStaffServiceMutation.isPending}
          variant="danger"
        />
      ) : null}

      {onEdit ? (
        <TableDetailActions>
          <PermissionGate
            resource={perm.resource}
            action={perm.update}
            role={perm.role}
          >
            <Button
              variant="admin"
              size="sm"
              className="mb-0"
              onClick={() => onEdit(staff)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Cập nhật
            </Button>
          </PermissionGate>
        </TableDetailActions>
      ) : null}
    </TableDetailExpanded>
  );
}
