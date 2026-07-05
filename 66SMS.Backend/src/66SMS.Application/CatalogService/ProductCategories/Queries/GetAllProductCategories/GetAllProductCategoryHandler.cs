using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.ProductCategories.Queries.GetAllProductCategories
{
    /// <summary>
    /// Handler for <see cref="GetAllProductCategoryQuery"/>
    /// </summary>
    public class GetAllProductCategoryHandler : IRequestHandler<GetAllProductCategoryQuery, Result<PagedResult<ProductCategoryDto>>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;
        private readonly IUserSqlRepository userSqlRepository;

        public GetAllProductCategoryHandler(IProductCategorySqlRepository productCategorySqlRepository, IUserSqlRepository userSqlRepository)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
            this.userSqlRepository = userSqlRepository;
        }

        public async Task<Result<PagedResult<ProductCategoryDto>>> Handle(GetAllProductCategoryQuery request, CancellationToken cancellationToken)
        {
            var query = productCategorySqlRepository.AsQueryable(true);

            if (!string.IsNullOrEmpty(request.OrderBy)) {
                query = request.OrderBy?.ToLower() switch
                {
                    "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                    "sortorder" => request.IsDescending ? query.OrderByDescending(x => x.SortOrder) : query.OrderBy(x => x.SortOrder),
                    _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
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
                    Status = x.Status,
                    CreatedAt = x.CreatedAt.ToString(),
                    UpdatedAt = x.UpdatedAt.HasValue ? x.UpdatedAt.Value.ToString() : null,
                   
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ProductCategoryDto>>.Success(result);
        }
    }
}
