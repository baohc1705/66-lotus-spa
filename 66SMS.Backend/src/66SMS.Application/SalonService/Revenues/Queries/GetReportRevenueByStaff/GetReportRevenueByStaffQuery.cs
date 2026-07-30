using _66SMS.Contracts.Shared;
using MediatR;
using static _66SMS.Application.DTOs.RevenueReportDto;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueByStaff
{
    public class GetReportRevenueByStaffQuery : IRequest<Result<List<ReportRevenueByStaffItemDto>>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public int? SalonId { get; set; }
    }
}
