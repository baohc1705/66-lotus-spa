using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetTopRevenueItems
{
    public class GetTopRevenueItemsHandler
        : IRequestHandler<GetTopRevenueItemsQuery, Result<List<TopRevenueItemDto>>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetTopRevenueItemsHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<List<TopRevenueItemDto>>> Handle(
            GetTopRevenueItemsQuery request,
            CancellationToken cancellationToken)
        {
            var itemType = string.Equals(request.Type, "product", StringComparison.OrdinalIgnoreCase)
                ? InvoiceItemConst.TYPE_PRODUCT
                : InvoiceItemConst.TYPE_SERVICE;

            var rows = await revenueRepository.GetTopItemsAsync(
                request.SalonId,
                request.From,
                request.To,
                itemType,
                request.Limit,
                cancellationToken);

            var total = rows.Sum(r => r.Revenue);

            var data = rows.Select(r => new TopRevenueItemDto
            {
                ItemId = r.ItemId,
                ItemName = r.ItemName,
                ItemType = r.ItemType,
                Quantity = r.Quantity,
                Revenue = r.Revenue,
                Percent = total > 0
                    ? Math.Round(r.Revenue * 100 / total, 0)
                    : 0,
            }).ToList();

            return Result<List<TopRevenueItemDto>>.Success(data);
        }
    }
}
