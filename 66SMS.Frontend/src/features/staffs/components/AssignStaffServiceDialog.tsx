import { useMemo, useState } from "react";
import { Scissors, Search, CheckSquare, Square } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { FormSection } from "@/shared/components/forms/FormSection";
import { formatCurrency } from "@/shared/utils/currency";
import { useAdminServices } from "@/features/services/hooks/useServices";
import type { ServiceListDto } from "@/features/services/types/service.types";
import type { StaffServiceDto } from "../types/staff.types";
import {
  useCreateStaffServicesMutation,
  useStaffServices,
} from "../hooks/useStaffs";

interface AssignStaffTarget {
  id?: number | null;
  fullName?: string | null;
  code?: string | null;
}

interface AssignStaffServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: AssignStaffTarget | null;
}

export function AssignStaffServiceDialog({
  open,
  onOpenChange,
  staff,
}: AssignStaffServiceDialogProps) {
  const staffId = staff?.id ?? null;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [validationError, setValidationError] = useState("");

  const { data: assignedResult, isLoading: isLoadingAssigned } = useStaffServices(
    {
      staffId: staffId ?? undefined,
      pageIndex: 1,
      pageSize: 500,
    },
    open && staffId != null && staffId > 0,
  );

  const { data: servicesResult, isLoading: isLoadingServices } = useAdminServices(
    { pageIndex: 1, pageSize: 500 },
    open,
  );

  const createMutation = useCreateStaffServicesMutation();

  const assignedServiceIds = useMemo(() => {
    const items = assignedResult?.data?.items ?? [];
    return new Set(
      items
        .map((s: StaffServiceDto) => s.serviceId)
        .filter((id): id is number => id != null),
    );
  }, [assignedResult?.data?.items]);

  const availableServices = useMemo(() => {
    const items = servicesResult?.data?.items ?? [];
    return items.filter(
      (s: ServiceListDto) =>
        s.id != null &&
        s.status === 1 &&
        !assignedServiceIds.has(s.id),
    );
  }, [servicesResult?.data?.items, assignedServiceIds]);

  const filteredServices = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    if (!q) return availableServices;
    return availableServices.filter(
      (s: ServiceListDto) =>
        s.name?.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q) ||
        s.categoryName?.toLowerCase().includes(q),
    );
  }, [availableServices, searchText]);

  function resetForm() {
    setSelectedIds([]);
    setSearchText("");
    setValidationError("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function toggleService(id: number) {
    setValidationError("");
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    setValidationError("");
    const allFilteredIds = filteredServices
      .map((s: ServiceListDto) => s.id)
      .filter((id): id is number => id != null);
    const allSelected = allFilteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...allFilteredIds.filter((id) => !prev.includes(id)),
      ]);
    }
  }

  const allFilteredSelected =
    filteredServices.length > 0 &&
    filteredServices.every(
      (s: ServiceListDto) => s.id != null && selectedIds.includes(s.id),
    );

  const isLoading = isLoadingAssigned || isLoadingServices;

  function onSubmit() {
    if (!staffId) return;
    if (selectedIds.length === 0) {
      setValidationError("Vui lòng chọn ít nhất 1 dịch vụ");
      return;
    }

    createMutation.mutate(
      { staffId, serviceIds: selectedIds },
      {
        onSuccess: (result) => {
          if (result.isSuccess) handleOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Phân công dịch vụ</DialogTitle>
          <DialogDescription>
            {staff?.fullName
              ? `Chọn dịch vụ cho nhân viên ${staff.fullName}${staff.code ? ` (${staff.code})` : ""}`
              : "Chọn dịch vụ để phân công cho nhân viên"}
          </DialogDescription>
        </DialogHeader>

        <FormSection icon={Scissors} title="Chọn dịch vụ">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-adminGray-400"
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tìm theo tên, mã hoặc danh mục..."
                className="w-full pl-8 pr-3 py-1.5 border border-adminGray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-adminGreen-600 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={toggleAll}
              disabled={filteredServices.length === 0}
              className="flex items-center gap-1.5 text-xs font-semibold text-adminGreen-600 hover:text-adminInk transition-colors whitespace-nowrap disabled:opacity-40"
            >
              {allFilteredSelected ? (
                <CheckSquare size={14} />
              ) : (
                <Square size={14} />
              )}
              {allFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>

          <div className="border border-adminGray-100 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-adminGray-400">
                Đang tải danh sách dịch vụ...
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="py-8 text-center text-sm text-adminGray-400">
                {searchText
                  ? "Không tìm thấy dịch vụ phù hợp"
                  : "Tất cả dịch vụ đã được phân công cho nhân viên này"}
              </div>
            ) : (
              <ul className="divide-y divide-adminGray-100 max-h-[280px] overflow-y-auto">
                {filteredServices.map((service: ServiceListDto) => {
                  const id = service.id!;
                  const isSelected = selectedIds.includes(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => toggleService(id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-adminGray-50 ${
                          isSelected ? "bg-adminGray-50/40" : ""
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-adminGreen-600 border-adminGreen-600"
                              : "border-adminGray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              viewBox="0 0 12 12"
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="2,6 5,9 10,3" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-adminInk truncate block">
                            {service.name}
                          </span>
                          <span className="text-xs text-adminGray-400">
                            {[service.code, service.categoryName]
                              .filter(Boolean)
                              .join(" · ")}
                            {service.durationMins != null
                              ? ` · ${service.durationMins} phút`
                              : ""}
                          </span>
                        </div>
                        <span className="text-xs text-adminInk/70 shrink-0">
                          {formatCurrency(service.sellingPrice)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between min-h-[20px]">
            {selectedIds.length > 0 ? (
              <span className="text-xs text-adminGreen-600 font-medium">
                Đã chọn {selectedIds.length} dịch vụ
              </span>
            ) : (
              <span />
            )}
            {validationError && (
              <span className="text-xs text-state-danger-text">
                {validationError}
              </span>
            )}
          </div>
        </FormSection>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="admin"
            size="sm"
            loading={createMutation.isPending}
            onClick={onSubmit}
          >
            Phân công ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
