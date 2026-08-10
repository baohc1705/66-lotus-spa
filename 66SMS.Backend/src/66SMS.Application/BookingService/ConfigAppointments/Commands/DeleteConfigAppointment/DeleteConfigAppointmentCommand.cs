using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.ConfigAppointments.Commands.DeleteConfigAppointment
{
    public class DeleteConfigAppointmentCommand : IRequest<Result<int>>
    {
        public int Id { get; set; }

        public DeleteConfigAppointmentCommand(int id)
        {
            Id = id;
        }
    }
}
