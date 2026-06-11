import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/shared/utils/date.utils";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useCreateWorkSchedule } from "../hooks/useSchedules";
import type {
  ShiftDTO,
  ShiftPeriodDTO,
} from "@/features/shifts/types/shift.types";
import { Button } from "@/shared/components/ui/button";

const schema = z.object({
  employeeId: z
    .number({ error: "Vui lòng chọn nhân viên" })
    .min(1, "Vui lòng chọn nhân viên"),
});

type FormValues = z.infer<typeof schema>;

interface AddEmployeeDialogProps {
  shift?: ShiftDTO | null;
  shiftPeriod?: ShiftPeriodDTO | null;
  date: string | null;
  onClose: () => void;
}

export function AddEmployeeDialog({
  shift,
  shiftPeriod,
  date,
  onClose,
}: AddEmployeeDialogProps) {
  const [isClosing, setIsClosing] = useState(false);

  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    pageIndex: 1,
    pageSize: 1000,
  });

  const { mutate: createWorkSchedule, isPending } = useCreateWorkSchedule();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeId: 0,
    },
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (!date || !shift || !shiftPeriod) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const onSubmit = (values: FormValues) => {
    createWorkSchedule(
      {
        shiftPeriodId: shiftPeriod.id,
        employeeId: values.employeeId,
        workDate: date,
      },
      {
        onSuccess: (res) => {
          if (res.isSuccess) {
            toast.success("Phân lịch làm việc thành công!");
            handleClose();
          }
        },
      },
    );
  };

  const subTitle = `${shift.name} (${shiftPeriod.shiftStart?.substring(0, 5)} - ${shiftPeriod.shiftEnd?.substring(0, 5)}) - Ngày ${formatDate(date).format("DD/MM/YYYY")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/45 transition-opacity"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative flex flex-col w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-200 transform ${
          mounted && !isClosing
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="flex-shrink-0 flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-semibold text-lotus-deep">
              Thêm nhân viên làm việc
            </h2>
            <p className="text-xs text-lotus-stone mt-0.5">{subTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form
            id="add-employee-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-lotus-deep mb-1.5 flex items-center gap-1">
                Nhân viên <span className="text-red-500">*</span>
              </label>
              <select
                {...form.register("employeeId", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-leaf disabled:bg-stone-100 text-sm"
                disabled={isLoadingEmployees}
              >
                <option value={0} disabled>
                  -- Chọn nhân viên --
                </option>
                {employeesData?.data?.items?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} {s.code ? `(${s.code})` : ""}
                  </option>
                ))}
              </select>
              {form.formState.errors.employeeId && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.employeeId.message}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="text-[13px] h-9"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="add-employee-form"
            disabled={isPending || !form.formState.isValid}
            variant="admin"
            className="text-[13px] h-9 gap-1.5"
            loading={isPending}
          >
            Phân công
          </Button>
        </div>
      </div>
    </div>
  );
}
