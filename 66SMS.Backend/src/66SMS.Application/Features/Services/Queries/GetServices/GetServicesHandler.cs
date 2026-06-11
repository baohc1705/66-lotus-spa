using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Services.Queries.GetServices
{
    public class GetServicesHandler : IRequestHandler<GetServicesQuery, Result<ServiceDto>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IMapper mapper;

        public GetServicesHandler(IServiceSqlRepository serviceSqlRepository, IMapper mapper)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<ServiceDto>> Handle(GetServicesQuery request, CancellationToken cancellationToken)
        {
            Service? entity = await serviceSqlRepository.AsQueryable()
                .Include(x => x.Category)
                .Include(x => x.Images)
                .Include(x => x.ServiceProducts!)
                    .ThenInclude(sp => sp.Product)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
                
            if (entity == null)
            {
                return Result<ServiceDto>.NotFound("Service not found", ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            ServiceDto dto = mapper.Map<ServiceDto>(entity);
            return Result<ServiceDto>.Success(dto);
        }
    }
}
