using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetRevenueTrend
{
    public class GetRevenueTrendQuery : IRequest<Result<List<CashFlowTrendPointDto>>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public int? SalonId { get; set; }
    }
}
