using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Services;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueByPeriod
{
    public class ExportReportRevenueByPeriodHandler : IRequestHandler<ExportReportRevenueByPeriodQuery, Result<RevenueExportFileDto>>
    {
        private readonly IRevenueSqlRepository revenueRepository;
        private readonly IRevenueExcelExportService revenueExcelExportService;
        public ExportReportRevenueByPeriodHandler(IRevenueSqlRepository revenueRepository, IRevenueExcelExportService revenueExcelExportService)
        {
            this.revenueRepository = revenueRepository;
            this.revenueExcelExportService = revenueExcelExportService;
        }

        public async Task<Result<RevenueExportFileDto>> Handle(ExportReportRevenueByPeriodQuery request, CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetReportByPeriodAsync(request.SalonId, request.From, request.To, request.Grain, cancellationToken);
            var bytes = revenueExcelExportService.BuildReportByPeriodWorkbook(request.From, request.To, request.Grain, rows);

            return Result<RevenueExportFileDto>.Success(new RevenueExportFileDto
            {
                Content = bytes,
                FileName = $"BaoCao_TheoThoiGian_{request.From:yyyyMMdd}_{request.To:yyyyMMdd}.xlsx",
            });
        }
    }
}
