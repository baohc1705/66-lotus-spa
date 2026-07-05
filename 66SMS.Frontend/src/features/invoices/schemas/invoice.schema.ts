import { z } from 'zod'

const itemSchema = z.object({
  itemType: z.coerce.number().min(1, 'Chọn loại').max(3),
  refId: z.coerce.number().min(1, 'Chọn mặt hàng'),
  quantity: z.coerce.number().min(1, 'Số lượng ≥ 1'),
  discountAmount: z.coerce.number().min(0, 'Không âm').optional(),
  staffId: z.coerce.number().optional(),
  note: z.string().max(500).optional().or(z.literal('')),
})

export const invoiceSchema = z.object({
  customerId: z.coerce.number().optional(),
  customerName: z.string().max(200).optional().or(z.literal('')),
  customerPhone: z.string().max(20).optional().or(z.literal('')),
  salonId: z.coerce.number().optional(),
  discountAmount: z.coerce.number().min(0, 'Không âm').optional(),
  applyMembershipDiscount: z.boolean().optional(),
  loyaltyPointsUsed: z.coerce.number().min(0, 'Không âm').optional(),
  taxAmount: z.coerce.number().min(0, 'Không âm').optional(),
  paymentMethod: z.coerce.number().min(1).max(4),
  paidAmount: z.coerce.number().min(0, 'Không âm').optional(),
  transactionId: z.string().max(100).optional().or(z.literal('')),
  note: z.string().max(500).optional().or(z.literal('')),
  items: z.array(itemSchema).min(1, 'Cần ít nhất 1 mặt hàng'),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
