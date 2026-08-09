import { z } from "zod";

const bookingRoomFieldsSchema = z.object({
  name: z
    .string()
    .nonempty("Tên phòng không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  imageUrl: z.string().optional().or(z.literal("")),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().optional(),
});

export const createBookingRoomSchema = bookingRoomFieldsSchema.extend({
  salonId: z.coerce.number().min(1, "Vui lòng chọn chi nhánh"),
});

export const updateBookingRoomFormSchema = bookingRoomFieldsSchema;

export const updateBookingRoomSchema = bookingRoomFieldsSchema.partial();

export const deleteBookingRoomSchema = z.object({
  id: z.number().min(1, "ID phải là số dương"),
});

export type CreateBookingRoomPayload = z.infer<typeof createBookingRoomSchema>;
export type UpdateBookingRoomPayload = z.infer<typeof updateBookingRoomSchema>;
export type DeleteBookingRoomPayload = z.infer<typeof deleteBookingRoomSchema>;

export type BookingRoomFormValues = {
  salonId?: number;
  name: string;
  imageUrl?: string;
  note?: string;
  status?: number;
};
