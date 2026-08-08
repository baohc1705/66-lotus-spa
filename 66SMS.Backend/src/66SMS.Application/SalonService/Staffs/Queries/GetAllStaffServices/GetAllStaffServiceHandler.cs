using _66SMS.Application.DTOs;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetAllStaffServices;

public class GetAllStaffServiceHandler : IRequestHandler<GetAllStaffServiceQuery, Result<PagedResult<StaffServiceDto>>>
{
    private readonly IStaffServiceSqlRepository staffServiceSqlRepository;

    public GetAllStaffServiceHandler(IStaffServiceSqlRepository staffServiceSqlRepository)
    {
        this.staffServiceSqlRepository = staffServiceSqlRepository;
    }
    public async Task<Result<PagedResult<StaffServiceDto>>> Handle(GetAllStaffServiceQuery request, CancellationToken cancellationToken)
    {
        var query = staffServiceSqlRepository.AsQueryable(true);
        if (request.StaffId.HasValue)
        {
            query = query.Where(x => x.StaffId == request.StaffId);
        }
        if (request.ServiceId.HasValue)
        {
            query = query.Where(x => x.ServiceId == request.ServiceId);
        }

        query = request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt);

        var results = await query
            .Select(x => new StaffServiceDto
            {
                Id = x.Id,
                StaffId = x.StaffId,
                ServiceId = x.ServiceId,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                SerCode = x.Service!.Code,
                SerName = x.Service!.Name,
                SerDurationMins = x.Service!.DurationMins,
                SerCostPrice = x.Service!.CostPrice,
                SerCommissionRate = x.Service!.CommissionRate
            })
            .ToPagedAsync(request, cancellationToken);

        return Result<PagedResult<StaffServiceDto>>.Success(results);
    }
}
