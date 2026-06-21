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
import type { StaffDto } from "../types/staff.types";
import { formatDisplayDate } from "@/shared/utils/date.utils";

const GENDER_MAP: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
};

interface StaffDetailExpandedProps {
  staffId: number;
  onEdit?: (staff: StaffDto) => void;
}

export function StaffDetailExpanded({
  staffId,
  onEdit,
}: StaffDetailExpandedProps) {
  const { data: result, isLoading } = useStaffDetail(staffId);
  const staff = result?.data;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-stone-50/30">
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
      <div className="p-6 text-center text-lotus-stone text-sm bg-stone-50/30">
        Không tìm thấy thông tin nhân viên
      </div>
    );
  }

  return (
    <div className="bg-stone-50/30 w-full overflow-hidden">
      <Tabs defaultValue="info" className="w-full flex-col">
        {/* Tab Headers */}
        <div className="px-4 pt-2">
          <TabsList className="h-10 border-b border-stone-200/80 justify-start rounded-none bg-transparent p-0 flex flex-nowrap overflow-x-auto overflow-y-hidden hide-scrollbar">
            <TabsTrigger
              value="info"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-[13px] font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Thông tin
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-[13px] font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Lịch làm việc
            </TabsTrigger>
            <TabsTrigger
              value="salary_config"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-[13px] font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Thiết lập lương
            </TabsTrigger>
            <TabsTrigger
              value="payslip"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-[13px] font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Phiếu lương
            </TabsTrigger>
            <TabsTrigger
              value="debt"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-[13px] font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Nợ và tạm ứng
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - Info */}
        <TabsContent value="info" className="p-4 m-0 border-none outline-none">
          <div className="flex flex-col gap-4">
            {/* Header profile info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {staff.avatarUrl ? (
                  <img
                    src={staff.avatarUrl}
                    alt={staff.fullName ?? ""}
                    className="w-14 h-14 object-cover"
                  />
                ) : (
                  <User className="w-7 h-7 text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-lotus-deep truncate">
                  {staff.fullName ?? "—"}
                </h3>
                <p className="text-[12px] text-lotus-stone mt-0.5">
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
                <DetailField label="Phòng ban" value={staff.role} />
                <DetailField label="Chức danh" value={staff.role} />
                <DetailField
                  label="Chi nhánh làm việc"
                  value={staff.salonName}
                />
              </div>
              <div className="flex flex-col">
                <DetailField label="Tài khoản" value={staff.username} />
                <DetailField label="Email" value={staff.email} />
                <DetailField
                  label="Giới tính"
                  value={GENDER_MAP[staff.gender ?? ""] ?? staff.gender}
                />
                <DetailField
                  label="Ngày sinh"
                  value={formatDisplayDate(staff.dateOfBirth)}
                />
              </div>
            </div>

            {/* Note & Actions */}
            <div className="flex items-end justify-between mt-2 pt-4 border-t border-stone-100/80">
              <div className="flex items-center gap-2 text-[13px] text-lotus-deep">
                <Pencil className="w-4 h-4 text-lotus-stone" />
                <span className="font-semibold">Ghi chú:</span>
              </div>
              <PermissionGate resource="staffs" action="update">
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => onEdit?.(staff)}
                  className="bg-lotus-leaf hover:opacity-90 text-white shadow-sm h-8 px-4 text-[13px] gap-1.5 ml-auto rounded-md transition-opacity"
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
          className="p-10 text-center text-lotus-stone text-sm"
        >
          Chưa có dữ liệu lịch làm việc
        </TabsContent>
        <TabsContent
          value="salary_config"
          className="p-10 text-center text-lotus-stone text-sm"
        >
          Chưa cấu hình thiết lập lương
        </TabsContent>
        <TabsContent
          value="payslip"
          className="p-10 text-center text-lotus-stone text-sm"
        >
          Không có phiếu lương nào
        </TabsContent>
        <TabsContent
          value="debt"
          className="p-10 text-center text-lotus-stone text-sm"
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
    <div className="py-3.5 border-b border-stone-100/80 last:border-b-0 group">
      <p className="text-[12px] text-lotus-stone mb-1">{label}</p>
      <p className="text-[13px] font-medium text-lotus-deep truncate">
        {value || "—"}
      </p>
    </div>
  );
}
