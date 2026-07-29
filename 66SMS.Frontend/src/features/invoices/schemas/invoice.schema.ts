import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const itemSchema = z.object({
  itemType: z.coerce
    .number()
    .min(1, VALIDATION_MSG.selectRequired("loại"))
    .max(3),
  refId: z.coerce.number().min(1, VALIDATION_MSG.selectRequired("mặt hàng")),
  quantity: z.coerce.number().min(1, VALIDATION_MSG.min(1)),
  discountAmount: z.coerce.number().min(0, VALIDATION_MSG.min(0)).optional(),
  staffId: z.coerce.number().optional(),
  note: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
});

export const invoiceSchema = z.object({
  customerId: z.coerce.number().optional(),
  customerName: z
    .string()
    .max(200, VALIDATION_MSG.max(200))
    .optional()
    .or(z.literal("")),
  customerPhone: z
    .string()
    .max(20, VALIDATION_MSG.max(20))
    .optional()
    .or(z.literal("")),
  salonId: z.coerce.number().optional(),
  discountAmount: z.coerce.number().min(0, VALIDATION_MSG.min(0)).optional(),
  applyMembershipDiscount: z.boolean().optional(),
  loyaltyPointsUsed: z.coerce.number().min(0, VALIDATION_MSG.min(0)).optional(),
  taxAmount: z.coerce.number().min(0, VALIDATION_MSG.min(0)).optional(),
  paymentMethod: z.coerce
    .number()
    .min(1, VALIDATION_MSG.selectRequired("phương thức thanh toán"))
    .max(4),
  paidAmount: z.coerce.number().min(0, VALIDATION_MSG.min(0)).optional(),
  transactionId: z
    .string()
    .max(100, VALIDATION_MSG.max(100))
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  items: z.array(itemSchema).min(1, "Hóa đơn cần ít nhất 1 mặt hàng"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
