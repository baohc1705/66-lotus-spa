import type { BookingPositionDto } from "@/features/booking_positions/types/bookingPosition.types";
import type { PageRequest } from "@/shared/types/common.types";

export interface BookingRoomDto {
  id?: number;
  salonId?: number | null;
  salonName?: string | null;
  name?: string;
  imageUrl?: string;
  note?: string;
  status?: number;
  availableCount?: number;
  inServiceCount?: number;
  totalPositionCount?: number;
  positions?: BookingPositionDto[];
}

export interface GetAllBookingRoomQuery extends PageRequest {
  keyword?: string;
  salonId?: number;
}

export interface CreateBookingRoomRequest {
  salonId: number;
  name: string;
  imageUrl?: string;
  note?: string;
  status?: number;
}

export interface UpdateBookingRoomRequest {
  name?: string;
  imageUrl?: string;
  note?: string;
  status?: number;
}
