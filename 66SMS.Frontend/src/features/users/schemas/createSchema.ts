import { z } from "zod";

export const createSchema = z.object({
  userName: z.string().min(3, 'Tối thiểu 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
  role: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

export type CreateFromData = z.infer<typeof createSchema>;
