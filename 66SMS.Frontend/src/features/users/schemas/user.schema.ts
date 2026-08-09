import { z } from "zod";

export const createSchema = z
  .object({
    userName: z
      .string()
      .min(1, "Tên tài khoản không được để trống")
      .min(3, "Tối thiểu 3 ký tự"),
    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không hợp lệ"),
    password: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .min(6, "Tối thiểu 6 ký tự"),
    confirmPassword: z
      .string()
      .min(1, "Xác nhận mật khẩu không được để trống"),
    role: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export const updateSchema = z.object({
  username: z.string().min(3, "Tối thiểu 3 ký tự").optional().or(z.literal("")),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  status: z.coerce.number().optional(),
});

export type CreateUserPayload = z.infer<typeof createSchema>;
export type UpdateUserPayload = z.infer<typeof updateSchema> & { id: number };
export type UserFormValues = CreateUserPayload;
