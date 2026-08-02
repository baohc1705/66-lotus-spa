import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { CustomerDto } from "../types/customer.types";
import { FallbackImage } from "@/shared/components/FallbackImage";

interface CustomerCrmListProps {
  customers: CustomerDto[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
  totalCustomers: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filter: string;
  onFilterChange: (val: string) => void;
  selectedGender: number | null;
  onSelectGender: (g: number | null) => void;
  selectedSource: string | null;
  onSelectSource: (s: string | null) => void;
  onAdd: () => void;
  showDeleted: boolean;
  onToggleDeleted: () => void;
}

export function CustomerCrmList({
  customers,
  selectedId,
  onSelect,
  isLoading,
  pageIndex,
  totalPages,
  onPageChange,
  filter,
  onFilterChange,
  selectedGender,
  onSelectGender,
  selectedSource,
  onSelectSource,
  onAdd,
  showDeleted,
  onToggleDeleted,
}: CustomerCrmListProps) {
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white border border-adminGray-100 rounded overflow-hidden shadow-sm">
      <div className="p-3 border-b border-adminGray-100 space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-adminGray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="pl-8 text-sm h-9 focus-visible:ring-adminGreen-600"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className={`h-9 w-9 shrink-0 ${showAdvancedFilter ? "bg-adminGreen-100 border-adminGreen-600 text-adminGreen-600" : "text-adminGray-600"}`}
            title="Tìm nâng cao"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onToggleDeleted}
            className={`h-9 w-9 shrink-0 ${showDeleted ? "bg-state-warning-bg border-state-warning-border text-state-warning-text" : "text-adminGray-600"}`}
            title={
              showDeleted ? "Xem danh sách hoạt động" : "Xem danh sách đã xóa"
            }
          >
            {showDeleted ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showAdvancedFilter && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-adminGray-100 animate-in fade-in slide-in-from-top-1 duration-200">
            <div>
              <label className="text-2xs font-bold text-adminGray-400 block mb-1 uppercase">
                Giới tính
              </label>
              <Select
                value={
                  selectedGender === null ? "all" : selectedGender.toString()
                }
                onValueChange={(val) =>
                  onSelectGender(val === "all" ? null : parseInt(val))
                }
              >
                <AdminSelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tất cả" />
                </AdminSelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="0">Nam</SelectItem>
                  <SelectItem value="1">Nữ</SelectItem>
                  <SelectItem value="2">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-2xs font-bold text-adminGray-400 block mb-1 uppercase">
                Nguồn khách
              </label>
              <Select
                value={selectedSource || "all"}
                onValueChange={(val) =>
                  onSelectSource(val === "all" ? null : val)
                }
              >
                <AdminSelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tất cả" />
                </AdminSelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Walk-in">Đến trực tiếp</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Referral">Giới thiệu</SelectItem>
                  <SelectItem value="Social Media">Mạng xã hội</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-adminGray-400 font-medium">
            {showDeleted ? "Khách hàng đã xóa" : "Khách hàng hoạt động"}
          </span>
          {!showDeleted && (
            <Button
              variant="admin"
              size="sm"
              onClick={onAdd}
              className="h-8 px-2.5 text-xs bg-adminGreen-600 hover:bg-adminGreen-600/90 text-white flex items-center gap-1 shadow-sm font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-adminGray-100">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-adminGray-400">
            Đang tải danh sách...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-xs text-adminGray-400">
            Không tìm thấy khách hàng nào
          </div>
        ) : (
          customers.map((cust) => {
            const isSelected = cust.id === selectedId;
            const code = cust.id
              ? `CS${String(cust.id).padStart(6, "0")}`
              : "—";
            return (
              <div
                key={cust.id}
                onClick={() => cust.id && onSelect(cust.id)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-150 border-l-[3px] ${
                  isSelected
                    ? "bg-adminGreen-600-light border-l-[3px] border-l-lotus-leaf font-medium "
                    : "hover:bg-adminGray-50 border-l-transparent"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-adminGray-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner border border-adminGray-100">
                  <FallbackImage
                    kind="customer"
                    src={cust.avatarUrl}
                    alt=""
                    className="w-10 h-10 object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-bold truncate ${isSelected ? "text-adminGreen-600" : "text-adminInk"}`}
                    >
                      {cust.fullName || "—"}
                    </span>
                    <span className="text-2xs text-adminGray-400 font-mono shrink-0">
                      {code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-adminGray-600 mt-0.5">
                    <span className="truncate">{cust.phone || "—"}</span>
                    {cust.loyaltyPoint != null && cust.loyaltyPoint > 0 && (
                      <span className="text-2xs font-semibold bg-state-warning-bg text-state-warning-text border border-state-warning-border/50 px-1 rounded">
                        {cust.loyaltyPoint} điểm
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-2 border-t border-adminGray-100 bg-adminGray-50/50 flex items-center justify-between text-xs text-adminGray-600">
          <Button
            variant="ghost"
            size="icon"
            disabled={pageIndex === 1 || isLoading}
            onClick={() => onPageChange(pageIndex - 1)}
            className="h-7 w-7 text-adminGray-600 hover:text-adminInk"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            Trang {pageIndex} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={pageIndex === totalPages || isLoading}
            onClick={() => onPageChange(pageIndex + 1)}
            className="h-7 w-7 text-adminGray-600 hover:text-adminInk"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
