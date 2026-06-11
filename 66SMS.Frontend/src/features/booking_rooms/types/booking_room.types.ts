import type { BookingPositionDTO } from "@/features/booking_positions/types/booking_position.types";

export interface BookingRoomDTO {
  id?: number;
  name?: string;
  imageUrl?: string;
  note?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  positions?: BookingPositionDTO[];
}

export interface CreateBookingRoomPayload {
  name?: string;
  imageUrl?: string;
  note?: string;
  status?: number;
}

export interface UpdateBookingRoomPayload {
  id?: number;
  name?: string;
  imageUrl?: string;
  note?: string;
  status?: number;
}
