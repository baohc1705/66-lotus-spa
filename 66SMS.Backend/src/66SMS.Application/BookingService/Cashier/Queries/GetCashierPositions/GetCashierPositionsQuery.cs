using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierPositions
{
    public sealed class GetCashierPositionsQuery : IRequest<Result<IReadOnlyList<CashierPositionDto>>>
    {
        public int? SalonId { get; set; }
        /// <summary>Ngày hẹn — dùng để đánh dấu vị trí đã có lịch trong ngày.</summary>
        public DateOnly? Date { get; set; }
    }
}
