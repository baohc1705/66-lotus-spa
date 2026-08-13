namespace _66SMS.Application.DTOs
{
    public class AppointmentServiceItemDto
    {
        public int ServiceId { get; set; }
        public string? Name { get; set; }
        public int DurationMins { get; set; }
        public decimal Price { get; set; }
    }

    public class AppointmentDto
    {
        public int? Id { get; set; }
        public string? AppointmentCode { get; set; }
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAvatar { get; set; }
        public int? StaffId { get; set; }
        public int? PositionId { get; set; }
        public DateOnly? AppointmentDate { get; set; }
        public int? Status { get; set; }
        public string? Note { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? PaidAmount { get; set; }
        public int? DepositPercent { get; set; }
        public DateTimeOffset? DepositDeadlineAt { get; set; }
        public string? CreatedAt { get; set; }
        public decimal? ServicesSubTotal { get; set; }
        public decimal? MembershipDiscountAmount { get; set; }
        public decimal? PromotionDiscountAmount { get; set; }
        public string? StaffFullName { get; set; }
        public string? SalonName { get; set; }
        public TimeOnly? TimeSlotStartTime { get; set; }
        public TimeOnly? TimeSlotEndTime { get; set; }
        public string? PositionName { get; set; }
        public string? PositionRoomName { get; set; }
        public int? PositionStatus { get; set; }
        public DateTimeOffset? TimeStartService { get; set; }
        public DateTimeOffset? CompletedAt { get; set; }
        public decimal? CustomerWalletBalance { get; set; }
        public int? InvoiceId { get; set; }
        public string? InvoiceCode { get; set; }
        public List<string>? ServiceNames { get; set; }
        public List<AppointmentServiceItemDto>? Services { get; set; }
    }
}
