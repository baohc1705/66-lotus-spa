import { User, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { useStaffDetail } from "../hooks/useStaffs";
import { useGetAllRoles } from "@/features/auth/hooks/useGetAllRoles";
import type { StaffFullDto } from "../types/staff.types";
import type { RoleDTO } from "@/features/auth/types/auth.types";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { GENDER_MAP } from "@/shared/constants/display.const";
import { StaffServicesTab } from "./StaffServicesTab";

interface StaffDetailExpandedProps {
  staffId: number;
  onEdit?: (staff: StaffFullDto) => void;
  onAssignService?: (staff: StaffFullDto) => void;
}

export function StaffDetailExpanded({
  staffId,
  onEdit,
  onAssignService,
}: StaffDetailExpandedProps) {
  const { data: result, isLoading } = useStaffDetail(staffId);
  const staff = result?.data;
  const { data: rolesResult } = useGetAllRoles();
  const roles = rolesResult?.data ?? [];

  const roleLabel =
    roles.find((r: RoleDTO) => r.code === staff?.role)?.name ??
    staff?.role ??
    null;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-adminGray-50/30">
        <div className="flex gap-4 mb-4">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
        <Skeleton className="w-48 h-6" />
        <div className="grid grid-cols-2 gap-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-6 text-center text-adminGray-600 text-sm bg-adminGray-50/30">
        Không tìm thấy thông tin nhân viên
      </div>
    );
  }

  return (
    <div className="bg-adminGray-50/30 w-full overflow-hidden">
      <Tabs defaultValue="info" className="w-full flex-col">
        <div className="px-4 pt-2">
          <TabsList className="h-10 border-b border-adminGray-100/80 justify-start rounded-none bg-transparent p-0 flex flex-nowrap overflow-x-auto overflow-y-hidden hide-scrollbar">
            <TabsTrigger
              value="info"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Thông tin
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Lịch làm việc
            </TabsTrigger>
            <TabsTrigger
              value="salary_config"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Thiết lập lương
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Dịch vụ thực hiện
            </TabsTrigger>
            <TabsTrigger
              value="payslip"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Phiếu lương
            </TabsTrigger>
            <TabsTrigger
              value="debt"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Nợ và tạm ứng
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="p-4 m-0 border-none outline-none">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-adminGreen-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {staff.avatarUrl ? (
                  <img
                    src={staff.avatarUrl}
                    alt={staff.fullName ?? ""}
                    className="w-14 h-14 object-cover"
                  />
                ) : (
                  <User className="w-7 h-7 text-adminGreen-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-adminInk truncate">
                  {staff.fullName ?? "—"}
                </h3>
                <p className="text-xs text-adminGray-600 mt-0.5">
                  Mã nhân viên: {staff.code ?? "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-0">
              <div className="flex flex-col">
                <DetailField label="Số điện thoại" value={staff.phone} />
                <DetailField label="Số CMND/CCCD" value={staff.nationalId} />
                <DetailField
                  label="Ngày bắt đầu làm việc"
                  value={formatDisplayDate(staff.hireDate)}
                />
              </div>
              <div className="flex flex-col">
                <DetailField label="Vai trò" value={roleLabel} />
                <DetailField
                  label="Chi nhánh làm việc"
                  value={staff.salonName}
                />
                <DetailField label="Địa chỉ" value={staff.fullAddress} />
              </div>
              <div className="flex flex-col">
                <DetailField label="Tài khoản" value={staff.username} />
                <DetailField label="Email" value={staff.email} />
                <DetailField
                  label="Giới tính"
                  value={
                    GENDER_MAP[staff.gender ?? ""] ??
                    (staff.gender != null ? String(staff.gender) : null)
                  }
                />
                <DetailField
                  label="Ngày sinh"
                  value={formatDisplayDate(staff.dateOfBirth)}
                />
              </div>
            </div>

            <div className="flex items-end justify-between mt-2 pt-4 border-t border-adminGray-100/80">
              <div className="flex items-center gap-2 text-sm text-adminInk">
                <Pencil className="w-4 h-4 text-adminGray-600" />
                <span className="font-semibold">Ghi chú:</span>
              </div>
              <PermissionGate resource="staffs" action="update">
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => onEdit?.(staff)}
                  className="bg-adminGreen-600 hover:opacity-90 text-white shadow-sm h-8 px-4 text-sm gap-1.5 ml-auto rounded-md transition-opacity"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Cập nhật
                </Button>
              </PermissionGate>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="schedule"
          className="p-10 text-center text-adminGray-600 text-sm"
        >
          Chưa có dữ liệu lịch làm việc
        </TabsContent>
        <TabsContent
          value="salary_config"
          className="p-10 text-center text-adminGray-600 text-sm"
        >
          Chưa cấu hình thiết lập lương
        </TabsContent>
        <TabsContent value="services" className="m-0 border-none outline-none">
          <StaffServicesTab
            staffId={staffId}
            staffName={staff.fullName}
            onAssign={() => onAssignService?.(staff)}
          />
        </TabsContent>
        <TabsContent
          value="payslip"
          className="p-10 text-center text-adminGray-600 text-sm"
        >
          Không có phiếu lương nào
        </TabsContent>
        <TabsContent
          value="debt"
          className="p-10 text-center text-adminGray-600 text-sm"
        >
          Không có nợ và tạm ứng
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="py-3.5 border-b border-adminGray-100/80 last:border-b-0 group">
      <p className="text-xs text-adminGray-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-adminInk truncate">
        {value || "—"}
      </p>
    </div>
  );
}
