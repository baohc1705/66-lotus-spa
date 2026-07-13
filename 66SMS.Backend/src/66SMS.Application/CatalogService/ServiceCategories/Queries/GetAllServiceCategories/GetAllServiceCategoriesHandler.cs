using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Enums;
using AutoMapper;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.ServiceCategories.Queries.GetAllServiceCategories
{
    /// <summary>
    /// Handler for <see cref="GetAllServiceCategoriesQuery"/>
    /// </summary>
    public class GetAllServiceCategoriesHandler : IRequestHandler<GetAllServiceCategoriesQuery, Result<PagedResult<ServiceCategoryDto>>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly IMapper mapper;

        public GetAllServiceCategoriesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository, IMapper mapper)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<ServiceCategoryDto>>> Handle(GetAllServiceCategoriesQuery request, CancellationToken cancellationToken)
        {
            // As queryable
            var query = serviceCategorySqlRepository.AsQueryable(true);
            
            if (!string.IsNullOrEmpty(request.Keyword))
            {
                query = query.Where(x => x.Name.StartsWith(request.Keyword));
            }

            if (request.IsDeleted)
            {
                query = query.Where(x => x.Status == (int)StatusActiveEnum.DELETED);
            }
            else
            {
                query = query.Where(x => x.Status != (int)StatusActiveEnum.DELETED);
            }

            if (request.Status != null)
            {
                query = query.Where(x => x.Status == request.Status);
            }
            
            query = request.OrderBy?.Trim().ToLower() switch
            {
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "sortorder" => request.IsDescending ? query.OrderByDescending(x => x.SortOrder) : query.OrderBy(x => x.SortOrder),
                _ => request.IsDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id)
            };

            PagedResult<ServiceCategoryDto> result = await query
                .Select(x => new ServiceCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    Icon = x.Icon,
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ServiceCategoryDto>>.Success(result);
        }
    }
}
