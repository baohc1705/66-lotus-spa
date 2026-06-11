using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.ProductCategories.Queries.GetDetailProductCategory
{
    public class GetDetailProductCategoryQuery : IRequest<Result<ProductCategoryDto>>
    {
        public int Id { get; set; }
    }
}
