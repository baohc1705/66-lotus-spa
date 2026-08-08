using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
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

            var dto = new RevenueSummaryDto();
            ApplyPeriod(dto, current);

            if (request.ComparePrevious)
            {
                var previous = rows.FirstOrDefault(r =>
                    string.Equals(r.PeriodTag, "previous", StringComparison.OrdinalIgnoreCase));
                var prevDto = new RevenueSummaryPeriodDto();
                ApplyPeriod(prevDto, previous);
                dto.PreviousPeriod = prevDto;
            }

            return Result<RevenueSummaryDto>.Success(dto);
        }

        private static void ApplyPeriod(RevenueSummaryPeriodDto target, RevenueSummaryRowDto? row)
        {
            if (row == null) return;

            target.CashIn = row.CashIn;
            target.CashOut = row.CashOut;
            target.NetCashFlow = row.CashIn - row.CashOut;
            target.GrossRevenue = row.GrossRevenue;
            target.TransactionCount = row.TransactionCount;
            target.AverageOrderValue = row.TransactionCount > 0
                ? Math.Round(row.GrossRevenue / row.TransactionCount, 0)
                : 0;
        }
    }
}
