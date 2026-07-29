import type {
  CreateBookingPositionPayload as CreatePayload,
  UpdateBookingPositionPayload as UpdatePayload,
  BookingPositionFormValues as FormValues,
} from "../schemas/bookingPosition.schema";
import type { PageRequest } from "@/shared/types/common.types";

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
  updatedAt?: string;
  roomName?: string;
} 

export type BookingPositionListParams = PageRequest & {
  keyword?: string;
  roomId?: number;
};
