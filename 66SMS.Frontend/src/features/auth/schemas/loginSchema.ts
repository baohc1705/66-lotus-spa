import { z } from "zod";

export const loginSchema = z.object({
    usernameOrEmail : z.string().min(1, 'Vui lòng nhập tài khoản'),
    password: z.string().min(1, 'Vui lòng nhập vào mật khẩu'),
});

export type LoginFormData = z.infer<typeof loginSchema>;