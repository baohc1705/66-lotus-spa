import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const configAppointmentBaseSchema = z
  .object({
    salonId: z.coerce.number().min(1, VALIDATION_MSG.selectRequired("chi nhánh")),
    depositPercent: z.coerce
      .number({ invalid_type_error: VALIDATION_MSG.required("Phần trăm cọc") })
      .min(0, "Phần trăm cọc phải từ 0 đến 100")
      .max(100, "Phần trăm cọc phải từ 0 đến 100"),
    startTime: z.preprocess(emptyToUndefined, z.string().optional()),
    endTime: z.preprocess(emptyToUndefined, z.string().optional()),
    slotMinutes: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .min(1, "Số phút mỗi khung giờ phải lớn hơn 0")
        .optional(),
    ),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      const [startH, startM] = data.startTime.split(":").map(Number);
      const [endH, endM] = data.endTime.split(":").map(Number);
      return endH * 60 + endM > startH * 60 + startM;
    },
    {
      message: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu",
      path: ["endTime"],
    },
  );

export const createConfigAppointmentSchema = configAppointmentBaseSchema;
export const updateConfigAppointmentSchema = configAppointmentBaseSchema;

export type CreateConfigAppointmentPayload = z.infer<
  typeof createConfigAppointmentSchema
>;
export type UpdateConfigAppointmentPayload = z.infer<
  typeof updateConfigAppointmentSchema
>;
export type ConfigAppointmentFormValues = {
  salonId: number;
  depositPercent: number;
  startTime?: string;
  endTime?: string;
  slotMinutes?: number;
};
