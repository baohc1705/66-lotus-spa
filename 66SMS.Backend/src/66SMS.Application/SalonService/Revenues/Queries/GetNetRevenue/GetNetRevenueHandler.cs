using _66SMS.Application.DTOs;
using _66SMS.Application.SalonService.Revenues.Queries.GetCustomerTraffic;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetNetRevenue
{
    public class GetNetRevenueHandler
        : IRequestHandler<GetNetRevenueQuery, Result<List<NetRevenueDataPointDto>>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetNetRevenueHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<List<NetRevenueDataPointDto>>> Handle(
            GetNetRevenueQuery request,
            CancellationToken cancellationToken)
        {
            var tab = GetCustomerTrafficHandler.MapTab(request.Tab);
            var rows = await revenueRepository.GetNetRevenueAsync(
                request.SalonId,
                request.From,
                request.To,
                tab,
                cancellationToken);

            var data = rows.Select(r => new NetRevenueDataPointDto
            {
                Label = r.Label,
                Value = r.Value,
            }).ToList();

            return Result<List<NetRevenueDataPointDto>>.Success(data);
        }
    }
}
