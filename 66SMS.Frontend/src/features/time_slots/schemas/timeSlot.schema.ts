import { z } from "zod";

const timeSlotBaseSchema = z.object({
  startTime: z
    .string()
    .nonempty("Thời gian bắt đầu không được để trống"),
  endTime: z
    .string()
    .nonempty("Thời gian kết thúc không được để trống"),
}).refine(
  (data) => {
    const [startH, startM] = data.startTime.split(":").map(Number);
    const [endH, endM] = data.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return endMinutes > startMinutes;
  },
  {
    message: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu",
    path: ["endTime"],
  }
);

export const createTimeSlotSchema = timeSlotBaseSchema;

export const updateTimeSlotSchema = timeSlotBaseSchema;

export const deleteTimeSlotSchema = z.object({
  id: z.number().min(1, "ID phải là số dương"),
});

export type CreateTimeSlotPayload = z.infer<
  typeof createTimeSlotSchema
>;
export type UpdateTimeSlotPayload = z.infer<
  typeof updateTimeSlotSchema
>;
export type DeleteTimeSlotPayload = z.infer<
  typeof deleteTimeSlotSchema
>;

export type TimeSlotFormValues = UpdateTimeSlotPayload;
