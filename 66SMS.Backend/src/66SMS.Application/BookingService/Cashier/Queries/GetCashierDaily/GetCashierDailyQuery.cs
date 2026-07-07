using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierDaily
{
    public class GetCashierDailyQuery : IRequest<Result<CashierDailyDto>>
    {
        public DateOnly Date { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? SalonId { get; set; }
    }
}
