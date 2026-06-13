import { z } from "zod";

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

export const bookingContactSchema = z.object({
  fullName: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự" }),
  phoneNumber: z
    .string()
    .regex(phoneRegex, { message: "Số điện thoại không hợp lệ" }),
  email: z
    .string()
    .email({ message: "Email không hợp lệ" })
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, { message: "Ghi chú không được vượt quá 500 ký tự" })
    .optional(),
});

export type BookingContactFormValues = z.infer<typeof bookingContactSchema>;
