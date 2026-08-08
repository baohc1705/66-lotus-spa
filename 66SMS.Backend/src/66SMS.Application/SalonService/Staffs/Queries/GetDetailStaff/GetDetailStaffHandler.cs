using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetDetailStaff
{
    public class GetDetailStaffHandler : IRequestHandler<GetDetailStaffQuery, Result<StaffFullDto>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;

        public GetDetailStaffHandler(
            IStaffSqlRepository staffSqlRepository,
            IStaffSalonSqlRepository staffSalonSqlRepository)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.staffSalonSqlRepository = staffSalonSqlRepository;
        }

        public async Task<Result<StaffFullDto>> Handle(GetDetailStaffQuery request, CancellationToken cancellationToken)
        {
            var activeSalonStatus = (int)StatusActiveEnum.ACTIVED;

            StaffFullDto? staffDto = await staffSqlRepository.AsQueryable(true)
                .Where(x => x.Id == request.Id && x.Status != (int)StatusActiveEnum.DELETED)
                .Select(x => new StaffFullDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    SalonId = x.StaffSalons!
                        .Where(ss => ss.Status == activeSalonStatus)
                        .Select(ss => (int?)ss.SalonId)
                        .FirstOrDefault(),
                    SalonName = x.StaffSalons!
                        .Where(ss => ss.Status == activeSalonStatus)
                        .Select(ss => ss.Salon!.Name)
                        .FirstOrDefault(),
                    Code = x.Code,
                    FullName = x.FullName,
                    AvatarUrl = x.AvatarUrl,
                    DateOfBirth = x.DateOfBirth,
                    Gender = x.Gender,
                    NationalId = x.NationalId,
                    Phone = x.Phone,
                    HireDate = x.HireDate,
                    ContractType = x.ContractType,
                    BasicSalary = x.BasicSalary,
                    SalaryType = x.SalaryType,
                    Status = x.Status,
                    StreetAddress = x.StreetAddress,
                    ProvinceCode = x.ProvinceCode,
                    WardCode = x.WardCode,
                    FullAddress = x.FullAddress,
                    Username = x.User != null ? x.User.Username : null,
                    Email = x.User != null ? x.User.Email : null,
                    Role = x.User!.UserRoles!
                        .Select(ur => ur.Role!.Code)
                        .FirstOrDefault(),
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (staffDto == null)
                return Result<StaffFullDto>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            if (request.SalonId.HasValue)
            {
                bool belongsToSalon = await staffSalonSqlRepository.AsQueryable(true)
                    .AnyAsync(ss => ss.StaffId == request.Id
                                 && ss.SalonId == request.SalonId.Value
                                 && ss.Status == activeSalonStatus, cancellationToken);
                if (!belongsToSalon)
                    return Result<StaffFullDto>.NotFound(StaffSalonConst.MSG_STAFF_SALON_NOT_FOUND, ErrorCodes.ERR_STAFF_SALON_NOT_FOUND);
            }

            return Result<StaffFullDto>.Success(staffDto);
        }
    }
}
