using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Salons.Queries.GetPrimarySalon
{
    public class GetPrimarySalonHandler : IRequestHandler<GetPrimarySalonQuery, Result<SalonDto?>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;

        public GetPrimarySalonHandler(ISalonSqlRepository salonSqlRepository)
        {
            this.salonSqlRepository = salonSqlRepository;
        }

        public async Task<Result<SalonDto?>> Handle(GetPrimarySalonQuery request, CancellationToken cancellationToken)
        {
            SalonDto? salon = await salonSqlRepository.AsQueryable()
                .Where(x => x.IsPrimary == true && x.Status == SalonConst.STATUS_ACTIVE)
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

            return Result<SalonDto?>.Success(salon);
        }
    }
}
