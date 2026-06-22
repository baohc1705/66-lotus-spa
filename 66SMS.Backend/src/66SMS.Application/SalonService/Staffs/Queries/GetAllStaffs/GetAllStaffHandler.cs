using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetAllStaffs
{
    public class GetAllStaffHandler : IRequestHandler<GetAllStaffQuery, Result<PagedResult<StaffDto>>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly IMapper mapper;

        public GetAllStaffHandler(IStaffSqlRepository staffSqlRepository, IStaffSalonSqlRepository staffSalonSqlRepository, IMapper mapper)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<StaffDto>>> Handle(GetAllStaffQuery request, CancellationToken cancellationToken)
        {
            var query = staffSqlRepository.AsQueryable();

            if (request.SalonId.HasValue)
            {
                query = query.Where(x => staffSalonSqlRepository.AsQueryable(true)
                    .Any(ss => ss.StaffId == x.Id 
                         && ss.SalonId == request.SalonId.Value 
                         && ss.Status == StaffSalonConst.STATUS_ACTIVE));
            }

            if (!string.IsNullOrEmpty(request.Role))
            {
                query = query.Where(x => x.User != null && x.User.UserRoles!.Any(ur => ur.Role != null && ur.Role.Name.ToLower() == request.Role.ToLower()));
            }

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.FullName.StartsWith(request.Filter) 
                                      || x.Phone == request.Filter 
                                      || x.User!.Email == request.Filter
                                      || x.Code == request.Filter);
            }

            if (!request.IsDeleted)
            {
                query = query.Where(x => x.Status != StaffConst.STATUS_DELETED);
            }
            

            query = request.OrderBy?.ToLower() switch
            {
                "email" => request.IsDescending ? query.OrderByDescending(x => x.User!.Email) : query.OrderBy(x => x.User!.Email),
                "fullname" => request.IsDescending ? query.OrderByDescending(x => x.FullName) : query.OrderBy(x => x.FullName),
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            PagedResult<StaffDto> pagedDto = await query
                .Select(x => new StaffDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    SalonId = x.StaffSalons != null ? x.StaffSalons.Where(ss => ss.Status == StaffSalonConst.STATUS_ACTIVE).Select(ss => (int?)ss.SalonId).FirstOrDefault() : null,
                    SalonName = x.StaffSalons != null ? x.StaffSalons.Where(ss => ss.Status == StaffSalonConst.STATUS_ACTIVE && ss.Salon != null).Select(ss => ss.Salon!.Name).FirstOrDefault() : null,
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
                    Status = x.Status,
                    StreetAddress = x.StreetAddress,
                    ProvinceCode = x.ProvinceCode,
                    WardCode = x.WardCode,
                    FullAddress = x.FullAddress,
                    Username = x.User != null ? x.User.Username : null,
                    Email = x.User != null ? x.User.Email : null,
                    Role = x.User != null ? x.User.UserRoles!.Select(ur => ur.Role!.Name).FirstOrDefault() : null,
                    CreatedAt  = x.CreatedAt.ToString(),
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<StaffDto>>.Success(pagedDto);
        }
    }
}
