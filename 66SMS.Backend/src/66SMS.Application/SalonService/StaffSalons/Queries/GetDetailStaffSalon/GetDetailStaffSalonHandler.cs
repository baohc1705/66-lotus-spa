using _66SMS.Application.DTOs.StaffSalons;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.StaffSalons.Queries.GetDetailStaffSalon
{
    public class GetDetailStaffSalonHandler : IRequestHandler<GetDetailStaffSalonQuery, Result<StaffSalonDto>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;

        public GetDetailStaffSalonHandler(IStaffSalonSqlRepository staffSalonSqlRepository)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
        }

        public async Task<Result<StaffSalonDto>> Handle(GetDetailStaffSalonQuery request, CancellationToken cancellationToken)
        {
            StaffSalonDto? staffSalon = await staffSalonSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id || x.StaffId == request.StaffId || x.SalonId == request.SalonId)
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
                .FirstOrDefaultAsync(cancellationToken);

            if (staffSalon == null)
                return Result<StaffSalonDto>.NotFound(StaffSalonConst.MSG_STAFF_SALON_NOT_FOUND, ErrorCodes.ERR_STAFF_SALON_NOT_FOUND);

            return Result<StaffSalonDto>.Success(staffSalon);
        }
    }
}
