import type { 
  RevenueQueryParams, 
  RevenueSummaryDto, 
  CashFlowTrendPointDto, 
  RevenueBreakdownDto, 
  TopRevenueItemDto, 
  RecentTransactionDto,
  TodaySummaryDto,
  TrafficDataPointDto,
  NetRevenueDataPointDto,
  TopStaffDto,
} from "../types/revenue.types";

// Seeded random helper for stable mock data
const getSeededValue = (seedStr: string, modifier: number = 1): number => {
  let hash = 0;
  const str = seedStr + modifier.toString();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const val = Math.abs(hash % 1000) / 1000; // float between 0 and 1
  return val;
};

// Date range generation helper
const getDaysBetween = (startStr: string, endStr: string): string[] => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const dates: string[] = [];
  
  const current = new Date(start);
  // Prevent infinite loops / too many days
  while (current <= end) {
    dates.push(current.toISOString().substring(0, 10));
    current.setDate(current.getDate() + 1);
    if (dates.length > 366) break;
  }
  return dates;
};

// Subtraction helper to find previous period dates of same length
const getPreviousPeriodDates = (startStr: string, endStr: string): { from: string; to: string } => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - diffDays);
  
  const prevEnd = new Date(end);
  prevEnd.setDate(prevEnd.getDate() - diffDays);

  return {
    from: prevStart.toISOString().substring(0, 10),
    to: prevEnd.toISOString().substring(0, 10),
  };
};

const SALON_NAMES: Record<number, string> = {
  1: "Chi nhánh Quận 1",
  2: "Chi nhánh Quận 3",
  3: "Chi nhánh Bình Thạnh",
};

const CUSTOMER_NAMES = [
  "Nguyễn Thị Lan", "Trần Văn Minh", "Phạm Hoàng Nam", "Lê Thị Ngọc", 
  "Vũ Huy Hoàng", "Đặng Minh Tuấn", "Trịnh Bích Vy", "Đỗ Hữu Đạt",
  "Bùi Thị Xuân", "Ngô Anh Dũng", "Hoàng Kim Oanh", "Phan Thanh Sơn"
];

const SERVICES = [
  { id: 1, name: "Massage Cổ Vai Gáy Dược Liệu", price: 350000 },
  { id: 2, name: "Massage Đá Nóng Thải Độc", price: 450000 },
  { id: 3, name: "Facial Collagen Trẻ Hóa", price: 600000 },
  { id: 4, name: "Gội Đầu Dưỡng Sinh Thảo Mộc", price: 180000 },
  { id: 5, name: "Chăm Sóc Da Mụn Chuyên Sâu", price: 400000 },
  { id: 6, name: "Tẩy Tế Bào Chết Toàn Thân", price: 300000 },
];

const PRODUCTS = [
  { id: 101, name: "Kem Chống Nắng Lotus Tinted SPF50", price: 420000 },
  { id: 102, name: "Sữa Rửa Mặt Nha Đam Dịu Nhẹ", price: 250000 },
  { id: 103, name: "Serum Trẻ Hóa Tế Bào Gốc Lotus", price: 850000 },
  { id: 104, name: "Tẩy Trang Trà Xanh Kháng Khuẩn", price: 180000 },
  { id: 105, name: "Mặt Nạ Thảo Mộc Dưỡng Trắng", price: 150000 },
  { id: 106, name: "Kem Dưỡng Ẩm Sâu Lotus Hydration", price: 550000 },
];

