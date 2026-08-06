import type { PageRequest } from "@/shared/types/common.types";
import type { InvoiceFormValues as FormValues } from "../schemas/invoice.schema";

export type InvoiceFormValues = FormValues;

export const INVOICE_STATUS = {
  DRAFT: 0,
  UNPAID: 1,
  PAID: 2,
  CANCELLED: 3,
  REFUNDED: 4,
} as const;

export const PAYMENT_METHOD = {
  CASH: 1,
  BANK_TRANSFER: 2,
  WALLET: 3,
  VNPAY: 4,
} as const;

export const INVOICE_ITEM_TYPE = {
  SERVICE: 1,
  PRODUCT: 2,
  TREATMENT_COURSE: 3,
} as const;

export const POINT_VALUE_VND = 1000;

export interface InvoiceItemDto {
  id: number | null;
  invoiceId: number | null;
  itemType: number | null;
  refId: number | null;
  itemName: string | null;
  unitPrice: number | null;
  quantity: number | null;
  discountAmount: number | null;
  lineTotal: number | null;
  staffId: number | null;
  staffName: string | null;
  note: string | null;
  status: number | null;
}

export interface InvoiceDto {
  id: number | null;
  invoiceCode: string | null;
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
  appointmentId: number | null;
  salonId: number | null;
  salonName: string | null;
  cashierId: number | null;
  subTotal: number | null;
  discountAmount: number | null;
  membershipTierId: number | null;
  membershipDiscountAmount: number | null;
  loyaltyPointsUsed: number | null;
  loyaltyPointsValue: number | null;
  loyaltyPointsEarned: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  paidAmount: number | null;
  changeAmount: number | null;
  paymentMethod: number | null;
  transactionId: string | null;
  status: number | null;
  note: string | null;
  issuedAt: string | null;
  createdAt: string | null;
  createdBy: number | null;
  updatedAt: string | null;
  updatedBy: number | null;
  items: InvoiceItemDto[] | null;
}

export interface CreateInvoiceItemPayload {
  itemType: number;
  refId: number;
  quantity: number;
  discountAmount?: number;
  staffId?: number;
  note?: string;
}

export interface CreateInvoicePayload {
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  appointmentId?: number;
  salonId?: number;
  discountAmount?: number;
  applyMembershipDiscount?: boolean;
  loyaltyPointsUsed?: number;
  taxAmount?: number;
  paymentMethod?: number;
  paidAmount?: number;
  transactionId?: string;
  note?: string;
  items: CreateInvoiceItemPayload[];
}

export interface UpdateInvoiceItemsPayload {
  items: CreateInvoiceItemPayload[];
  discountAmount?: number;
  applyMembershipDiscount?: boolean;
  note?: string;
}

export interface GetAllInvoicesQuery extends PageRequest {
  status?: number;
  customerId?: number;
  salonId?: number;
  fromDate?: string;
  toDate?: string;
  paymentMethod?: number;
}
