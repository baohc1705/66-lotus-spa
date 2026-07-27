using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentPosition
{
    public sealed class AssignAppointmentPositionCommand : IRequest<Result<object>>
    {
        public int AppointmentId { get; set; }
        public int PositionId { get; set; }
        public int? UserId { get; set; }
    }
}
