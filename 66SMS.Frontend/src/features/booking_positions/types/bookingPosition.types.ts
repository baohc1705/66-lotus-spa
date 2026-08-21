import type { PageRequest } from "@/shared/types/common.types";

export interface BookingPositionDto {
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

export interface GetAllBookingPositionQuery extends PageRequest {
  keyword?: string;
  roomId?: number;
}

export interface CreateBookingPositionRequest {
  roomId: number;
  name: string;
  sortOrder?: number;
  note?: string;
  status?: number;
}

export interface UpdateBookingPositionRequest {
  roomId?: number;
  name?: string;
  sortOrder?: number;
  note?: string;
  status?: number;
}
