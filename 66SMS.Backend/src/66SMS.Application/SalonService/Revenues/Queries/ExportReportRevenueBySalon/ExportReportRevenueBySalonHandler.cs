using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueBySalon
{
    public class ExportReportRevenueBySalonHandler : IRequestHandler<ExportReportRevenueBySalonQuery, Result<RevenueExportFileDto>>
    {
        private readonly IRevenueSqlRepository revenueRepository;
        private readonly IRevenueExcelExportService excelExportService;

        public ExportReportRevenueBySalonHandler(IRevenueSqlRepository revenueRepository, IRevenueExcelExportService excelExportService)
        {
            this.revenueRepository = revenueRepository;
            this.excelExportService = excelExportService;
        }

        public async Task<Result<RevenueExportFileDto>> Handle(ExportReportRevenueBySalonQuery request, CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetReportBySalonAsync(request.From, request.To, cancellationToken);
            var bytes = excelExportService.BuildReportBySalonWorkbook(request.From, request.To, rows);
            return Result<RevenueExportFileDto>.Success(new RevenueExportFileDto
            {
                Content = bytes,
                FileName = $"BaoCao_TheoChiNhanh_{request.From:yyyyMMdd}_{request.To:yyyyMMdd}.xlsx",
            });
        }
    }
}
