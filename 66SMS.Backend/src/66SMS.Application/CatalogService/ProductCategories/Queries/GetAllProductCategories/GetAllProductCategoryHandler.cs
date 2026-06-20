using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductCategories.Queries.GetAllProductCategories
{
    public class GetAllProductCategoryHandler : IRequestHandler<GetAllProductCategoryQuery, Result<PagedResult<ProductCategoryDto>>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;
        private readonly IMapper mapper;

        public GetAllProductCategoryHandler(IProductCategorySqlRepository productCategorySqlRepository, IMapper mapper)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<ProductCategoryDto>>> Handle(GetAllProductCategoryQuery request, CancellationToken cancellationToken)
        {
            var query = productCategorySqlRepository.AsQueryable();

            if (!string.IsNullOrEmpty(request.OrderBy)) {
                query = request.OrderBy?.ToLower() switch
                {
                    "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                    "sortorder" => request.IsDescending ? query.OrderByDescending(x => x.SortOrder) : query.OrderBy(x => x.SortOrder),
                    _ => query.OrderByDescending(x => x.CreatedAt)
                };
            }
            
            PagedResult<ProductCategoryDto> result = await query
                .ProjectTo<ProductCategoryDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ProductCategoryDto>>.Success(result);
        }
    }
}
