using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using static _66SMS.Application.DTOs.RevenueReportDto;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueByStaff
{
    public class GetReportRevenueByStaffHandler : IRequestHandler<GetReportRevenueByStaffQuery, Result<List<ReportRevenueByStaffItemDto>>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetReportRevenueByStaffHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<List<ReportRevenueByStaffItemDto>>> Handle(GetReportRevenueByStaffQuery request, CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetReportByStaffAsync(request.SalonId, request.From, request.To, cancellationToken);
            var result = rows.Select(x => new ReportRevenueByStaffItemDto
            {
                StaffId = x.StaffId,
                StaffName = x.StaffName,
                ServiceCount = x.ServiceCount,
                ServiceRevenue = x.ServiceRevenue,
                Commission = x.Commission,
                TotalRevenue = x.TotalRevenue,
            }).ToList();
            return Result<List<ReportRevenueByStaffItemDto>>.Success(result);
        }
    }
}
