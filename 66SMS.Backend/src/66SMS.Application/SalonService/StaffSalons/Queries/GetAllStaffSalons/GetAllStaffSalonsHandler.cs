using _66SMS.Application.DTOs.StaffSalons;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.SalonService.StaffSalons.Queries.GetAllStaffSalons
{
    public class GetAllStaffSalonsHandler : IRequestHandler<GetAllStaffSalonsQuery, Result<PagedResult<StaffSalonDto>>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly IMapper mapper;

        public GetAllStaffSalonsHandler(IStaffSalonSqlRepository staffSalonSqlRepository, IMapper mapper)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<StaffSalonDto>>> Handle(GetAllStaffSalonsQuery request, CancellationToken cancellationToken)
        {
            var query = staffSalonSqlRepository.AsQueryable();

            if (request.SalonId.HasValue)
                query = query.Where(x => x.SalonId == request.SalonId.Value);

            if (request.StaffId.HasValue)
                query = query.Where(x => x.StaffId == request.StaffId.Value);

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            PagedResult<StaffSalonDto> result = await query
                .Select(x => new StaffSalonDto
                {
                    Id = x.Id,
                    SalonId = x.SalonId,
                    SalonName = x.Salon!.Name,
                    StaffId = x.StaffId,
                    StaffName = x.Staff!.FullName,
                    IsManager = x.IsManager,
                    Status = x.Status,
                    StartDate = x.StartDate.ToString(),
                    EndDate = x.EndDate.ToString(),
                    CreatedAt = x.CreatedAt.ToString(),
                    UpdatedAt = x.UpdatedAt.ToString(),
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<StaffSalonDto>>.Success(result);
        }
    }
}
