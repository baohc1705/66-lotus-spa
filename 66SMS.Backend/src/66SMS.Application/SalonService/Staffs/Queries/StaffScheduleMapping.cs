using _66SMS.Application.DTOs.Staffs;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.SalonService.Staffs.Queries
{
    /// <summary>
    /// Map projection schedule → DTO (chạy in-memory sau khi SQL đã Select cột cần thiết).
    /// </summary>
    internal static class StaffScheduleMapping
    {
        public static StaffScheduleBookingDto ToBookingDto(
            int id,
            string? customerName,
            string? customerPhone,
            List<string> serviceNames,
            int durationMins,
            TimeOnly? startTime,
            int status,
            decimal paidAmount,
            decimal totalAmount,
            string? note)
        {
            string statusStr = status switch
            {
                AppointmentConst.STATUS_PENDING => "pending",
                AppointmentConst.STATUS_CONFIRMED => "confirmed",
                AppointmentConst.STATUS_WAITING => "waiting",
                AppointmentConst.STATUS_IN_SERVICE => "in-progress",
                AppointmentConst.STATUS_COMPLETED => paidAmount >= totalAmount ? "paid" : "unpaid",
                AppointmentConst.STATUS_CANCELLED => "cancelled",
                AppointmentConst.STATUS_NO_SHOW => "not-arrived",
                _ => "pending",
            };

            var serviceName = serviceNames.Count > 0
                ? string.Join(", ", serviceNames)
                : "Dịch vụ";

            var mins = durationMins > 0 ? durationMins : 15;
            var startTs = startTime ?? new TimeOnly(0, 0);
            var endTs = startTs.AddMinutes(mins);

            return new StaffScheduleBookingDto
            {
                Id = id.ToString(),
                CustomerName = string.IsNullOrWhiteSpace(customerName) ? "Khách hàng" : customerName,
                CustomerPhone = customerPhone ?? "",
                ServiceName = serviceName,
                StartTime = startTs.ToString(@"HH\:mm"),
                EndTime = endTs.ToString(@"HH\:mm"),
                Status = statusStr,
                TotalAmount = totalAmount,
                Note = note,
            };
        }
    }
}
