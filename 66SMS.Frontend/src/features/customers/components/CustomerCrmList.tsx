import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded overflow-hidden shadow-sm">
      {/* Toolbar & Search */}
      <div className="p-3 border-b border-stone-100 space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="pl-8 text-[13px] h-9 focus-visible:ring-lotus-leaf"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className={`h-9 w-9 shrink-0 ${showAdvancedFilter ? "bg-lotus-leaf/10 border-lotus-leaf text-lotus-leaf" : "text-stone-600"}`}
            title="Tìm nâng cao"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onToggleDeleted}
            className={`h-9 w-9 shrink-0 ${showDeleted ? "bg-amber-100 border-amber-300 text-amber-800" : "text-stone-600"}`}
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

        {/* Advanced Filters Panel */}
        {showAdvancedFilter && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 animate-in fade-in slide-in-from-top-1 duration-200">
            <div>
              <label className="text-[10px] font-bold text-stone-400 block mb-1 uppercase">
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
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="0">Nam</SelectItem>
                  <SelectItem value="1">Nữ</SelectItem>
                  <SelectItem value="2">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-400 block mb-1 uppercase">
                Nguồn khách
              </label>
              <Select
                value={selectedSource || "all"}
                onValueChange={(val) =>
                  onSelectSource(val === "all" ? null : val)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
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
          <span className="text-[11px] text-stone-400 font-medium">
            {showDeleted ? "Khách hàng đã xóa" : "Khách hàng hoạt động"}
          </span>
          {!showDeleted && (
            <Button
              variant="admin"
              size="sm"
              onClick={onAdd}
              className="h-8 px-2.5 text-xs bg-lotus-leaf hover:bg-lotus-leaf/90 text-white flex items-center gap-1 shadow-sm font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm
            </Button>
          )}
        </div>
      </div>

      {/* Customer List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-stone-100">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-stone-400">
            Đang tải danh sách...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
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
                    ? "bg-lotus-leaf-light border-l-[3px] border-l-lotus-leaf font-medium "
                    : "hover:bg-stone-50 border-l-transparent"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner border border-stone-200">
                  {cust.avatarUrl ? (
                    <img
                      src={cust.avatarUrl}
                      alt=""
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <span className="text-[13px] font-bold text-stone-500">
                      {(cust.fullName ?? "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[13px] font-bold truncate ${isSelected ? "text-lotus-leaf" : "text-stone-900"}`}
                    >
                      {cust.fullName || "—"}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono shrink-0">
                      {code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mt-0.5">
                    <span className="truncate">{cust.phone || "—"}</span>
                    {cust.loyaltyPoint != null && cust.loyaltyPoint > 0 && (
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/50 px-1 rounded">
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-2 border-t border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs text-stone-600">
          <Button
            variant="ghost"
            size="icon"
            disabled={pageIndex === 1 || isLoading}
            onClick={() => onPageChange(pageIndex - 1)}
            className="h-7 w-7 text-stone-500 hover:text-stone-950"
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
            className="h-7 w-7 text-stone-500 hover:text-stone-950"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
