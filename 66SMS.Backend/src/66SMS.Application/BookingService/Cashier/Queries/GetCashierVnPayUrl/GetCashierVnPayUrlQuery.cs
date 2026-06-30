using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierVnPayUrl
{
    public sealed class GetCashierVnPayUrlQuery : IRequest<Result<string>>
    {
        public int AppointmentId { get; set; }
        public string IpAddress { get; set; } = string.Empty;
    }
}
