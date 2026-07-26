using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetRevenueBreakdown
{
    public class GetRevenueBreakdownQuery : IRequest<Result<RevenueBreakdownDto>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public int? SalonId { get; set; }
    }
}
