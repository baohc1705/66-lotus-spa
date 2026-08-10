using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using static _66SMS.Application.DTOs.RevenueReportDto;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueByService
{
    public class GetReportRevenueByServiceHandler : IRequestHandler<GetReportRevenueByServiceQuery, Result<List<ReportRevenueByServiceItemDto>>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetReportRevenueByServiceHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<List<ReportRevenueByServiceItemDto>>> Handle(GetReportRevenueByServiceQuery request, CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetReportByServiceAsync(request.SalonId, request.CategoryId, request.From,request.To, cancellationToken);

            var data = rows.Select(r => new ReportRevenueByServiceItemDto
            {
                ItemId = r.ItemId,
                ItemName = r.ItemName,
                Quantity = r.Quantity,
                AvgCommissionRate = r.AvgCommissionRate,
                Revenue = r.Revenue,
                Commission = r.Commission,
                TotalRevenue = r.TotalRevenue,
            }).ToList();

            return Result<List<ReportRevenueByServiceItemDto>>.Success(data);
        }
    }
}
