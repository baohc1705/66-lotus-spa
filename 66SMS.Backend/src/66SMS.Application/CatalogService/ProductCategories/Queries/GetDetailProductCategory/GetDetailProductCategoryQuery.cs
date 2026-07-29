using _66SMS.Application.DTOs;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductCategories.Queries.GetDetailProductCategory
{
    /// <summary>
    /// Get detail category request by id
    /// </summary>
    public class GetDetailProductCategoryQuery : IRequest<Result<ProductCategoryDto>>
    {
        public int? Id { get; set; }
    }
}
