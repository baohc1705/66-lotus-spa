import { useMemo, useState } from "react";
import { CheckSquare, Scissors, Search, Square } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { formatCurrency } from "@/shared/utils/currency";
import { useServicesAdmin } from "@/features/services/hooks/useServices";
import type { ServiceDto } from "@/features/services/types/service.types";

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

  const { data: assignedResult, isLoading: isLoadingAssigned } =
    useStaffServices(
      {
        staffId: staffId ?? undefined,
        pageIndex: 1,
        pageSize: 500,
      },
      open && staffId != null && staffId > 0,
    );

  const { data: servicesResult, isLoading: isLoadingServices } =
    useServicesAdmin({ pageIndex: 1, pageSize: 500 }, open);

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
      (s: ServiceDto) =>
        s.id != null && s.status === 1 && !assignedServiceIds.has(s.id),
    );
  }, [servicesResult?.data?.items, assignedServiceIds]);

  const filteredServices = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    if (!q) return availableServices;
    return availableServices.filter(
      (s: ServiceDto) =>
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

  function handleClose() {
    resetForm();
    onOpenChange(false);
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
      .map((s: ServiceDto) => s.id)
      .filter((id): id is number => id != null);
    const allSelected = allFilteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id)),
      );
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
      (s: ServiceDto) => s.id != null && selectedIds.includes(s.id),
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
          if (result.isSuccess) handleClose();
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Phân công dịch vụ"
      size="lg"
      scrollable
    >
      <FormSection icon={Scissors} title="Chọn dịch vụ">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 z-10 h-3.5 w-3.5 -translate-y-1/2 text-kit-muted" />
            <Input
              type="text"
              inputSize="sm"
              value={searchText}
              onChange={(e: { target: { value: string } }) =>
                setSearchText(e.target.value)
              }
              placeholder="Tìm theo tên, mã hoặc danh mục..."
              className="h-9 pl-8"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-0 shrink-0"
            onClick={toggleAll}
            disabled={filteredServices.length === 0}
          >
            {allFilteredSelected ? (
              <CheckSquare className="h-3.5 w-3.5" />
            ) : (
              <Square className="h-3.5 w-3.5" />
            )}
            {allFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
        </div>

        <div className="overflow-hidden rounded border border-kit">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-kit-muted">
              Đang tải danh sách dịch vụ...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-8 text-center text-sm text-kit-muted">
              {searchText
                ? "Không tìm thấy dịch vụ phù hợp"
                : "Tất cả dịch vụ đã được phân công cho nhân viên này"}
            </div>
          ) : (
            <ul className="max-h-70 divide-y divide-kit overflow-y-auto">
              {filteredServices.map((service: ServiceDto) => {
                const id = service.id!;
                const isSelected = selectedIds.includes(id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => toggleService(id)}
                      className={
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-kit-page " +
                        (isSelected ? "bg-kit-page/60" : "")
                      }
                    >
                      <span
                        className={
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors " +
                          (isSelected
                            ? "border-kit-primary bg-kit-primary"
                            : "border-kit")
                        }
                      >
                        {isSelected ? (
                          <svg
                            viewBox="0 0 12 12"
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        ) : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-kit-heading">
                          {service.name}
                        </span>
                        <span className="text-xs text-kit-muted">
                          {[service.code, service.categoryName]
                            .filter(Boolean)
                            .join(" · ")}
                          {service.durationMins != null
                            ? ` · ${service.durationMins} phút`
                            : ""}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-kit-body">
                        {formatCurrency(service.sellingPrice)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-2 flex min-h-5 items-center justify-between">
          {selectedIds.length > 0 ? (
            <span className="text-xs font-medium text-kit-primary">
              Đã chọn {selectedIds.length} dịch vụ
            </span>
          ) : (
            <span />
          )}
          {validationError ? (
            <span className="text-xs text-kit-danger">{validationError}</span>
          ) : null}
        </div>
      </FormSection>

      <div className="mt-4 flex justify-end gap-2 border-t border-kit pt-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mb-0"
          onClick={handleClose}
          disabled={createMutation.isPending}
        >
          Hủy
        </Button>
        <Button
          type="button"
          variant="admin"
          size="sm"
          className="mb-0"
          loading={createMutation.isPending}
          onClick={onSubmit}
        >
          Phân công ({selectedIds.length})
        </Button>
      </div>
    </Modal>
  );
}
