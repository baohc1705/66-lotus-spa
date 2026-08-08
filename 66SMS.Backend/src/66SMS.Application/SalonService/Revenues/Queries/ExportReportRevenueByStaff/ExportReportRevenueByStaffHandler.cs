using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueByStaff
{
    public class ExportReportRevenueByStaffHandler : IRequestHandler<ExportReportRevenueByStaffQuery, Result<RevenueExportFileDto>>
    {
        private readonly IRevenueSqlRepository revenueSqlRepository;
        private readonly IRevenueExcelExportService revenueExcelExportService;
        public ExportReportRevenueByStaffHandler(IRevenueSqlRepository revenueSqlRepository, IRevenueExcelExportService revenueExcelExportService)
        {
            this.revenueSqlRepository = revenueSqlRepository;
            this.revenueExcelExportService = revenueExcelExportService;
        }

        public async Task<Result<RevenueExportFileDto>> Handle(ExportReportRevenueByStaffQuery request, CancellationToken cancellationToken)
        {
            var rows = await revenueSqlRepository.GetReportByStaffAsync(request.SalonId, request.From, request.To, cancellationToken);
            var bytes = revenueExcelExportService.BuildReportByStaffWorkbook(request.From, request.To, request.SalonLabel, rows);
            return Result<RevenueExportFileDto>.Success(new RevenueExportFileDto
            {
                Content = bytes,
                FileName = $"BaoCao_TheoNhanVien_{request.From:yyyyMMdd}_{request.To:yyyyMMdd}.xlsx",
            });
        }
    }
}
