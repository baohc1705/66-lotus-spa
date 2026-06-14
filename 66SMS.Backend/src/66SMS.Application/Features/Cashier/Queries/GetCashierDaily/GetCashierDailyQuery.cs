using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Cashier.Queries.GetCashierDaily
{
    public class GetCashierDailyQuery : IRequest<Result<CashierDailyDto>>
    {
        public DateOnly Date { get; set; }
    }
}
