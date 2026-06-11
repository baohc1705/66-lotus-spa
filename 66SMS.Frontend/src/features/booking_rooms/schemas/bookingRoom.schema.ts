import { z } from "zod";

const bookingRoomBaseSchema = z.object({
  name: z
    .string()
    .nonempty("Tên phòng không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  imageUrl: z
    .string()
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().optional(),
});

export const createBookingRoomSchema = bookingRoomBaseSchema;

export const updateBookingRoomSchema = bookingRoomBaseSchema;

export const deleteBookingRoomSchema = z.object({
  id: z.number().min(1, "ID phải là số dương"),
});

export type CreateBookingRoomPayload = z.infer<typeof createBookingRoomSchema>;
export type UpdateBookingRoomPayload = z.infer<typeof updateBookingRoomSchema>;
export type DeleteBookingRoomPayload = z.infer<typeof deleteBookingRoomSchema>;

export type BookingRoomFormValues = UpdateBookingRoomPayload;
