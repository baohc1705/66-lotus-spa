import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { Pagination } from "@/shared/components/Pagination";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import { Input } from "@/shared/forms/Input";
import { InputGroup, InputGroupText } from "@/shared/forms/InputGroup";
import { Select } from "@/shared/forms/Select";

import type { CustomerDto } from "../types/customer.types";

const GENDER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "0", label: "Nam" },
  { value: "1", label: "Nữ" },
  { value: "2", label: "Khác" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "Walk-in", label: "Đến trực tiếp" },
  { value: "Online", label: "Online" },
  { value: "Referral", label: "Giới thiệu" },
  { value: "Social Media", label: "Mạng xã hội" },
];

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
    <div className="flex h-full flex-col overflow-hidden rounded border border-kit bg-kit-white shadow-kit-card">
      <div className="space-y-2 border-b border-kit p-3">
        <div className="flex items-center gap-1.5">
          <InputGroup size="sm" className="min-w-0 flex-1">
            <InputGroupText className="px-2">
              <Search className="h-4 w-4 text-kit-muted" />
            </InputGroupText>
            <Input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={filter}
              onChange={(event) => onFilterChange(event.target.value)}
              inputSize="sm"
              className="rounded-l-none border-l-0"
            />
          </InputGroup>

          <Button
            type="button"
            variant={showAdvancedFilter ? "outline-primary" : "outline"}
            size="icon-sm"
            className="mb-0 mr-0 shrink-0"
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            title="Tìm nâng cao"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={showDeleted ? "outline-warning" : "outline"}
            size="icon-sm"
            className="mb-0 mr-0 shrink-0"
            onClick={onToggleDeleted}
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

        {showAdvancedFilter ? (
          <div className="grid grid-cols-2 gap-2 border-t border-kit pt-2">
            <div>
              <label className="mb-1 block text-2xs font-bold uppercase text-kit-muted">
                Giới tính
              </label>
              <Select
                value={
                  selectedGender === null ? "all" : selectedGender.toString()
                }
                onChange={(event) =>
                  onSelectGender(
                    event.target.value === "all"
                      ? null
                      : Number(event.target.value),
                  )
                }
                options={GENDER_OPTIONS}
                inputSize="sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-2xs font-bold uppercase text-kit-muted">
                Nguồn khách
              </label>
              <Select
                value={selectedSource || "all"}
                onChange={(event) =>
                  onSelectSource(
                    event.target.value === "all" ? null : event.target.value,
                  )
                }
                options={SOURCE_OPTIONS}
                inputSize="sm"
              />
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs font-medium text-kit-muted">
            {showDeleted ? "Khách hàng đã xóa" : "Khách hàng hoạt động"}
          </span>
          {!showDeleted ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mb-0"
              onClick={onAdd}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Thêm
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-center text-xs text-kit-muted">
            Đang tải danh sách...
          </p>
        ) : customers.length === 0 ? (
          <p className="p-8 text-center text-xs text-kit-muted">
            Không tìm thấy khách hàng nào
          </p>
        ) : (
          <ListGroup flush>
            {customers.map((customer: CustomerDto) => {
              const isSelected = customer.id === selectedId;
              const code = customer.id
                ? `CS${String(customer.id).padStart(6, "0")}`
                : "—";

              return (
                <ListGroupItem
                  key={customer.id}
                  action
                  active={isSelected}
                  onClick={() => {
                    if (customer.id) onSelect(customer.id);
                  }}
                  className="gap-2 px-3 py-2.5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-kit bg-kit-page">
                      <FallbackImage
                        kind="customer"
                        src={customer.avatarUrl}
                        alt=""
                        className="h-10 w-10 object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold">
                          {customer.fullName || "—"}
                        </span>
                        <span className="shrink-0 font-mono text-2xs opacity-80">
                          {code}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-xs opacity-90">
                        {customer.phone || "—"}
                      </div>
                    </div>
                  </div>
                  {customer.loyaltyPoint != null && customer.loyaltyPoint > 0 ? (
                    <Badge variant="warning" soft className="shrink-0 normal-case">
                      {customer.loyaltyPoint} điểm
                    </Badge>
                  ) : null}
                </ListGroupItem>
              );
            })}
          </ListGroup>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex justify-center border-t border-kit bg-kit-page/50 p-2">
          <Pagination
            page={pageIndex}
            pageCount={totalPages}
            onPageChange={onPageChange}
            size="sm"
          />
        </div>
      ) : null}
    </div>
  );
}
