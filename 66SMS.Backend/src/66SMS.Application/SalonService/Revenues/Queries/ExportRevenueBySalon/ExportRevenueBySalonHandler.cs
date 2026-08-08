using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Services;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportRevenueBySalon
{
    public class ExportRevenueBySalonHandler
        : IRequestHandler<ExportRevenueBySalonQuery, Result<RevenueExportFileDto>>
    {
        private readonly IRevenueSqlRepository revenueRepository;
        private readonly IRevenueExcelExportService excelExportService;

        public ExportRevenueBySalonHandler(
            IRevenueSqlRepository revenueRepository,
            IRevenueExcelExportService excelExportService)
        {
            this.revenueRepository = revenueRepository;
            this.excelExportService = excelExportService;
        }

        public async Task<Result<RevenueExportFileDto>> Handle(
            ExportRevenueBySalonQuery request,
            CancellationToken cancellationToken)
        {
            if (!request.IsAdmin)
            {
                return Result<RevenueExportFileDto>.Forbidden(
                    "Chỉ Admin được xuất báo cáo so sánh doanh thu chi nhánh.");
            }

            var salonRows = await revenueRepository.GetBySalonAsync(
                request.From,
                request.To,
                request.ComparePrevious,
                cancellationToken);

            var dailyRows = await revenueRepository.GetBySalonDailyAsync(
                request.From,
                request.To,
                cancellationToken);

            var bytes = excelExportService.BuildBySalonWorkbook(
                request.From,
                request.To,
                salonRows,
                dailyRows);

            var fileName = $"DoanhThu_ChiNhanh_{request.From:yyyyMMdd}_{request.To:yyyyMMdd}.xlsx";

            return Result<RevenueExportFileDto>.Success(new RevenueExportFileDto
            {
                Content = bytes,
                FileName = fileName,
            });
        }
    }
}
