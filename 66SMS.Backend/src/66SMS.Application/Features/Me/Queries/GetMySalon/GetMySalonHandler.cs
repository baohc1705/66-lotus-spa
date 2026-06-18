using _66SMS.Application.DTOs.Salons;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Me.Queries.GetMySalon
{
    public class GetMySalonHandler : IRequestHandler<GetMySalonQuery, Result<SalonDto>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly IMapper mapper;

        public GetMySalonHandler(ISalonSqlRepository salonSqlRepository, IMapper mapper)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<SalonDto>> Handle(GetMySalonQuery request, CancellationToken cancellationToken)
        {
            if (!request.SalonId.HasValue)
                return Result<SalonDto>.BadRequest("You are not assigned to any salon.");

            var salon = await salonSqlRepository.AsQueryable()
                .Where(x => x.Id == request.SalonId.Value)
                .ProjectTo<SalonDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (salon == null)
                return Result<SalonDto>.NotFound("Salon not found.");

            return Result<SalonDto>.Success(salon);
        }
    }
}
