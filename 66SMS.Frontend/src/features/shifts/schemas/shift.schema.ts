import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

export const createShiftSchema = z
  .object({
    name: z.string().min(1, VALIDATION_MSG.required("Tên ca làm việc")),
    description: z.string().optional().or(z.literal("")),
    shiftStart: z
      .string()
      .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
    shiftEnd: z
      .string()
      .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
    effectiveFrom: z.string().min(1, VALIDATION_MSG.selectRequired("ngày áp dụng")),
    effectiveTo: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      return data.shiftStart < data.shiftEnd;
    },
    {
      message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
      path: ["shiftEnd"],
    },
  )
  .refine(
    (data) => {
      if (data.effectiveTo && data.effectiveTo !== "") {
        return new Date(data.effectiveFrom) <= new Date(data.effectiveTo);
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
      path: ["effectiveTo"],
    },
  );

export const updateShiftSchema = createShiftSchema;

export type CreateShiftFormValues = z.infer<typeof createShiftSchema>;
export type UpdateShiftFormValues = z.infer<typeof updateShiftSchema>;
