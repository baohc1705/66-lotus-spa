using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.SalonService.StaffSalons.Queries.GetAllStaffSalons
{
    public class GetAllStaffSalonsHandler : IRequestHandler<GetAllStaffSalonsQuery, Result<PagedResult<StaffSalonDto>>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
       

        public GetAllStaffSalonsHandler(IStaffSalonSqlRepository staffSalonSqlRepository)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
        }

        public async Task<Result<PagedResult<StaffSalonDto>>> Handle(GetAllStaffSalonsQuery request, CancellationToken cancellationToken)
        {
            var query = staffSalonSqlRepository.AsQueryable(true);

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
                    StaffCode = x.Staff!.Code,
                    StaffRole = x.Staff!.User!.UserRoles!.Where(x => x.UserId == x.UserId).Select(x => x.Role!.Name).FirstOrDefault(),
                    IsManager = x.IsManager,
                    Status = x.Status,
                    StartDate = x.StartDate,
                    EndDate = x.EndDate,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<StaffSalonDto>>.Success(result);
        }
    }
}
