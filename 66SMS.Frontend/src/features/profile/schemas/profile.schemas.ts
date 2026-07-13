import { z } from "zod";

/** Schema hồ sơ staff (admin) — chỉ thông tin cá nhân */
export const profileSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phoneNumber: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .max(11, "Số điện thoại không hợp lệ"),
  profilePhotoUrl: z.string().optional().nullable(),
  gender: z.number().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/** Schema hồ sơ khách (landing) — cá nhân + địa chỉ + tài khoản đăng nhập */
export const customerProfileSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phoneNumber: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .max(11, "Số điện thoại không hợp lệ"),
  profilePhotoUrl: z.string().optional().nullable(),
  gender: z.number().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  streetAddress: z.string().max(500).optional().or(z.literal("")),
  provinceCode: z.string().optional().or(z.literal("")),
  wardCode: z.string().optional().or(z.literal("")),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
});

export type CustomerProfileFormValues = z.infer<typeof customerProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu không được để trống"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const accountSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
});

export type AccountFormValues = z.infer<typeof accountSchema>;
