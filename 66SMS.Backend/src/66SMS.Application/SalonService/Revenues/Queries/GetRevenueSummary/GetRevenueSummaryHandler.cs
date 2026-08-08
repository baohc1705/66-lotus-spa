using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Models;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetRevenueSummary
{
    public class GetRevenueSummaryHandler
        : IRequestHandler<GetRevenueSummaryQuery, Result<RevenueSummaryDto>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetRevenueSummaryHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<RevenueSummaryDto>> Handle(
            GetRevenueSummaryQuery request,
            CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetSummaryAsync(
                request.SalonId,
                request.From,
                request.To,
                request.ComparePrevious,
                cancellationToken);

            var current = rows.FirstOrDefault(r =>
                string.Equals(r.PeriodTag, "current", StringComparison.OrdinalIgnoreCase));

            var dto = MapSummary(current);

            if (request.ComparePrevious)
            {
                var previous = rows.FirstOrDefault(r =>
                    string.Equals(r.PeriodTag, "previous", StringComparison.OrdinalIgnoreCase));
                dto.PreviousPeriod = MapPeriod(previous);
            }

            return Result<RevenueSummaryDto>.Success(dto);
        }

        private static RevenueSummaryDto MapSummary(RevenueSummaryRowDto? row)
        {
            var dto = new RevenueSummaryDto();
            ApplyPeriod(dto, row);
            return dto;
        }

        private static RevenueSummaryPeriodDto MapPeriod(RevenueSummaryRowDto? row)
        {
            var dto = new RevenueSummaryPeriodDto();
            ApplyPeriod(dto, row);
            return dto;
        }

        private static void ApplyPeriod(RevenueSummaryPeriodDto target, RevenueSummaryRowDto? row)
        {
            if (row == null) return;

            target.CashIn = row.CashIn;
            target.CashOut = row.CashOut;
            target.NetCashFlow = row.NetCashFlow;
            target.GrossRevenue = row.GrossRevenue;
            target.TransactionCount = row.TransactionCount;
            target.AverageOrderValue = row.AverageOrderValue;
        }
    }
}
