using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.DeleteServiceProducts
{
    public class DeleteServiceProductCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
