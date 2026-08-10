import { z } from "zod";

const itemSchema = z.object({
  itemType: z.coerce
    .number()
    .min(1, "Vui lòng chọn loại")
    .max(3),
  refId: z.coerce.number().min(1, "Vui lòng chọn mặt hàng"),
  quantity: z.coerce.number().min(1, "Phải lớn hơn hoặc bằng 1"),
  discountAmount: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  staffId: z.coerce.number().optional(),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
});

export const invoiceSchema = z.object({
  customerId: z.coerce.number().optional(),
  customerName: z
    .string()
    .max(200, "Tối đa 200 ký tự")
    .optional()
    .or(z.literal("")),
  customerPhone: z
    .string()
    .max(20, "Tối đa 20 ký tự")
    .optional()
    .or(z.literal("")),
  salonId: z.coerce.number().optional(),
  discountAmount: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  applyMembershipDiscount: z.boolean().optional(),
  loyaltyPointsUsed: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  taxAmount: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  paymentMethod: z.coerce
    .number()
    .min(1, "Vui lòng chọn phương thức thanh toán")
    .max(4),
  paidAmount: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  transactionId: z
    .string()
    .max(100, "Tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  items: z.array(itemSchema).min(1, "Hóa đơn cần ít nhất 1 mặt hàng"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
