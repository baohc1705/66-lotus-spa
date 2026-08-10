using _66SMS.Application.BookingService.Appointments.Commands.CreateAppointment;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Commands.CreateCashierAppointment
{
    public class CreateCashierAppointmentCommand : IRequest<Result<List<int>>>
    {
        public int ActorUserId { get; set; }
        public int CustomerId { get; set; }
        public string? PromotionCode { get; set; }
        public List<GuestAppointmentDto> Guests { get; set; } = new();
    }
}