// Helper to generate metrics for a given date range and salon
const calculatePeriodSummary = (from: string, to: string, salonId: number | null): {
  cashIn: number;
  cashOut: number;
  grossRevenue: number;
  transactionCount: number;
} => {
  const dates = getDaysBetween(from, to);
  let totalCashIn = 0;
  let totalCashOut = 0;
  let totalGross = 0;
  let totalTransactions = 0;

  // Base daily values based on Salon
  const baseVolume = salonId ? (10 + (salonId * 5)) : 35; // Number of txs per day
  const baseTicket = 450000; // Avg ticket price

  dates.forEach((date) => {
    const seedSeed = `${date}_${salonId ?? "all"}`;
    const dateFactor = 0.7 + getSeededValue(seedSeed, 1) * 0.6; // 0.7 to 1.3 variance
    
    const dailyTxCount = Math.floor(baseVolume * dateFactor);
    const dailyGross = dailyTxCount * baseTicket * (0.95 + getSeededValue(seedSeed, 2) * 0.1);
    
    // Cash In incorporates Gross + topups/deposits - refunds (approximated)
    const dailyCashIn = dailyGross * (1.05 + getSeededValue(seedSeed, 3) * 0.05);
    // Cash Out is base salaries + commission + refunds (typically 40-55% of cashIn)
    const dailyCashOut = dailyCashIn * (0.42 + getSeededValue(seedSeed, 4) * 0.12);

    totalGross += dailyGross;
    totalCashIn += dailyCashIn;
    totalCashOut += dailyCashOut;
    totalTransactions += dailyTxCount;
  });

  return {
    cashIn: Math.round(totalCashIn),
    cashOut: Math.round(totalCashOut),
    grossRevenue: Math.round(totalGross),
    transactionCount: totalTransactions,
  };
};

export const generateMockRevenueSummary = (params: RevenueQueryParams): RevenueSummaryDto => {
  const { from, to, salonId, comparePrevious = true } = params;
  
  const current = calculatePeriodSummary(from, to, salonId ?? null);
  const averageOrderValue = current.transactionCount > 0 ? Math.round(current.cashIn / current.transactionCount) : 0;

  const result: RevenueSummaryDto = {
    cashIn: current.cashIn,
    cashOut: current.cashOut,
    netCashFlow: current.cashIn - current.cashOut,
    grossRevenue: current.grossRevenue,
    transactionCount: current.transactionCount,
    averageOrderValue,
  };

  if (comparePrevious) {
    const prevPeriod = getPreviousPeriodDates(from, to);
    const prev = calculatePeriodSummary(prevPeriod.from, prevPeriod.to, salonId ?? null);
    const prevAov = prev.transactionCount > 0 ? Math.round(prev.cashIn / prev.transactionCount) : 0;

    result.previousPeriod = {
      cashIn: prev.cashIn,
      cashOut: prev.cashOut,
      netCashFlow: prev.cashIn - prev.cashOut,
      grossRevenue: prev.grossRevenue,
      transactionCount: prev.transactionCount,
      averageOrderValue: prevAov,
    };
  }

  return result;
};

export const generateMockRevenueTrend = (params: RevenueQueryParams): CashFlowTrendPointDto[] => {
  const { from, to, salonId } = params;
  const dates = getDaysBetween(from, to);
  
  const baseVolume = salonId ? (10 + (salonId * 5)) : 35;
  const baseTicket = 450000;

  return dates.map((date) => {
    const seedSeed = `${date}_${salonId ?? "all"}`;
    const dateFactor = 0.7 + getSeededValue(seedSeed, 5) * 0.6;
    
    const dailyTxCount = Math.floor(baseVolume * dateFactor);
    const dailyGross = dailyTxCount * baseTicket * (0.95 + getSeededValue(seedSeed, 6) * 0.1);
    
    const cashIn = Math.round(dailyGross * (1.05 + getSeededValue(seedSeed, 7) * 0.05));
    const cashOut = Math.round(cashIn * (0.42 + getSeededValue(seedSeed, 8) * 0.12));

    return {
      date,
      cashIn,
      cashOut,
    };
  });
};

