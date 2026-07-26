using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetTopRevenueItems
{
    public class GetTopRevenueItemsQuery : IRequest<Result<List<TopRevenueItemDto>>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public int? SalonId { get; set; }
        /// <summary>service | product</summary>
        public string Type { get; set; } = "service";
        public int Limit { get; set; } = 5;
    }
}
