using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Commands.DeleteAppointment
{
    public class DeleteAppointmentCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