export const generateMockRevenueBreakdown = (params: RevenueQueryParams): RevenueBreakdownDto => {
  const { from, to, salonId } = params;
  const summary = calculatePeriodSummary(from, to, salonId ?? null);
  const seed = `${from}_${to}_${salonId ?? "all"}`;

  // 1. By Item Type (SERVICE = 1, PRODUCT = 2, TREATMENT_COURSE = 3)
  const serviceFactor = 0.65 + getSeededValue(seed, 10) * 0.1; // ~65% - 75%
  const productFactor = 0.15 + getSeededValue(seed, 11) * 0.08; // ~15% - 23%
  const courseFactor = 1 - serviceFactor - productFactor;

  const serviceAmt = Math.round(summary.grossRevenue * serviceFactor);
  const productAmt = Math.round(summary.grossRevenue * productFactor);
  const courseAmt = summary.grossRevenue - serviceAmt - productAmt;

  const byItemType = [
    { itemType: 1, label: "Dịch vụ", amount: serviceAmt, percent: Math.round(serviceFactor * 100) },
    { itemType: 2, label: "Sản phẩm", amount: productAmt, percent: Math.round(productFactor * 100) },
    { itemType: 3, label: "Liệu trình", amount: courseAmt, percent: Math.round(courseFactor * 100) },
  ];

  // 2. By Payment Method (CASH = 1, BANK_TRANSFER = 2, WALLET = 3, VNPAY = 4)
  const cashFactor = 0.2 + getSeededValue(seed, 12) * 0.1; // ~20% - 30%
  const bankFactor = 0.45 + getSeededValue(seed, 13) * 0.1; // ~45% - 55%
  const walletFactor = 0.1 + getSeededValue(seed, 14) * 0.08; // ~10% - 18%
  const vnpayFactor = 1 - cashFactor - bankFactor - walletFactor;

  const cashAmt = Math.round(summary.cashIn * cashFactor);
  const bankAmt = Math.round(summary.cashIn * bankFactor);
  const walletAmt = Math.round(summary.cashIn * walletFactor);
  const vnpayAmt = summary.cashIn - cashAmt - bankAmt - walletAmt;

  const byPaymentMethod = [
    { method: 1, label: "Tiền mặt", amount: cashAmt, percent: Math.round(cashFactor * 100) },
    { method: 2, label: "Chuyển khoản", amount: bankAmt, percent: Math.round(bankFactor * 100) },
    { method: 3, label: "Ví thành viên", amount: walletAmt, percent: Math.round(walletFactor * 100) },
    { method: 4, label: "Cổng VNPay", amount: vnpayAmt, percent: Math.round(vnpayFactor * 100) },
  ];

  // 3. Cash Out Breakdown
  const payrollBaseFactor = 0.6 + getSeededValue(seed, 15) * 0.1; // ~60% - 70%
  const commissionFactor = 0.25 + getSeededValue(seed, 16) * 0.08; // ~25% - 33%

  const payrollBase = Math.round(summary.cashOut * payrollBaseFactor);
  const commission = Math.round(summary.cashOut * commissionFactor);
  const refunds = summary.cashOut - payrollBase - commission;

  // 4. Discounts Breakdown (WHY revenue is lower than potential)
  const manualDisc = Math.round(summary.grossRevenue * 0.02 * (0.8 + getSeededValue(seed, 17) * 0.4));
  const memberDisc = Math.round(summary.grossRevenue * 0.035 * (0.8 + getSeededValue(seed, 18) * 0.4));
  const loyaltyDisc = Math.round(summary.grossRevenue * 0.015 * (0.8 + getSeededValue(seed, 19) * 0.4));
  const promoDisc = Math.round(summary.grossRevenue * 0.025 * (0.8 + getSeededValue(seed, 20) * 0.4));
  const totalDisc = manualDisc + memberDisc + loyaltyDisc + promoDisc;
  const totalPercent = Math.round((totalDisc / (summary.grossRevenue + totalDisc)) * 100);

  return {
    byItemType,
    byPaymentMethod,
    cashOut: {
      payrollBase,
      commission,
      refunds,
    },
    discounts: {
      manual: manualDisc,
      membership: memberDisc,
      loyalty: loyaltyDisc,
      promotion: promoDisc,
      totalPercent,
    },
  };
};

