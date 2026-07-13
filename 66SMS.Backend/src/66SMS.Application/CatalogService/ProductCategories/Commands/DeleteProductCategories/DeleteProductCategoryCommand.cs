using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.DeleteProductCategories
{
    /// <summary>
    /// Delete product cateogy request
    /// </summary>
    public class DeleteProductCategoryCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
