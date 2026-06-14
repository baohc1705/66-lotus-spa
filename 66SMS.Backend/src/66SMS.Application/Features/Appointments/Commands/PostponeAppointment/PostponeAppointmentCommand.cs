using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Commands.PostponeAppointment
{
    public sealed class PostponeAppointmentCommand : IRequest<Result<object>>
    {
        public int AppointmentId { get; set; }
        public int? UserId { get; set; }
    }
}
