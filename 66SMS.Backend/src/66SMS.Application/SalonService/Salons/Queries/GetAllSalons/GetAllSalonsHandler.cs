using _66SMS.Application.DTOs.Salons;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.SalonService.Salons.Queries.GetAllSalons
{
    public class GetAllSalonsHandler : IRequestHandler<GetAllSalonsQuery, Result<PagedResult<SalonDto>>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly IMapper mapper;

        public GetAllSalonsHandler(ISalonSqlRepository salonSqlRepository, IMapper mapper)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<SalonDto>>> Handle(GetAllSalonsQuery request, CancellationToken cancellationToken)
        {
            var query = salonSqlRepository.AsQueryable();

            if (!string.IsNullOrEmpty(request.Filter))
            {
                string keywordLower = request.Filter.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keywordLower)
                    || x.Code.ToLower().Contains(keywordLower)
                    || x.Phone.Contains(request.Filter));
            }

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            query = query.OrderByDescending(x => x.CreatedAt);

            PagedResult<SalonDto> result = await query
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
                    CreatedAt = x.CreatedAt.ToString(),
                    UpdatedAt = x.UpdatedAt.ToString()
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<SalonDto>>.Success(result);
        }
    }
}
