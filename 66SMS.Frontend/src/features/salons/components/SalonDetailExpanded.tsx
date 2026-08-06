import { SalonStaffPage } from "@/features/staff_salons/pages/SalonStaffPage";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { FallbackImage } from "@/shared/components/FallbackImage";
import {
  Calendar,
  FileText,
  Hash,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Users,
} from "lucide-react";
import { useSalonDetail } from "../hooks/useSalons";
import type { SalonDTO } from "../types/salon.types";
import { SalonStatusBadge } from "./SalonStatusBadge";

interface SalonDetailExpandedProps {
  salonId: number;
  onEdit?: (salon: SalonDTO) => void;
}

export function SalonDetailExpanded({
  salonId,
  onEdit,
}: SalonDetailExpandedProps) {
  const { data: result, isLoading } = useSalonDetail(salonId);
  const salon = result?.data;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-adminGray-50/30">
        <div className="flex gap-4 mb-4">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
        <div className="grid grid-cols-2 gap-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="p-6 text-center text-adminGray-600 text-sm bg-adminGray-50/30">
        Không tìm thấy thông tin chi nhánh
      </div>
    );
  }

  return (
    <div className="bg-adminGray-50/30 w-full overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
      <Tabs defaultValue="info" className="w-full flex-col">
        <div className="px-4 pt-2 sticky top-0 bg-adminGray-50/95 backdrop-blur-sm z-10">
          <TabsList className="h-10 border-b border-adminGray-100/80 justify-start rounded-none bg-transparent p-0 flex flex-nowrap overflow-x-auto overflow-y-hidden hide-scrollbar">
            <TabsTrigger
              value="info"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              <Users className="w-3.5 h-3.5 mr-1.5 inline" />
              Nhân viên
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="p-4 m-0 border-none outline-none">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-adminGray-50/50 flex items-center justify-center shrink-0 shadow-sm border border-adminGray-100/50 overflow-hidden">
                <FallbackImage
                  kind="salon"
                  src={salon.imageUrl}
                  alt={salon.name ?? ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-adminInk truncate">
                    {salon.name ?? "—"}
                  </h3>
                  <span className="font-mono text-xs bg-adminGray-100 px-1.5 py-0.5 rounded text-adminGray-600 border border-adminGray-100">
                    {salon.code}
                  </span>
                </div>
                <div className="mt-1">
                  <SalonStatusBadge status={salon.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-0">
              <div className="flex flex-col">
                <DetailField
                  label="Số điện thoại"
                  value={salon.phone}
                  icon={Phone}
                />
                <DetailField label="Email" value={salon.email} icon={Mail} />
                <DetailField
                  label="Mã số thuế"
                  value={salon.taxCode}
                  icon={Hash}
                />
              </div>
              <div className="flex flex-col">
                <DetailField
                  label="Ngày làm việc"
                  value={salon.workingDays}
                  icon={Calendar}
                />
                <DetailField
                  label="Thứ tự hiển thị"
                  value={salon.sortOrder?.toString()}
                />
              </div>
              <div className="flex flex-col">
                <DetailField
                  label="Địa chỉ"
                  value={salon.fullAddress}
                  icon={MapPin}
                />
                {salon.fullAddress && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-adminGreen-600 hover:underline mt-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Xem trên Google Maps
                  </a>
                )}
              </div>
            </div>

            {salon.description && (
              <div className="rounded-lg bg-white border border-adminGray-100 p-3">
                <p className="text-xs font-semibold text-adminGray-600 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Mô tả
                </p>
                <p className="text-sm text-adminInk/80 whitespace-pre-line">
                  {salon.description}
                </p>
              </div>
            )}

            <div className="flex items-end justify-end mt-2 pt-4 border-t border-adminGray-100/80">
              <Button
                variant="admin"
                size="sm"
                onClick={() => onEdit?.(salon)}
                className="bg-adminGreen-600 hover:opacity-90 text-white shadow-sm h-8 px-4 text-sm gap-1.5 rounded-md transition-opacity"
              >
                <Pencil className="w-3.5 h-3.5" />
                Cập nhật
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="staff" className="p-4 m-0 border-none outline-none">
          <SalonStaffPage salonId={salonId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ElementType;
}) {
  return (
    <div className="py-3.5 border-b border-adminGray-100/80 last:border-b-0">
      <p className="text-xs text-adminGray-600 mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </p>
      <p className="text-sm font-medium text-adminInk truncate">
        {value || "—"}
      </p>
    </div>
  );
}
