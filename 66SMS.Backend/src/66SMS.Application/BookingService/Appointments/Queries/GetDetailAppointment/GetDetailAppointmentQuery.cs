using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetDetailAppointment
{
    public class GetDetailAppointmentQuery : IRequest<Result<AppointmentDto>>
    {
        public int? Id { get; set; }
    }
}
