using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.DTOs;

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
                    StaffCode = x.Staff!.Code,
                    IsManager = x.IsManager,
                    Status = x.Status,
                    StartDate = x.StartDate,
                    EndDate = x.EndDate,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (staffSalon == null)
                return Result<StaffSalonDto>.NotFound(StaffSalonConst.MSG_STAFF_SALON_NOT_FOUND, ErrorCodes.ERR_STAFF_SALON_NOT_FOUND);

            return Result<StaffSalonDto>.Success(staffSalon);
        }
    }
}
