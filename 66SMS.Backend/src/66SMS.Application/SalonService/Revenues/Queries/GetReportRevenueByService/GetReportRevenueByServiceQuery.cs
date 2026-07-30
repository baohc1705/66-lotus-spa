using _66SMS.Contracts.Shared;
using MediatR;
using static _66SMS.Application.DTOs.RevenueReportDto;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueByService
{
    public class GetReportRevenueByServiceQuery : IRequest<Result<List<ReportRevenueByServiceItemDto>>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public int? SalonId { get; set; }
        public int? CategoryId { get; set; }
    }
}
