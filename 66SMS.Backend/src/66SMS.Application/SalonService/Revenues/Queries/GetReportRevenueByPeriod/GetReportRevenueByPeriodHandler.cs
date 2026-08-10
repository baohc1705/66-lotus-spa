using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using static _66SMS.Application.DTOs.RevenueReportDto;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueByPeriod
{
    public class GetReportRevenueByPeriodHandler : IRequestHandler<GetReportRevenueByPeriodQuery, Result<ReportRevenueByPeriodDto>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetReportRevenueByPeriodHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<ReportRevenueByPeriodDto>> Handle(GetReportRevenueByPeriodQuery request, CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetReportByPeriodAsync(request.SalonId, request.From, request.To, request.Grain, cancellationToken);

            var items = rows.Select(x => new ReportRevenueByPeriodItemDto
            {
                PeriodKey = x.PeriodKey,
                OrderCount = x.OrderCount,
                InvoiceTotal = x.InvoiceTotal,
                CommissionTotal = x.CommissionTotal,
                TotalRevenue = x.TotalRevenue,
            }).ToList();

            var totalRevenue = rows.Sum(r => r.InvoiceTotal);
            var totalExpense = rows.Sum(r => r.CashOut);

            var dto = new ReportRevenueByPeriodDto
            {
                Stats = new ReportPeriodStatsDto
                {
                    TotalRevenue = totalRevenue,
                    TotalExpense = totalExpense,
                    OrderCount = rows.Sum(r => r.OrderCount),
                    Profit = totalRevenue - totalExpense,
                },
                Rows = items,
            };

            return Result<ReportRevenueByPeriodDto>.Success(dto);
        }
    }
}
