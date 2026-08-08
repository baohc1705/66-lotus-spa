using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetAllStaffs
{
    public class GetAllStaffHandler : IRequestHandler<GetAllStaffQuery, Result<PagedResult<StaffDto>>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly ICacheService cacheService;

        public GetAllStaffHandler(
            IStaffSqlRepository staffSqlRepository,
            IStaffSalonSqlRepository staffSalonSqlRepository,
            ICacheService cacheService)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.cacheService = cacheService;
        }

        public async Task<Result<PagedResult<StaffDto>>> Handle(GetAllStaffQuery request, CancellationToken cancellationToken)
        {
            string? cacheKey = null;
            if (request.SalonId.HasValue
                && string.IsNullOrEmpty(request.Role)
                && string.IsNullOrEmpty(request.Filter))
            {
                cacheKey = StaffConst.CacheKeyBySalon(request.SalonId.Value);
                var cached = await cacheService.GetAsync<PagedResult<StaffDto>>(cacheKey, cancellationToken);
                if (cached is not null)
                {
                    return Result<PagedResult<StaffDto>>.Success(cached);
                }
            }

            var query = staffSqlRepository.AsQueryable(true);

            if (request.SalonId.HasValue)
            {
                var salonId = request.SalonId.Value;
                query = query.Where(x => staffSalonSqlRepository.AsQueryable(true)
                    .Any(ss => ss.StaffId == x.Id
                        && ss.SalonId == salonId
                        && ss.Status == (int)StatusActiveEnum.ACTIVED));
            }

            if (!string.IsNullOrEmpty(request.Role))
            {
                var role = request.Role.ToLower();
                query = query.Where(x => x.User != null
                    && x.User.UserRoles!.Any(ur =>
                        ur.Role != null && ur.Role.Code!.ToLower() == role));
            }

            if (!string.IsNullOrEmpty(request.Filter))
            {
                var filter = request.Filter;
                query = query.Where(x =>
                    x.FullName.StartsWith(filter)
                    || x.Phone == filter
                    || x.Code == filter
                    || (x.User != null && x.User.Email == filter));
            }

            if (!request.IsDeleted)
            {
                query = query.Where(x => x.Status != (int)StatusActiveEnum.DELETED);
            }

            query = request.OrderBy?.ToLower() switch
            {
                "email" => request.IsDescending
                    ? query.OrderByDescending(x => x.User!.Email)
                    : query.OrderBy(x => x.User!.Email),
                "fullname" => request.IsDescending
                    ? query.OrderByDescending(x => x.FullName)
                    : query.OrderBy(x => x.FullName),
                "code" => request.IsDescending
                    ? query.OrderByDescending(x => x.Code)
                    : query.OrderBy(x => x.Code),
                _ => request.IsDescending
                    ? query.OrderByDescending(x => x.CreatedAt)
                    : query.OrderBy(x => x.CreatedAt),
            };

            var activeSalonStatus = (int)StatusActiveEnum.ACTIVED;
            PagedResult<StaffDto> pagedDto = await query
                .Select(x => new StaffDto
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
                    Role = x.User!.UserRoles!
                        .Select(ur => ur.Role!.Code)
                        .FirstOrDefault(),
                    Code = x.Code,
                    FullName = x.FullName,
                    AvatarUrl = x.AvatarUrl,
                    Gender = x.Gender,
                    Phone = x.Phone,
                    ContractType = x.ContractType,
                    BasicSalary = x.BasicSalary,
                    Status = x.Status,
                    Email = x.User != null ? x.User.Email : null,
                    CreatedAt = x.CreatedAt,
                })
                .ToPagedAsync(request, cancellationToken);

            if (cacheKey is not null)
            {
                await cacheService.SetAsync(cacheKey, pagedDto, StaffConst.CACHE_TTL_BY_SALON, cancellationToken);
            }

            return Result<PagedResult<StaffDto>>.Success(pagedDto);
        }
    }
}
