namespace _66SMS.Application.DTOs.Revenues
{
    public class RevenueSummaryPeriodDto
    {
        public decimal CashIn { get; set; }
        public decimal CashOut { get; set; }
        public decimal NetCashFlow { get; set; }
        public decimal GrossRevenue { get; set; }
        public int TransactionCount { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class RevenueSummaryDto : RevenueSummaryPeriodDto
    {
        public RevenueSummaryPeriodDto? PreviousPeriod { get; set; }
    }

    public class CashFlowTrendPointDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal CashIn { get; set; }
        public decimal CashOut { get; set; }
    }

    public class RevenueBreakdownItemDto
    {
        public int ItemType { get; set; }
        public string Label { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Percent { get; set; }
    }

    public class PaymentMethodBreakdownItemDto
    {
        public int Method { get; set; }
        public string Label { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Percent { get; set; }
    }

    public class RevenueBreakdownDto
    {
        public List<RevenueBreakdownItemDto> ByItemType { get; set; } = new();
        public List<PaymentMethodBreakdownItemDto> ByPaymentMethod { get; set; } = new();
        public RevenueCashOutDto CashOut { get; set; } = new();
        public RevenueDiscountsDto Discounts { get; set; } = new();
    }

    public class RevenueCashOutDto
    {
        public decimal PayrollBase { get; set; }
        public decimal Commission { get; set; }
        public decimal Refunds { get; set; }
    }

    public class RevenueDiscountsDto
    {
        public decimal Manual { get; set; }
        public decimal Membership { get; set; }
        public decimal Loyalty { get; set; }
        public decimal Promotion { get; set; }
        public decimal TotalPercent { get; set; }
    }

    public class TopRevenueItemDto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int ItemType { get; set; }
        public int Quantity { get; set; }
        public decimal Revenue { get; set; }
        public decimal Percent { get; set; }
    }

    public class TodaySummaryDto
    {
        public TodayAppointmentsDto Appointments { get; set; } = new();
        public TodayCustomersDto Customers { get; set; } = new();
        public TodayCashDto Cash { get; set; } = new();
    }

    public class TodayAppointmentsDto
    {
        public int Total { get; set; }
        public int Completed { get; set; }
        public int CompletionRate { get; set; }
        public int ChangeVsYesterday { get; set; }
    }

    public class TodayCustomersDto
    {
        public int Total { get; set; }
        public int NewCustomers { get; set; }
        public int Returning { get; set; }
        public int Lapsed { get; set; }
    }

    public class TodayCashDto
    {
        public decimal GrossRevenue { get; set; }
        public decimal CashOut { get; set; }
        public decimal NetRevenue { get; set; }
    }

    public class TrafficDataPointDto
    {
        public string Label { get; set; } = string.Empty;
        public decimal Value { get; set; }
    }

    public class NetRevenueDataPointDto
    {
        public string Label { get; set; } = string.Empty;
        public decimal Value { get; set; }
    }

    public class TopStaffDto
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Quantity { get; set; }
        public decimal Commission { get; set; }
        public int GrowthPercent { get; set; }
    }
}
