import type {
  CreateTimeSlotPayload as CreatePayload,
  UpdateTimeSlotPayload as UpdatePayload,
  TimeSlotFormValues as FormValues,
} from "../schemas/timeSlot.schema";

export type CreateTimeSlotPayload = CreatePayload;
export type UpdateTimeSlotPayload = UpdatePayload;
export type TimeSlotFormValues = FormValues;

export interface TimeSlotDTO {
  id?: number;
  startTime?: string;
  endTime?: string;
}
