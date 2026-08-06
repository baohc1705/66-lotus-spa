import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { GENDER_MAP, STATUS_MAP } from "@/shared/constants/display.const";
import { FileText, Pencil, Trash2, User } from "lucide-react";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { useCustomerDetail } from "../hooks/useCustomers";
import type { CustomerDto } from "../types/customer.types";

interface CustomerCrmDetailProps {
  customerId: number | null;
  onEdit: (customer: CustomerDto) => void;
  onDelete: (customer: CustomerDto) => void;
}

export function CustomerCrmDetail({
  customerId,
  onEdit,
  onDelete,
}: CustomerCrmDetailProps) {
  const { data: result, isLoading } = useCustomerDetail(customerId);
  const customer = result?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white border border-adminGray-100 rounded overflow-hidden p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-4 py-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!customerId || !customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white border border-adminGray-100 rounded shadow-sm p-6 text-center text-adminGray-400">
        <User className="w-12 h-12 text-adminGray-300 mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium">
          Chọn một khách hàng để xem chi tiết
        </p>
      </div>
    );
  }

  const code = customer.id ? `CS${String(customer.id).padStart(6, "0")}` : "—";

  return (
    <div className="flex flex-col h-full bg-white border border-adminGray-100 rounded overflow-hidden shadow-sm">
      <div className="p-4 border-b border-adminGray-100 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-bold text-adminInk truncate">
          Thông tin khách hàng -{" "}
          <span className="font-mono text-adminGray-600">{code}</span>
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs text-state-danger-text hover:text-state-danger-text hover:bg-state-danger-bg border-state-danger-border"
            onClick={() => onDelete(customer)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Xóa
          </Button>
          <Button
            size="sm"
            variant="admin"
            className="h-8 text-xs bg-lotus-primary hover:bg-lotus-primary-600 text-white font-semibold"
            onClick={() => onEdit(customer)}
          >
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Sửa
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-adminGray-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner border border-adminGray-100">
            <FallbackImage
              kind="customer"
              src={customer.avatarUrl}
              alt={customer.fullName || ""}
              className="w-16 h-16 object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-adminInk truncate">
              {customer.fullName || "—"}
            </h4>
            <div className="text-xs text-adminGray-600 mt-1 space-y-0.5">
              <p>
                Lần mua đầu:{" "}
                {customer.firstPurchaseAt
                  ? formatDisplayDate(customer.firstPurchaseAt)
                  : "chưa có"}
              </p>
              <p>
                Ghé thăm lần cuối:{" "}
                {customer.lastPurchaseAt
                  ? formatDisplayDate(customer.lastPurchaseAt)
                  : "chưa đến"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-lotus-secondary text-white shadow-sm shrink-0">
            <span className="text-base font-black leading-none">
              {customer.loyaltyPoint ?? 0}
            </span>
            <span className="text-2xs mt-0.5 uppercase tracking-wider font-semibold">
              Điểm
            </span>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-adminGray-100 bg-transparent p-0 h-9">
            <TabsTrigger
              value="personal"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-2 text-xs font-semibold text-adminGray-600 hover:text-adminInk data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:shadow-none"
            >
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger
              value="note"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-2 text-xs font-semibold text-adminGray-600 hover:text-adminInk data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:shadow-none"
            >
              Ghi chú
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="personal"
            className="pt-3 border-0 m-0 outline-none"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <DetailFieldItem label="Mã khách hàng" value={code} />
              <DetailFieldItem label="Số điện thoại" value={customer.phone} />
              <DetailFieldItem label="Email" value={customer.email} />
              <DetailFieldItem
                label="Giới tính"
                value={
                  customer.gender !== null
                    ? GENDER_MAP[customer.gender] || "Khác"
                    : "—"
                }
              />
              <DetailFieldItem
                label="Ngày sinh"
                value={
                  customer.dateOfBirth
                    ? formatDisplayDate(customer.dateOfBirth)
                    : "—"
                }
              />
              <DetailFieldItem
                label="Nguồn giới thiệu"
                value={customer.source}
              />
              <DetailFieldItem
                label="Trạng thái"
                value={
                  customer.status !== null
                    ? STATUS_MAP[customer.status] || "—"
                    : "—"
                }
              />
              <DetailFieldItem
                label="Điểm tích lũy"
                value={String(customer.loyaltyPoint ?? 0)}
              />
              <DetailFieldItem
                label="Địa chỉ"
                value={customer.fullAddress}
                className="col-span-2"
              />
            </div>
          </TabsContent>

          <TabsContent
            value="note"
            className="pt-3 m-0 outline-none text-xs text-adminGray-600"
          >
            <div className="bg-adminGray-50 rounded p-3 min-h-24 border border-adminGray-100 flex items-start gap-2">
              <FileText className="w-4 h-4 text-adminGray-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-adminInk block mb-1">
                  Ghi chú:
                </span>
                <p className="text-adminGray-600 italic">
                  {customer.note || "Không có ghi chú nào"}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DetailFieldItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div
      className={`space-y-0.5 border-b border-adminGray-100/60 pb-1.5 last:border-b-0 ${className}`}
    >
      <span className="text-2xs text-adminGray-400 font-bold uppercase tracking-wider block">
        {label}
      </span>
      <span className="font-semibold text-adminInk truncate block">
        {value || "—"}
      </span>
    </div>
  );
}
