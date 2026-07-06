import type { BookingPositionDTO } from "@/features/booking_positions/types/booking_position.types";
import type {
  CreateBookingRoomPayload as CreatePayload,
  UpdateBookingRoomPayload as UpdatePayload,
  BookingRoomFormValues as FormValues,
} from "../schemas/bookingRoom.schema";

export type CreateBookingRoomPayload = CreatePayload;
export type UpdateBookingRoomPayload = UpdatePayload;
export type BookingRoomFormValues = FormValues;

export interface BookingRoomDTO {
  id?: number;
  name?: string;
  imageUrl?: string;
  note?: string;
  status?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  positions?: BookingPositionDTO[];
}