export const generateMockTopItems = (params: RevenueQueryParams, itemType: "service" | "product", limit: number = 5): TopRevenueItemDto[] => {
  const { from, to, salonId } = params;
  const summary = calculatePeriodSummary(from, to, salonId ?? null);
  const seed = `${from}_${to}_${salonId ?? "all"}_${itemType}`;
  
  const pool = itemType === "service" ? SERVICES : PRODUCTS;
  const typeNum = itemType === "service" ? 1 : 2;

  // Create random revenue weights that total to summary.grossRevenue * type portion
  const typePortion = itemType === "service" ? 0.7 : 0.25;
  const targetRevenue = summary.grossRevenue * typePortion;

  const itemsWithWeight = pool.map((item, idx) => {
    const weight = 0.3 + getSeededValue(seed, idx) * 0.7; // weight 0.3 - 1.0
    return { ...item, weight };
  });

  const totalWeight = itemsWithWeight.reduce((acc, item) => acc + item.weight, 0);

  const result: TopRevenueItemDto[] = itemsWithWeight
    .map((item) => {
      const itemRev = Math.round((item.weight / totalWeight) * targetRevenue);
      const qty = Math.round(itemRev / item.price);
      return {
        itemId: item.id,
        itemName: item.name,
        itemType: typeNum,
        quantity: qty > 0 ? qty : 1,
        revenue: itemRev,
        percent: Math.round((itemRev / summary.grossRevenue) * 100),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return result;
};

export const generateMockRecentTransactions = (params: RevenueQueryParams, limit: number = 10): RecentTransactionDto[] => {
  const { to, salonId } = params;
  // Generate transactions ending on the 'to' date
  const baseDate = new Date(to);
  const txs: RecentTransactionDto[] = [];

  for (let i = 0; i < limit; i++) {
    const seed = `tx_${to}_${salonId ?? "all"}_${i}`;
    const hoursAgo = Math.floor(getSeededValue(seed, 30) * 12); // transactions over the day
    const minutesAgo = Math.floor(getSeededValue(seed, 31) * 60);
    const txDate = new Date(baseDate);
    txDate.setHours(20 - hoursAgo, minutesAgo, 0, 0); // business hours 8am - 8pm

    const custName = CUSTOMER_NAMES[Math.floor(getSeededValue(seed, 32) * CUSTOMER_NAMES.length)];
    
    // Salon assignment
    let sId = salonId;
    if (!sId) {
      // Pick random salon 1-3
      sId = 1 + Math.floor(getSeededValue(seed, 33) * 3);
    }
    const salonName = SALON_NAMES[sId] ?? "Chi nhánh Quận 1";

    const amount = 100000 + Math.floor(getSeededValue(seed, 34) * 19) * 100000; // 100k - 2M VND
    const payMethod = 1 + Math.floor(getSeededValue(seed, 35) * 4); // payment method 1-4

    txs.push({
      invoiceId: 1000 + i,
      invoiceCode: `HD-${1054 + i}`,
      customerName: custName,
      salonName,
      amount,
      paymentMethod: payMethod,
      issuedAt: txDate.toISOString(),
    });
  }

  // Sort by date descending
  return txs.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
};

// ─── NEW: Today Summary (appointments, customers, cash) ────────────────────

export const generateMockTodaySummary = (salonId: number | null): TodaySummaryDto => {
  const seed = `today_${salonId ?? "all"}`;
  const base = salonId ? 10 + salonId * 4 : 28;

  const totalAppts = base + Math.floor(getSeededValue(seed, 1) * 6);
  const completed = Math.floor(totalAppts * (0.65 + getSeededValue(seed, 2) * 0.2));
  const changeAppts = Math.round((getSeededValue(seed, 3) * 30) - 10); // -10% to +20%

  const totalCustomers = base + Math.floor(getSeededValue(seed, 4) * 10);
  const newCust = Math.floor(totalCustomers * (0.3 + getSeededValue(seed, 5) * 0.15));
  const returning = Math.floor(totalCustomers * (0.5 + getSeededValue(seed, 6) * 0.1));
  const lapsed = totalCustomers - newCust - returning;

  const baseRevenue = (salonId ? 800000 + salonId * 200000 : 2000000);
  const grossRevenue = Math.round(baseRevenue * (0.7 + getSeededValue(seed, 7) * 0.6) * 1000);
  const cashOut = Math.round(grossRevenue * (0.42 + getSeededValue(seed, 8) * 0.1));

  return {
    appointments: {
      total: totalAppts,
      completed,
      completionRate: Math.round((completed / totalAppts) * 100),
      changeVsYesterday: changeAppts,
    },
    customers: {
      total: totalCustomers,
      newCustomers: newCust,
      returning,
      lapsed: lapsed < 0 ? 0 : lapsed,
    },
    cash: {
      grossRevenue,
      cashOut,
      netRevenue: grossRevenue - cashOut,
    },
  };
};

const HOUR_LABELS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];
const DAY_LABELS = ["T2","T3","T4","T5","T6","T7","CN"];
const DATE_LABELS = (from: string, to: string): string[] => {
  const start = new Date(from);
  const end = new Date(to);
  const labels: string[] = [];
  const cur = new Date(start);
  while (cur <= end && labels.length < 31) {
    const d = cur.getDate().toString().padStart(2, "0");
    const m = (cur.getMonth() + 1).toString().padStart(2, "0");
    labels.push(`${d}/${m}`);
    cur.setDate(cur.getDate() + 1);
  }
  return labels;
};

export const generateMockCustomerTraffic = (
  salonId: number | null,
  tab: "hour" | "day" | "date",
  from: string,
  to: string
): TrafficDataPointDto[] => {
  const seed = `traffic_${salonId ?? "all"}_${tab}`;
  const base = salonId ? 2 + salonId : 6;

  if (tab === "hour") {
    return HOUR_LABELS.map((label, i) => {
      const peakFactor = i >= 2 && i <= 5 ? 1.5 : i >= 7 && i <= 9 ? 1.8 : 1.0;
      return {
        label,
        value: Math.round(base * peakFactor * (0.5 + getSeededValue(seed, i) * 1.0)),
      };
    });
  }
  if (tab === "day") {
    return DAY_LABELS.map((label, i) => ({
      label,
      value: Math.round(base * 6 * (0.5 + getSeededValue(seed, i) * 1.0)),
    }));
  }
  // date
  return DATE_LABELS(from, to).map((label, i) => ({
    label,
    value: Math.round(base * 5 * (0.5 + getSeededValue(seed, i) * 1.0)),
  }));
};

export const generateMockNetRevenue = (
  salonId: number | null,
  tab: "hour" | "day" | "date",
  from: string,
  to: string
): NetRevenueDataPointDto[] => {
  const seed = `netrev_${salonId ?? "all"}_${tab}`;
  const baseRev = salonId ? 800000 + salonId * 300000 : 2500000;

  if (tab === "hour") {
    return HOUR_LABELS.map((label, i) => {
      const peakFactor = i >= 3 && i <= 5 ? 1.6 : i >= 7 && i <= 9 ? 2.0 : 0.8;
      return {
        label,
        value: Math.round(baseRev * peakFactor * (0.4 + getSeededValue(seed, i) * 1.2)),
      };
    });
  }
  if (tab === "day") {
    return DAY_LABELS.map((label, i) => ({
      label,
      value: Math.round(baseRev * 5 * (0.4 + getSeededValue(seed, i) * 1.2)),
    }));
  }
  return DATE_LABELS(from, to).map((label, i) => ({
    label,
    value: Math.round(baseRev * 4 * (0.4 + getSeededValue(seed, i) * 1.2)),
  }));
};

const STAFF_NAMES = [
  "Nguyễn Thu Hà",
  "Trần Minh Anh",
  "Lê Văn Dũng",
  "Phạm Quốc Bảo",
  "Vũ Thị Mai",
];

export const generateMockTopStaff = (
  salonId: number | null,
  from: string,
  to: string,
  limit: number = 5
): TopStaffDto[] => {
  const seed = `staff_${salonId ?? "all"}_${from}_${to}`;
  const baseRev = salonId ? 15000000 + salonId * 5000000 : 30000000;

  return STAFF_NAMES.slice(0, limit).map((name, i) => {
    const factor = 1 - i * 0.18 + getSeededValue(seed, i) * 0.05;
    const revenue = Math.round(baseRev * factor);
    const quantity = Math.round(revenue / 350000);
    const commission = Math.round(revenue * 0.1);
    const growth = Math.round(getSeededValue(seed, i + 10) * 40 + 5); // 5-45%
    return {
      staffId: i + 1,
      staffName: name,
      revenue,
      quantity,
      commission,
      growthPercent: growth,
    };
  });
};

