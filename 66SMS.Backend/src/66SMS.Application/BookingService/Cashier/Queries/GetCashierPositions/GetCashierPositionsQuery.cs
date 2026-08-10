using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierPositions
{
    public sealed class GetCashierPositionsQuery : IRequest<Result<IReadOnlyList<CashierPositionDto>>>
    {
        public int? SalonId { get; set; }
        public DateOnly? Date { get; set; }
    }
}
