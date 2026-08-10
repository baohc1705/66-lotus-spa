import { z } from "zod";

export const createShiftSchema = z
  .object({
    salonId: z.coerce.number().min(1, "Vui lòng chọn chi nhánh"),
    name: z.string().min(1, "Tên ca làm việc không được để trống"),
    description: z.string().optional().or(z.literal("")),
    shiftStart: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):?([0-5]\d)$/,
        "Định dạng giờ không hợp lệ (HH:mm)",
      ),
    shiftEnd: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):?([0-5]\d)$/,
        "Định dạng giờ không hợp lệ (HH:mm)",
      ),
  })
  .refine(
    (data) => {
      return data.shiftStart < data.shiftEnd;
    },
    {
      message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
      path: ["shiftEnd"],
    },
  );

export const updateShiftSchema = createShiftSchema;

export type CreateShiftFormValues = z.infer<typeof createShiftSchema>;
export type UpdateShiftFormValues = z.infer<typeof updateShiftSchema>;
