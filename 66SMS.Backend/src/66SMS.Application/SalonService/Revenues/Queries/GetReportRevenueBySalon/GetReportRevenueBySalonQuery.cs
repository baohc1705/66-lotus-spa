using _66SMS.Contract.Shared;
using MediatR;
using static _66SMS.Application.DTOs.RevenueReportDto;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueBySalon
{
    public class GetReportRevenueBySalonQuery : IRequest<Result<ReportRevenueBySalonDto>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
    }
}
