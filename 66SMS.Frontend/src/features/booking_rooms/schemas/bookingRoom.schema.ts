import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const bookingRoomFieldsSchema = z.object({
  name: z
    .string()
    .nonempty(VALIDATION_MSG.required("Tên phòng"))
    .max(100, VALIDATION_MSG.max(100)),
  imageUrl: z.string().optional().or(z.literal("")),
  note: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().optional(),
});

export const createBookingRoomSchema = bookingRoomFieldsSchema.extend({
  salonId: z.coerce.number().min(1, VALIDATION_MSG.selectRequired("chi nhánh")),
});

/** Schema validate form edit (name bắt buộc). */
export const updateBookingRoomFormSchema = bookingRoomFieldsSchema;

/** Payload PATCH — mọi field optional (toggle status, partial update). */
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
