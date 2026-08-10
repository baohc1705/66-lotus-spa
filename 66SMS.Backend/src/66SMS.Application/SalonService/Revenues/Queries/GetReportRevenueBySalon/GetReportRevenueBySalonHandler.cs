using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using static _66SMS.Application.DTOs.RevenueReportDto;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueBySalon
{
    public class GetReportRevenueBySalonHandler : IRequestHandler<GetReportRevenueBySalonQuery, Result<ReportRevenueBySalonDto>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetReportRevenueBySalonHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<ReportRevenueBySalonDto>> Handle(GetReportRevenueBySalonQuery request, CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetReportBySalonAsync(request.From, request.To, cancellationToken);
            var items = rows.Select(x => new ReportRevenueBySalonItemDto
            {
                SalonId = x.SalonId,
                SalonName = x.SalonName ?? string.Empty,
                StaffCount = x.StaffCount ?? 0,
                OrderCount = x.OrderCount ?? 0,
                CashIn = x.CashIn ?? 0,
                CommissionOut = x.CommissionOut ?? 0,
                TotalRevenue = x.TotalRevenue ?? 0,
            }).ToList();

            var totalCollected = rows.Sum(r => r.CashIn ?? 0);
            var totalCommission = rows.Sum(r => r.CommissionOut ?? 0);

            var dto = new ReportRevenueBySalonDto
            {
                Stats = new ReportSalonStatsDto
                {
                    TotalRevenue = rows.Sum(r => r.TotalRevenue ?? 0),
                    TotalCollected = totalCollected,
                    TotalCommission = totalCommission,
                    Profit = totalCollected - totalCommission,
                },
                Rows = items,
            };

            return Result<ReportRevenueBySalonDto>.Success(dto);
        }
    }
}
