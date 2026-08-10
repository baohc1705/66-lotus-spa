using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.ConfigAppointments.Queries.GetConfigAppointmentBySalon
{
    public class GetConfigAppointmentBySalonQuery : IRequest<Result<ConfigAppointmentDto>>
    {
        public int? SalonId { get; set; }
    }
}
