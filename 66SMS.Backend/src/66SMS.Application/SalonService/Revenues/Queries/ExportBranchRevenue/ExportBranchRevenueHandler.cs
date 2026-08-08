using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportBranchRevenue
{
    public class ExportBranchRevenueHandler
        : IRequestHandler<ExportBranchRevenueQuery, Result<RevenueExportFileDto>>
    {
        private readonly IRevenueSqlRepository revenueRepository;
        private readonly ISalonSqlRepository salonRepository;
        private readonly IRevenueExcelExportService excelExportService;

        public ExportBranchRevenueHandler(
            IRevenueSqlRepository revenueRepository,
            ISalonSqlRepository salonRepository,
            IRevenueExcelExportService excelExportService)
        {
            this.revenueRepository = revenueRepository;
            this.salonRepository = salonRepository;
            this.excelExportService = excelExportService;
        }

        public async Task<Result<RevenueExportFileDto>> Handle(
            ExportBranchRevenueQuery request,
            CancellationToken cancellationToken)
        {
            var salon = await salonRepository.FindByIdAsync(request.SalonId, asNoTracking: true, cancellationToken);
            if (salon == null)
            {
                return Result<RevenueExportFileDto>.NotFound(RevenueConst.MSG_SALON_NOT_FOUND);
            }

            var staffRows = await revenueRepository.GetByStaffAsync(
                request.SalonId,
                request.From,
                request.To,
                cancellationToken);

            var serviceRows = await revenueRepository.GetByServiceAsync(
                request.SalonId,
                request.From,
                request.To,
                cancellationToken);

            var bytes = excelExportService.BuildBranchRevenueWorkbook(
                salon.Name,
                request.From,
                request.To,
                staffRows,
                serviceRows);

            var fileName = $"DoanhThu_{salon.Code}_{request.From:yyyyMMdd}_{request.To:yyyyMMdd}.xlsx";

            return Result<RevenueExportFileDto>.Success(new RevenueExportFileDto
            {
                Content = bytes,
                FileName = fileName,
            });
        }
    }
}
