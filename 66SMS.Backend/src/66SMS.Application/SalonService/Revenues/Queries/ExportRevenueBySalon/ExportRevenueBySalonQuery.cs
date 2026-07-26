using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportRevenueBySalon
{
    public class ExportRevenueBySalonQuery : IRequest<Result<RevenueExportFileDto>>
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public bool ComparePrevious { get; set; } = true;
        public bool IsAdmin { get; set; }
    }
}
