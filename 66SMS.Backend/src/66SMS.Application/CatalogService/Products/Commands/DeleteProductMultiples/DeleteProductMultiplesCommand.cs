using System.Text.Json.Serialization;
using _66SMS.Contracts.Shared;
using MediatR;
namespace _66SMS.Application.CatalogService.Products.Commands.DeleteProductMultiples
{

    public class DeleteProductMultiplesCommand : IRequest<Result<object>>
    {
        public List<int> Ids { get; set; } = new();

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
