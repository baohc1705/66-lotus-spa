using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.DeleteProductCategories
{
    /// <summary>
    /// Delete product cateogy request
    /// </summary>
    public class DeleteProductCategoryCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
