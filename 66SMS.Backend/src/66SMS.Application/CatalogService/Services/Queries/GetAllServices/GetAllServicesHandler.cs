using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.Services.Queries.GetAllServices
{
    public class GetAllServicesHandler : IRequestHandler<GetAllServicesQuery, Result<PagedResult<ServiceDto>>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IMapper mapper;

        public GetAllServicesHandler(IServiceSqlRepository serviceSqlRepository, IMapper mapper)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<ServiceDto>>> Handle(GetAllServicesQuery request, CancellationToken cancellationToken)
        {
            var query = serviceSqlRepository.AsQueryable();
            // Filter here
            if (request.IsActived != null && (bool)request.IsActived)
            {
                query = query.Where(x => x.Status == ServiceConst.STATUS_ACTIVED);
            }

            if (!string.IsNullOrEmpty(request.keyword))
            {
                query = query.Where(x => x.Name.StartsWith(request.keyword));
            }

            // Order by
            query = request.OrderBy?.ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "category" => request.IsDescending ? query.OrderByDescending(x => x.CategoryId) : query.OrderBy(x => x.CategoryId),
                _ => query.OrderByDescending(x => x.CreatedAt)
            };

            PagedResult<ServiceDto> pagedResult = await query
                .SelectServiceDto(request.Includes?.ToLower())
                .ToPagedAsync(request, cancellationToken);
            return Result<PagedResult<ServiceDto>>.Success(pagedResult);
        }
    }
}