using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetTopStaff
{
    public class GetTopStaffQuery : IRequest<Result<List<TopStaffDto>>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public int? SalonId { get; set; }
        public int Limit { get; set; } = 5;
    }
}
