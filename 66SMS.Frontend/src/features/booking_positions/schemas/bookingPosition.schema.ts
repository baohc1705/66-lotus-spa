import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const bookingPositionFieldsSchema = z.object({
  roomId: z.coerce
    .number()
    .min(1, VALIDATION_MSG.selectRequired("phòng dịch vụ")),
  name: z
    .string()
    .nonempty(VALIDATION_MSG.required("Tên vị trí"))
    .max(100, VALIDATION_MSG.max(100)),
  sortOrder: z.coerce.number().min(0, VALIDATION_MSG.min(0)).optional(),
  note: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().optional(),
});

export const createBookingPositionSchema = bookingPositionFieldsSchema;

export const updateBookingPositionFormSchema = bookingPositionFieldsSchema;

export const updateBookingPositionSchema =
  bookingPositionFieldsSchema.partial();

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

export type BookingPositionFormValues = {
  roomId: number;
  name: string;
  sortOrder?: number;
  note?: string;
  status?: number;
};
