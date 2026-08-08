using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.IdentityService.Users.Queries.GetMySalon
{
    public class GetMySalonHandler : IRequestHandler<GetMySalonQuery, Result<SalonDto>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;

        public GetMySalonHandler(ISalonSqlRepository salonSqlRepository)
        {
            this.salonSqlRepository = salonSqlRepository;
        }

        public async Task<Result<SalonDto>> Handle(GetMySalonQuery request, CancellationToken cancellationToken)
        {
            if (!request.SalonId.HasValue)
                return Result<SalonDto>.BadRequest(UserConst.MSG_USER_NOT_ASSIGNED_TO_SALON, ErrorCodes.ERR_BAD_REQUEST);

            var salon = await salonSqlRepository.AsQueryable()
                .Where(x => x.Id == request.SalonId.Value)
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
                    CreatedAt = x.CreatedAt,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (salon == null)
                return Result<SalonDto>.NotFound(SalonConst.MSG_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            return Result<SalonDto>.Success(salon);
        }
    }
}
