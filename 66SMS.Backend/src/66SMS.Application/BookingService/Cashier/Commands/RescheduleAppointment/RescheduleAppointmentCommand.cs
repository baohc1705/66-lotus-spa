using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Commands.RescheduleAppointment
{
    public sealed class RescheduleAppointmentCommand : IRequest<Result<object>>
    {
        public int AppointmentId { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public int SlotId { get; set; }
        public int? UserId { get; set; }
    }
}
