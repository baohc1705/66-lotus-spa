using _66SMS.Contracts.Shared;
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
                SalonName = x.SalonName,
                StaffCount = x.StaffCount,
                OrderCount = x.OrderCount,
                CashIn = x.CashIn,
                CommissionOut = x.CommissionOut,
                TotalRevenue = x.TotalRevenue,
            }).ToList();

            var totalRevenue = rows.Sum(r => r.TotalRevenue);
            var totalCommission = rows.Sum(r => r.CommissionOut);

            var dto = new ReportRevenueBySalonDto
            {
                Stats = new ReportSalonStatsDto
                {
                    TotalRevenue = totalRevenue,
                    TotalCollected = rows.Sum(r => r.CashIn),
                    TotalCommission = totalCommission,
                    Profit = totalRevenue - totalCommission,
                },
                Rows = items,
            };

            return Result<ReportRevenueBySalonDto>.Success(dto);
        }
    }
}
