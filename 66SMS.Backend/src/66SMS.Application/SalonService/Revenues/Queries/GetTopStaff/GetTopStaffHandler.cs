using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetTopStaff
{
    public class GetTopStaffHandler
        : IRequestHandler<GetTopStaffQuery, Result<List<TopStaffDto>>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetTopStaffHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<List<TopStaffDto>>> Handle(
            GetTopStaffQuery request,
            CancellationToken cancellationToken)
        {
            var rows = await revenueRepository.GetTopStaffAsync(
                request.SalonId,
                request.From,
                request.To,
                request.Limit,
                cancellationToken);

            var data = rows.Select(r => new TopStaffDto
            {
                StaffId = r.StaffId,
                StaffName = r.StaffName,
                Revenue = r.Revenue,
                Quantity = r.Quantity,
                Commission = r.Commission,
                GrowthPercent = r.GrowthPercent,
            }).ToList();

            return Result<List<TopStaffDto>>.Success(data);
        }
    }
}
