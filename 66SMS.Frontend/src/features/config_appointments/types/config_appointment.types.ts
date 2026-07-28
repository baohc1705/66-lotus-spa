import type {
  CreateConfigAppointmentPayload as CreatePayload,
  UpdateConfigAppointmentPayload as UpdatePayload,
  ConfigAppointmentFormValues as FormValues,
} from "../schemas/configAppointment.schema";

export type CreateConfigAppointmentPayload = CreatePayload;
export type UpdateConfigAppointmentPayload = UpdatePayload;
export type ConfigAppointmentFormValues = FormValues;

export interface ConfigAppointmentDTO {
  id?: number;
  depositPercent?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  slotMinutes?: number | null;
  salonId?: number | null;
  salonName?: string | null;
}
