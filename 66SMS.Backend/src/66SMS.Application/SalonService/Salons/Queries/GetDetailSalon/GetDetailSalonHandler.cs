using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.SalonService.Salons.Queries.GetDetailSalon
{
    /// <summary>
    /// handler for <see cref="GetDetailSalonQuery"/>
    /// </summary>
    public class GetDetailSalonHandler : IRequestHandler<GetDetailSalonQuery, Result<SalonDto>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;

        public GetDetailSalonHandler(ISalonSqlRepository salonSqlRepository)
        {
            this.salonSqlRepository = salonSqlRepository;
        }

        public async Task<Result<SalonDto>> Handle(GetDetailSalonQuery request, CancellationToken cancellationToken)
        {
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
                    Status = x.Status,
                    CreatedAt = x.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (salon == null)
                return Result<SalonDto>.NotFound(SalonConst.MSG_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            return Result<SalonDto>.Success(salon);
        }
    }
}
