import { useState, useMemo } from "react";
import { User, Search, CheckSquare, Square } from "lucide-react";
import { toast } from "@/shared/utils/kitToast";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { formatDate } from "@/shared/utils/date.utils";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import type { ShiftDTO } from "@/features/shifts/types/shift.types";
import { useBulkCreateWorkSchedule } from "../hooks/useSchedules";

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
  date: string | null;
  defaultStaffId?: number | null;
  existingStaffIds?: number[];
  onClose: () => void;
}

export function AddStaffDialog({
  shift,
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

  const availableStaffs = useMemo(() => {
    const items = staffsData?.data?.items || [];
    const result: StaffDto[] = [];
    for (let index = 0; index < items.length; index++) {
      const staff = items[index];
      if (!staff.id) continue;
      if (existingStaffIds.includes(staff.id)) continue;
      result.push(staff);
    }
    return result;
  }, [staffsData, existingStaffIds]);

  const filteredStaffs = useMemo(() => {
    const query = searchText.toLowerCase().trim();
    if (!query) return availableStaffs;
    const result: StaffDto[] = [];
    for (let index = 0; index < availableStaffs.length; index++) {
      const staff = availableStaffs[index];
      const nameMatch = staff.fullName?.toLowerCase().includes(query);
      const codeMatch = staff.code?.toLowerCase().includes(query);
      if (nameMatch || codeMatch) result.push(staff);
    }
    return result;
  }, [availableStaffs, searchText]);

  if (!date || !shift || !shift.id) return null;

  function toggleStaff(id: number) {
    setValidationError("");
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    setValidationError("");
    const allFilteredIds: number[] = [];
    for (let index = 0; index < filteredStaffs.length; index++) {
      const id = filteredStaffs[index].id;
      if (id) allFilteredIds.push(id);
    }
    const allSelected = allFilteredIds.every((id: number) =>
      selectedIds.includes(id),
    );
    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id)),
      );
      return;
    }
    setSelectedIds((prev) => [
      ...prev,
      ...allFilteredIds.filter((id: number) => !prev.includes(id)),
    ]);
  }

  const allFilteredSelected =
    filteredStaffs.length > 0 &&
    filteredStaffs.every((staff: StaffDto) =>
      selectedIds.includes(staff.id!),
    );

  function onSubmit() {
    if (selectedIds.length === 0) {
      setValidationError("Vui lòng chọn ít nhất 1 nhân viên");
      return;
    }

    const schedules = selectedIds.map((staffId: number) => {
      const staff = staffsData?.data?.items?.find(
        (item: StaffDto) => item.id === staffId,
      );
      return {
        staffId,
        shiftId: shift!.id,
        workDate: date!,
        salonId: salonId || staff?.salonId || undefined,
      };
    });

    bulkCreate(
      { schedules },
      {
        onSuccess: (result) => {
          if (result.isSuccess) {
            toast.success(
              `Đã phân lịch cho ${selectedIds.length} nhân viên thành công!`,
            );
            onClose();
          }
        },
      },
    );
  }

  const utilDate = formatDate(date);
  const dayName =
    WEEKDAYS.find((day) => day.value === utilDate.day())?.label || "";
  const subTitle = `Ca: ${shift.name} (${shift.shiftStart?.substring(0, 5)} - ${shift.shiftEnd?.substring(0, 5)}) | ${dayName}, ${utilDate.format("DD/MM/YYYY")}`;

  return (
    <Modal
      open
      onClose={onClose}
      title="Thêm lịch làm việc"
      size="md"
      scrollable
    >
      <div className="space-y-3">
        <p className="text-xs text-kit-muted">{subTitle}</p>

        <FormSection icon={User} title="Chọn nhân viên">
          <div className="mb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-kit-muted"
              />
              <Input
                type="text"
                inputSize="sm"
                value={searchText}
                onChange={(e: { target: { value: string } }) =>
                  setSearchText(e.target.value)
                }
                placeholder="Tìm theo tên hoặc mã nhân viên..."
                className="pl-8"
              />
            </div>
            <button
              type="button"
              onClick={toggleAll}
              disabled={filteredStaffs.length === 0}
              className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-kit-primary transition-colors hover:text-kit-heading disabled:opacity-40"
            >
              {allFilteredSelected ? (
                <CheckSquare size={14} />
              ) : (
                <Square size={14} />
              )}
              {allFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>

          <div className="overflow-hidden rounded border border-kit">
            {isLoadingStaffs ? (
              <div className="py-8 text-center text-sm text-kit-muted">
                Đang tải danh sách nhân viên...
              </div>
            ) : filteredStaffs.length === 0 ? (
              <div className="py-8 text-center text-sm text-kit-muted">
                {searchText
                  ? "Không tìm thấy nhân viên phù hợp"
                  : "Tất cả nhân viên đã được xếp ca này"}
              </div>
            ) : (
              <ul className="max-h-65 divide-y divide-kit overflow-y-auto">
                {filteredStaffs.map((staff: StaffDto) => {
                  const isSelected = selectedIds.includes(staff.id!);
                  return (
                    <li key={staff.id}>
                      <button
                        type="button"
                        onClick={() => toggleStaff(staff.id!)}
                        className={
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-kit-page " +
                          (isSelected ? "bg-kit-page/60" : "")
                        }
                      >
                        <div
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
                              className="h-3 w-3 text-kit-white"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="2,6 5,9 10,3" />
                            </svg>
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-kit-heading">
                            {staff.fullName}
                          </span>
                          {staff.code ? (
                            <span className="text-xs text-kit-muted">
                              {staff.code}
                            </span>
                          ) : null}
                        </div>
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
                Đã chọn {selectedIds.length} nhân viên
              </span>
            ) : (
              <span />
            )}
            {validationError ? (
              <span className="text-xs text-kit-danger">{validationError}</span>
            ) : null}
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={onClose}
            disabled={isPending}
          >
            Bỏ qua
          </Button>
          <Button
            type="button"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
            onClick={onSubmit}
          >
            Lưu ({selectedIds.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
