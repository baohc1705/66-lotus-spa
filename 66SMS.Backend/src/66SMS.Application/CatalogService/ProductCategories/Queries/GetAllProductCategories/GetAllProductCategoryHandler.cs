using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductCategories.Queries.GetAllProductCategories
{
    /// <summary>
    /// Handler for <see cref="GetAllProductCategoryQuery"/>
    /// </summary>
    public class GetAllProductCategoryHandler : IRequestHandler<GetAllProductCategoryQuery, Result<PagedResult<ProductCategoryDto>>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;

        public GetAllProductCategoryHandler(IProductCategorySqlRepository productCategorySqlRepository)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
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
                .Select(x => new ProductCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt.ToString(),
                    UpdatedAt = x.UpdatedAt.HasValue ? x.UpdatedAt.Value.ToString("HH:mm dd/MM/yyyy") : null,
                })
                .OrderByDescending(x => x.CreatedAt)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ProductCategoryDto>>.Success(result);
        }
    }
}
