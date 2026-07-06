import { User, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { useCustomerDetail } from "../hooks/useCustomers";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import type { CustomerDto } from "../types/customer.types";
import { CUSTOMER_PERM } from "../constants/customer.permissions";

import { GENDER_MAP, STATUS_MAP } from "@/shared/constants/display.const";

interface CustomerDetailExpandedProps {
  customerId: number;
  onEdit?: (customer: CustomerDto) => void;
}

export function CustomerDetailExpanded({
  customerId,
  onEdit,
}: CustomerDetailExpandedProps) {
  const { data: result, isLoading } = useCustomerDetail(customerId);
  const customer = result?.data;
  const perm = CUSTOMER_PERM;

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

  if (!customer) {
    return (
      <div className="p-6 text-center text-lotus-stone text-sm bg-stone-50/30">
        Không tìm thấy thông tin khách hàng
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
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-lotus-admin-lg font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Thông tin
            </TabsTrigger>
            <TabsTrigger
              value="purchase"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-lotus-admin-lg font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Lịch sử mua hàng
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-lotus-admin-lg font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Lịch hẹn
            </TabsTrigger>
            <TabsTrigger
              value="loyalty"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-lotus-admin-lg font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Tích lũy & Ưu đãi
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - Info */}
        <TabsContent value="info" className="p-4 m-0 border-none outline-none">
          <div className="flex flex-col gap-4">
            {/* Header profile info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {customer.avatarUrl ? (
                  <img
                    src={customer.avatarUrl}
                    alt={customer.fullName ?? ""}
                    className="w-14 h-14 object-cover"
                  />
                ) : (
                  <User className="w-7 h-7 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-lotus-deep truncate">
                  {customer.fullName ?? "—"}
                </h3>
                <p className="text-lotus-admin-md text-lotus-stone mt-0.5">
                  Điểm: {customer.loyaltyPoint ?? 0}
                </p>
              </div>
            </div>

            {/* Grid 3 cols for fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-0">
              <div className="flex flex-col">
                <DetailField label="Số điện thoại" value={customer.phone} />
                <DetailField
                  label="Giới tính"
                  value={
                    GENDER_MAP[customer.gender ?? ""] ??
                    customer.gender?.toString()
                  }
                />
                <DetailField
                  label="Ngày sinh"
                  value={formatDisplayDate(customer.dateOfBirth)}
                />
              </div>
              <div className="flex flex-col">
                <DetailField label="Nguồn khách" value={customer.source} />
                <DetailField
                  label="Trạng thái"
                  value={
                    STATUS_MAP[customer.status ?? ""] ??
                    customer.status?.toString()
                  }
                />
                <DetailField label="Địa chỉ" value={customer.fullAddress} />
              </div>
              <div className="flex flex-col">
                <DetailField label="Email" value={customer.email} />
                <DetailField
                  label="Lần mua đầu"
                  value={formatDisplayDate(customer.firstPurchaseAt)}
                />
                <DetailField
                  label="Lần mua gần nhất"
                  value={formatDisplayDate(customer.lastPurchaseAt)}
                />
              </div>
            </div>

            {/* Note & Actions */}
            <div className="flex items-end justify-between mt-2 pt-4 border-t border-stone-100/80">
              <div className="flex items-start gap-2 text-lotus-admin-lg text-lotus-deep flex-1 min-w-0">
                <Pencil className="w-4 h-4 text-lotus-stone shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Ghi chú:</span>
                  <span className="ml-1 text-lotus-stone">
                    {customer.note || "Chưa có ghi chú"}
                  </span>
                </div>
              </div>
              <PermissionGate resource={perm.resource} action={perm.update}>
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => onEdit?.(customer)}
                  className="bg-lotus-leaf hover:opacity-90 text-white shadow-sm h-8 px-4 text-lotus-admin-lg gap-1.5 ml-auto rounded-md transition-opacity"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Cập nhật
                </Button>
              </PermissionGate>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="purchase"
          className="p-10 text-center text-lotus-stone text-sm"
        >
          Chưa có dữ liệu lịch sử mua hàng
        </TabsContent>
        <TabsContent
          value="appointments"
          className="p-10 text-center text-lotus-stone text-sm"
        >
          Chưa có lịch hẹn nào
        </TabsContent>
        <TabsContent
          value="loyalty"
          className="p-10 text-center text-lotus-stone text-sm"
        >
          Chưa có thông tin tích lũy & ưu đãi
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
      <p className="text-lotus-admin-md text-lotus-stone mb-1">{label}</p>
      <p className="text-lotus-admin-lg font-medium text-lotus-deep truncate">
        {value || "—"}
      </p>
    </div>
  );
}
