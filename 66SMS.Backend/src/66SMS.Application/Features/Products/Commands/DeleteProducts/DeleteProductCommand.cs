using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Products.Commands.DeleteProducts
{
    public class DeleteProductCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
