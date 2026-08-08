using _66SMS.Contract.Shared;
using MediatR;
using static _66SMS.Application.DTOs.RevenueReportDto;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueByPeriod
{
    public class GetReportRevenueByPeriodQuery : IRequest<Result<ReportRevenueByPeriodDto>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public int? SalonId { get; set; }
        public string Grain { get; set; } = "day";
    }
}
