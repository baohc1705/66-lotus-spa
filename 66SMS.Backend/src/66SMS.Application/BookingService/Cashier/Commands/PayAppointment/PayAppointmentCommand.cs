using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Commands.PayAppointment
{
    public sealed class PayAppointmentCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string? Note { get; set; }
        public int? UserId { get; set; }
    }
}
