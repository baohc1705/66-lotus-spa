using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Enums;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.ProductCategories.Queries.GetAllProductCategories
{
    public class GetAllProductCategoryHandler : IRequestHandler<GetAllProductCategoryQuery, Result<PagedResult<ProductCategoryDto>>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;

        public GetAllProductCategoryHandler(IProductCategorySqlRepository productCategorySqlRepository)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
        }

        public async Task<Result<PagedResult<ProductCategoryDto>>> Handle(GetAllProductCategoryQuery request, CancellationToken cancellationToken)
        {
            var query = productCategorySqlRepository.AsQueryable(true);

            if (!string.IsNullOrEmpty(request.OrderBy)) {
                query = request.OrderBy?.ToLower() switch
                {
                    "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                    "sortorder" => request.IsDescending ? query.OrderByDescending(x => x.SortOrder) : query.OrderBy(x => x.SortOrder),
                    _ => request.IsDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id)
                };
            }

            if (request.IsDeleted)
            {
                query = query.Where(x => x.Status == (int)StatusActiveEnum.DELETED);
            }
            else
            {
                query = query.Where(x => x.Status != (int)StatusActiveEnum.DELETED);
            }

            if (!string.IsNullOrEmpty(request.Filter))
            {
                var keyword = request.Filter.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keyword));
            }

            PagedResult<ProductCategoryDto> result = await query
                .Select(x => new ProductCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    SortOrder = x.SortOrder,
                    Status = x.Status
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ProductCategoryDto>>.Success(result);
        }
    }
}
