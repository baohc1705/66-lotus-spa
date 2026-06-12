export interface TimeSlotDTO {
  id?: number;
  startTime?: string;
  endTime?: string;
}

export interface CreateTimeSlotPayload {
  startTime: string;
  endTime: string;
}

export interface UpdateTimeSlotPayload {
  id?: number;
  startTime?: string;
  endTime?: string;
}
