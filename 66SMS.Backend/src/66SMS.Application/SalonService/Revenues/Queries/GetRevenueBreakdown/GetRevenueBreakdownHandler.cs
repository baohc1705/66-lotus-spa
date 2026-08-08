using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetRevenueBreakdown
{
    public class GetRevenueBreakdownHandler
        : IRequestHandler<GetRevenueBreakdownQuery, Result<RevenueBreakdownDto>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetRevenueBreakdownHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<RevenueBreakdownDto>> Handle(
            GetRevenueBreakdownQuery request,
            CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetBreakdownAsync(
                request.SalonId,
                request.From,
                request.To,
                cancellationToken);

            var total = rows.Sum(r => r.Amount);

            var dto = new RevenueBreakdownDto
            {
                ByItemType = rows.Select(r => new RevenueBreakdownItemDto
                {
                    ItemType = r.ItemType,
                    Label = r.Label,
                    Amount = r.Amount,
                    Percent = total > 0
                        ? Math.Round(r.Amount * 100 / total, 0)
                        : 0,
                }).ToList(),
            };

            return Result<RevenueBreakdownDto>.Success(dto);
        }
    }
}
