import { z } from "zod";

const bookingPositionBaseSchema = z.object({
  roomId: z.coerce.number().min(1, "Vui lòng chọn phòng dịch vụ"),
  name: z
    .string()
    .nonempty("Tên vị trí không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  sortOrder: z.coerce.number().min(0, "Thứ tự phải lớn hơn 0").optional(),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().optional(),
});

export const createBookingPositionSchema = bookingPositionBaseSchema;

export const updateBookingPositionSchema = bookingPositionBaseSchema;

export const deleteBookingPositionSchema = z.object({
  id: z.number().min(1, "ID phải là số dương"),
});

export type CreateBookingPositionPayload = z.infer<
  typeof createBookingPositionSchema
>;
export type UpdateBookingPositionPayload = z.infer<
  typeof updateBookingPositionSchema
>;
export type DeleteBookingPositionPayload = z.infer<
  typeof deleteBookingPositionSchema
>;

export type BookingPositionFormValues = UpdateBookingPositionPayload;
