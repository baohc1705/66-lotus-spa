using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetDepositVnPayUrl
{
    public class GetDepositVnPayUrlQuery : IRequest<Result<string>>
    {
        public int? AppointmentId { get; set; }
        public string? IpAddress { get; set; }
    }
}
