using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetCustomerTraffic
{
    public class GetCustomerTrafficHandler
        : IRequestHandler<GetCustomerTrafficQuery, Result<List<TrafficDataPointDto>>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetCustomerTrafficHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<List<TrafficDataPointDto>>> Handle(
            GetCustomerTrafficQuery request,
            CancellationToken cancellationToken)
        {
            var tab = MapTab(request.Tab);
            var rows = await revenueRepository.GetCustomerTrafficAsync(
                request.SalonId,
                request.From,
                request.To,
                tab,
                cancellationToken);

            var data = rows.Select(r => new TrafficDataPointDto
            {
                Label = r.Label,
                Value = r.Value,
            }).ToList();

            return Result<List<TrafficDataPointDto>>.Success(data);
        }

        internal static byte MapTab(string tab) => tab switch
        {
            "day" => 2,   // theo thứ
            "date" => 3,  // theo ngày lịch
            _ => 1,       // hour
        };
    }
}
