using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetRevenueTrend
{
    public class GetRevenueTrendHandler
        : IRequestHandler<GetRevenueTrendQuery, Result<List<CashFlowTrendPointDto>>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetRevenueTrendHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<List<CashFlowTrendPointDto>>> Handle(
            GetRevenueTrendQuery request,
            CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetTrendAsync(
                request.SalonId,
                request.From,
                request.To,
                cancellationToken);

            var data = rows.Select(r => new CashFlowTrendPointDto
            {
                Date = r.Date.ToString("yyyy-MM-dd"),
                CashIn = r.CashIn,
                CashOut = r.CashOut,
            }).ToList();

            return Result<List<CashFlowTrendPointDto>>.Success(data);
        }
    }
}
