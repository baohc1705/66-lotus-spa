using _66SMS.Application.DTOs.Salons;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Salons.Queries.GetDetailSalon
{
    public class GetDetailSalonHandler : IRequestHandler<GetDetailSalonQuery, Result<SalonDto>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly IMapper mapper;

        public GetDetailSalonHandler(ISalonSqlRepository salonSqlRepository, IMapper mapper)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<SalonDto>> Handle(GetDetailSalonQuery request, CancellationToken cancellationToken)
        {
            SalonDto? salon = await salonSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .ProjectTo<SalonDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (salon == null)
                return Result<SalonDto>.NotFound("Salon not found.", ErrorCodes.ERR_SALON_NOT_FOUND);

            return Result<SalonDto>.Success(salon);
        }
    }
}
