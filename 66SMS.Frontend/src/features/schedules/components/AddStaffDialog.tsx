import { useState, useMemo } from "react";
import { User, Search, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/shared/utils/date.utils";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import { useBulkCreateWorkSchedule } from "../hooks/useSchedules";
import type { ShiftDTO, ShiftPeriodDTO } from "@/features/shifts/types/shift.types";
import { useAuthStore } from "@/features/auth/stores/authStore";

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

const WEEKDAYS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

interface AddStaffDialogProps {
  shift?: ShiftDTO | null;
  shiftPeriod?: ShiftPeriodDTO | null;
  date: string | null;
  defaultStaffId?: number | null;
  existingStaffIds?: number[];
  onClose: () => void;
}

export function AddStaffDialog({
  shift,
  shiftPeriod,
  date,
  defaultStaffId,
  existingStaffIds = [],
  onClose,
}: AddStaffDialogProps) {
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());

  const [selectedIds, setSelectedIds] = useState<number[]>(
    defaultStaffId ? [defaultStaffId] : [],
  );
  const [searchText, setSearchText] = useState("");
  const [validationError, setValidationError] = useState("");

  const { data: staffsData, isLoading: isLoadingStaffs } = useStaffs({
    pageIndex: 1,
    pageSize: 1000,
    salonId: salonId || undefined,
  });

  const { mutate: bulkCreate, isPending } = useBulkCreateWorkSchedule();

  const availableStaffs = useMemo(
    () =>
      (staffsData?.data?.items || []).filter(
        (s) => !existingStaffIds.includes(s.id!),
      ),
    [staffsData, existingStaffIds],
  );

  const filteredStaffs = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    if (!q) return availableStaffs;
    return availableStaffs.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q),
    );
  }, [availableStaffs, searchText]);

  if (!date || !shift || !shiftPeriod) return null;

  const toggleStaff = (id: number) => {
    setValidationError("");
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setValidationError("");
    const allFilteredIds = filteredStaffs.map((s) => s.id!);
    const allSelected = allFilteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...allFilteredIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const allFilteredSelected =
    filteredStaffs.length > 0 &&
    filteredStaffs.every((s) => selectedIds.includes(s.id!));

  const onSubmit = () => {
    if (selectedIds.length === 0) {
      setValidationError("Vui lòng chọn ít nhất 1 nhân viên");
      return;
    }

    const schedules = selectedIds.map((staffId) => ({
      staffId,
      shiftPeriodId: shiftPeriod.id,
      workDate: date,
      salonId: salonId || undefined,
    }));

    bulkCreate(
      { schedules },
      {
        onSuccess: (res) => {
          if (res.isSuccess) {
            toast.success(
              `Đã phân lịch cho ${selectedIds.length} nhân viên thành công!`,
            );
            onClose();
          }
        },
      },
    );
  };

  const utilDate = formatDate(date);
  const dayName =
    WEEKDAYS.find((w) => w.value === utilDate.day())?.label || "";
  const subTitle = `Ca: ${shift.name} (${shiftPeriod.shiftStart?.substring(0, 5)} - ${shiftPeriod.shiftEnd?.substring(0, 5)}) | ${dayName}, ${utilDate.format("DD/MM/YYYY")}`;

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Thêm lịch làm việc</DialogTitle>
          <DialogDescription>{subTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <FormSection icon={User} title="Chọn nhân viên">
            {/* Search + select all bar */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Tìm theo tên hoặc mã nhân viên..."
                  className="w-full pl-8 pr-3 py-1.5 border border-stone-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-lotus-leaf bg-white"
                />
              </div>
              <button
                type="button"
                onClick={toggleAll}
                disabled={filteredStaffs.length === 0}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-lotus-leaf hover:text-lotus-deep transition-colors whitespace-nowrap disabled:opacity-40"
              >
                {allFilteredSelected ? (
                  <CheckSquare size={14} />
                ) : (
                  <Square size={14} />
                )}
                {allFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>

            {/* Staff list */}
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              {isLoadingStaffs ? (
                <div className="py-8 text-center text-[13px] text-stone-400">
                  Đang tải danh sách nhân viên...
                </div>
              ) : filteredStaffs.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-stone-400">
                  {searchText
                    ? "Không tìm thấy nhân viên phù hợp"
                    : "Tất cả nhân viên đã được xếp ca này"}
                </div>
              ) : (
                <ul className="divide-y divide-stone-100 max-h-[260px] overflow-y-auto">
                  {filteredStaffs.map((staff) => {
                    const isSelected = selectedIds.includes(staff.id!);
                    return (
                      <li key={staff.id}>
                        <button
                          type="button"
                          onClick={() => toggleStaff(staff.id!)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-stone-50 ${
                            isSelected ? "bg-lotus-cream/40" : ""
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-lotus-leaf border-lotus-leaf"
                                : "border-stone-300"
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
                            <span className="text-[13px] font-medium text-lotus-deep truncate block">
                              {staff.fullName}
                            </span>
                            {staff.code && (
                              <span className="text-[11px] text-stone-400">
                                {staff.code}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Selected count + validation */}
            <div className="mt-2 flex items-center justify-between min-h-[20px]">
              {selectedIds.length > 0 ? (
                <span className="text-[12px] text-lotus-leaf font-medium">
                  Đã chọn {selectedIds.length} nhân viên
                </span>
              ) : (
                <span />
              )}
              {validationError && (
                <span className="text-[12px] text-red-500">{validationError}</span>
              )}
            </div>
          </FormSection>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Bỏ qua
          </Button>
          <Button
            type="button"
            variant="admin"
            size="sm"
            loading={isPending}
            onClick={onSubmit}
          >
            Lưu ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
