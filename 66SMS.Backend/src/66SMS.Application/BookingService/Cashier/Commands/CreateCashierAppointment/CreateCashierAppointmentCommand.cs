using _66SMS.Application.BookingService.Appointments.Commands.CreateAppointment;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Commands.CreateCashierAppointment
{
    /// <summary>
    /// Lễ tân/staff đặt lịch hộ khách: chờ phục vụ ngay, không yêu cầu cọc.
    /// </summary>
    public class CreateCashierAppointmentCommand : IRequest<Result<List<int>>>
    {
        /// <summary>UserId nhân viên đang thao tác (từ JWT).</summary>
        public int ActorUserId { get; set; }

        /// <summary>Khách hàng CRM được đặt lịch hộ.</summary>
        public int CustomerId { get; set; }

        public string? PromotionCode { get; set; }
        public List<GuestAppointmentDto> Guests { get; set; } = new();
    }
}
