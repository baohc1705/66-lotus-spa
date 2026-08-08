using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueByService
{
    public class ExportReportRevenueByServiceHandler : IRequestHandler<ExportReportRevenueByServiceQuery, Result<RevenueExportFileDto>>
    {
        private readonly IRevenueSqlRepository revenueSqlRepository;
        private readonly IRevenueExcelExportService revenueExcelExportService;
        public ExportReportRevenueByServiceHandler(IRevenueSqlRepository revenueSqlRepository, IRevenueExcelExportService revenueExcelExportService)
        {
            this.revenueSqlRepository = revenueSqlRepository;
            this.revenueExcelExportService = revenueExcelExportService;
        }

        public async Task<Result<RevenueExportFileDto>> Handle(ExportReportRevenueByServiceQuery request, CancellationToken cancellationToken)
        {
            var rows = await revenueSqlRepository.GetReportByServiceAsync(request.SalonId, request.CategoryId, request.From, request.To, cancellationToken);
            var bytes = revenueExcelExportService.BuildReportByServiceWorkbook(request.From, request.To, request.SalonLabel, rows);
            return Result<RevenueExportFileDto>.Success(new RevenueExportFileDto
            {
                Content = bytes,
                FileName = $"BaoCao_TheoDichVu_{request.From:yyyyMMdd}_{request.To:yyyyMMdd}.xlsx",
            });
        }
    }
}
