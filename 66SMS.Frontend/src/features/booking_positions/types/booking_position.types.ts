import type {
  CreateBookingPositionPayload as CreatePayload,
  UpdateBookingPositionPayload as UpdatePayload,
  BookingPositionFormValues as FormValues,
} from "../schemas/bookingPosition.schema";

export type CreateBookingPositionPayload = CreatePayload;
export type UpdateBookingPositionPayload = UpdatePayload;
export type BookingPositionFormValues = FormValues;

export interface BookingPositionDTO {
  id?: number;
  roomId?: number;
  name?: string;
  sortOrder?: number;
  note?: string;
  status?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  roomName?: string;
}
