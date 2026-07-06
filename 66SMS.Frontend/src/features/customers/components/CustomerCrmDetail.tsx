import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import {
  Award,
  CalendarRange,
  FileText,
  Pencil,
  Printer,
  ShoppingCart,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useCustomerDetail } from "../hooks/useCustomers";
import type { CustomerDto } from "../types/customer.types";

interface CustomerCrmDetailProps {
  customerId: number | null;
  onEdit: (customer: CustomerDto) => void;
  onDelete: (customer: CustomerDto) => void;
}

const GENDER_MAP: Record<string, string> = {
  0: "Nam",
  1: "Nữ",
  2: "Khác",
};

export function CustomerCrmDetail({
  customerId,
  onEdit,
  onDelete,
}: CustomerCrmDetailProps) {
  const { data: result, isLoading } = useCustomerDetail(customerId);
  const customer = result?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white border border-stone-200 rounded overflow-hidden p-6 space-y-4 shadow-sm">
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
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!customerId || !customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white border border-stone-200 rounded shadow-sm p-6 text-center text-stone-400">
        <User className="w-12 h-12 text-stone-300 mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium">
          Chọn một khách hàng để xem chi tiết
        </p>
      </div>
    );
  }

  const code = customer.id ? `CS${String(customer.id).padStart(6, "0")}` : "—";
  const createdDate = customer.createdAt
    ? formatDisplayDate(customer.createdAt)
    : "—";

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded overflow-hidden shadow-sm">
      {/* Detail Header & Main Title */}
      <div className="p-4 border-b border-stone-100 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-bold text-stone-900 truncate">
          Thông tin khách hàng -{" "}
          <span className="font-mono text-stone-600">{code}</span>
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Profile Card & Big Badge */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner border border-stone-200">
            {customer.avatarUrl ? (
              <img
                src={customer.avatarUrl}
                alt={customer.fullName || ""}
                className="w-16 h-16 object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-stone-500">
                {(customer.fullName || "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-stone-900 truncate">
              {customer.fullName || "—"}
            </h4>
            <div className="text-xs text-stone-500 mt-1 space-y-0.5">
              <p>Khởi tạo lúc: {createdDate}</p>
              <p>
                Ghé thăm lần cuối:{" "}
                {customer.lastPurchaseAt
                  ? formatDisplayDate(customer.lastPurchaseAt)
                  : "chưa đến"}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-0.5 rounded">
                Hạng Thường
              </span>
              <button className="text-[11px] text-lotus-leaf hover:underline font-medium">
                + Thêm nhóm khách hàng
              </button>
            </div>
          </div>
          {/* Big Loyalty Point Badge */}
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-lotus-secondary text-white shadow-sm shrink-0">
            <span className="text-base font-black leading-none">
              {customer.loyaltyPoint ?? 0}
            </span>
            <span className="text-[8px] mt-0.5 uppercase tracking-wider font-semibold">
              Điểm
            </span>
          </div>
        </div>

        {/* Short Summary Stats */}
        <div className="bg-stone-50 border border-stone-100 rounded-lg p-3 text-xs space-y-1.5 text-stone-600">
          <div className="flex justify-between">
            <span>Tổng số lần đặt trước:</span>
            <span className="font-bold text-stone-900">0 (lần)</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng số lần đặt từ app:</span>
            <span className="font-bold text-stone-900">0 (lần)</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng số lần đến trực tiếp:</span>
            <span className="font-bold text-stone-900">0 (lần)</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng số lần hủy đặt / không đến:</span>
            <span className="font-bold text-stone-900">0 (lần)</span>
          </div>
          <div className="flex justify-between border-t border-stone-200/60 pt-1.5">
            <span>Nguồn giới thiệu:</span>
            <span className="font-medium text-stone-800">
              {customer.source || "—"}
            </span>
          </div>
        </div>

        {/* Tabbed Info */}
        <Tabs defaultValue="personal" className="w-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-stone-200 bg-transparent p-0 h-9">
            <TabsTrigger
              value="personal"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-2 text-xs font-semibold text-stone-500 hover:text-stone-900 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:shadow-none"
            >
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger
              value="note"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-2 text-xs font-semibold text-stone-500 hover:text-stone-900 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:shadow-none"
            >
              Ghi chú
            </TabsTrigger>
            <TabsTrigger
              value="relatives"
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-2 text-xs font-semibold text-stone-500 hover:text-stone-900 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:shadow-none"
            >
              Người thân
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="personal"
            className="pt-3 border-0 m-0 outline-none"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <DetailFieldItem label="Mã khách hàng" value={code} canPrint />
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
              <DetailFieldItem label="Facebook" value="—" />
              <DetailFieldItem label="Số ĐT Zalo" value="—" />
              <DetailFieldItem label="Website" value="—" />
              <DetailFieldItem
                label="Ngày sinh"
                value={
                  customer.dateOfBirth
                    ? formatDisplayDate(customer.dateOfBirth)
                    : "—"
                }
              />
              <DetailFieldItem label="Chiều cao" value="—" />
              <DetailFieldItem label="Cân nặng" value="—" />
              <DetailFieldItem label="Mã thẻ" value="—" />
              <DetailFieldItem
                label="Địa chỉ"
                value={customer.fullAddress}
                className="col-span-2"
              />
            </div>
          </TabsContent>

          <TabsContent
            value="note"
            className="pt-3 m-0 outline-none text-xs text-stone-500"
          >
            <div className="bg-stone-50 rounded p-3 min-h-24 border border-stone-100 flex items-start gap-2">
              <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-stone-700 block mb-1">
                  Ghi chú:
                </span>
                <p className="text-stone-600 italic">
                  {customer.note || "Không có ghi chú nào"}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="relatives"
            className="pt-3 m-0 outline-none text-xs text-stone-500 text-center py-6"
          >
            <Users className="w-8 h-8 text-stone-300 mx-auto mb-1 stroke-[1.5]" />
            <p>Chưa khai báo thông tin người thân</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer fixed action buttons */}
      <div className="p-3 border-t border-stone-100 bg-stone-50/50 flex gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs border-stone-300 text-stone-700 h-9 font-semibold"
        >
          <Printer className="w-3.5 h-3.5 mr-1" />
          In phiếu
        </Button>
        <Button
          variant="admin"
          size="sm"
          className="flex-[1.5] text-xs bg-orange-500 hover:bg-orange-600 text-white h-9 font-semibold"
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
          Tạo Đơn Hàng
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs border-stone-300 text-stone-700 h-9 font-semibold"
        >
          <CalendarRange className="w-3.5 h-3.5 mr-1" />
          Đặt lịch
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs border-stone-300 text-stone-700 h-9 font-semibold"
        >
          <Award className="w-3.5 h-3.5 mr-1" />
          Điểm
        </Button>
      </div>
    </div>
  );
}

function DetailFieldItem({
  label,
  value,
  canPrint = false,
  className = "",
}: {
  label: string;
  value: string | null | undefined;
  canPrint?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`space-y-0.5 border-b border-stone-100/60 pb-1.5 last:border-b-0 ${className}`}
    >
      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
        {label}
      </span>
      <div className="flex items-center gap-1.5 justify-between">
        <span className="font-semibold text-stone-800 truncate">
          {value || "—"}
        </span>
        {canPrint && value && value !== "—" && (
          <button className="text-[10px] bg-stone-100 text-stone-600 hover:bg-stone-200 px-1.5 py-0.5 rounded font-bold shrink-0">
            In mã
          </button>
        )}
      </div>
    </div>
  );
}
