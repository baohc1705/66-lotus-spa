using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueBySalon
{
    public class ExportReportRevenueBySalonQuery : IRequest<Result<RevenueExportFileDto>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
    }
}
