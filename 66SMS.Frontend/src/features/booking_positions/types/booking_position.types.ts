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

export interface CreateBookingPositionPayload {
  roomId: number;
  name: string;
  sortOrder?: number;
  note?: string;
  status?: number;
}

export interface UpdateBookingPositionPayload {
  id?: number;
  roomId?: number;
  name?: string;
  sortOrder?: number;
  note?: string;
  status?: number;
}
