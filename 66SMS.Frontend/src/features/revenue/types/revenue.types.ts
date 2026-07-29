export interface RevenueQueryParams {
  from: string;
  to: string;
  salonId?: number | null;
  comparePrevious?: boolean;
}

export interface RevenueSummaryPeriodDto {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  grossRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
}

export interface RevenueSummaryDto extends RevenueSummaryPeriodDto {
  previousPeriod?: RevenueSummaryPeriodDto;
}

export interface CashFlowTrendPointDto {
  date: string;
  cashIn: number;
  cashOut: number;
}

export interface RevenueBreakdownItemDto {
  itemType: number;
  label: string;
  amount: number;
  percent: number;
}

export interface PaymentMethodBreakdownItemDto {
  method: number;
  label: string;
  amount: number;
  percent: number;
}

export interface RevenueBreakdownDto {
  byItemType: RevenueBreakdownItemDto[];
  byPaymentMethod: PaymentMethodBreakdownItemDto[];
  cashOut: {
    payrollBase: number;
    commission: number;
    refunds: number;
  };
  discounts: {
    manual: number;
    membership: number;
    loyalty: number;
    promotion: number;
    totalPercent: number;
  };
}

export interface TopRevenueItemDto {
  itemId: number;
  itemName: string;
  itemType: number;
  quantity: number;
  revenue: number;
  percent: number;
}

export interface RecentTransactionDto {
  invoiceId: number;
  invoiceCode: string;
  customerName: string;
  salonName: string;
  amount: number;
  paymentMethod: number;
  issuedAt: string;
}

export interface TodaySummaryDto {
  appointments: {
    total: number;
    completed: number;
    completionRate: number;
    changeVsYesterday: number;
  };
  customers: {
    total: number;
    newCustomers: number;
    returning: number;
    lapsed: number;
  };
  cash: {
    grossRevenue: number;
    cashOut: number;
    netRevenue: number;
  };
}

export interface TrafficDataPointDto {
  label: string;
  value: number;
}

export interface NetRevenueDataPointDto {
  label: string;
  value: number;
}

export interface TopStaffDto {
  staffId: number;
  staffName: string;
  revenue: number;
  quantity: number;
  commission: number;
  growthPercent: number;
}
