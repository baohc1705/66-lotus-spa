using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Salons.Queries.GetDetailSalon
{
    public class GetDetailSalonHandler : IRequestHandler<GetDetailSalonQuery, Result<SalonDto>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ICacheService cacheService;

        public GetDetailSalonHandler(
            ISalonSqlRepository salonSqlRepository,
            ICacheService cacheService)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.cacheService = cacheService;
        }

        public async Task<Result<SalonDto>> Handle(GetDetailSalonQuery request, CancellationToken cancellationToken)
        {
            var cacheKey = SalonConst.CacheKeyDetail(request.Id!.Value);
            var cached = await cacheService.GetAsync<SalonDto>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                return Result<SalonDto>.Success(cached);
            }

            SalonDto? salon = await salonSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id && x.Status != SalonConst.STATUS_DELETED)
                .Select(x => new SalonDto
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Phone = x.Phone,
                    Email = x.Email,
                    StreetAddress = x.StreetAddress,
                    ProvinceCode = x.ProvinceCode,
                    WardCode = x.WardCode,
                    FullAddress = x.FullAddress,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    WorkingDays = x.WorkingDays,
                    TaxCode = x.TaxCode,
                    ImageUrl = x.ImageUrl,
                    Description = x.Description,
                    SortOrder = x.SortOrder,
                    IsPrimary = x.IsPrimary,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (salon == null)
                return Result<SalonDto>.NotFound(SalonConst.MSG_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            await cacheService.SetAsync(cacheKey, salon, SalonConst.CACHE_TTL_DETAIL, cancellationToken);
            return Result<SalonDto>.Success(salon);
        }
    }
}
