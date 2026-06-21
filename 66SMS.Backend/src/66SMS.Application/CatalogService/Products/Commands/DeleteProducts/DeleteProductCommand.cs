using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.Products.Commands.DeleteProducts
{
    /// <summary>
    /// Request delete product
    /// </summary>
    public class DeleteProductCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
