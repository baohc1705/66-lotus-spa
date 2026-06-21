using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetDetailStaff
{
    public class GetDetailStaffHandler : IRequestHandler<GetDetailStaffQuery, Result<StaffDto>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly IMapper mapper;

        public GetDetailStaffHandler(IStaffSqlRepository staffSqlRepository, IStaffSalonSqlRepository staffSalonSqlRepository, IMapper mapper)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<StaffDto>> Handle(GetDetailStaffQuery request, CancellationToken cancellationToken)
        {
            StaffDto? staffDto = await staffSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new StaffDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    SalonId = x.SalonId,
                    SalonName = x.Salon != null ? x.Salon.Name : null,
                    Code = x.Code,
                    FullName = x.FullName,
                    AvatarUrl = x.AvatarUrl,
                    DateOfBirth = x.DateOfBirth.ToString(),
                    Gender = x.Gender.ToString(),
                    NationalId = x.NationalId,
                    Phone = x.Phone,
                    HireDate = x.HireDate.ToString(),
                    ContractType = x.ContractType,
                    BasicSalary = x.BasicSalary,
                    Status = x.Status.ToString(),
                    StreetAddress = x.StreetAddress,
                    ProvinceCode = x.ProvinceCode,
                    WardCode = x.WardCode,
                    FullAddress = x.FullAddress,
                    Username = x.User != null ? x.User.Username : null,
                    Email = x.User != null ? x.User.Email : null,
                    Role = x.User != null ? x.User.UserRoles.Select(ur => ur.Role!.Name).FirstOrDefault() : null
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (staffDto == null) 
                return Result<StaffDto>.NotFound();

            if (request.SalonId.HasValue)
            {
                bool belongsToSalon = await staffSalonSqlRepository.AsQueryable()
                    .AnyAsync(ss => ss.StaffId == request.Id 
                                 && ss.SalonId == request.SalonId.Value 
                                 && ss.Status == StaffSalonConst.STATUS_ACTIVE, cancellationToken);
                if (!belongsToSalon)
                    return Result<StaffDto>.NotFound();
            }

            return Result<StaffDto>.Success(staffDto);
        }
    }
}
