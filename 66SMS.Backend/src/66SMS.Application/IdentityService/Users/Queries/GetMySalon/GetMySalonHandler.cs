using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.IdentityService.Users.Queries.GetMySalon
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
                return Result<SalonDto>.BadRequest(UserConst.MSG_USER_NOT_ASSIGNED_TO_SALON, ErrorCodes.ERR_BAD_REQUEST);

            var salon = await salonSqlRepository.AsQueryable()
                .Where(x => x.Id == request.SalonId.Value)
                .ProjectTo<SalonDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (salon == null)
                return Result<SalonDto>.NotFound(SalonConst.MSG_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            return Result<SalonDto>.Success(salon);
        }
    }
}
