using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.ConfigAppointments.Queries.GetDetailConfigAppointment
{
    public class GetDetailConfigAppointmentQuery : IRequest<Result<ConfigAppointmentDto>>
    {
        public int Id { get; set; }

        public GetDetailConfigAppointmentQuery(int id)
        {
            Id = id;
        }
    }
}
