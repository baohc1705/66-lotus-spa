using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetNetRevenue
{
    public class GetNetRevenueQuery : IRequest<Result<List<NetRevenueDataPointDto>>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public int? SalonId { get; set; }
        /// <summary>hour | day | date</summary>
        public string Tab { get; set; } = "hour";
    }
}
