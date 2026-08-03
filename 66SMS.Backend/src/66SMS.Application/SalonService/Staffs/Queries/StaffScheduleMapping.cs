using _66SMS.Application.DTOs.Staffs;

namespace _66SMS.Application.SalonService.Staffs.Queries
{
    /// <summary>
    /// Map projection schedule → DTO (chạy in-memory sau khi SQL đã Select cột cần thiết).
    /// </summary>
    internal static class StaffScheduleMapping
    {
        public static StaffScheduleBookingDto ToBookingDto(
            int id,
            string? appointmentCode,
            string? customerName,
            string? customerPhone,
            List<string> serviceNames,
            int durationMins,
            TimeOnly? startTime,
            int status,
            decimal paidAmount,
            decimal totalAmount,
            string? note,
            string? positionName,
            DateTimeOffset? timeStartService,
            DateTimeOffset? completedAt)
        {
            var serviceName = serviceNames.Count > 0
                ? string.Join(", ", serviceNames)
                : "Dịch vụ";

            var mins = durationMins > 0 ? durationMins : 15;
            var startTs = startTime ?? new TimeOnly(0, 0);
            var endTs = startTs.AddMinutes(mins);

            return new StaffScheduleBookingDto
            {
                Id = id.ToString(),
                AppointmentCode = appointmentCode,
                CustomerName = string.IsNullOrWhiteSpace(customerName) ? "Khách hàng" : customerName,
                CustomerPhone = customerPhone ?? "",
                ServiceName = serviceName,
                StartTime = startTs.ToString(@"HH\:mm"),
                EndTime = endTs.ToString(@"HH\:mm"),
                Status = status,
                PaidAmount = paidAmount,
                TotalAmount = totalAmount,
                Note = note,
                PositionName = positionName,
                TimeStartService = timeStartService,
                CompletedAt = completedAt,
            };
        }
    }
}
