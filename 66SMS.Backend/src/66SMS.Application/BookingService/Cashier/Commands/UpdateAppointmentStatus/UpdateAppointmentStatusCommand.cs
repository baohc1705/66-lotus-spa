using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Commands.UpdateAppointmentStatus
{
    public sealed class UpdateAppointmentStatusCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        public int Status { get; set; }
        public string? Note { get; set; }
        public int? UserId { get; set; }
    }
}
